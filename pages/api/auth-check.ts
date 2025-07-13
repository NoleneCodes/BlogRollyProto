
import type { NextApiRequest, NextApiResponse } from 'next';

type AuthData = {
  authenticated: boolean;
  userId?: string;
  userName?: string;
  userRoles?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthData>
) {
  // Check for Repl Auth headers
  const userId = req.headers['x-replit-user-id'] as string;
  const userName = req.headers['x-replit-user-name'] as string;
  const userRoles = req.headers['x-replit-user-roles'] as string;

  if (userId && userName) {
    res.status(200).json({
      authenticated: true,
      userId,
      userName,
      userRoles
    });
  } else {
    res.status(200).json({
      authenticated: false
    });
  }
}
