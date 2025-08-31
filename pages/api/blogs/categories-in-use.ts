
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { MAIN_CATEGORIES } from '../../../lib/categories-tags';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all categories from live blog submissions
    const { data: blogs, error } = await supabase
      .from('blog_submissions')
      .select('category')
      .eq('status', 'live')
      .eq('is_live', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }

    // Extract unique categories
    const usedCategories = new Set<string>();
    blogs?.forEach(blog => {
      if (blog.category) {
        usedCategories.add(blog.category);
      }
    });

    // Filter main categories to only include those in use
    const filteredCategories = MAIN_CATEGORIES.filter(category => 
      category === 'Other' || usedCategories.has(category)
    );

    return res.status(200).json({
      categories: filteredCategories,
      allUsedCategories: Array.from(usedCategories).sort(),
      totalUsedCategories: usedCategories.size
    });

  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
