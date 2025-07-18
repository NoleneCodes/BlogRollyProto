
import type { NextApiRequest, NextApiResponse } from 'next';

type AdminAuthData = {
  authenticated: boolean;
  authorized: boolean;
  userId?: string;
  userName?: string;
  userRoles?: string;
  message?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminAuthData>
) {
  // Check for Repl Auth headers
  const userId = req.headers['x-replit-user-id'] as string;
  const userName = req.headers['x-replit-user-name'] as string;
  const userRoles = req.headers['x-replit-user-roles'] as string;
  
  // Temporary logging to see your username - remove after adding to authorized list
  console.log('Username attempting access:', userName);

  if (!userId || !userName) {
    return res.status(200).json({
      authenticated: false,
      authorized: false,
      message: 'Authentication required'
    });
  }

  // Define authorized users (BlogRolly team members)
  const authorizedUsers = [
    // Add your specific Replit username here
    // To find your username, check the console when you're logged in
    // or temporarily add console.log(userName) below to see it
  ];

  const roles = userRoles ? userRoles.split(',') : [];
  const isTeamMember = authorizedUsers.includes(userName) || 
                      roles.includes('admin') || 
                      roles.includes('blogrolly-admin');

  if (isTeamMember) {
    res.status(200).json({
      authenticated: true,
      authorized: true,
      userId,
      userName,
      userRoles
    });
  } else {
    res.status(200).json({
      authenticated: true,
      authorized: false,
      userId,
      userName,
      userRoles,
      message: 'Insufficient permissions for admin access'
    });
  }
}
