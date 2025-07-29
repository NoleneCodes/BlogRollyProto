
export const supportRequestReplyTemplate = {
  subject: 'Re: Support Request #{ticketId}',
  template: (firstName: string, ticketId: string, originalMessage: string, supportReply: string) => `
    <h1>Support Team Response</h1>
    <p>Hi ${firstName},</p>
    <p>We have an update regarding your support request (Ticket #${ticketId}).</p>
    
    <p><strong>Our Response:</strong></p>
    <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin: 15px 0;">
      ${supportReply}
    </div>

    <p><strong>Your Original Message:</strong></p>
    <blockquote style="border-left: 3px solid #c42142; padding-left: 15px; margin: 15px 0; color: #666;">
      ${originalMessage}
    </blockquote>

    <p>If you need further assistance, simply reply to this email.</p>
    <p>The BlogRolly Support Team</p>
  `
};
