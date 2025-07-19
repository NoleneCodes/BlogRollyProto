
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
  welcomeReader: {
    subject: 'Welcome to BlogRolly! 🎉',
    template: (firstName: string) => `
      <h1>Welcome to BlogRolly, ${firstName}!</h1>
      <p>We're excited to have you join our community of blog lovers.</p>
      <p>Start exploring amazing blogs tailored to your interests:</p>
      <a href="https://blogrolly.com/blogroll" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Explore the Blogroll
      </a>
    `
  },
  
  welcomeBlogger: {
    subject: 'Welcome to BlogRolly - Your Blog Awaits! ✨',
    template: (firstName: string) => `
      <h1>Welcome to BlogRolly, ${firstName}!</h1>
      <p>Thank you for joining our community of amazing bloggers.</p>
      <p>Ready to submit your first blog for review?</p>
      <a href="https://blogrolly.com/submit" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Submit Your Blog
      </a>
    `
  },
  
  blogSubmissionReceived: {
    subject: 'Blog Submission Received - Under Review',
    template: (blogTitle: string) => `
      <h1>Thank you for your submission!</h1>
      <p>We've received your blog submission: <strong>${blogTitle}</strong></p>
      <p>Our team will review it within 2-3 business days.</p>
      <p>You'll receive an email when the review is complete.</p>
    `
  },
  
  blogApproved: {
    subject: '🎉 Your Blog Has Been Approved!',
    template: (blogTitle: string) => `
      <h1>Congratulations! Your blog has been approved! 🎉</h1>
      <p><strong>${blogTitle}</strong> is now live on BlogRolly!</p>
      <p>Your blog is now discoverable by thousands of readers who love your content niche.</p>
      <a href="https://blogrolly.com/profile/blogger" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View Your Dashboard
      </a>
    `
  },
  
  blogRejected: {
    subject: 'Blog Submission Update',
    template: (blogTitle: string, reason: string) => `
      <h1>Update on Your Blog Submission</h1>
      <p>Thank you for submitting <strong>${blogTitle}</strong>.</p>
      <p>Unfortunately, we're unable to approve it at this time due to: ${reason}</p>
      <p>Don't worry! You can make adjustments and resubmit anytime.</p>
      <a href="https://blogrolly.com/submit" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Submit Again
      </a>
    `
  },
  
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
      <a href="https://blogrolly.com/profile/blogger-premium" style="background: #c42142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Access Premium Dashboard
      </a>
    `
  }
};

// Placeholder functions for email sending
export const emailService = {
  sendWelcomeEmail: async (email: string, firstName: string, userType: 'reader' | 'blogger') => {
    console.log('TODO: Send welcome email via Resend', { email, firstName, userType });
    // TODO: Implement Resend integration
  },
  
  sendBlogStatusEmail: async (email: string, blogTitle: string, status: 'approved' | 'rejected', reason?: string) => {
    console.log('TODO: Send blog status email', { email, blogTitle, status, reason });
    // TODO: Implement Resend integration
  },
  
  addToMailchimpAudience: async (email: string, firstName: string, tags: string[]) => {
    console.log('TODO: Add to Mailchimp audience', { email, firstName, tags });
    // TODO: Implement Mailchimp integration
  },
  
  sendPremiumWelcome: async (email: string, firstName: string) => {
    console.log('TODO: Send premium welcome email', { email, firstName });
    // TODO: Implement Resend integration
  }
};
