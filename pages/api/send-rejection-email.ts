
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseHelpers } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { blogSubmissionId } = req.body;
    
    if (!blogSubmissionId) {
      return res.status(400).json({ error: 'Blog submission ID is required' });
    }

    // Send rejection email using blog review data
    const result = await supabaseHelpers.sendRejectionEmailFromReview(blogSubmissionId);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      message: 'Rejection email sent successfully using blog review data'
    });
  } catch (error) {
    console.error('Send rejection email error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
