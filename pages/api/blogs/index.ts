
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      category, 
      tag,
      limit = '50',
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
        image_description,
        image_type,
        image_file_path,
        category,
        tags,
        created_at,
        views,
        clicks,
        user_id,
        user_profiles!inner(
          username,
          first_name,
          surname,
          display_name
        ),
        blogger_profiles!inner(
          blog_name,
          blog_description,
          is_verified
        )
      `)
      .eq('status', 'live')
      .eq('is_live', true);

    // Category filter
    if (category && typeof category === 'string' && category !== 'all') {
      query = query.eq('category', category);
    }

    // Tag filter
    if (tag && typeof tag === 'string') {
      query = query.contains('tags', [tag]);
    }

    // Pagination
    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;
    
    query = query
      .range(offsetNum, offsetNum + limitNum - 1)
      .order('created_at', { ascending: false });

    const { data: blogs, error, count } = await query;

    if (error) {
      console.error('Blogs fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch blogs' });
    }

    // Transform data to match frontend expectations
    const transformedBlogs = blogs?.map(blog => ({
      id: blog.id,
      title: blog.title,
      description: blog.description,
      url: blog.url,
      image: blog.image_url,
      imageDescription: blog.image_description,
      imageType: blog.image_type,
      imageFilePath: blog.image_file_path,
      category: blog.category,
      tags: blog.tags,
      author: blog.user_profiles?.[0]?.display_name || 
              `${blog.user_profiles?.[0]?.first_name} ${blog.user_profiles?.[0]?.surname}`,
      authorUsername: blog.user_profiles?.[0]?.username,
      blogName: blog.blogger_profiles?.[0]?.blog_name,
      isVerified: blog.blogger_profiles?.[0]?.is_verified,
      readTime: Math.ceil((blog.description?.length || 0) / 200), // Estimate
      date: blog.created_at,
      views: blog.views,
      clicks: blog.clicks
    })) || [];

    return res.status(200).json({
      blogs: transformedBlogs,
      total: count || 0,
      filters: {
        category: category || null,
        tag: tag || null
      }
    });

  } catch (error) {
    console.error('Blogs API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
