
export const blogUrlChangedTemplate = {
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
};
