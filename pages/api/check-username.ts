import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username required' });
  }

  // Check username in user_profiles table
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('username', username)
    .limit(1);

  if (error) {
    return res.status(500).json({ error: 'Database error' });
  }

  res.status(200).json({ exists: data && data.length > 0 });
}
