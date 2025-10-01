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
import { proWelcomeTemplate } from './subscription-payments/premiumWelcome';
import { paymentSuccessfulTemplate } from './subscription-payments/paymentSuccessful';
import { paymentFailedFirstNoticeTemplate } from './subscription-payments/paymentFailedFirstNotice';
import { paymentFailedFinalNoticeTemplate } from './subscription-payments/paymentFailedFinalNotice';
import { blogDelistedPaymentTemplate } from './subscription-payments/blogDelistedPayment';
import { linkedinVerificationResultTemplate } from './investor-onboarding/linkedinVerificationResult';

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
  premiumWelcome: proWelcomeTemplate,
  paymentSuccessful: paymentSuccessfulTemplate,
  paymentFailedFirstNotice: paymentFailedFirstNoticeTemplate,
  paymentFailedFinalNotice: paymentFailedFinalNoticeTemplate,
  blogDelistedPayment: blogDelistedPaymentTemplate,

  // LinkedIn Verification
  linkedinVerificationResult: linkedinVerificationResultTemplate
};

// Email service functions with Resend SDK
import { resend, RESEND_CONFIG, INVESTOR_EMAIL_CONFIG, SUPPORT_EMAIL_CONFIG } from '../resend-client';

export const emailService = {
  sendLinkedinVerificationResult: async (email: string, investorName: string, approved: boolean, rejectionReason?: string) => {
    try {
      const { subject, html } = emailTemplates.linkedinVerificationResult(investorName, approved, rejectionReason);

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
      console.error('Send LinkedIn verification result email error:', error);
      throw error;
    }
  },
  //  User Onboarding
  sendWelcomeEmail: async (email: string, firstName: string, userType: 'reader' | 'blogger') => {
    try {
      const template = userType === 'reader' ? emailTemplates.welcomeReader : emailTemplates.welcomeBlogger;
      const html = template.template(firstName);
      const subject = template.subject;

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
      const html = emailTemplates.blogSubmissionReceived.template(firstName, blogTitle);
      const subject = emailTemplates.blogSubmissionReceived.subject;

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
      let html: string;

      if (status === 'approved') {
        html = template.template(firstName, blogTitle, blogUrl);
      } else {
        html = template.template(firstName, blogTitle, rejectionReason!, rejectionNote);
      }

      const subject = template.subject;

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
  sendBlogUrlChangedEmail: async (
    email: string, 
    bloggerName: string, 
    blogTitle: string, 
    newUrl: string, 
    changeReason: string,
    reapprovalRequired: boolean = false,
    oldUrl?: string
  ) => {
    try {
      const html = emailTemplates.blogUrlChanged({
        bloggerName,
        blogTitle,
        oldUrl,
        newUrl,
        changeReason,
        reapprovalRequired
      });
      const subject = `Blog URL Updated${reapprovalRequired ? ' - Re-approval Required' : ''}`;

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
      const html = emailTemplates.blogDeactivated.template(firstName, blogTitle, reason);
      const subject = emailTemplates.blogDeactivated.subject;

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
      const html = emailTemplates.passwordReset.template(firstName, resetLink);
      const subject = emailTemplates.passwordReset.subject;

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
      const html = emailTemplates.bugReportReceived.template(firstName, reportId);
      const subject = emailTemplates.bugReportReceived.subject;

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
      const html = emailTemplates.supportRequestReceived.template(firstName, ticketId, supportMessage, estimatedResponse);
      const subject = emailTemplates.supportRequestReceived.subject;

      const { data, error } = await resend.emails.send({
        from: SUPPORT_EMAIL_CONFIG.fromEmail,
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
      const html = emailTemplates.supportRequestReply.template(firstName, ticketId, originalMessage, supportReply);
      const subject = emailTemplates.supportRequestReply.subject;

      const { data, error } = await resend.emails.send({
        from: SUPPORT_EMAIL_CONFIG.fromEmail,
        to: email,
        subject,
        html,
        replyTo: SUPPORT_EMAIL_CONFIG.replyTo
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
      const html = emailTemplates.premiumWelcome.template(firstName);
      const subject = emailTemplates.premiumWelcome.subject;

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
      const html = emailTemplates.paymentSuccessful.template(firstName, amount, planName, invoiceUrl, nextBillingDate);
      const subject = emailTemplates.paymentSuccessful.subject;

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
      let html: string;

      if (noticeType === 'first') {
        html = template.template(firstName, planName, amount, retryDate!);
      } else {
        html = template.template(firstName, planName, amount, delistDate!);
      }

      const subject = template.subject;

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
      const html = emailTemplates.blogDelistedPayment.template(firstName, blogCount, amount);
      const subject = emailTemplates.blogDelistedPayment.subject;

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

  // LinkedIn Verification
  linkedinVerificationResult: { firstName: string; status: string; profileUrl: string; };
}