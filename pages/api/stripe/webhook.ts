
import type { NextApiRequest, NextApiResponse } from 'next'
// import { stripe } from '../../../lib/stripe'
// import { supabaseDB } from '../../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // TODO: Implement Stripe webhook verification and handling
  console.log('TODO: Handle Stripe webhook', req.body)

  /*
  const sig = req.headers['stripe-signature']!
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err)
    return res.status(400).send(`Webhook Error: ${err}`)
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
      // Update user to premium status
      await supabaseDB.updateUserPremiumStatus(session.metadata.userId, true)
      break
    
    case 'invoice.payment_succeeded':
      // Handle successful payment
      break
    
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      const subscription = event.data.object
      await supabaseDB.updateUserPremiumStatus(subscription.metadata.userId, false)
      break
    
    default:
      console.log(`Unhandled event type ${event.type}`)
  }
  */

  res.status(200).json({ received: true })
}
