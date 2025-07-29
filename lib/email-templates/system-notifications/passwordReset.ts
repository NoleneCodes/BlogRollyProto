export const passwordResetTemplate = {
  subject: 'Reset Your BlogRolly Password',
  template: (firstName: string, resetLink: string) => `
    <h1>Password Reset Request</h1>
    <p>Hi ${firstName},</p>
    <p>We received a request to reset your BlogRolly password.</p>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetLink}" style="background: #c42142; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
    <p>This link will expire in 24 hours for security purposes.</p>
    <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
    <p>The BlogRolly Team</p>
  `
};