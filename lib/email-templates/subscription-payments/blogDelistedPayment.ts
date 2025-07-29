export const blogDelistedPaymentTemplate = {
  subject: 'Blogs Delisted Due to Payment Issue',
  template: (firstName: string, blogCount: number, amount: string) => `
    <h1>Blogs Delisted</h1>
    <p>Hi ${firstName},</p>
    <p>Due to an unresolved payment issue (${amount}), ${blogCount} of your blog${blogCount > 1 ? 's have' : ' has'} been temporarily delisted from BlogRolly.</p>
    <p>To restore your blogs:</p>
    <ul>
      <li>Update your payment method in account settings</li>
      <li>Or contact our support team for assistance</li>
    </ul>
    <p>Once payment is resolved, your blogs will be automatically restored.</p>
    <p>The BlogRolly Team</p>
  `
};