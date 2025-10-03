import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify this is a cron request (add proper auth in production)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run daily security metrics aggregation
    const { error: metricsError } = await supabase
      .rpc('update_security_metrics_daily');

    if (metricsError) {
      console.error('Security metrics update failed:', metricsError);
    }

    // Clean up old logs (7 years retention for compliance)
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc('cleanup_old_security_logs', { retention_days: 2555 });

    if (cleanupError) {
      console.error('Security logs cleanup failed:', cleanupError);
    }

    res.status(200).json({
      success: !metricsError && !cleanupError,
      metrics_updated: !metricsError,
      logs_cleaned: cleanupResult || 0
    });

  } catch (error) {
    console.error('Security maintenance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
