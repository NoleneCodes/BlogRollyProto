
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
    const { q, type = 'keyword', category, tags, author, dateRange, limit = '20', offset = '0' } = req.query;
    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;
    const tagArray = tags && typeof tags === 'string' ? tags.split(',') : null;

    const { data: blogsRaw, error } = await supabase
      .rpc('ranked_blog_search', {
        search_query: q && typeof q === 'string' && q.trim() ? q.trim() : null,
        category_filter: category && typeof category === 'string' && category !== 'all' ? category : null,
        tags_filter: tagArray,
        limit_count: limitNum,
        offset_count: offsetNum
      });
    const blogs = Array.isArray(blogsRaw) ? blogsRaw : [];

    // Log search analytics (don't let this crash the search)
    if (q) {
      try {
        await supabase.from('search_analytics').insert({
          search_query: q as string,
          search_type: type as string,
          results_count: blogs.length,
          filters_used: {
            category: category || null,
            tags: tags ? (tags as string).split(',') : [],
            author: author || null,
            dateRange: dateRange || null
          }
        });
      } catch (analyticsError) {
        console.warn('Failed to log search analytics:', analyticsError);
        // Continue with the search response
      }
    }

    // Transform data to match frontend expectations
    const transformedBlogs = blogs.map(blog => ({
      id: blog.id,
      title: blog.title,
      description: blog.description,
      url: blog.url,
      image: blog.image_url,
      category: blog.category,
      tags: blog.tags,
      author: 'Anonymous', // Placeholder until we fix user relationships
      authorUsername: 'unknown',
      blogName: 'Blog',
      isVerified: false,
      readTime: Math.ceil((blog.description?.length || 0) / 200),
      date: blog.created_at,
      views: blog.views || 0,
      clicks: blog.clicks || 0,
      rank: blog.rank
    }));

    return res.status(200).json({
      results: transformedBlogs,
      total: transformedBlogs.length,
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
