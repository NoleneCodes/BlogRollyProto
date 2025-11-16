import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, BlogStatus } from '../../../lib/improved_supabase_types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, submissionIds } = req.body;

    if (!action || !submissionIds || !Array.isArray(submissionIds)) {
      return res.status(400).json({ 
        error: 'Missing required fields: action and submissionIds array' 
      });
    }

    // Validate action
    const validActions = ['approve', 'reject', 'feature', 'unfeature', 'archive'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ 
        error: `Invalid action. Must be one of: ${validActions.join(', ')}` 
      });
    }

    // TODO: Add admin authentication check
    // const { data: user } = await supabase.auth.getUser();
    // if (!user || !await isAdmin(user.id)) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    let updateData: any = {};
    const timestamp = new Date().toISOString();

    // Prepare update based on action
    switch (action) {
      case 'approve':
        updateData = {
          status: 'approved' as BlogStatus,
          approved_at: timestamp,
          reviewed_at: timestamp
        };
        break;

      case 'reject':
        updateData = {
          status: 'rejected' as BlogStatus,
          rejected_at: timestamp,
          reviewed_at: timestamp
        };
        break;

      case 'feature':
        updateData = {
          featured: true,
          updated_at: timestamp
        };
        break;

      case 'unfeature':
        updateData = {
          featured: false,
          updated_at: timestamp
        };
        break;

      case 'archive':
        updateData = {
          status: 'archived' as BlogStatus,
          updated_at: timestamp
        };
        break;
    }

    // Perform bulk update
    const { data, error } = await supabase
      .from('blog_submissions')
      .update(updateData)
      .in('id', submissionIds)
      .select();

    if (error) {
      console.error('Bulk action error:', error);
      return res.status(500).json({ 
        error: 'Failed to perform bulk action',
        details: error.message
      });
    }

    // Log the admin action
    try {
      await supabase
        .from('admin_activity_log')
        .insert({
          action_type: `bulk_${action}`,
          target_type: 'blog_submissions',
          details: {
            submission_ids: submissionIds,
            affected_count: data?.length || 0
          }
        });
    } catch (logError) {
      console.warn('Failed to log admin action:', logError);
      // Don't fail the main operation if logging fails
    }

    return res.status(200).json({
      success: true,
      message: `Successfully ${action}ed ${data?.length || 0} submissions`,
      affectedCount: data?.length || 0,
      submissionIds: submissionIds
    });

  } catch (error) {
    console.error('Bulk action API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}
