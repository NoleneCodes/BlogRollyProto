import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Fetch LinkedIn verifications from investor_users table
  const { data, error } = await supabase
    .from('investor_users')
    .select('id, name, linkedin_url, linkedin_verification_status, linkedin_verification_requested_at, email')
    .not('linkedin_url', 'is', null)
    .not('linkedin_verification_status', 'is', null);
  if (error) {
    return res.status(500).json({ error: 'Failed to fetch verifications', details: error });
  }
  // Map to LinkedInVerification type expected by frontend
  const verifications = (data || []).map((item: any) => ({
    id: item.id,
    bloggerName: item.name,
    linkedinUrl: item.linkedin_url,
    status: item.linkedin_verification_status,
    date: item.linkedin_verification_requested_at ? new Date(item.linkedin_verification_requested_at).toISOString().split('T')[0] : '',
    dateSort: item.linkedin_verification_requested_at ? Number(new Date(item.linkedin_verification_requested_at).toISOString().replace(/[-:T]/g, '').slice(0,8)) : 0,
    email: item.email
  }));
  return res.status(200).json(verifications);
}
