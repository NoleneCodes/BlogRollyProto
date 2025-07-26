import type { NextApiRequest, NextApiResponse } from 'next'
import { stripePayments } from '../../../lib/stripe'

type CheckoutData = {
  sessionId?: string
  url?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckoutData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, userId, successUrl, cancelUrl } = req.body

    if (!priceId || !userId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { sessionId, url } = await stripePayments.createCheckoutSession(
      priceId,
      userId,
      successUrl,
      cancelUrl
    )

    res.status(200).json({ sessionId, url })
  } catch (error) {
    console.error('Checkout session creation error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}