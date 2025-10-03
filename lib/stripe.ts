// Backend Stripe SDK (only for server-side usage)
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Stripe pricing configuration
export const STRIPE_PRICES = {
  BLOGGER_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly_placeholder',
  BLOGGER_PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly_placeholder',
}

// Stripe payment utilities
export const stripePayments = {
  createCheckoutSession: async (priceId: string, userId: string, successUrl: string, cancelUrl: string) => {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
      },
    })
    return { sessionId: session.id, url: session.url }
  },

  createPortalSession: async (customerId: string, returnUrl: string) => {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return { url: session.url }
  },

  getSubscription: async (subscriptionId: string) => {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  },

  cancelSubscription: async (subscriptionId: string) => {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
    return subscription
  }
}
