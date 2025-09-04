// Check user's pro status with Stripe verification
import type { NextApiRequest, NextApiResponse } from 'next';
// Make sure the path and file exist, or update as needed
import { supabaseDB } from '../../lib/supabase'; // adjust path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = req.body.user; // or get user from session/cookie as needed

  const { isPremium, error: premiumError, tier, subscriptionStatus, subscriptionEndDate } = await supabaseDB.isUserPremium(user.id);

  if (premiumError) {
    return res.status(500).json({
      isPremium: false,
      error: 'Failed to check pro status'
    });
  }

  // Also sync the user's tier with their actual Stripe status
  try {
    await supabaseDB.verifyAndSyncUserTier(user.id);
  } catch (syncError) {
    return res.status(500).json({
      isPremium: false,
      error: 'Failed to sync user tier'
    });
  }

  return res.status(200).json({
    isPremium,
    tier,
    subscriptionStatus,
    subscriptionEndDate
  });
}