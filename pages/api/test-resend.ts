
import { NextApiRequest, NextApiResponse } from 'next';
import { testResendConnection, sendEmail } from '../../lib/resend-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test the connection
    const connectionTest = await testResendConnection();
    
    if (!connectionTest.success) {
      return res.status(400).json({
        success: false,
        message: connectionTest.message,
        resendConfigured: false
      });
    }

    // Optional: Send a test email if query parameter is provided
    if (req.query.sendTest === 'true' && req.query.email) {
      try {
        await sendEmail({
          to: req.query.email as string,
          subject: 'BlogRolly - Resend Test Email',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #c42142;">🎉 Resend is Working!</h2>
              <p>This is a test email from BlogRolly to confirm that Resend email service is properly configured.</p>
              <p>If you received this email, everything is working correctly!</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <small style="color: #666;">
                This email was sent from BlogRolly's email testing system.
              </small>
            </div>
          `
        });

        return res.status(200).json({
          success: true,
          message: 'Resend client is working and test email sent successfully',
          resendConfigured: true,
          testEmailSent: true
        });
      } catch (emailError) {
        return res.status(500).json({
          success: false,
          message: 'Resend client connected but failed to send test email',
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
          resendConfigured: true,
          testEmailSent: false
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Resend client is properly configured and connected',
      resendConfigured: true
    });

  } catch (error) {
    console.error('Resend test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to test Resend connection',
      error: error instanceof Error ? error.message : 'Unknown error',
      resendConfigured: false
    });
  }
}
