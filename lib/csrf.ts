
import crypto from 'crypto';

export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  if (!token || !sessionToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(sessionToken, 'hex')
  );
};

export const addCSRFProtection = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const token = req.headers['x-csrf-token'] as string;
    const sessionToken = req.headers['x-session-csrf'] as string;
    
    if (!validateCSRFToken(token, sessionToken)) {
      res.status(403).json({ error: 'Invalid CSRF token' });
      return false;
    }
  }
  return true;
};
