import { loadStripe } from '@stripe/stripe-js';

export const clientStripe = {
  redirectToCheckout: async (sessionId: string) => {
    if (!sessionId) {
      console.error('No sessionId provided for Stripe checkout');
      return;
    }
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    if (!stripe) {
      console.error('Stripe.js failed to load');
      return;
    }
    // Type assertion to ensure redirectToCheckout is available
    const { error } = await (stripe as any).redirectToCheckout({ sessionId });
    if (error) console.error('Stripe checkout error:', error);
  }
};
