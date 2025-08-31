
export const linkedinVerificationRequestTemplate = (investorName: string, investorEmail: string, linkedinUrl: string) => {
  return {
    subject: `LinkedIn Verification Request - ${investorName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #c42142; color: white; padding: 2rem; text-align: center; }
            .content { padding: 2rem; background: white; }
            .verification-section { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
            .approve-button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0.5rem; }
            .reject-button { background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0.5rem; }
            .footer { background: #f8f9fa; padding: 1.5rem; text-align: center; font-size: 0.9rem; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BlogRolly</h1>
              <p>LinkedIn Verification Request</p>
            </div>
            
            <div class="content">
              <h2>New LinkedIn Verification Request</h2>
              
              <div class="verification-section">
                <h3>Investor Details:</h3>
                <p><strong>Name:</strong> ${investorName}</p>
                <p><strong>Email:</strong> ${investorEmail}</p>
                <p><strong>LinkedIn Profile:</strong> <a href="${linkedinUrl}" target="_blank">${linkedinUrl}</a></p>
              </div>
              
              <p>Please review the LinkedIn profile and verify that it belongs to a legitimate investor or investment professional.</p>
              
              <div style="text-align: center; margin: 2rem 0;">
                <p><strong>Review the LinkedIn profile and then use the admin dashboard to approve or reject this verification.</strong></p>
              </div>
            </div>
            
            <div class="footer">
              <p>BlogRolly Investor Relations Team</p>
              <p>This is an automated message from the BlogRolly investor verification system.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
LinkedIn Verification Request

Investor Details:
Name: ${investorName}
Email: ${investorEmail}
LinkedIn Profile: ${linkedinUrl}

Please review the LinkedIn profile and use the admin dashboard to approve or reject this verification.

BlogRolly Investor Relations Team
    `
  };
};
