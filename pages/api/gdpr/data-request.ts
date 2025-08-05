
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { logGDPREvent } from '../../../lib/security-logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, requestType, reason } = req.body;

    if (!email || !requestType) {
      return res.status(400).json({ error: 'Email and request type are required' });
    }

    // Validate request type
    const validTypes = ['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'];
    if (!validTypes.includes(requestType)) {
      return res.status(400).json({ error: 'Invalid request type' });
    }

    // Log the GDPR request
    await logGDPREvent('gdpr_request', req, {
      email,
      requestType,
      reason
    });

    // Store the request in database
    const { data, error } = await supabase
      .from('gdpr_requests')
      .insert([{
        email,
        request_type: requestType,
        reason,
        status: 'pending',
        ip_address: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
        user_agent: req.headers['user-agent'],
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error storing GDPR request:', error);
      return res.status(500).json({ error: 'Failed to process request' });
    }

    // Send confirmation email (implement based on your email service)
    // await sendGDPRRequestConfirmation(email, requestType, data.id);

    res.status(200).json({ 
      message: 'Request submitted successfully',
      requestId: data.id 
    });

  } catch (error) {
    console.error('GDPR request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
