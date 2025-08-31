
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session/auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { method, verified } = req.body;

    if (!method || typeof verified !== 'boolean') {
      return res.status(400).json({ error: 'Method and verified status required' });
    }

    // Update blogger profile with verification status
    const { data: bloggerProfile, error: updateError } = await supabase
      .from('blogger_profiles')
      .update({
        domain_verification_status: verified ? 'verified' : 'failed',
        domain_verification_method: method,
        domain_verified_at: verified ? new Date().toISOString() : null,
        domain_last_check: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Domain verification update error:', updateError);
      return res.status(500).json({ error: 'Failed to update verification status' });
    }

    return res.status(200).json({
      success: true,
      verification_status: bloggerProfile.domain_verification_status,
      verified_at: bloggerProfile.domain_verified_at
    });

  } catch (error) {
    console.error('Domain verification API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
