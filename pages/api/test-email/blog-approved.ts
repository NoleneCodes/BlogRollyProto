
import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../lib/email-templates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, blogTitle, blogUrl } = req.body;
    
    if (!email || !firstName || !blogTitle || !blogUrl) {
      return res.status(400).json({ error: 'Email, firstName, blogTitle, and blogUrl are required' });
    }

    const result = await emailService.sendBlogStatusEmail(email, firstName, blogTitle, blogUrl, 'approved');
    
    return res.status(200).json({
      success: true,
      message: 'Blog approved email sent successfully',
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
