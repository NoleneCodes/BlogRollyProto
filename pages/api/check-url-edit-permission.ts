
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
// Make sure the file exists at the specified path and exports supabaseDB
import { supabaseDB } from '../../lib/supabase';
// If the file does not exist, create '../../lib/supabaseDB.ts' and export supabaseDB from it.

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

    // Check if user has premium status with Stripe verification
    const { isPremium, error: premiumError, tier } = await supabaseDB.isUserPremium(user.id);
    
    if (premiumError) {
      console.error('Error checking premium status:', premiumError);
      return res.status(500).json({ error: 'Failed to check user status' });
    }

    // Sync tier with Stripe status
    await supabaseDB.verifyAndSyncUserTier(user.id);
    
    return res.status(200).json({ 
      canEditUrl: isPremium,
      isPremium,
      tier: tier || 'free',
      note: 'This permission is for editing individual blog post URLs, not the main blog domain'
    });
    
  } catch (error) {
    console.error('Error in URL edit permission check:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
