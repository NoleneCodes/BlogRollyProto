
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

interface SearchFilters {
  category?: string;
  tags?: string[];
  author?: string;
  dateRange?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      q, 
      type = 'keyword', 
      category, 
      tags, 
      author, 
      dateRange,
      limit = '20',
      offset = '0'
    } = req.query;

    let query = supabase
      .from('blog_submissions')
      .select(`
        id,
        title,
        description,
        url,
        image_url,
        category,
        tags,
        created_at,
        views,
        clicks,
        user_id,
        users!inner(
          username,
          first_name,
          surname,
          display_name
        ),
        blogger_profiles!inner(
          blog_name,
          blog_description,
          categories,
          is_verified
        )
      `)
      .eq('status', 'live')
      .eq('is_live', true);

    // Text search
    if (q && typeof q === 'string') {
      if (type === 'keyword') {
        query = query.textSearch('search_vector', q.split(' ').join(' & '));
      } else {
        // For AI search, we'll use a broader text search for now
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }
    }

    // Category filter
    if (category && typeof category === 'string' && category !== 'all') {
      query = query.eq('category', category);
    }

    // Tags filter
    if (tags && typeof tags === 'string') {
      const tagArray = tags.split(',');
      query = query.overlaps('tags', tagArray);
    }

    // Author search
    if (author && typeof author === 'string') {
      query = query.or(`
        users.username.ilike.%${author}%,
        users.first_name.ilike.%${author}%,
        users.surname.ilike.%${author}%,
        users.display_name.ilike.%${author}%,
        blogger_profiles.categories.cs.{${author}}
      `);
    }

    // Date range filter
    if (dateRange && typeof dateRange === 'string') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // No filter
      }
      
      if (startDate.getTime() > 0) {
        query = query.gte('created_at', startDate.toISOString());
      }
    }

    // Pagination
    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;
    
    query = query
      .range(offsetNum, offsetNum + limitNum - 1)
      .order('created_at', { ascending: false });

    const { data: blogs, error, count } = await query;

    if (error) {
      console.error('Search error:', error);
      return res.status(500).json({ error: 'Search failed' });
    }

    // Log search analytics
    if (q) {
      await supabase.from('search_analytics').insert({
        search_query: q as string,
        search_type: type as string,
        results_count: count || 0,
        filters_used: {
          category: category || null,
          tags: tags ? (tags as string).split(',') : [],
          author: author || null,
          dateRange: dateRange || null
        }
      });
    }

    // Transform data to match frontend expectations
    const transformedBlogs = blogs?.map(blog => ({
      id: blog.id,
      title: blog.title,
      description: blog.description,
      url: blog.url,
      image: blog.image_url,
      category: blog.category,
      tags: blog.tags,
      author: blog.users.display_name || 
              `${blog.users.first_name} ${blog.users.surname}`,
      authorUsername: blog.users.username,
      blogName: blog.blogger_profiles.blog_name,
      isVerified: blog.blogger_profiles.is_verified,
      readTime: Math.ceil((blog.description?.length || 0) / 200), // Estimate
      date: blog.created_at,
      views: blog.views,
      clicks: blog.clicks
    })) || [];

    return res.status(200).json({
      results: transformedBlogs,
      total: count || 0,
      query: q || '',
      filters: {
        category: category || null,
        tags: tags ? (tags as string).split(',') : [],
        author: author || null,
        dateRange: dateRange || null
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
