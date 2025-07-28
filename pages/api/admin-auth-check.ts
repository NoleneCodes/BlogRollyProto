
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
  try {
    // Get the session from the request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(200).json({
        authenticated: false,
        authorized: false,
        message: 'No authentication token provided'
      });
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(200).json({
        authenticated: false,
        authorized: false,
        message: 'Invalid or expired authentication token'
      });
    }

    // Check if the user is an authorized admin
    const authorizedAdminEmails = [
      'hello@blogrolly.com'
    ];

    const isAuthorizedAdmin = authorizedAdminEmails.includes(user.email || '');

    if (isAuthorizedAdmin) {
      res.status(200).json({
        authenticated: true,
        authorized: true,
        userId: user.id,
        userEmail: user.email
      });
    } else {
      res.status(200).json({
        authenticated: true,
        authorized: false,
        userId: user.id,
        userEmail: user.email,
        message: 'Only BlogRolly administrators can access this area'
      });
    }
  } catch (error) {
    console.error('Admin auth check error:', error);
    res.status(500).json({
      authenticated: false,
      authorized: false,
      message: 'Authentication check failed'
    });
  }
}
