
import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../lib/email-templates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, resetLink } = req.body;
    
    if (!email || !firstName || !resetLink) {
      return res.status(400).json({ error: 'Email, firstName, and resetLink are required' });
    }

    const result = await emailService.sendPasswordResetEmail(email, firstName, resetLink);
    
    return res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
