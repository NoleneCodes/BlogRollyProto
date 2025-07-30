
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseDB } from '../../lib/supabase';

type SyncResponse = {
  success: boolean;
  synced?: boolean;
  changed?: boolean;
  oldTier?: string;
  newTier?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyncResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    // Verify and sync user tier with Stripe status
    const result = await supabaseDB.verifyAndSyncUserTier(user.id);
    
    if (result.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to sync user tier'
      });
    }

    return res.status(200).json({
      success: true,
      synced: result.synced,
      changed: result.changed,
      oldTier: result.oldTier,
      newTier: result.newTier
    });

  } catch (error) {
    console.error('Tier sync error:', error);
    return res.status(500).json({
      success: false,
      error: 'Tier sync failed'
    });
  }
}
