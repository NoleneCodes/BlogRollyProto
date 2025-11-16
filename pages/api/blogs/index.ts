import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      limit = '20',
      category,
      tags,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      featured,
      status = 'live'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100); // Max 100 per page
    const offset = (pageNum - 1) * limitNum;

    // Start building the query
    let query = supabase
      .from('blog_submissions')
      .select(`
        id,
        title,
        description,
        url,
        image_url,
        image_description,
        category,
        tags,
        views,
        clicks,
        ctr,
        created_at,
        live_at,
        slug,
        reading_time,
        featured,
        social_shares,
        users:user_id (
          username,
          display_name,
          first_name,
          surname
        ),
        user_profiles:user_id (
          avatar_url
        ),
        blogger_profiles:user_id (
          blog_name,
          blog_url,
          is_verified
        )
      `, { count: 'exact' })
      .eq('is_live', true)
      .eq('status', status)
      .is('deleted_at', null);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    } else if (featured === 'false') {
      query = query.eq('featured', false);
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query = query.overlaps('tags', tagArray);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'live_at', 'title', 'views', 'clicks', 'ctr', 'featured'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? true : false;
    
    // Featured blogs first, then by sort criteria
    if (sortField === 'featured') {
      query = query.order('featured', { ascending: false });
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order(sortField as string, { ascending: order });
    }

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch blogs' });
    }

    // Transform data
    const blogs = data?.map(blog => ({
      id: blog.id,
      title: blog.title,
      description: blog.description,
      url: blog.url,
      imageUrl: blog.image_url,
      imageDescription: blog.image_description,
      category: blog.category,
      tags: blog.tags || [],
      views: blog.views || 0,
      clicks: blog.clicks || 0,
      ctr: blog.ctr || 0,
      createdAt: blog.created_at,
      liveAt: blog.live_at,
      slug: blog.slug,
      readingTime: blog.reading_time,
      featured: blog.featured || false,
      socialShares: blog.social_shares || 0,
      author: {
        name: blog.users?.display_name || 
              `${blog.users?.first_name || ''} ${blog.users?.surname || ''}`.trim() || 
              blog.users?.username || 'Anonymous',
        username: blog.users?.username,
        avatar: blog.user_profiles?.avatar_url,
        blogName: blog.blogger_profiles?.blog_name,
        blogUrl: blog.blogger_profiles?.blog_url,
        verified: blog.blogger_profiles?.is_verified || false
      }
    })) || [];

    // Pagination metadata
    const totalPages = Math.ceil((count || 0) / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    // Set cache headers for performance
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return res.status(200).json({
      blogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages,
        hasNext,
        hasPrev
      },
      filters: {
        category,
        tags,
        search,
        featured,
        status
      },
      sorting: {
        sortBy: sortField,
        sortOrder
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}
