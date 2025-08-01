
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { DomainVerificationService } from '../../lib/domainVerification';

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

    const { postUrl } = req.body;

    if (!postUrl) {
      return res.status(400).json({ error: 'Post URL is required' });
    }

    // Get blogger profile with verified domain
    const { data: bloggerProfile, error: profileError } = await supabase
      .from('blogger_profiles')
      .select('blog_url, domain_verification_status')
      .eq('user_id', user.id)
      .single();

    if (profileError || !bloggerProfile) {
      return res.status(404).json({ error: 'Blogger profile not found' });
    }

    // Check if domain is verified
    if (bloggerProfile.domain_verification_status !== 'verified') {
      return res.status(403).json({ 
        error: 'Domain must be verified before submitting blog posts',
        requires_verification: true
      });
    }

    // Validate that post URL matches verified domain
    const validation = DomainVerificationService.validatePostUrlMatchesBlogDomain(
      postUrl,
      bloggerProfile.blog_url
    );

    if (!validation.isValid) {
      return res.status(400).json({ 
        error: validation.error,
        valid: false
      });
    }

    return res.status(200).json({ 
      valid: true,
      message: 'Blog post URL is valid for your verified domain'
    });

  } catch (error) {
    console.error('Blog URL validation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
