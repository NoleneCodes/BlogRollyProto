
export const paymentFailedFirstNoticeTemplate = {
  subject: 'Payment Issue - Action Required (7 Days Remaining)',
  template: (userName: string, planName: string, amount: string, retryDate: string) => `
    <h1>Payment Issue - Action Required</h1>
    <p>Hi ${userName},</p>
    <p>We encountered an issue processing your payment for ${planName}.</p>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 15px 0;">
      <p><strong>Amount Due:</strong> ${amount}</p>
      <p><strong>We'll retry on:</strong> ${retryDate}</p>
      <p><strong>Your blogs will be delisted in 7 days if payment isn't resolved.</strong></p>
    </div>

    <p>Please update your payment method or contact support if you need assistance:</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Update Payment Method
    </a>
    
    <p>The BlogRolly Team</p>
  `
};
