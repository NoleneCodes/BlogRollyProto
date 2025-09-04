
import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../lib/email-templates';
import { BlogStatusHelpers } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, blogTitle, rejectionReason, rejectionNote, blogSubmissionId } = req.body;
    
    // If blogSubmissionId is provided, use actual blog review data
    if (blogSubmissionId) {
  const result = await BlogStatusHelpers.sendRejectionEmailFromReview(blogSubmissionId);
      
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Blog rejected email sent successfully using review data',
        data: result
      });
    }
    
    // Fallback to manual test data
    if (!email || !firstName || !blogTitle || !rejectionReason) {
      return res.status(400).json({ error: 'Email, firstName, blogTitle, and rejectionReason are required (or provide blogSubmissionId for real data)' });
    }

    // Convert rejection reason to human-readable label if it's a code
    const reasonLabel = rejectionReason.includes('_') ? 
  BlogStatusHelpers.getRejectionReasonLabel(rejectionReason) : 
      rejectionReason;

    const result = await emailService.sendBlogStatusEmail(email, firstName, blogTitle, '', 'rejected', reasonLabel, rejectionNote);
    
    return res.status(200).json({
      success: true,
      message: 'Test blog rejected email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
