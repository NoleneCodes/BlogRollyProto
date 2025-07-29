export const paymentFailedFirstNoticeTemplate = {
  subject: 'Payment Failed - We\'ll Try Again Soon',
  template: (firstName: string, planName: string, amount: string, retryDate: string) => `
    <h1>Payment Failed</h1>
    <p>Hi ${firstName},</p>
    <p>We were unable to process your payment for <strong>${planName}</strong> (${amount}).</p>
    <p>Don't worry - we'll automatically retry the payment on <strong>${retryDate}</strong>.</p>
    <p>In the meantime, please make sure your payment method is up to date in your account settings.</p>
    <p>If you're experiencing payment issues or need assistance, our support team is here to help at <a href="mailto:support@blogrolly.com">support@blogrolly.com</a>.</p>
    <p>The BlogRolly Team</p>
  `
};