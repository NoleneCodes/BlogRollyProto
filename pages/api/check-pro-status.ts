
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseDB } from '../../lib/supabase';

type ProStatusData = {
  isPro: boolean;
  tier?: string;
  subscriptionStatus?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProStatusData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      isPro: false,
      error: 'Method not allowed'
    });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        isPro: false,
        error: 'No authentication token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        isPro: false,
        error: 'Invalid authentication token'
      });
    }

    // Check user's pro status
    const { data: profile, error: profileError } = await supabaseDB.getUserWithBloggerProfile(user.id);
    
    if (profileError) {
      return res.status(500).json({
        isPro: false,
        error: 'Failed to check pro status'
      });
    }

    const isPro = profile?.tier === 'pro';
    const subscriptionStatus = profile?.blogger_profiles?.[0]?.subscription_status;

    // Additional check: verify subscription is actually active
    const isActiveSubscription = subscriptionStatus === 'active';

    return res.status(200).json({
      isPro: isPro && isActiveSubscription,
      tier: profile?.tier,
      subscriptionStatus
    });

  } catch (error) {
    console.error('Pro status check error:', error);
    return res.status(500).json({
      isPro: false,
      error: 'Pro status check failed'
    });
  }
}
