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