import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { DomainVerificationService } from '../../lib/domainVerification';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ 
        error: 'Method not allowed. Only POST requests are supported.',
        allowedMethods: ['POST']
      });
    }

    const { postUrl } = req.body;

    if (!postUrl) {
      return res.status(400).json({ 
        isValid: false,
        error: 'Post URL is required',
        field: 'url'
      });
    }

    if (typeof postUrl !== 'string' || postUrl.trim().length === 0) {
      return res.status(400).json({ 
        isValid: false,
        error: 'URL must be a non-empty string',
        field: 'url'
      });
    }

    const trimmedUrl = postUrl.trim();

    // Basic URL validation
    let urlObj;
    try {
      urlObj = new URL(trimmedUrl);
    } catch (error) {
      return res.status(400).json({ 
        isValid: false, 
        error: 'Invalid URL format. Please enter a complete URL (e.g., https://example.com)',
        field: 'url'
      });
    }

    // Check if it's HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return res.status(400).json({ 
        isValid: false, 
        error: 'URL must use HTTP or HTTPS protocol',
        field: 'url'
      });
    }

    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return res.status(400).json({ 
        isValid: false, 
        error: 'URL must have a valid hostname',
        field: 'url'
      });
    }

    // Check for localhost or local IPs (not allowed for blog submissions)
    const localHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
    const isLocalIP = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(urlObj.hostname);

    if (localHosts.includes(urlObj.hostname.toLowerCase()) || isLocalIP) {
      return res.status(400).json({ 
        isValid: false, 
        error: 'Local or private network URLs are not allowed',
        field: 'url'
      });
    }

    // Check URL length (reasonable limit)
    if (trimmedUrl.length > 2000) {
      return res.status(400).json({ 
        isValid: false, 
        error: 'URL is too long (maximum 2000 characters)',
        field: 'url'
      });
    }

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

    // Check if URL is already taken by another submission
    const { supabaseDB } = await import('../../lib/supabase');
    const availability = await supabaseDB.checkBlogPostUrlAvailability(postUrl);

    if (!availability.isAvailable) {
      return res.status(400).json({ 
        error: availability.error || 'This blog post URL is already taken',
        valid: false,
        isDuplicate: true
      });
    }

    res.status(200).json({ 
      valid: true,
      normalizedUrl: urlObj.toString(),
      hostname: urlObj.hostname,
      message: 'Blog post URL is valid and available'
    });

  } catch (error) {
    console.error('Error in URL validation:', error);

    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(500).json({ 
      isValid: false,
      error: 'Server error during URL validation. Please try again.',
      code: 'VALIDATION_ERROR',
      ...(isDevelopment && { details: error instanceof Error ? error.message : 'Unknown error' })
    });
  }
}