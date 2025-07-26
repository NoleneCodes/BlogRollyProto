
import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '../../../lib/stripe'
import { buffer } from 'micro'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']!
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret)
  } catch (err: any) {
    console.log(`Webhook signature verification failed.`, err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log('Checkout session completed:', session.id)
        // TODO: Update user to premium status in Supabase
        // await supabaseDB.updateUserPremiumStatus(session.metadata.userId, true)
        break
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object
        console.log('Invoice payment succeeded:', invoice.id)
        // Handle successful payment
        break
      
      case 'customer.subscription.deleted':
        const subscription = event.data.object
        console.log('Subscription cancelled:', subscription.id)
        // TODO: Update user to remove premium status
        // await supabaseDB.updateUserPremiumStatus(subscription.metadata.userId, false)
        break
      
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}
