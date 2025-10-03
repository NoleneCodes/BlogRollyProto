
import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../lib/email-templates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, planName, amount, delistDate } = req.body;

    if (!email || !firstName || !planName || !amount || !delistDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Use the correct service function and type
    const result = await emailService.sendPaymentFailedNotice(email, firstName, planName, amount, 'final', undefined, delistDate);

    return res.status(200).json({
      success: true,
      message: 'Payment failed final notice email sent successfully',
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
