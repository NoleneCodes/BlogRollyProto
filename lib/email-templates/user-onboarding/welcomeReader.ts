
export const welcomeReaderTemplate = {
  subject: 'Welcome to BlogRolly! 🎉',
  template: (firstName: string) => `
    <h1>Welcome to BlogRolly, ${firstName}!</h1>
    <p>We're excited to have you join our community of blog lovers.</p>
    <p>Start exploring amazing blogs tailored to your interests:</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/blogroll" style="background: #c42142; colour: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Explore the Blogroll
    </a>
    <p>Happy reading!</p>
    <p>The BlogRolly Team</p>
  `
};
