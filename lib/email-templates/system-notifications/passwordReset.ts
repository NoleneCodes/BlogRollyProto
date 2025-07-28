
export const passwordResetTemplate = {
  subject: 'Reset Your BlogRolly Password',
  template: (userName: string, resetLink: string) => `
    <h1>Reset Your Password</h1>
    <p>Hi ${userName},</p>
    <p>We received a request to reset your BlogRolly password.</p>
    <p>Click the link below to create a new password:</p>
    <a href="${resetLink}" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Reset Password
    </a>
    <p>This link will expire in 24 hours. If you didn't request this reset, please ignore this email.</p>
    <p>The BlogRolly Team</p>
  `
};
