
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

export const RESEND_CONFIG = {
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: 'hello@blogrolly.com'
};

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
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  sendBlogSubmissionReceived: async (email: string, userName: string, blogTitle: string) => {
    try {
      const { html, subject } = emailTemplates.blogSubmissionReceived({ userName, blogTitle });
      
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

  sendBlogStatusEmail: async (email: string, userName: string, blogTitle: string, blogUrl: string, status: 'approved' | 'rejected', rejectionReason?: string, rejectionNote?: string) => {
    try {
      const template = status === 'approved' ? emailTemplates.blogApproved : emailTemplates.blogRejected;
      const templateData = status === 'approved' 
        ? { userName, blogTitle, blogUrl }
        : { userName, blogTitle, rejectionReason: rejectionReason!, rejectionNote };
      
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
  sendBlogUrlChangedEmail: async (email: string, userName: string, blogTitle: string, oldUrl: string, newUrl: string) => {
    try {
      const { html, subject } = emailTemplates.blogUrlChanged({ userName, blogTitle, oldUrl, newUrl });
      
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

  sendBlogDeactivatedEmail: async (email: string, userName: string, blogTitle: string, reason: string) => {
    try {
      const { html, subject } = emailTemplates.blogDeactivated({ userName, blogTitle, reason });
      
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
  sendPasswordResetEmail: async (email: string, userName: string, resetLink: string) => {
    try {
      const { html, subject } = emailTemplates.passwordReset({ userName, resetLink });
      
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
  sendBugReportThankYou: async (email: string, userName: string, reportId: string) => {
    try {
      const { html, subject } = emailTemplates.bugReportReceived({ userName, reportId });
      
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
  sendSupportRequestReceived: async (email: string, userName: string, ticketId: string, supportMessage: string, estimatedResponse?: string) => {
    try {
      const { html, subject } = emailTemplates.supportRequestReceived({ userName, ticketId, supportMessage, estimatedResponse });
      
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

  sendSupportRequestReply: async (email: string, userName: string, ticketId: string, originalMessage: string, supportReply: string) => {
    try {
      const { html, subject } = emailTemplates.supportRequestReply({ userName, ticketId, originalMessage, supportReply });
      
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

  sendPaymentSuccessful: async (email: string, userName: string, amount: string, planName: string, invoiceUrl: string, nextBillingDate: string) => {
    try {
      const { html, subject } = emailTemplates.paymentSuccessful({ userName, amount, planName, invoiceUrl, nextBillingDate });
      
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

  sendPaymentFailedNotice: async (email: string, userName: string, planName: string, amount: string, noticeType: 'first' | 'final', retryDate?: string, delistDate?: string) => {
    try {
      const template = noticeType === 'first' ? emailTemplates.paymentFailedFirstNotice : emailTemplates.paymentFailedFinalNotice;
      const templateData = noticeType === 'first' 
        ? { userName, planName, amount, retryDate: retryDate! }
        : { userName, planName, amount, delistDate: delistDate! };
      
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

  sendBlogDelistedPayment: async (email: string, userName: string, blogCount: number, amount: string) => {
    try {
      const { html, subject } = emailTemplates.blogDelistedPayment({ userName, blogCount, amount });
      
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
  blogSubmissionReceived: { userName: string; blogTitle: string };
  blogApproved: { userName: string; blogTitle: string; blogUrl: string };
  blogRejected: { userName: string; blogTitle: string; rejectionReason: string; rejectionNote?: string };

  // Blog Management
  blogUrlChanged: { userName: string; blogTitle: string; oldUrl: string; newUrl: string };
  blogDeactivated: { userName: string; blogTitle: string; reason: string };

  // System Notifications
  passwordReset: { userName: string; resetLink: string };

  // Bug Reporting
  bugReportReceived: { userName: string; reportId: string };

  // Support Requests
  supportRequestReceived: { userName: string; ticketId: string; supportMessage: string; estimatedResponse?: string };
  supportRequestReply: { userName: string; ticketId: string; originalMessage: string; supportReply: string };

  // Subscription & Payments
  premiumWelcome: { firstName: string };
  paymentSuccessful: { userName: string; amount: string; planName: string; invoiceUrl: string; nextBillingDate: string };
  paymentFailedFirstNotice: { userName: string; planName: string; amount: string; retryDate: string };
  paymentFailedFinalNotice: { userName: string; planName: string; amount: string; delistDate: string };
  blogDelistedPayment: { userName: string; blogCount: number; amount: string };
}
