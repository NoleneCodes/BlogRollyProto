
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
      .select('id, email, name, is_verified')
      .eq('verification_token', token)
      .single();

    if (findError || !investor) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    if (investor.is_verified) {
      return res.status(200).json({ 
        success: true, 
        message: 'Email already verified. You can now log in to your investor dashboard.' 
      });
    }

    // Verify the account
    const { error: updateError } = await supabase
      .from('investor_users')
      .update({ 
        is_verified: true, 
        verification_token: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', investor.id);

    if (updateError) {
      console.error('Verification update error:', updateError);
      return res.status(500).json({ error: 'Failed to verify account' });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in to your investor dashboard.',
      investor: {
        email: investor.email,
        name: investor.name
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
}
