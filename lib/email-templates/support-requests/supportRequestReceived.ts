
export const supportRequestReceivedTemplate = {
  subject: 'Support Request Received - We\'re Here to Help!',
  template: (userName: string, ticketId: string, supportMessage: string, estimatedResponse?: string) => `
    <h1>Support Request Received</h1>
    <p>Hi ${userName},</p>
    <p>Thank you for contacting BlogRolly support. We've received your request and will get back to you soon.</p>
    <p><strong>Ticket ID:</strong> ${ticketId}</p>
    <p><strong>Your Message:</strong></p>
    <blockquote style="border-left: 3px solid #c42142; padding-left: 15px; margin: 15px 0; color: #666;">
      ${supportMessage}
    </blockquote>
    ${estimatedResponse ? `<p><strong>Estimated Response Time:</strong> ${estimatedResponse}</p>` : ''}
    <p>We'll reply to this email address with our response. Please keep the ticket ID for reference.</p>
    <p>The BlogRolly Support Team</p>
  `
};
