
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { DomainVerificationService } from '../../../lib/domainVerification';
import { sendEmail } from '../../../lib/resend-client';
import { blogUrlChangedTemplate } from '../../../lib/email-templates/blog-management/blogUrlChanged';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session/auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { submissionId, newUrl, changeReason } = req.body;

    if (!submissionId || !newUrl || !changeReason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate domain first
    const { data: bloggerProfile, error: profileError } = await supabase
      .from('blogger_profiles')
      .select('blog_url, domain_verification_status')
      .eq('user_id', user.id)
      .single();

    if (profileError || !bloggerProfile) {
      return res.status(404).json({ error: 'Blogger profile not found' });
    }

    if (bloggerProfile.domain_verification_status !== 'verified') {
      return res.status(403).json({ 
        error: 'Domain must be verified before updating blog URLs',
        requires_verification: true
      });
    }

    // Validate that new URL matches verified domain
    const validation = DomainVerificationService.validatePostUrlMatchesBlogDomain(
      newUrl,
      bloggerProfile.blog_url
    );

    if (!validation.isValid) {
      return res.status(400).json({ 
        error: validation.error,
        valid: false
      });
    }

    // Update the URL using the new method that handles automatic deactivation
    const supabaseDB = await import('../../../lib/supabase');
    const { data, error, requiresReapproval } = await supabaseDB.SupabaseDB.updateBlogUrl(
      submissionId,
      user.id,
      newUrl,
      changeReason
    );

    if (error) {
      return res.status(400).json({ error: error.message || 'Failed to update URL' });
    }

    // Send email notification if the blog was deactivated for re-approval
    if (requiresReapproval && data) {
      try {
        const emailContent = blogUrlChangedTemplate({
          bloggerName: user.user_metadata?.first_name || 'Blogger',
          blogTitle: data.title,
          oldUrl: req.body.oldUrl, // If provided
          newUrl: newUrl,
          changeReason: changeReason,
          reapprovalRequired: true
        });

        await sendEmail({
          to: user.email!,
          subject: 'Blog URL Updated - Re-approval Required',
          html: emailContent
        });
      } catch (emailError) {
        console.error('Failed to send URL change notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    return res.status(200).json({ 
      success: true,
      data,
      requiresReapproval,
      message: requiresReapproval 
        ? 'URL updated successfully. Blog deactivated for re-approval.'
        : 'URL updated successfully.'
    });

  } catch (error) {
    console.error('Blog URL update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
