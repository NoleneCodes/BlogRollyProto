
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseDB } from '../../lib/supabase';

type PremiumStatusData = {
  isPremium: boolean;
  tier?: string;
  subscriptionStatus?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PremiumStatusData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      isPremium: false,
      error: 'Method not allowed'
    });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        isPremium: false,
        error: 'No authentication token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        isPremium: false,
        error: 'Invalid authentication token'
      });
    }

    // Check user's premium status
    const { data: profile, error: profileError } = await supabaseDB.getUserWithBloggerProfile(user.id);
    
    if (profileError) {
      return res.status(500).json({
        isPremium: false,
        error: 'Failed to check premium status'
      });
    }

    const isPremium = profile?.tier === 'pro';
    const subscriptionStatus = profile?.blogger_profiles?.[0]?.subscription_status;

    // Additional check: verify subscription is actually active
    const isActiveSubscription = subscriptionStatus === 'active';

    return res.status(200).json({
      isPremium: isPremium && isActiveSubscription,
      tier: profile?.tier,
      subscriptionStatus
    });

  } catch (error) {
    console.error('Premium status check error:', error);
    return res.status(500).json({
      isPremium: false,
      error: 'Premium status check failed'
    });
  }
}
