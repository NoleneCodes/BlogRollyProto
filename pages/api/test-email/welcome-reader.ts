
import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../lib/email-templates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName } = req.body;
    
    if (!email || !firstName) {
      return res.status(400).json({ error: 'Email and firstName are required' });
    }

    const result = await emailService.sendWelcomeEmail(email, firstName, 'reader');
    
    return res.status(200).json({
      success: true,
      message: 'Welcome reader email sent successfully',
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
