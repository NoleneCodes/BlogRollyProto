
import { NextApiRequest, NextApiResponse } from 'next';
import { addEmailToThread, getSupportRequestById } from '../../../lib/supportRequestData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ticketId, userEmail, message } = req.body;
    
    if (!ticketId || !userEmail || !message) {
      return res.status(400).json({ error: 'Ticket ID, user email, and message are required' });
    }

    // Verify the ticket exists
    const ticket = getSupportRequestById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    // Add the user response to the email thread
    const success = addEmailToThread(ticketId, {
      from: 'user',
      sender: userEmail,
      content: message
    });

    if (success) {
      return res.status(200).json({
        success: true,
        message: 'User response added to ticket'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to add user response'
      });
    }
  } catch (error) {
    console.error('Error adding user response:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
