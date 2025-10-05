
export const proWelcomeTemplate = {
  subject: '👑 Welcome to BlogRolly Pro!',
  template: (firstName: string) => `
    <h1>Welcome to Pro, ${firstName}! 👑</h1>
    <p>Thank you for upgrading to BlogRolly Pro!</p>
    <p>You now have access to:</p>
    <ul>
      <li>✅ Unlimited blog submissions</li>
      <li>✅ Advanced analytics and insights</li>
      <li>✅ Priority review for submissions</li>
      <li>✅ Traffic optimisation insights</li>
      <li>✅ Priority support</li>
    </ul>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger-premium" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Access Pro Dashboard
    </a>
    <p>The BlogRolly Team</p>
  `
};
