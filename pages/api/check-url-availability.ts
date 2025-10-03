import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseDB } from '../../lib/supabase';
import { logSecurityEvent } from '../../lib/securityAudit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, type, excludeId } = req.body;

    if (!url || !type) {
      return res.status(400).json({ error: 'URL and type are required' });
    }

    if (!['blog_domain', 'blog_post'].includes(type)) {
      return res.status(400).json({ error: 'Type must be blog_domain or blog_post' });
    }

    let availability;

    if (type === 'blog_domain') {
      availability = await supabaseDB.checkBlogDomainAvailability(url);
    } else {
      availability = await supabaseDB.checkBlogPostUrlAvailability(url, excludeId);
    }

    await logSecurityEvent({
      event_type: 'api_access',
      severity: 'medium',
      ip_address: Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : (req.headers['x-forwarded-for'] as string) || req.connection?.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
      request_path: req.url,
      request_method: req.method,
      response_status: res.statusCode,
      details: { endpoint: 'check-url-availability' },
      compliance_flags: []
    });

    return res.status(200).json({
      isAvailable: availability.isAvailable,
      error: availability.error,
      existingSubmission: availability.existingSubmission || null
    });

  } catch (error) {
    console.error('URL availability check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
