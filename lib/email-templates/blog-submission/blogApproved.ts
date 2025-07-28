
export const blogApprovedTemplate = {
  subject: '🎉 Your Blog Has Been Approved!',
  template: (blogTitle: string, userName: string, blogUrl: string) => `
    <h1>Congratulations, ${userName}! Your blog has been approved! 🎉</h1>
    <p><strong>${blogTitle}</strong> is now live on BlogRolly!</p>
    <p>Your blog is now discoverable by thousands of readers who love your content niche.</p>
    <p><strong>Blog URL:</strong> ${blogUrl}</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      View Your Dashboard
    </a>
    <p>Keep creating amazing content!</p>
    <p>The BlogRolly Team</p>
  `
};
