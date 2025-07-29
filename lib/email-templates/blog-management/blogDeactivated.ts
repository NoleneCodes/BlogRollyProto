export const blogDeactivatedTemplate = {
  subject: 'Blog Deactivated - Action Required',
  template: (firstName: string, blogTitle: string, reason: string) => `
    <h1>Blog Deactivated</h1>
    <p>Hi ${firstName},</p>
    <p>Your blog "<strong>${blogTitle}</strong>" has been deactivated from BlogRolly.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>If you believe this was done in error or if you've resolved the issue, please contact our support team.</p>
    <p>The BlogRolly Team</p>
  `
};