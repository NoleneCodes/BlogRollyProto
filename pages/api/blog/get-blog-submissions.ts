import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase
      .from('blog_submissions')
      .select('id, title, user_id, status, created_at, url')
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Optionally fetch author name from user_profiles if needed
    // For now, just return user_id as author
    const submissions = (data || []).map(sub => ({
      id: sub.id,
      title: sub.title,
      author: sub.user_id, // Replace with actual author name if available
      status: sub.status,
      submittedAt: sub.created_at,
      url: sub.url
    }));

    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch blog submissions.' });
  }
}
