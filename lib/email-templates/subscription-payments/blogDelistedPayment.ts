
export const blogDelistedPaymentTemplate = {
  subject: 'Blogs Delisted Due to Payment Failure',
  template: (userName: string, blogCount: number, amount: string) => `
    <h1>Blogs Delisted Due to Payment Failure</h1>
    <p>Hi ${userName},</p>
    <p>Due to continued payment issues, ${blogCount} of your blog${blogCount > 1 ? 's have' : ' has'} been delisted from BlogRolly.</p>
    
    <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 15px 0;">
      <p><strong>Outstanding Amount:</strong> ${amount}</p>
      <p><strong>Status:</strong> Blogs are no longer visible to readers</p>
    </div>

    <p>To restore your blogs and reactivate your account:</p>
    <ol>
      <li>Update your payment method</li>
      <li>Pay the outstanding amount</li>
      <li>Contact support to reactivate your listings</li>
    </ol>

    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Resolve Payment Issue
    </a>
    
    <p>We're here to help if you need assistance.</p>
    <p>The BlogRolly Team</p>
  `
};
