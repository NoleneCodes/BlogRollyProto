import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

// GET: fetch reading history for user
// POST: add blog to reading history
// DELETE: remove blog from reading history
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string; // You should use your auth system
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    // Fetch reading history
    const { data, error } = await supabase
      .from('reading_history')
      .select('blog_id')
      .eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ blogIds: data.map(d => d.blog_id) });
  }

  if (req.method === 'POST') {
    const { blogId } = req.body;
    if (!blogId) return res.status(400).json({ error: 'Missing blogId' });
    const { error } = await supabase
      .from('reading_history')
      .upsert({ user_id: userId, blog_id: blogId });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { blogId } = req.body;
    if (!blogId) return res.status(400).json({ error: 'Missing blogId' });
    const { error } = await supabase
      .from('reading_history')
      .delete()
      .eq('user_id', userId)
      .eq('blog_id', blogId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
