import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { logAdminActivity } from '../../../lib/userActivityTracker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bugId, newStatus, adminEmail } = req.body;
    if (!bugId || !newStatus || !adminEmail) {
      return res.status(400).json({ error: 'bugId, newStatus, and adminEmail are required' });
    }

    const { error: updateError } = await supabase
      .from('bug_reports')
      .update({ status: newStatus })
      .eq('id', bugId);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Log admin activity
    await logAdminActivity({
      adminEmail,
      action: `Updated bug report status to ${newStatus}`,
      target: bugId,
      tab: 'Bug Reports',
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
