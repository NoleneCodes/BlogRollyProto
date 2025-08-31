import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        authenticated: false, 
        error: 'No authorization header' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        authenticated: false, 
        error: 'Invalid or expired token' 
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        blogger_profiles(
          stripe_customer_id,
          subscription_status,
          subscription_end_date
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ 
        authenticated: false, 
        error: 'Failed to load user profile' 
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: profile.first_name,
        surname: profile.surname,
        role: profile.role,
        tier: profile.tier,
        isAuthenticated: true
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ 
      authenticated: false, 
      error: 'Authentication check failed' 
    });
  }
}