
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

// Email service functions (placeholders for actual implementation)
export const emailService = {
  //  User Onboarding
  sendWelcomeEmail: async (email: string, firstName: string, userType: 'reader' | 'blogger') => {
    console.log('TODO: Send welcome email via Resend', { email, firstName, userType });
    // TODO: Implement Resend integration
  },
  
  //  Blog Submission Workflow
  sendBlogSubmissionReceived: async (email: string, userName: string, blogTitle: string) => {
    console.log('TODO: Send blog submission received email', { email, userName, blogTitle });
    // TODO: Implement Resend integration
  },

  sendBlogStatusEmail: async (email: string, userName: string, blogTitle: string, blogUrl: string, status: 'approved' | 'rejected', rejectionReason?: string, rejectionNote?: string) => {
    console.log('TODO: Send blog status email', { email, userName, blogTitle, blogUrl, status, rejectionReason, rejectionNote });
    // TODO: Implement Resend integration
  },

  //  Blog Management
  sendBlogUrlChangedEmail: async (email: string, userName: string, blogTitle: string, oldUrl: string, newUrl: string) => {
    console.log('TODO: Send blog URL changed email', { email, userName, blogTitle, oldUrl, newUrl });
    // TODO: Implement Resend integration
  },

  sendBlogDeactivatedEmail: async (email: string, userName: string, blogTitle: string, reason: string) => {
    console.log('TODO: Send blog deactivated email', { email, userName, blogTitle, reason });
    // TODO: Implement Resend integration
  },

  //  System Notifications
  sendPasswordResetEmail: async (email: string, userName: string, resetLink: string) => {
    console.log('TODO: Send password reset email', { email, userName, resetLink });
    // TODO: Implement Resend integration
  },

  // Bug Reporting
  sendBugReportThankYou: async (email: string, userName: string, reportId: string) => {
    console.log('TODO: Send bug report thank you email', { email, userName, reportId });
    // TODO: Implement Resend integration
  },

  // Support Requests
  sendSupportRequestReceived: async (email: string, userName: string, ticketId: string, supportMessage: string, estimatedResponse?: string) => {
    console.log('TODO: Send support request received email', { email, userName, ticketId, supportMessage, estimatedResponse });
    // TODO: Implement Resend integration
  },

  sendSupportRequestReply: async (email: string, userName: string, ticketId: string, originalMessage: string, supportReply: string) => {
    console.log('TODO: Send support request reply email', { email, userName, ticketId, originalMessage, supportReply });
    // TODO: Implement Resend integration
  },

  // Subscription & Payments
  sendPremiumWelcome: async (email: string, firstName: string) => {
    console.log('TODO: Send premium welcome email', { email, firstName });
    // TODO: Implement Resend integration
  },

  sendPaymentSuccessful: async (email: string, userName: string, amount: string, planName: string, invoiceUrl: string, nextBillingDate: string) => {
    console.log('TODO: Send payment successful email', { email, userName, amount, planName, invoiceUrl, nextBillingDate });
    // TODO: Implement Resend integration
  },

  sendPaymentFailedNotice: async (email: string, userName: string, planName: string, amount: string, noticeType: 'first' | 'final', retryDate?: string, delistDate?: string) => {
    console.log('TODO: Send payment failed notice email', { email, userName, planName, amount, noticeType, retryDate, delistDate });
    // TODO: Implement Resend integration
  },

  sendBlogDelistedPayment: async (email: string, userName: string, blogCount: number, amount: string) => {
    console.log('TODO: Send blog delisted payment email', { email, userName, blogCount, amount });
    // TODO: Implement Resend integration
  },

  // Mailchimp integration
  addToMailchimpAudience: async (email: string, firstName: string, tags: string[]) => {
    console.log('TODO: Add to Mailchimp audience', { email, firstName, tags });
    // TODO: Implement Mailchimp integration
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
