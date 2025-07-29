export const paymentFailedFinalNoticeTemplate = {
  subject: 'Final Notice: Payment Failed - Account Will Be Downgraded',
  template: (firstName: string, planName: string, amount: string, delistDate: string) => `
    <h1>Final Payment Notice</h1>
    <p>Hi ${firstName},</p>
    <p>We've been unable to process your payment for <strong>${planName}</strong> (${amount}) after multiple attempts.</p>
    <p><strong>Important:</strong> Your account will be downgraded to the free tier on <strong>${delistDate}</strong> if payment is not received.</p>
    <p>To avoid service interruption:</p>
    <ul>
      <li>Update your payment method in account settings</li>
      <li>Or contact our support team for assistance</li>
    </ul>
    <p>We're here to help resolve any payment issues you may be experiencing.</p>
    <p>If you believe this is an error or need assistance, please contact our support team immediately at <a href="mailto:support@blogrolly.com">support@blogrolly.com</a>.</p>
    <p>The BlogRolly Team</p>
  `
};