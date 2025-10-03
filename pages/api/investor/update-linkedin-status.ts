import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id, status, admin_user_id } = req.body;
  if (!id || !status) {
    return res.status(400).json({ error: 'Missing id or status' });
  }
  // Update investor_users table
  const { error } = await supabase
    .from('investor_users')
    .update({
      linkedin_verification_status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  if (error) {
    return res.status(500).json({ error: 'Failed to update status', details: error });
  }
  // Log admin activity
  if (admin_user_id) {
    await supabase.from('admin_activity_log').insert([
      {
        admin_user_id,
        action_type: status === 'approved' ? 'approve_linkedin_verification' : status === 'rejected' ? 'reject_linkedin_verification' : 'update_linkedin_verification',
        target_type: 'investor_user',
        target_id: id,
        details: { status },
      }
    ]);
  }
  return res.status(200).json({ success: true });
}
