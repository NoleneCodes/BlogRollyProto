
export const linkedinVerificationResultTemplate = (investorName: string, approved: boolean) => {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/investor/dashboard`;
  
  return {
    subject: `LinkedIn Verification ${approved ? 'Approved' : 'Rejected'} - BlogRolly Investors`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #c42142; color: white; padding: 2rem; text-align: center; }
            .content { padding: 2rem; background: white; }
            .success-section { background: #d4edda; border: 1px solid #c3e6cb; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
            .error-section { background: #f8d7da; border: 1px solid #f5c6cb; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
            .dashboard-button { background: #c42142; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 1rem 0; }
            .footer { background: #f8f9fa; padding: 1.5rem; text-align: center; font-size: 0.9rem; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BlogRolly</h1>
              <p>LinkedIn Verification Update</p>
            </div>
            
            <div class="content">
              <h2>Hello ${investorName},</h2>
              
              ${approved ? `
                <div class="success-section">
                  <h3>✅ LinkedIn Verification Approved!</h3>
                  <p>Congratulations! Your LinkedIn profile has been verified and your investor account is now fully activated.</p>
                  <p>You now have access to:</p>
                  <ul>
                    <li>Exclusive founder updates and insights</li>
                    <li>Interactive pitch deck and financial projections</li>
                    <li>Monthly progress reports</li>
                    <li>Direct communication with our founder</li>
                    <li>Investment opportunities and documentation</li>
                  </ul>
                </div>
                
                <div style="text-align: center;">
                  <a href="${dashboardUrl}" class="dashboard-button">Access Your Investor Dashboard</a>
                </div>
              ` : `
                <div class="error-section">
                  <h3>❌ LinkedIn Verification Not Approved</h3>
                  <p>Unfortunately, we were unable to verify your LinkedIn profile at this time.</p>
                  <p>This could be due to:</p>
                  <ul>
                    <li>Incomplete LinkedIn profile</li>
                    <li>Insufficient investment experience demonstrated</li>
                    <li>Profile does not match our investor criteria</li>
                  </ul>
                  <p>If you believe this is an error, please contact our investor relations team at <a href="mailto:investors@blogrolly.com">investors@blogrolly.com</a></p>
                </div>
              `}
              
              <p>If you have any questions, please don't hesitate to reach out to our investor relations team.</p>
            </div>
            
            <div class="footer">
              <p>Best regards,<br>BlogRolly Investor Relations Team</p>
              <p><a href="mailto:investors@blogrolly.com">investors@blogrolly.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
LinkedIn Verification ${approved ? 'Approved' : 'Rejected'} - BlogRolly Investors

Hello ${investorName},

${approved ? `
✅ LinkedIn Verification Approved!

Congratulations! Your LinkedIn profile has been verified and your investor account is now fully activated.

You now have access to:
- Exclusive founder updates and insights
- Interactive pitch deck and financial projections
- Monthly progress reports
- Direct communication with our founder
- Investment opportunities and documentation

Access Your Investor Dashboard: ${dashboardUrl}
` : `
❌ LinkedIn Verification Not Approved

Unfortunately, we were unable to verify your LinkedIn profile at this time.

This could be due to:
- Incomplete LinkedIn profile
- Insufficient investment experience demonstrated
- Profile does not match our investor criteria

If you believe this is an error, please contact our investor relations team at investors@blogrolly.com
`}

If you have any questions, please don't hesitate to reach out to our investor relations team.

Best regards,
BlogRolly Investor Relations Team
investors@blogrolly.com
    `
  };
};
