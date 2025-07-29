export const blogApprovedTemplate = {
  subject: 'Congratulations! Your Blog Post Has Been Approved',
  template: (firstName: string, blogTitle: string, blogUrl: string) => `
    <h1>🎉 Your Blog Post is Now Live!</h1>
    <p>Hi ${firstName},</p>
    <p>Great news! Your blog post "<strong>${blogTitle}</strong>" has been approved and is now featured on BlogRolly.</p>
    <p><strong>Your approved post:</strong> <a href="${blogUrl}">${blogTitle}</a></p>
    <p>Your post is now discoverable by our community of readers who are interested in quality content like yours.</p>
    <p>What's next:</p>
    <ul>
      <li>Your post will appear in relevant category feeds</li>
      <li>Readers can discover it through search and recommendations</li>
      <li>You can track its performance in your dashboard</li>
      <li>Feel free to submit more posts anytime!</li>
    </ul>
    <p>Thank you for contributing to the BlogRolly community!</p>
    <p>The BlogRolly Team</p>
  `
};