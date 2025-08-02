
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { verificationToken, approved, rejectionReason } = req.body;

    if (!verificationToken || typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'Verification token and approval status are required' });
    }

    if (!approved && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required when rejecting verification' });
    }

    // Find investor by LinkedIn verification token
    const { data: investor, error: findError } = await supabase
      .from('investor_users')
      .select('id, email, name, linkedin_url')
      .eq('linkedin_verification_token', verificationToken)
      .single();

    if (findError || !investor) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    const updateData = {
      linkedin_verified: approved,
      linkedin_verification_token: null,
      verification_status: approved ? 'fully_verified' : 'rejected',
      updated_at: new Date().toISOString()
    };

    // Update investor verification status
    const { error: updateError } = await supabase
      .from('investor_users')
      .update(updateData)
      .eq('id', investor.id);

    if (updateError) {
      console.error('LinkedIn approval update error:', updateError);
      return res.status(500).json({ error: 'Failed to update verification status' });
    }

    // Send notification email
    try {
      const { sendLinkedInVerificationResult } = await import('../../../lib/resend-client');
      await sendLinkedInVerificationResult(investor.email, investor.name, approved, rejectionReason);
    } catch (emailError) {
      console.error('LinkedIn result email failed:', emailError);
    }

    res.status(200).json({
      success: true,
      message: `LinkedIn verification ${approved ? 'approved' : 'rejected'} successfully`
    });

  } catch (error) {
    console.error('LinkedIn approval error:', error);
    res.status(500).json({ error: 'Internal server error during LinkedIn approval' });
  }
}
