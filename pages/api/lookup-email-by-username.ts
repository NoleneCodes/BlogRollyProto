import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations (add this to your .env.local)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // Look up the user profile by username
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('username', username.toLowerCase().trim())
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ 
        error: 'Username not found',
        found: false 
      });
    }

    // Get the user's email from the auth.users table using admin client
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.user_id);

    if (userError || !user || !user.email) {
      return res.status(404).json({ 
        error: 'User email not found',
        found: false 
      });
    }

    return res.status(200).json({
      found: true,
      email: user.email
    });

  } catch (error) {
    console.error('Username lookup error:', error);
    return res.status(500).json({ 
      error: 'Failed to lookup username',
      found: false 
    });
  }
}