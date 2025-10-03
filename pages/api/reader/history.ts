// Next.js API route: /api/reader/history
// Handles adding and fetching reading history for a reader
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Add to reading history
    const { readerId, blogId } = req.body;
    if (!readerId || !blogId) return res.status(400).json({ error: 'Missing readerId or blogId' });
    const { error } = await supabase
      .from('reader_reading_history')
      .insert([{ reader_id: readerId, blog_id: blogId }]);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    // Get reading history for reader
    const { readerId } = req.query;
    if (!readerId) return res.status(400).json({ error: 'Missing readerId' });
    const { data, error } = await supabase
      .from('reader_reading_history')
      .select('blog_id, read_at')
      .eq('reader_id', readerId)
      .order('read_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ history: data });
  }
  res.setHeader('Allow', ['POST', 'GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
