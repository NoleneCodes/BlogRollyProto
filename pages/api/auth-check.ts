import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check for Repl Auth headers first (for development)
    const userId = req.headers['x-replit-user-id'] as string;
    const userName = req.headers['x-replit-user-name'] as string;
    const userRoles = req.headers['x-replit-user-roles'] as string;

    if (userId && userName) {
      return res.status(200).json({
        isAuthenticated: true,
        userId,
        userName,
        userRoles
      });
    }

    // Check if there's a session cookie or token
    const authCookie = req.cookies['auth-token'] || req.headers.authorization;

    // For development/testing, you can simulate being authenticated
    // Remove this and implement proper auth check in production
    const isAuthenticated = false; // Change to true for testing authenticated state

    if (isAuthenticated || authCookie) {
      return res.status(200).json({
        isAuthenticated: true,
        userId: 'test-user-id',
        userRoles: 'reader'
      });
    } else {
      return res.status(200).json({
        isAuthenticated: false
      });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({
      isAuthenticated: false,
      error: 'Authentication check failed'
    });
  }
}