import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all users
    const { data: users, error: userError } = await supabase.from('users').select('*');
    if (userError) throw userError;

    // Get all bloggers
    const { data: bloggers, error: bloggerError } = await supabase.from('bloggers').select('*');
    if (bloggerError) throw bloggerError;

    // Get all readers
    const { data: readers, error: readerError } = await supabase.from('readers').select('*');
    if (readerError) throw readerError;

    // Get all investors
    const { data: investors, error: investorError } = await supabase.from('investor_users').select('*');
    if (investorError) throw investorError;

    // Get all blog submissions
    const { data: blogPosts, error: blogError } = await supabase.from('blog_submissions').select('*');
    if (blogError) throw blogError;

    // Get all premium/pro users
    const premiumMembers = users.filter(u => u.tier === 'pro' || u.subscription_status === 'active');

    // Active bloggers: bloggers with at least 1 post
    const activeBloggerIds = new Set(blogPosts.filter(post => post.status === 'approved').map(post => post.user_id));
    const activeBloggers = bloggers.filter(b => activeBloggerIds.has(b.user_id));

    // Total users = bloggers + readers + investors
    const totalUsers = bloggers.length + readers.length + investors.length;

    res.status(200).json({
      totalUsers,
      activeBloggers: activeBloggers.length,
      readers: readers.length,
      premiumMembers: premiumMembers.length,
      investors: investors.length,
      bloggers: bloggers.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch user stats.' });
  }
}
