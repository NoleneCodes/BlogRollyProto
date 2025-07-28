
export const blogRejectedTemplate = {
  subject: 'Blog Submission Update',
  template: (blogTitle: string, userName: string, rejectionReason: string, rejectionNote?: string) => `
    <h1>Update on Your Blog Submission</h1>
    <p>Hi ${userName},</p>
    <p>Thank you for submitting <strong>${blogTitle}</strong>.</p>
    <p>Unfortunately, we're unable to approve it at this time due to: <strong>${rejectionReason}</strong></p>
    ${rejectionNote ? `<p><strong>Additional notes:</strong> ${rejectionNote}</p>` : ''}
    <p>Don't worry! You can make adjustments and resubmit anytime.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/submit" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Submit Again
    </a>
    <p>If you have questions about this decision, please contact our support team.</p>
    <p>The BlogRolly Team</p>
  `
};
