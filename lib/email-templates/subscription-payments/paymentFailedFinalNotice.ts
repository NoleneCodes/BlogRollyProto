
export const paymentFailedFinalNoticeTemplate = {
  subject: 'URGENT: Payment Required - 2 Days Remaining',
  template: (userName: string, planName: string, amount: string, delistDate: string) => `
    <h1>URGENT: Payment Required</h1>
    <p>Hi ${userName},</p>
    <p>This is a final notice regarding your failed payment for ${planName}.</p>
    
    <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 15px 0;">
      <p><strong>Amount Due:</strong> ${amount}</p>
      <p><strong>Your blogs will be delisted on:</strong> ${delistDate}</p>
      <p><strong>Only 2 days remaining to resolve this issue.</strong></p>
    </div>

    <p>To prevent your blogs from being delisted, please update your payment method immediately:</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Update Payment Method Now
    </a>
    
    <p>If you need assistance, please contact support immediately.</p>
    <p>The BlogRolly Team</p>
  `
};
