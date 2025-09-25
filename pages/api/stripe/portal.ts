// Next.js API route to create a Stripe customer portal session
import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../lib/stripe';
import { supabaseDB } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  // Get Stripe customer ID from blogger_profiles
  const { data: blogger, error } = await supabaseDB.getBloggerProfileByUserId(userId);
  if (error || !blogger || !blogger.stripe_customer_id) {
    return res.status(404).json({ error: 'Stripe customer not found' });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: blogger.stripe_customer_id,
      return_url: process.env.NEXT_PUBLIC_APP_URL + '/profile/blogger-premium',
    });
    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
