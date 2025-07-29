
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Resend configuration
export const RESEND_CONFIG = {
  fromEmail: 'no-reply@blogrolly.com',
  fromName: 'BlogRolly',
  replyTo: 'support@blogrolly.com'
};

// Test function to verify Resend client is working
export const testResendConnection = async () => {
  try {
    // This will validate the API key without sending an email
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('✅ Resend client is properly configured');
      return { success: true, message: 'Resend client connected successfully' };
    } else {
      console.error('❌ Resend API key validation failed');
      return { success: false, message: 'Invalid Resend API key' };
    }
  } catch (error) {
    console.error('❌ Resend connection test failed:', error);
    return { success: false, message: 'Failed to connect to Resend' };
  }
};

// Helper function to send emails with proper error handling
export const sendEmail = async (emailData: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: emailData.from || `${RESEND_CONFIG.fromName} <${RESEND_CONFIG.fromEmail}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      reply_to: emailData.replyTo || RESEND_CONFIG.replyTo,
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent successfully:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};
