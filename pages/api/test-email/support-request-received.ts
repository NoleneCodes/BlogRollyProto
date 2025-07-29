
import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../lib/email-templates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, ticketId, supportMessage } = req.body;
    
    if (!email || !firstName || !ticketId || !supportMessage) {
      return res.status(400).json({ error: 'Email, firstName, ticketId, and supportMessage are required' });
    }

    const result = await emailService.sendSupportRequestReceived(email, firstName, ticketId, supportMessage, '24-48 hours');
    
    return res.status(200).json({
      success: true,
      message: 'Support request received email sent successfully',
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
