import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { logAdminActivity } from '../../lib/userActivityTracker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requestId, adminResponse, adminEmail } = req.body;
    if (!requestId || !adminResponse || !adminEmail) {
      return res.status(400).json({ error: 'requestId, adminResponse, and adminEmail are required' });
    }

    const { error: updateError } = await supabase
      .from('support_requests')
      .update({
        status: 'responded',
        admin_response: adminResponse,
        admin_responder: adminEmail,
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    await logAdminActivity({
      adminEmail,
      action: `Responded to support request`,
      target: requestId,
      tab: 'Support Requests',
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
