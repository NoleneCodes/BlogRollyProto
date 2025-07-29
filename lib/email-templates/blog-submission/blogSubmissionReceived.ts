export const blogSubmissionReceivedTemplate = {
  subject: 'Blog Submission Received - Under Review',
  template: (firstName: string, blogTitle: string) => `
    <h1>Blog Submission Received</h1>
    <p>Hi ${firstName},</p>
    <p>Thank you for submitting your blog post "<strong>${blogTitle}</strong>" to BlogRolly!</p>
    <p>Your submission is now under review by our team. We'll review it within 2-3 business days and let you know the outcome.</p>
    <p>What happens next:</p>
    <ul>
      <li>Our team will review your post for quality and guidelines compliance</li>
      <li>If approved, it will be added to our featured blogroll</li>
      <li>You'll receive an email with the result either way</li>
    </ul>
    <p>We'll be in touch with updates on your submission status.</p>
    <p>If you have any questions, feel free to contact us at <a href="mailto:support@blogrolly.com">support@blogrolly.com</a>.</p>
    <p>The BlogRolly Team</p>
  `
};