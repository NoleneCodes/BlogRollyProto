
export const bugReportReceivedTemplate = {
  subject: 'Thank You for Your Bug Report',
  template: (userName: string, reportId: string) => `
    <h1>Thank You for Your Bug Report</h1>
    <p>Hi ${userName},</p>
    <p>Thank you for taking the time to report a bug. Your feedback helps us improve BlogRolly for everyone.</p>
    <p><strong>Report ID:</strong> ${reportId}</p>
    <p>Our team will investigate the issue and work on a fix. We'll update you if we need any additional information.</p>
    <p>We appreciate your patience and continued support!</p>
    <p>The BlogRolly Team</p>
  `
};
