export const paymentSuccessfulTemplate = {
  subject: 'Payment Successful - Thank You!',
  template: (firstName: string, amount: string, planName: string, invoiceUrl: string, nextBillingDate: string) => `
    <h1>Payment Successful</h1>
    <p>Hi ${firstName},</p>
    <p>Thank you! Your payment for <strong>${planName}</strong> has been processed successfully.</p>
    <p><strong>Amount Paid:</strong> ${amount}</p>
    <p><strong>Next Billing Date:</strong> ${nextBillingDate}</p>
    <p><strong>Invoice:</strong> <a href="${invoiceUrl}">Download Invoice</a></p>
    <p>Your premium features are now active and ready to use!</p>
    <p>The BlogRolly Team</p>
  `
};