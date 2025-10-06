
export const welcomeBloggerTemplate = {
  subject: 'Welcome to BlogRolly - Your Blog Awaits! ✨',
  template: (firstName: string) => `
    <h1>Welcome to BlogRolly, ${firstName}!</h1>
    <p>Thank you for joining our community of amazing bloggers.</p>
    <p>Ready to submit your first blog for review?</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/submit" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Submit Your Blog
    </a>
    <hr style="margin:2em 0;">
    <h2>Install BlogRolly for a distraction-free app experience!</h2>
    <p>Did you know you can install BlogRolly on your device and use it just like an app?</p>
    <ul>
      <li>Enjoy a clean, focused blogging experience</li>
      <li>Get the same look and feel as a native app</li>
      <li>BlogRolly takes up less space than regular apps</li>
      <li>Quick access from your home screen</li>
    </ul>
    <p><b>How to install:</b> On your phone, tap your browser's menu and choose "Add to Home Screen".</p>
    <p>Share and manage your blogs anywhere, anytime!</p>
    <p>Need help getting started? Check out our submission guidelines.</p>
    <p>The BlogRolly Team</p>
  `
};
