/**
 * CORRECTED ADMIN SUBMISSION ACTION API ENDPOINT
 * 
 * ⚠️  NEW FILE: pages/api/admin/submission-action.ts
 * 
 * Required for:
 * ✅ Individual blog submission actions (approve/reject/feature)
 * ✅ Single submission operations from admin dashboard
 * ✅ Action logging and status updates
 * ✅ Email notifications for status changes
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

// Blog status types matching your database
type BlogStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'live' | 'archived';
type ActionType = 'approve' | 'reject' | 'feature' | 'unfeature' | 'archive' | 'under_review';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { submissionId, action, reason, note } = req.body;

    // Validation
    if (!submissionId || !action) {
      return res.status(400).json({ 
        error: 'Missing required fields: submissionId and action' 
      });
    }

    // Validate action type
    const validActions: ActionType[] = ['approve', 'reject', 'feature', 'unfeature', 'archive', 'under_review'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ 
        error: `Invalid action. Must be one of: ${validActions.join(', ')}` 
      });
    }

    // TODO: Add admin authentication check here
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user || !await isAdmin(user.id)) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const timestamp = new Date().toISOString();
    let updateData: any = { updated_at: timestamp };

    // Prepare update data based on action
    switch (action) {
      case 'approve':
        updateData = {
          ...updateData,
          status: 'approved' as BlogStatus,
          approved_at: timestamp,
          reviewed_at: timestamp,
          is_live: false // Will be set to live separately
        };
        break;

      case 'reject':
        if (!reason) {
          return res.status(400).json({ 
            error: 'Rejection reason is required for reject action' 
          });
        }
        updateData = {
          ...updateData,
          status: 'rejected' as BlogStatus,
          rejected_at: timestamp,
          reviewed_at: timestamp,
          rejection_reason: reason,
          rejection_note: note || null
        };
        break;

      case 'feature':
        updateData = {
          ...updateData,
          featured: true
        };
        break;

      case 'unfeature':
        updateData = {
          ...updateData,
          featured: false
        };
        break;

      case 'archive':
        updateData = {
          ...updateData,
          status: 'archived' as BlogStatus,
          is_live: false
        };
        break;

      case 'under_review':
        updateData = {
          ...updateData,
          status: 'under_review' as BlogStatus,
          reviewed_at: timestamp
        };
        break;
    }

    // Get the current submission for logging
    const { data: currentSubmission, error: fetchError } = await supabase
      .from('blog_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !currentSubmission) {
      return res.status(404).json({ 
        error: 'Blog submission not found',
        details: fetchError?.message
      });
    }

    // Update the submission
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('blog_submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select(`
        *,
        users:user_id (
          id,
          email,
          username,
          display_name,
          first_name,
          surname
        )
      `)
      .single();

    if (updateError) {
      console.error('Submission update error:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update submission',
        details: updateError.message
      });
    }

    // Create audit log entry
    try {
      await supabase
        .from('admin_activity_log')
        .insert({
          action_type: action,
          target_type: 'blog_submission',
          target_id: submissionId,
          details: {
            submission_id: submissionId,
            submission_title: currentSubmission.title,
            previous_status: currentSubmission.status,
            new_status: updateData.status || currentSubmission.status,
            previous_featured: currentSubmission.featured,
            new_featured: updateData.featured !== undefined ? updateData.featured : currentSubmission.featured,
            reason: reason || null,
            note: note || null,
            timestamp
          },
          created_at: timestamp
        });
    } catch (logError) {
      console.warn('Failed to create audit log:', logError);
      // Don't fail the operation for logging errors
    }

    // Send notification email (if email system is configured)
    if (action === 'approve' || action === 'reject') {
      try {
        await sendStatusChangeEmail(updatedSubmission, action, reason, note);
      } catch (emailError) {
        console.warn('Failed to send notification email:', emailError);
        // Don't fail the operation for email errors
      }
    }

    // Prepare response
    const responseMessage = getActionMessage(action, updatedSubmission.title);

    return res.status(200).json({
      success: true,
      message: responseMessage,
      submission: {
        id: updatedSubmission.id,
        title: updatedSubmission.title,
        status: updatedSubmission.status,
        featured: updatedSubmission.featured,
        isLive: updatedSubmission.is_live,
        updatedAt: updatedSubmission.updated_at
      },
      action: action,
      timestamp
    });

  } catch (error) {
    console.error('Submission action API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Helper function to get action success message
function getActionMessage(action: ActionType, title: string): string {
  const messages = {
    approve: `Blog "${title}" has been approved`,
    reject: `Blog "${title}" has been rejected`,
    feature: `Blog "${title}" has been featured`,
    unfeature: `Blog "${title}" has been unfeatured`,
    archive: `Blog "${title}" has been archived`,
    under_review: `Blog "${title}" has been marked as under review`
  };
  
  return messages[action] || `Action ${action} completed for "${title}"`;
}

// Helper function to send status change emails
async function sendStatusChangeEmail(
  submission: any, 
  action: 'approve' | 'reject', 
  reason?: string, 
  note?: string
) {
  try {
    // This would integrate with your existing email system
    // For example, if you use Resend or another service
    
    const userEmail = submission.users?.email;
    if (!userEmail) {
      console.warn('No email found for user, skipping notification');
      return;
    }

    const emailData = {
      to: userEmail,
      blogTitle: submission.title,
      action: action,
      reason: reason,
      note: note,
      blogUrl: submission.url
    };

    // Example API call to your existing email service
    const response = await fetch('/api/send-rejection-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error(`Email service responded with status: ${response.status}`);
    }

    console.log(`${action} notification email sent to ${userEmail}`);
    
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}