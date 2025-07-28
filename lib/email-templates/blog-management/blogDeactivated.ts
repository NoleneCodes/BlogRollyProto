
export const blogDeactivatedTemplate = {
  subject: 'Blog Post Deactivated',
  template: (userName: string, blogTitle: string, reason: string) => `
    <h1>Blog Post Deactivated</h1>
    <p>Hi ${userName},</p>
    <p>Your blog post <strong>${blogTitle}</strong> has been deactivated.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>Your blog is no longer visible in the BlogRolly feed. You can reactivate it from your dashboard once any issues are resolved.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      View Your Dashboard
    </a>
    <p>If you have questions, please contact our support team.</p>
    <p>The BlogRolly Team</p>
  `
};
