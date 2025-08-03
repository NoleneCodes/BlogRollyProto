
export const welcomeBloggerTemplate = {
  subject: 'Welcome to BlogRolly - Your Blog Awaits! ✨',
  template: (firstName: string) => `
    <h1>Welcome to BlogRolly, ${firstName}!</h1>
    <p>Thank you for joining our community of amazing bloggers.</p>
    <p>Ready to submit your first blog for review?</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/submit" style="background: #c42142; colour: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Submit Your Blog
    </a>
    <p>Need help getting started? Check out our submission guidelines.</p>
    <p>The BlogRolly Team</p>
  `
};
