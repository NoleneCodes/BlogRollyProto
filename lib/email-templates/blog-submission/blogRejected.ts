export const blogRejectedTemplate = {
  subject: 'Blog Submission Update - Action Required',
  template: (firstName: string, blogTitle: string, rejectionReason: string, rejectionNote?: string) => `
    <h1>Blog Submission Review Update</h1>
    <p>Hi ${firstName},</p>
    <p>Thank you for submitting "<strong>${blogTitle}</strong>" to BlogRolly. After review, we're unable to approve this submission at this time.</p>

    <p><strong>Reason:</strong> ${rejectionReason}</p>
    ${rejectionNote ? `<p><strong>Additional notes:</strong> ${rejectionNote}</p>` : ''}

    <p><strong>What you can do:</strong></p>
    <ul>
      <li>Review our <a href="https://blogrolly.com/guidelines">submission guidelines</a></li>
      <li>Make the necessary adjustments to your content</li>
      <li>Resubmit your post when ready</li>
    </ul>

    <p>We're here to help you succeed! If you have questions about this feedback, please don't hesitate to contact our support team.</p>
    <p>The BlogRolly Team</p>
  `
};