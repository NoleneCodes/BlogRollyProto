import type { NextApiRequest, NextApiResponse } from 'next';
import { sendLinkedInVerificationResultEmail } from '../../../lib/linkedinVerificationData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, name, approved, rejectionReason } = req.body;
  try {
    await sendLinkedInVerificationResultEmail(email, name, approved, rejectionReason);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email', details: error });
  }
}
