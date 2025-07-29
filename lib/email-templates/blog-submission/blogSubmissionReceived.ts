
export const blogSubmissionReceivedTemplate = ({ userName, blogTitle }: { userName: string; blogTitle: string }) => ({
  subject: 'Blog Submission Received - Under Review',
  html: `
    <h1>Thank you for your submission, ${userName}!</h1>
    <p>We've received your blog submission: <strong>${blogTitle}</strong></p>
    <p>Our team will review it within 2-3 business days.</p>
    <p>You'll receive an email when the review is complete.</p>
    <p>The BlogRolly Team</p>
  `
});
