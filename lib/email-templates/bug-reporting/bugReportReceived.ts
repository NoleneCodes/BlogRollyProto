export const bugReportReceivedTemplate = {
  subject: 'Bug Report Received - Thank You!',
  template: (firstName: string, reportId: string) => `
    <h1>Bug Report Received</h1>
    <p>Hi ${firstName},</p>
    <p>Thank you for reporting a bug to BlogRolly! Your feedback helps us improve the platform.</p>
    <p><strong>Report ID:</strong> ${reportId}</p>
    <p>Our development team will investigate the issue and work on a fix. We'll update you if we need any additional information.</p>
    <p>We appreciate your help in making BlogRolly better!</p>
    <p>The BlogRolly Team</p>
  `
};