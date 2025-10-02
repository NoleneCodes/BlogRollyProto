import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q = '' } = req.query;
  const query = typeof q === 'string' ? q.trim() : '';

  try {
    // Fetch matching titles
    const { data: titleData, error: titleError } = await supabase
      .from('blog_submissions')
      .select('title')
      .ilike('title', `${query}%`)
      .limit(10);

    // Fetch matching categories
    const { data: categoryData, error: categoryError } = await supabase
      .from('blog_submissions')
      .select('category')
      .ilike('category', `${query}%`)
      .limit(10);

    if (titleError || categoryError) {
      return res.status(500).json({ error: 'Failed to fetch suggestions' });
    }

    // Deduplicate and prioritize exact matches
    const titles = Array.isArray(titleData) ? [...new Set(titleData.map(t => t.title))] : [];
    const categories = Array.isArray(categoryData) ? [...new Set(categoryData.map(c => c.category))] : [];

    return res.status(200).json({
      titles,
      categories
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
