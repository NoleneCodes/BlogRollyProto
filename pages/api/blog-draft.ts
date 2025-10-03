import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const draft = { ...req.body, user_id: user.id };
    const { error } = await supabase
      .from('blog_drafts')
      .upsert([draft], { onConflict: 'user_id' });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('blog_drafts')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('blog_drafts')
      .delete()
      .eq('user_id', user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
