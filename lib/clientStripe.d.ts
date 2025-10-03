// TypeScript declaration for clientStripe
export interface ClientStripe {
  redirectToCheckout: (sessionId: string) => Promise<void>;
}

declare const clientStripe: ClientStripe;
export { clientStripe };
