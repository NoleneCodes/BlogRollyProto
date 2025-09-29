
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

type AdminAuthData = {
  authenticated: boolean;
  authorized: boolean;
  userId?: string;
  userEmail?: string;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminAuthData>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      authenticated: false,
      authorized: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log('Admin auth check started');
    
    // Get the session from the request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header provided');
      return res.status(401).json({
        authenticated: false,
        authorized: false,
        message: 'No authentication token provided'
      });
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).json({
        authenticated: false,
        authorized: false,
        message: 'Invalid authorization header format'
      });
    }
    
    console.log('Verifying token with Supabase');
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Supabase auth error:', error);
      return res.status(401).json({
        authenticated: false,
        authorized: false,
        message: 'Authentication token verification failed'
      });
    }

    if (!user) {
      console.log('No user found for token');
      return res.status(401).json({
        authenticated: false,
        authorized: false,
        message: 'Invalid or expired authentication token'
      });
    }

    console.log('User authenticated:', user.email);

    // Only allow @blogrolly.com emails as admins
    const email = user.email || '';
    const isAuthorizedAdmin = email.endsWith('@blogrolly.com');

    if (isAuthorizedAdmin) {
      console.log('User authorized as admin');
      return res.status(200).json({
        authenticated: true,
        authorized: true,
        userId: user.id,
        userEmail: user.email
      });
    } else {
      console.log('User not authorized as admin:', user.email);
      return res.status(403).json({
        authenticated: true,
        authorized: false,
        userId: user.id,
        userEmail: user.email,
        message: 'Only BlogRolly administrators with @blogrolly.com emails can access this area'
      });
    }
  } catch (error) {
    console.error('Admin auth check error:', error);
    return res.status(500).json({
      authenticated: false,
      authorized: false,
      message: 'Authentication check failed'
    });
  }
}
