
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, linkedinUrl } = req.body;

    if (!email || !linkedinUrl) {
      return res.status(400).json({ error: 'Email and LinkedIn URL are required' });
    }

    // Validate LinkedIn URL format
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9-]+\/?$/;
    if (!linkedinRegex.test(linkedinUrl)) {
      return res.status(400).json({ error: 'Please provide a valid LinkedIn profile URL' });
    }

    // Find investor by email
    const { data: investor, error: findError } = await supabase
      .from('investor_users')
      .select('id, email, name, is_verified, verification_status')
      .eq('email', email)
      .single();

    if (findError || !investor) {
      return res.status(400).json({ error: 'Investor account not found' });
    }

    if (!investor.is_verified) {
      return res.status(400).json({ error: 'Please verify your email first' });
    }

    if (investor.verification_status !== 'pending_linkedin') {
      return res.status(400).json({ error: 'LinkedIn verification not required for this account' });
    }

    // Generate LinkedIn verification token
    const linkedinVerificationToken = Math.random().toString(36).substring(2, 15) + 
                                    Math.random().toString(36).substring(2, 15);

    // Update investor with LinkedIn URL and verification token
    const { error: updateError } = await supabase
      .from('investor_users')
      .update({ 
        linkedin_url: linkedinUrl,
        linkedin_verification_token: linkedinVerificationToken,
        updated_at: new Date().toISOString()
      })
      .eq('id', investor.id);

    if (updateError) {
      console.error('LinkedIn verification update error:', updateError);
      return res.status(500).json({ error: 'Failed to submit LinkedIn verification' });
    }

    // Send LinkedIn verification email to admin
    try {
      const { sendLinkedInVerificationRequest } = await import('../../../lib/resend-client');
      await sendLinkedInVerificationRequest(investor.email, investor.name, linkedinUrl);
    } catch (emailError) {
      console.error('LinkedIn verification email failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'LinkedIn verification submitted. Our team will review your profile within 24-48 hours.',
      verificationToken: linkedinVerificationToken
    });

  } catch (error) {
    console.error('LinkedIn verification error:', error);
    res.status(500).json({ error: 'Internal server error during LinkedIn verification' });
  }
}
