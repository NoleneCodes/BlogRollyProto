import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      limit = '20',
      status,
      category,
      featured,
      hasAdultContent,
      userId,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      includeStats = 'false'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const offset = (pageNum - 1) * limitNum;

    // Build the main query
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
        status,
        has_adult_content,
        featured,
        reading_time,
        social_shares,
        views,
        clicks,
        ctr,
        created_at,
        submitted_at,
        reviewed_at,
        approved_at,
        rejected_at,
        live_at,
        updated_at,
        user_id,
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
      .is('deleted_at', null);

    // Apply filters
    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    } else if (featured === 'false') {
      query = query.eq('featured', false);
    }

    if (hasAdultContent === 'true') {
      query = query.eq('has_adult_content', true);
    } else if (hasAdultContent === 'false') {
      query = query.eq('has_adult_content', false);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = [
      'created_at', 'submitted_at', 'reviewed_at', 'live_at', 'updated_at',
      'title', 'status', 'category', 'views', 'clicks', 'ctr', 'featured'
    ];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const order = sortOrder === 'asc';

    query = query.order(sortField as string, { ascending: order });

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch blog submissions' });
    }

    // Transform data
    const submissions = data?.map(submission => ({
      id: submission.id,
      title: submission.title,
      description: submission.description,
      url: submission.url,
      imageUrl: submission.image_url,
      imageDescription: submission.image_description,
      category: submission.category,
      tags: submission.tags || [],
      status: submission.status,
      hasAdultContent: submission.has_adult_content,
      featured: submission.featured || false,
      readingTime: submission.reading_time,
      socialShares: submission.social_shares || 0,
      metrics: {
        views: submission.views || 0,
        clicks: submission.clicks || 0,
        ctr: submission.ctr || 0
      },
      timestamps: {
        createdAt: submission.created_at,
        submittedAt: submission.submitted_at,
        reviewedAt: submission.reviewed_at,
        approvedAt: submission.approved_at,
        rejectedAt: submission.rejected_at,
        liveAt: submission.live_at,
        updatedAt: submission.updated_at
      },
      author: {
        id: submission.user_id,
        name: submission.users?.display_name || 
              `${submission.users?.first_name || ''} ${submission.users?.surname || ''}`.trim() || 
              submission.users?.username || 'Unknown',
        username: submission.users?.username,
        avatar: submission.user_profiles?.avatar_url,
        blogName: submission.blogger_profiles?.blog_name,
        blogUrl: submission.blogger_profiles?.blog_url,
        verified: submission.blogger_profiles?.is_verified || false
      }
    })) || [];

    // Get statistics if requested
    let statistics = null;
    if (includeStats === 'true') {
      try {
        const { data: statsData } = await supabase
          .from('blog_submissions')
          .select('status, featured, has_adult_content, created_at')
          .is('deleted_at', null);

        if (statsData) {
          const today = new Date().toDateString();
          statistics = {
            total: statsData.length,
            byStatus: {
              draft: statsData.filter(s => s.status === 'draft').length,
              submitted: statsData.filter(s => s.status === 'submitted').length,
              under_review: statsData.filter(s => s.status === 'under_review').length,
              approved: statsData.filter(s => s.status === 'approved').length,
              rejected: statsData.filter(s => s.status === 'rejected').length,
              live: statsData.filter(s => s.status === 'live').length,
              archived: statsData.filter(s => s.status === 'archived').length
            },
            featured: statsData.filter(s => s.featured).length,
            adultContent: statsData.filter(s => s.has_adult_content).length,
            submittedToday: statsData.filter(s => 
              new Date(s.created_at).toDateString() === today
            ).length
          };
        }
      } catch (statsError) {
        console.error('Error fetching statistics:', statsError);
        // Continue without statistics
      }
    }

    // Pagination metadata
    const totalPages = Math.ceil((count || 0) / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    // Response
    const response = {
      submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages,
        hasNext,
        hasPrev
      },
      filters: {
        status,
        category,
        featured,
        hasAdultContent,
        userId,
        search
      },
      sorting: {
        sortBy: sortField,
        sortOrder
      }
    };

    if (statistics) {
      (response as any).statistics = statistics;
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60');

    return res.status(200).json(response);

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}
