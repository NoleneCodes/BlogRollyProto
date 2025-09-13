// API route: /api/blogs/batch
// Fetches blog details for a list of blog IDs
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { blogIds } = req.body;
  if (!Array.isArray(blogIds) || blogIds.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid blogIds' });
  }
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .in('id', blogIds);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ blogs: data });
}
