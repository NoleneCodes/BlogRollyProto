
// Email template imports
import { welcomeReaderTemplate } from './user-onboarding/welcomeReader';
import { welcomeBloggerTemplate } from './user-onboarding/welcomeBlogger';
import { blogSubmissionReceivedTemplate } from './blog-submission/blogSubmissionReceived';
import { blogApprovedTemplate } from './blog-submission/blogApproved';
import { blogRejectedTemplate } from './blog-submission/blogRejected';
import { blogUrlChangedTemplate } from './blog-management/blogUrlChanged';
import { blogDeactivatedTemplate } from './blog-management/blogDeactivated';
import { passwordResetTemplate } from './system-notifications/passwordReset';
import { bugReportReceivedTemplate } from './bug-reporting/bugReportReceived';
import { supportRequestReceivedTemplate } from './support-requests/supportRequestReceived';
import { supportRequestReplyTemplate } from './support-requests/supportRequestReply';
import { premiumWelcomeTemplate } from './subscription-payments/premiumWelcome';
import { paymentSuccessfulTemplate } from './subscription-payments/paymentSuccessful';
import { paymentFailedFirstNoticeTemplate } from './subscription-payments/paymentFailedFirstNotice';
import { paymentFailedFinalNoticeTemplate } from './subscription-payments/paymentFailedFinalNotice';
import { blogDelistedPaymentTemplate } from './subscription-payments/blogDelistedPayment';

// Email service configuration
export const MAILCHIMP_CONFIG = {
  apiKey: process.env.MAILCHIMP_API_KEY,
  serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX,
  audienceId: process.env.MAILCHIMP_AUDIENCE_ID
};

// Re-export RESEND_CONFIG from the dedicated client
export { RESEND_CONFIG } from '../resend-client';

// Email templates organized by category
export const emailTemplates = {
  //  User Onboarding
  welcomeReader: welcomeReaderTemplate,
  welcomeBlogger: welcomeBloggerTemplate,
  
  // Blog Submission Workflow
  blogSubmissionReceived: blogSubmissionReceivedTemplate,
  blogApproved: blogApprovedTemplate,
  blogRejected: blogRejectedTemplate,

  //  Blog Management
  blogUrlChanged: blogUrlChangedTemplate,
  blogDeactivated: blogDeactivatedTemplate,

  //  System Notifications
  passwordReset: passwordResetTemplate,

  // Bug Reporting
  bugReportReceived: bugReportReceivedTemplate,

  // Support Requests
  supportRequestReceived: supportRequestReceivedTemplate,
  supportRequestReply: supportRequestReplyTemplate,

  // Subscription & Payments
  premiumWelcome: premiumWelcomeTemplate,
  paymentSuccessful: paymentSuccessfulTemplate,
  paymentFailedFirstNotice: paymentFailedFirstNoticeTemplate,
  paymentFailedFinalNotice: paymentFailedFinalNoticeTemplate,
  blogDelistedPayment: blogDelistedPaymentTemplate
};

// Email service functions with Resend SDK
import { resend, RESEND_CONFIG, sendEmail } from '../resend-client';

export const emailService = {
  //  User Onboarding
  sendWelcomeEmail: async (email: string, firstName: string, userType: 'reader' | 'blogger') => {
    try {
      const template = userType === 'reader' ? emailTemplates.welcomeReader : emailTemplates.welcomeBlogger;
      const { html, subject } = template({ firstName });
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send welcome email error:', error);
      throw error;
    }
  },
  
  //  Blog Submission Workflow
  sendBlogSubmissionReceived: async (email: string, firstName: string, blogTitle: string) => {
    try {
      const { html, subject } = emailTemplates.blogSubmissionReceived({ firstName, blogTitle });
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send blog submission received email error:', error);
      throw error;
    }
  },

  sendBlogStatusEmail: async (email: string, firstName: string, blogTitle: string, blogUrl: string, status: 'approved' | 'rejected', rejectionReason?: string, rejectionNote?: string) => {
    try {
      const template = status === 'approved' ? emailTemplates.blogApproved : emailTemplates.blogRejected;
      const templateData = status === 'approved' 
        ? { firstName, blogTitle, blogUrl }
        : { firstName, blogTitle, rejectionReason: rejectionReason!, rejectionNote };
      
      const { html, subject } = template(templateData);
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send blog status email error:', error);
      throw error;
    }
  },

  //  Blog Management
  sendBlogUrlChangedEmail: async (email: string, firstName: string, blogTitle: string, oldUrl: string, newUrl: string) => {
    try {
      const { html, subject } = emailTemplates.blogUrlChanged({ firstName, blogTitle, oldUrl, newUrl });
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send blog URL changed email error:', error);
      throw error;
    }
  },

  sendBlogDeactivatedEmail: async (email: string, firstName: string, blogTitle: string, reason: string) => {
    try {
      const { html, subject } = emailTemplates.blogDeactivated({ firstName, blogTitle, reason });
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send blog deactivated email error:', error);
      throw error;
    }
  },

  //  System Notifications
  sendPasswordResetEmail: async (email: string, firstName: string, resetLink: string) => {
    try {
      const { html, subject } = emailTemplates.passwordReset({ firstName, resetLink });
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send password reset email error:', error);
      throw error;
    }
  },

  // Bug Reporting
  sendBugReportThankYou: async (email: string, firstName: string, reportId: string) => {
    try {
      const { html, subject } = emailTemplates.bugReportReceived({ firstName, reportId });
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send bug report thank you email error:', error);
      throw error;
    }
  },

  // Support Requests
  sendSupportRequestReceived: async (email: string, firstName: string, ticketId: string, supportMessage: string, estimatedResponse?: string) => {
    try {
      const { html, subject } = emailTemplates.supportRequestReceived({ firstName, ticketId, supportMessage, estimatedResponse });
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send support request received email error:', error);
      throw error;
    }
  },

  sendSupportRequestReply: async (email: string, firstName: string, ticketId: string, originalMessage: string, supportReply: string) => {
    try {
      const { html, subject } = emailTemplates.supportRequestReply({ firstName, ticketId, originalMessage, supportReply });
      
      const { data, error } = await resend.emails.send({
        from: `${RESEND_CONFIG.fromName} Support <support@blogrolly.com>`,
        to: email,
        subject,
        html,
        reply_to: 'support@blogrolly.com'
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send support request reply email error:', error);
      throw error;
    }
  },

  // Subscription & Payments
  sendPremiumWelcome: async (email: string, firstName: string) => {
    try {
      const { html, subject } = emailTemplates.premiumWelcome({ firstName });
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send premium welcome email error:', error);
      throw error;
    }
  },

  sendPaymentSuccessful: async (email: string, firstName: string, amount: string, planName: string, invoiceUrl: string, nextBillingDate: string) => {
    try {
      const { html, subject } = emailTemplates.paymentSuccessful({ firstName, amount, planName, invoiceUrl, nextBillingDate });
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send payment successful email error:', error);
      throw error;
    }
  },

  sendPaymentFailedNotice: async (email: string, firstName: string, planName: string, amount: string, noticeType: 'first' | 'final', retryDate?: string, delistDate?: string) => {
    try {
      const template = noticeType === 'first' ? emailTemplates.paymentFailedFirstNotice : emailTemplates.paymentFailedFinalNotice;
      const templateData = noticeType === 'first' 
        ? { firstName, planName, amount, retryDate: retryDate! }
        : { firstName, planName, amount, delistDate: delistDate! };
      
      const { html, subject } = template(templateData);
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send payment failed notice email error:', error);
      throw error;
    }
  },

  sendBlogDelistedPayment: async (email: string, firstName: string, blogCount: number, amount: string) => {
    try {
      const { html, subject } = emailTemplates.blogDelistedPayment({ firstName, blogCount, amount });
      
      const { data, error } = await resend.emails.send({
        from: RESEND_CONFIG.fromEmail,
        to: email,
        subject,
        html
      });
      
      if (error) {
        throw new Error(`Resend SDK error: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Send blog delisted payment email error:', error);
      throw error;
    }
  },

  // Mailchimp integration
  addToMailchimpAudience: async (email: string, firstName: string, tags: string[]) => {
    try {
      if (!MAILCHIMP_CONFIG.apiKey || !MAILCHIMP_CONFIG.audienceId) {
        console.log('Mailchimp not configured, skipping audience update');
        return;
      }

      const response = await fetch(`https://${MAILCHIMP_CONFIG.serverPrefix}.api.mailchimp.com/3.0/lists/${MAILCHIMP_CONFIG.audienceId}/members`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: firstName
          },
          tags: tags
        })
      });
      
      if (!response.ok) {
        throw new Error(`Mailchimp API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Add to Mailchimp audience error:', error);
      throw error;
    }
  }
};

// Email template data interfaces for type safety
export interface EmailTemplateData {
  // User Onboarding
  welcomeReader: { firstName: string };
  welcomeBlogger: { firstName: string };

  // Blog Submission Workflow
  blogSubmissionReceived: { firstName: string; blogTitle: string };
  blogApproved: { firstName: string; blogTitle: string; blogUrl: string };
  blogRejected: { firstName: string; blogTitle: string; rejectionReason: string; rejectionNote?: string };

  // Blog Management
  blogUrlChanged: { firstName: string; blogTitle: string; oldUrl: string; newUrl: string };
  blogDeactivated: { firstName: string; blogTitle: string; reason: string };

  // System Notifications
  passwordReset: { firstName: string; resetLink: string };

  // Bug Reporting
  bugReportReceived: { firstName: string; reportId: string };

  // Support Requests
  supportRequestReceived: { firstName: string; ticketId: string; supportMessage: string; estimatedResponse?: string };
  supportRequestReply: { firstName: string; ticketId: string; originalMessage: string; supportReply: string };

  // Subscription & Payments
  premiumWelcome: { firstName: string };
  paymentSuccessful: { firstName: string; amount: string; planName: string; invoiceUrl: string; nextBillingDate: string };
  paymentFailedFirstNotice: { firstName: string; planName: string; amount: string; retryDate: string };
  paymentFailedFinalNotice: { firstName: string; planName: string; amount: string; delistDate: string };
  blogDelistedPayment: { firstName: string; blogCount: number; amount: string };
}
