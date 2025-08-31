
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { TAGS } from '../../../lib/categories-tags';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all tags from live blog submissions
    const { data: blogs, error } = await supabase
      .from('blog_submissions')
      .select('tags')
      .eq('status', 'live')
      .eq('is_live', true);

    if (error) {
      console.error('Error fetching tags:', error);
      return res.status(500).json({ error: 'Failed to fetch tags' });
    }

    // Extract all unique tags from the blogs
    const allUsedTags = new Set<string>();
    blogs?.forEach(blog => {
      blog.tags?.forEach((tag: string) => allUsedTags.add(tag));
    });

    // Filter the centralized TAGS object to only include categories with used tags
    const filteredTagCategories: Record<string, string[]> = {};
    
    Object.entries(TAGS).forEach(([categoryName, tagsInCategory]) => {
      const usedTagsInCategory = tagsInCategory.filter(tag => 
        tag !== 'Other' && allUsedTags.has(tag)
      );
      
      // Only include categories that have at least one used tag
      if (usedTagsInCategory.length > 0) {
        filteredTagCategories[categoryName] = usedTagsInCategory;
      }
    });

    return res.status(200).json({
      tagCategories: filteredTagCategories,
      allUsedTags: Array.from(allUsedTags).sort(),
      totalUsedTags: allUsedTags.size
    });

  } catch (error) {
    console.error('Tags API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
