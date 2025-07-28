
// Email template configurations for Resend and Mailchimp integration
// TODO: Install @mailchimp/mailchimp_marketing and resend when ready to integrate

export const MAILCHIMP_CONFIG = {
  apiKey: process.env.MAILCHIMP_API_KEY,
  serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX,
  audienceId: process.env.MAILCHIMP_AUDIENCE_ID
};

export const RESEND_CONFIG = {
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: 'hello@blogrolly.com'
};

// Email templates for different scenarios
export const emailTemplates = {
  // 🧭 User Onboarding
  welcomeReader: {
    subject: 'Welcome to BlogRolly! 🎉',
    template: (firstName: string) => `
      <h1>Welcome to BlogRolly, ${firstName}!</h1>
      <p>We're excited to have you join our community of blog lovers.</p>
      <p>Start exploring amazing blogs tailored to your interests:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/blogroll" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Explore the Blogroll
      </a>
      <p>Happy reading!</p>
      <p>The BlogRolly Team</p>
    `
  },
  
  welcomeBlogger: {
    subject: 'Welcome to BlogRolly - Your Blog Awaits! ✨',
    template: (firstName: string) => `
      <h1>Welcome to BlogRolly, ${firstName}!</h1>
      <p>Thank you for joining our community of amazing bloggers.</p>
      <p>Ready to submit your first blog for review?</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/submit" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Submit Your Blog
      </a>
      <p>Need help getting started? Check out our submission guidelines.</p>
      <p>The BlogRolly Team</p>
    `
  },
  
  // 📝 Blog Submission Workflow
  blogSubmissionReceived: {
    subject: 'Blog Submission Received - Under Review',
    template: (blogTitle: string, userName: string) => `
      <h1>Thank you for your submission, ${userName}!</h1>
      <p>We've received your blog submission: <strong>${blogTitle}</strong></p>
      <p>Our team will review it within 2-3 business days.</p>
      <p>You'll receive an email when the review is complete.</p>
      <p>The BlogRolly Team</p>
    `
  },
  
  blogApproved: {
    subject: '🎉 Your Blog Has Been Approved!',
    template: (blogTitle: string, userName: string, blogUrl: string) => `
      <h1>Congratulations, ${userName}! Your blog has been approved! 🎉</h1>
      <p><strong>${blogTitle}</strong> is now live on BlogRolly!</p>
      <p>Your blog is now discoverable by thousands of readers who love your content niche.</p>
      <p><strong>Blog URL:</strong> ${blogUrl}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View Your Dashboard
      </a>
      <p>Keep creating amazing content!</p>
      <p>The BlogRolly Team</p>
    `
  },
  
  blogRejected: {
    subject: 'Blog Submission Update',
    template: (blogTitle: string, userName: string, rejectionReason: string, rejectionNote?: string) => `
      <h1>Update on Your Blog Submission</h1>
      <p>Hi ${userName},</p>
      <p>Thank you for submitting <strong>${blogTitle}</strong>.</p>
      <p>Unfortunately, we're unable to approve it at this time due to: <strong>${rejectionReason}</strong></p>
      ${rejectionNote ? `<p><strong>Additional notes:</strong> ${rejectionNote}</p>` : ''}
      <p>Don't worry! You can make adjustments and resubmit anytime.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/submit" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Submit Again
      </a>
      <p>If you have questions about this decision, please contact our support team.</p>
      <p>The BlogRolly Team</p>
    `
  },

  // ⚙️ Blog Management
  blogUrlChanged: {
    subject: 'Blog URL Successfully Updated',
    template: (userName: string, blogTitle: string, oldUrl: string, newUrl: string) => `
      <h1>Blog URL Updated Successfully</h1>
      <p>Hi ${userName},</p>
      <p>Your blog URL for <strong>${blogTitle}</strong> has been successfully updated.</p>
      <p><strong>Previous URL:</strong> ${oldUrl}</p>
      <p><strong>New URL:</strong> ${newUrl}</p>
      <p>Please note: You can only change your blog URL once every 3 months.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View Your Dashboard
      </a>
      <p>The BlogRolly Team</p>
    `
  },

  blogDeactivated: {
    subject: 'Blog Post Deactivated',
    template: (userName: string, blogTitle: string, reason: string) => `
      <h1>Blog Post Deactivated</h1>
      <p>Hi ${userName},</p>
      <p>Your blog post <strong>${blogTitle}</strong> has been deactivated.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Your blog is no longer visible in the BlogRolly feed. You can reactivate it from your dashboard once any issues are resolved.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View Your Dashboard
      </a>
      <p>If you have questions, please contact our support team.</p>
      <p>The BlogRolly Team</p>
    `
  },

  // 🔐 System Notifications
  passwordReset: {
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
  },

  // 🐞 Bug Reporting
  bugReportReceived: {
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
  },

  // 🧰 Support Requests
  supportRequestReceived: {
    subject: 'Support Request Received - We\'re Here to Help!',
    template: (userName: string, ticketId: string, supportMessage: string, estimatedResponse?: string) => `
      <h1>Support Request Received</h1>
      <p>Hi ${userName},</p>
      <p>Thank you for contacting BlogRolly support. We've received your request and will get back to you soon.</p>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Your Message:</strong></p>
      <blockquote style="border-left: 3px solid #c42142; padding-left: 15px; margin: 15px 0; color: #666;">
        ${supportMessage}
      </blockquote>
      ${estimatedResponse ? `<p><strong>Estimated Response Time:</strong> ${estimatedResponse}</p>` : ''}
      <p>We'll reply to this email address with our response. Please keep the ticket ID for reference.</p>
      <p>The BlogRolly Support Team</p>
    `
  },

  supportRequestReply: {
    subject: 'Re: Support Request #{ticketId}',
    template: (userName: string, ticketId: string, originalMessage: string, supportReply: string) => `
      <h1>Support Team Response</h1>
      <p>Hi ${userName},</p>
      <p>We have an update regarding your support request (Ticket #${ticketId}).</p>
      
      <p><strong>Our Response:</strong></p>
      <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin: 15px 0;">
        ${supportReply}
      </div>

      <p><strong>Your Original Message:</strong></p>
      <blockquote style="border-left: 3px solid #c42142; padding-left: 15px; margin: 15px 0; color: #666;">
        ${originalMessage}
      </blockquote>

      <p>If you need further assistance, simply reply to this email.</p>
      <p>The BlogRolly Support Team</p>
    `
  },

  // 💳 Subscription & Payments
  premiumWelcome: {
    subject: '👑 Welcome to BlogRolly Premium!',
    template: (firstName: string) => `
      <h1>Welcome to Premium, ${firstName}! 👑</h1>
      <p>Thank you for upgrading to BlogRolly Premium!</p>
      <p>You now have access to:</p>
      <ul>
        <li>✅ Unlimited blog submissions</li>
        <li>✅ Advanced analytics and insights</li>
        <li>✅ Priority review for submissions</li>
        <li>✅ Traffic optimization insights</li>
        <li>✅ Priority support</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger-premium" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Access Premium Dashboard
      </a>
      <p>The BlogRolly Team</p>
    `
  },

  paymentSuccessful: {
    subject: 'Payment Successful - Thank You!',
    template: (userName: string, amount: string, planName: string, invoiceUrl: string, nextBillingDate: string) => `
      <h1>Payment Successful</h1>
      <p>Hi ${userName},</p>
      <p>Thank you! Your payment has been processed successfully.</p>
      
      <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin: 15px 0;">
        <p><strong>Plan:</strong> ${planName}</p>
        <p><strong>Amount:</strong> ${amount}</p>
        <p><strong>Next Billing Date:</strong> ${nextBillingDate}</p>
      </div>

      <a href="${invoiceUrl}" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Download Invoice
      </a>
      
      <p>Your premium features are now active. Enjoy BlogRolly Premium!</p>
      <p>The BlogRolly Team</p>
    `
  },

  paymentFailedFirstNotice: {
    subject: 'Payment Issue - Action Required (7 Days Remaining)',
    template: (userName: string, planName: string, amount: string, retryDate: string) => `
      <h1>Payment Issue - Action Required</h1>
      <p>Hi ${userName},</p>
      <p>We encountered an issue processing your payment for ${planName}.</p>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 15px 0;">
        <p><strong>Amount Due:</strong> ${amount}</p>
        <p><strong>We'll retry on:</strong> ${retryDate}</p>
        <p><strong>Your blogs will be delisted in 7 days if payment isn't resolved.</strong></p>
      </div>

      <p>Please update your payment method or contact support if you need assistance:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Update Payment Method
      </a>
      
      <p>The BlogRolly Team</p>
    `
  },

  paymentFailedFinalNotice: {
    subject: 'URGENT: Payment Required - 2 Days Remaining',
    template: (userName: string, planName: string, amount: string, delistDate: string) => `
      <h1>URGENT: Payment Required</h1>
      <p>Hi ${userName},</p>
      <p>This is a final notice regarding your failed payment for ${planName}.</p>
      
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 15px 0;">
        <p><strong>Amount Due:</strong> ${amount}</p>
        <p><strong>Your blogs will be delisted on:</strong> ${delistDate}</p>
        <p><strong>Only 2 days remaining to resolve this issue.</strong></p>
      </div>

      <p>To prevent your blogs from being delisted, please update your payment method immediately:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Update Payment Method Now
      </a>
      
      <p>If you need assistance, please contact support immediately.</p>
      <p>The BlogRolly Team</p>
    `
  },

  blogDelistedPayment: {
    subject: 'Blogs Delisted Due to Payment Failure',
    template: (userName: string, blogCount: number, amount: string) => `
      <h1>Blogs Delisted Due to Payment Failure</h1>
      <p>Hi ${userName},</p>
      <p>Due to continued payment issues, ${blogCount} of your blog${blogCount > 1 ? 's have' : ' has'} been delisted from BlogRolly.</p>
      
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 15px 0;">
        <p><strong>Outstanding Amount:</strong> ${amount}</p>
        <p><strong>Status:</strong> Blogs are no longer visible to readers</p>
      </div>

      <p>To restore your blogs and reactivate your account:</p>
      <ol>
        <li>Update your payment method</li>
        <li>Pay the outstanding amount</li>
        <li>Contact support to reactivate your listings</li>
      </ol>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/blogger" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Resolve Payment Issue
      </a>
      
      <p>We're here to help if you need assistance.</p>
      <p>The BlogRolly Team</p>
    `
  }
};

// Email service functions (placeholders for actual implementation)
export const emailService = {
  // 🧭 User Onboarding
  sendWelcomeEmail: async (email: string, firstName: string, userType: 'reader' | 'blogger') => {
    console.log('TODO: Send welcome email via Resend', { email, firstName, userType });
    // TODO: Implement Resend integration
  },
  
  // 📝 Blog Submission Workflow
  sendBlogSubmissionReceived: async (email: string, userName: string, blogTitle: string) => {
    console.log('TODO: Send blog submission received email', { email, userName, blogTitle });
    // TODO: Implement Resend integration
  },

  sendBlogStatusEmail: async (email: string, userName: string, blogTitle: string, blogUrl: string, status: 'approved' | 'rejected', rejectionReason?: string, rejectionNote?: string) => {
    console.log('TODO: Send blog status email', { email, userName, blogTitle, blogUrl, status, rejectionReason, rejectionNote });
    // TODO: Implement Resend integration
  },

  // ⚙️ Blog Management
  sendBlogUrlChangedEmail: async (email: string, userName: string, blogTitle: string, oldUrl: string, newUrl: string) => {
    console.log('TODO: Send blog URL changed email', { email, userName, blogTitle, oldUrl, newUrl });
    // TODO: Implement Resend integration
  },

  sendBlogDeactivatedEmail: async (email: string, userName: string, blogTitle: string, reason: string) => {
    console.log('TODO: Send blog deactivated email', { email, userName, blogTitle, reason });
    // TODO: Implement Resend integration
  },

  // 🔐 System Notifications
  sendPasswordResetEmail: async (email: string, userName: string, resetLink: string) => {
    console.log('TODO: Send password reset email', { email, userName, resetLink });
    // TODO: Implement Resend integration
  },

  // 🐞 Bug Reporting
  sendBugReportThankYou: async (email: string, userName: string, reportId: string) => {
    console.log('TODO: Send bug report thank you email', { email, userName, reportId });
    // TODO: Implement Resend integration
  },

  // 🧰 Support Requests
  sendSupportRequestReceived: async (email: string, userName: string, ticketId: string, supportMessage: string, estimatedResponse?: string) => {
    console.log('TODO: Send support request received email', { email, userName, ticketId, supportMessage, estimatedResponse });
    // TODO: Implement Resend integration
  },

  sendSupportRequestReply: async (email: string, userName: string, ticketId: string, originalMessage: string, supportReply: string) => {
    console.log('TODO: Send support request reply email', { email, userName, ticketId, originalMessage, supportReply });
    // TODO: Implement Resend integration
  },

  // 💳 Subscription & Payments
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
