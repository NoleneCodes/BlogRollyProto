
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find investor by verification token

      const { data: investor, error: findError } = await supabase
        .from('investor_users')
        .select('id, email, name, is_verified, token_expires_at')
        .eq('verification_token', token)
        .single();

    if (findError || !investor) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

      // Check if token is expired
      if (investor.token_expires_at && new Date() > new Date(investor.token_expires_at)) {
        return res.status(400).json({ error: 'Verification token has expired. Please request a new verification email.' });
      }

    if (investor.is_verified) {
      return res.status(200).json({ 
        success: true, 
        message: 'Email already verified. You can now log in to your investor dashboard.' 
      });
    }

    // Verify the email and move to LinkedIn verification step
    const { error: updateError } = await supabase
      .from('investor_users')
      .update({ 
        is_verified: true, 
        verification_token: null,
        verification_status: 'pending_linkedin',
        updated_at: new Date().toISOString()
      })
      .eq('id', investor.id);

    if (updateError) {
      console.error('Verification update error:', updateError);
      return res.status(500).json({ error: 'Failed to verify account' });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Please complete LinkedIn verification to access your investor dashboard.',
      investor: {
        email: investor.email,
        name: investor.name
      },
      nextStep: 'linkedin_verification'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
}
