export const blogUrlChangedTemplate = {
  subject: 'Blog URL Updated Successfully',
  template: (firstName: string, blogTitle: string, oldUrl: string, newUrl: string) => `
    <h1>Blog URL Updated</h1>
    <p>Hi ${firstName},</p>
    <p>Your blog URL for "<strong>${blogTitle}</strong>" has been successfully updated.</p>
    <p><strong>Previous URL:</strong> ${oldUrl}</p>
    <p><strong>New URL:</strong> ${newUrl}</p>
    <p>Please note that all previously approved posts from your old URL will need to be re-reviewed for the new URL.</p>
    <p>You can now submit new posts using your updated blog URL.</p>
    <p>The BlogRolly Team</p>
  `
};
interface BlogUrlChangedTemplateProps {
  bloggerName: string;
  blogTitle: string;
  oldUrl?: string;
  newUrl: string;
  changeReason: string;
  reapprovalRequired: boolean;
}

export const blogUrlChangedTemplate = ({
  bloggerName,
  blogTitle,
  oldUrl,
  newUrl,
  changeReason,
  reapprovalRequired
}: BlogUrlChangedTemplateProps): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Blog URL Updated${reapprovalRequired ? ' - Re-approval Required' : ''}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #c42142; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .btn { display: inline-block; background: #c42142; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .url-box { background: white; border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 3px; font-family: monospace; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Blog URL Updated</h1>
        </div>
        
        <div class="content">
          <p>Hi ${bloggerName},</p>
          
          <p>Your blog post URL has been successfully updated:</p>
          
          <h3>${blogTitle}</h3>
          
          ${oldUrl ? `
            <p><strong>Previous URL:</strong></p>
            <div class="url-box">${oldUrl}</div>
          ` : ''}
          
          <p><strong>New URL:</strong></p>
          <div class="url-box">${newUrl}</div>
          
          <p><strong>Reason for change:</strong> ${changeReason}</p>
          
          ${reapprovalRequired ? `
            <div class="alert">
              <h4>⚠️ Re-approval Required</h4>
              <p>Since your blog URL has changed, your blog post has been automatically deactivated and will need to go through our approval process again. This ensures that all content meets our guidelines and that the new URL is accessible.</p>
              
              <p><strong>What happens next:</strong></p>
              <ul>
                <li>Your blog post is now in "Pending" status</li>
                <li>Our review team will check the new URL and content</li>
                <li>You'll receive an email notification once the review is complete</li>
                <li>If approved, your blog will be reactivated automatically</li>
              </ul>
              
              <p>This process typically takes 1-2 business days.</p>
            </div>
          ` : `
            <div class="success">
              <h4>✅ URL Updated Successfully</h4>
              <p>Your blog URL has been updated and remains active. No further action is required.</p>
            </div>
          `}
          
          <p>If you have any questions about this change or the approval process, please don't hesitate to contact our support team.</p>
          
          <a href="https://blogrolly.com/profile/blogger" class="btn">View Your Blog Dashboard</a>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The BlogRolly Team</p>
          <p>This email was sent because you updated a blog URL on BlogRolly.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
