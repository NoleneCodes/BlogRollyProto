import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { logSecurityEvent } from '../../../lib/securityAudit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, request_type, reason } = req.body;
    const ip_address = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    const user_agent = req.headers['user-agent'] || 'unknown';

    if (!email || !request_type) {
      return res.status(400).json({ error: 'Email and request type are required' });
    }

    const validTypes = ['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'];
    if (!validTypes.includes(request_type)) {
      return res.status(400).json({ error: 'Invalid request type' });
    }

    // Submit GDPR request
    const { data, error } = await supabase
      .from('gdpr_requests')
      .insert({
        email,
        request_type,
        reason,
        ip_address,
        user_agent,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('GDPR request submission error:', error);
      return res.status(500).json({ error: 'Failed to submit GDPR request' });
    }

    // Log security event
    await logSecurityEvent({
      event_type: 'data_access',
      severity: 'medium',
      ip_address: ip_address as string,
      user_agent: user_agent as string,
      request_path: req.url,
      request_method: req.method,
      response_status: 200,
      details: {
        gdpr_request_type: request_type,
        email_domain: email.split('@')[1]
      },
      compliance_flags: ['gdpr']
    });

    res.status(200).json({
      success: true,
      message: 'GDPR request submitted successfully',
      request_id: data.id
    });

  } catch (error) {
    console.error('GDPR request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
