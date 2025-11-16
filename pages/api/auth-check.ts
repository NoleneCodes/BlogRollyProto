import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 Auth check started');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create Supabase client with session from cookies
    console.log('🔍 Creating Supabase client');
    const supabase = createPagesServerClient({ req, res });
    
    // Get the current user session
    console.log('🔍 Getting session');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔍 Session result:', { hasSession: !!session, hasUser: !!session?.user, error: sessionError });
    
    if (sessionError || !session?.user) {
      console.log('🔍 No valid session found');
      return res.status(401).json({ 
        authenticated: false, 
        error: 'No valid session' 
      });
    }

    const user = session.user;
    console.log('🔍 User found:', user.id, user.email);

    // Get user profile
    console.log('🔍 Fetching user profile');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, first_name, surname, username')
      .eq('user_id', user.id)
      .single();

    console.log('🔍 Profile result:', { profile, error: profileError });

    if (profileError) {
      // User might not have a profile yet, return basic auth info
      console.log('🔍 No profile found, returning basic auth');
      return res.status(200).json({
        authenticated: true,
        userId: user.id,
        userName: user.email?.split('@')[0] || 'User',
        userRoles: 'reader'
      });
    }

    console.log('🔍 Returning full profile');
    return res.status(200).json({
      authenticated: true,
      userId: user.id,
      userName: profile.username || profile.first_name || user.email?.split('@')[0] || 'User',
      userRoles: profile.role || 'reader'
    });

  } catch (error) {
    console.error('🔍 Auth check error:', error);
    return res.status(401).json({ 
      authenticated: false, 
      error: 'Authentication check failed' 
    });
  }
}