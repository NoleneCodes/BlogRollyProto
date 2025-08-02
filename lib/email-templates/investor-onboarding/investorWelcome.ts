
export const investorWelcomeTemplate = (investorName: string, verificationToken: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/investor/verify?token=${verificationToken}`;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/investor/dashboard`;

  return {
    subject: 'Welcome to BlogRolly Investor Portal - Please Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BlogRolly Investor Portal</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #c42142 0%, #a01835 100%); color: white; padding: 2rem; text-align: center; }
          .logo { font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; }
          .content { padding: 2rem; }
          .verification-section { background: #f8f9fa; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; text-align: center; border-left: 4px solid #c42142; }
          .verify-button { display: inline-block; background: #c42142; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 1rem 0; transition: background 0.2s ease; }
          .verify-button:hover { background: #a01835; }
          .features { background: #f8f9fa; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; }
          .feature { margin-bottom: 1rem; padding-left: 1.5rem; position: relative; }
          .feature::before { content: '✓'; position: absolute; left: 0; color: #c42142; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 1.5rem; text-align: center; font-size: 0.9rem; color: #666; }
          .social-links { margin: 1rem 0; }
          .social-links a { color: #c42142; text-decoration: none; margin: 0 0.5rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BlogRolly</div>
            <p>Investor Portal Access</p>
          </div>
          
          <div class="content">
            <h2>Welcome to the BlogRolly Investor Community, ${investorName}!</h2>
            
            <p>Thank you for your interest in joining the BlogRolly investment journey. We're excited to have you as part of our exclusive investor community.</p>
            
            <div class="verification-section">
              <h3>📧 Verify Your Email Address</h3>
              <p>Before you can access your investor dashboard, please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" class="verify-button">Verify Email & Activate Account</a>
              <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
                This verification link will expire in 24 hours for security purposes.
              </p>
            </div>

            <div class="features">
              <h3>🚀 Your Investor Dashboard Includes:</h3>
              <div class="feature">Exclusive pitch deck and financial projections</div>
              <div class="feature">Monthly progress reports and metrics</div>
              <div class="feature">Direct communication channel with our founder</div>
              <div class="feature">Early access to product updates and roadmap</div>
              <div class="feature">Investment opportunity notifications</div>
              <div class="feature">Community discussions with fellow investors</div>
            </div>

            <h3>🎯 What's Next?</h3>
            <ol>
              <li><strong>Verify your email</strong> using the button above</li>
              <li><strong>Access your dashboard</strong> at <a href="${dashboardUrl}" style="color: #c42142;">${dashboardUrl}</a></li>
              <li><strong>Explore our vision</strong> and investment opportunities</li>
              <li><strong>Schedule a call</strong> with our founder if you'd like to discuss further</li>
            </ol>

            <p>We believe BlogRolly represents a unique opportunity to reshape how people discover authentic, independent content. Your potential partnership means everything to us.</p>

            <p><strong>Ready to join the revolution?</strong></p>
          </div>
          
          <div class="footer">
            <p>Questions? Reply to this email or contact us at <a href="mailto:investors@blogrolly.com" style="color: #c42142;">investors@blogrolly.com</a></p>
            
            <div class="social-links">
              <a href="https://x.com/BlogRolly">Twitter</a> | 
              <a href="https://www.instagram.com/blogrolly/">Instagram</a> | 
              <a href="https://www.linkedin.com/company/blogrolly">LinkedIn</a>
            </div>
            
            <p style="margin-top: 1rem;">&copy; 2025 BlogRolly. Building the future of content discovery.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to BlogRolly Investor Portal!

Hi ${investorName},

Thank you for your interest in joining the BlogRolly investment journey. 

VERIFY YOUR EMAIL:
Please verify your email address by visiting: ${verificationUrl}

DASHBOARD ACCESS:
Once verified, access your investor dashboard at: ${dashboardUrl}

Your investor dashboard includes:
- Exclusive pitch deck and financial projections
- Monthly progress reports and metrics  
- Direct communication with our founder
- Early access to product updates
- Investment opportunity notifications
- Community discussions with fellow investors

Questions? Contact us at investors@blogrolly.com

Best regards,
The BlogRolly Team
    `
  };
};
