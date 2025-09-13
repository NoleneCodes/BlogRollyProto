// Next.js API route: /api/follow
// Handles follow and unfollow actions for readers and bloggers
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Follow blogger
    const { readerId, bloggerId } = req.body;
    if (!readerId || !bloggerId) return res.status(400).json({ error: 'Missing readerId or bloggerId' });
    const { error } = await supabase
      .from('blogger_follows')
      .insert([{ reader_id: readerId, blogger_id: bloggerId }]);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'DELETE') {
    // Unfollow blogger
    const { readerId, bloggerId } = req.body;
    if (!readerId || !bloggerId) return res.status(400).json({ error: 'Missing readerId or bloggerId' });
    const { error } = await supabase
      .from('blogger_follows')
      .delete()
      .eq('reader_id', readerId)
      .eq('blogger_id', bloggerId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }
  // Get following count for a blogger
  if (req.method === 'GET') {
    const { bloggerId } = req.query;
    if (!bloggerId) return res.status(400).json({ error: 'Missing bloggerId' });
    const { count, error } = await supabase
      .from('blogger_follows')
      .select('*', { count: 'exact', head: true })
      .eq('blogger_id', bloggerId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ count });
  }
  res.setHeader('Allow', ['POST', 'DELETE', 'GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
