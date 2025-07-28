
export const paymentSuccessfulTemplate = {
  subject: 'Payment Successful - Thank You!',
  template: (userName: string, amount: string, planName: string, invoiceUrl: string, nextBillingDate: string) => `
    <h1>Payment Successful</h1>
    <p>Hi ${userName},</p>
    <p>Thank you! Your payment has been processed successfully.</p>
    
    <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin: 15px 0;">
      <p><strong>Plan:</strong> ${planName}</p>
      <p><strong>Amount:</strong> ${amount}</p>
      <p><strong>Next Billing Date:</strong> ${nextBillingDate}</p>
    </div>

    <a href="${invoiceUrl}" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Download Invoice
    </a>
    
    <p>Your premium features are now active. Enjoy BlogRolly Premium!</p>
    <p>The BlogRolly Team</p>
  `
};
