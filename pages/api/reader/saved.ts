// Next.js API route: /api/reader/saved
// Handles saving and removing blogs for a reader
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Save blog
    const { readerId, blogId } = req.body;
    if (!readerId || !blogId) return res.status(400).json({ error: 'Missing readerId or blogId' });
    const { error } = await supabase
      .from('reader_saved_blogs')
      .insert([{ reader_id: readerId, blog_id: blogId }]);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'DELETE') {
    // Remove saved blog
    const { readerId, blogId } = req.body;
    if (!readerId || !blogId) return res.status(400).json({ error: 'Missing readerId or blogId' });
    const { error } = await supabase
      .from('reader_saved_blogs')
      .delete()
      .eq('reader_id', readerId)
      .eq('blog_id', blogId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    // Get saved blogs for reader
    const { readerId } = req.query;
    if (!readerId) return res.status(400).json({ error: 'Missing readerId' });
    const { data, error } = await supabase
      .from('reader_saved_blogs')
      .select('blog_id, saved_at')
      .eq('reader_id', readerId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ blogs: data });
  }
  res.setHeader('Allow', ['POST', 'DELETE', 'GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
