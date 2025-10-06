
export const welcomeReaderTemplate = {
  subject: 'Welcome to BlogRolly! 🎉',
  template: (firstName: string) => `
    <h1>Welcome to BlogRolly, ${firstName}!</h1>
    <p>We're excited to have you join our community of blog lovers.</p>
    <p>Start exploring amazing blogs tailored to your interests:</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/blogroll" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Explore the Blogroll
    </a>
    <hr style="margin:2em 0;">
    <h2>Install BlogRolly for a distraction-free app experience!</h2>
    <p>Did you know you can install BlogRolly on your device and use it just like an app?</p>
    <ul>
      <li>Enjoy a clean, focused reading experience</li>
      <li>Get the same look and feel as a native app</li>
      <li>BlogRolly takes up less space than regular apps</li>
      <li>Quick access from your home screen</li>
    </ul>
    <p><b>How to install:</b> On your phone, tap your browser's menu and choose "Add to Home Screen".</p>
    <p>Enjoy BlogRolly anywhere, anytime!</p>
    <p>Happy reading!</p>
    <p>The BlogRolly Team</p>
  `
};
