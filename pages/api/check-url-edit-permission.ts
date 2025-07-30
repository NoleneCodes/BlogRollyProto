
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user has premium status
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('subscription_status, tier')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ error: 'Failed to check user status' });
    }

    const isPremium = profile?.subscription_status === 'active' || profile?.tier === 'pro';
    
    return res.status(200).json({ 
      canEditUrl: isPremium,
      isPremium,
      tier: profile?.tier || 'free'
    });
    
  } catch (error) {
    console.error('Error in URL edit permission check:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
