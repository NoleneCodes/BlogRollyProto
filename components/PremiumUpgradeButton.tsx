
import React, { useState } from 'react';
import { stripePayments, STRIPE_PRICES, clientStripe } from '../lib/stripe';
import { trackPremiumUpgrade } from '../lib/analytics';
import styles from '../styles/PremiumUpgrade.module.css';

interface PremiumUpgradeButtonProps {
  userId: string;
  userEmail?: string;
  variant?: 'monthly' | 'yearly';
  className?: string;
}

const PremiumUpgradeButton: React.FC<PremiumUpgradeButtonProps> = ({
  userId,
  userEmail,
  variant = 'monthly',
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    trackPremiumUpgrade();

    try {
      const priceId = variant === 'yearly' 
        ? STRIPE_PRICES.BLOGGER_PREMIUM_YEARLY 
        : STRIPE_PRICES.BLOGGER_PREMIUM_MONTHLY;

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail,
          successUrl: `${window.location.origin}/profile/blogger-premium?success=true`,
          cancelUrl: `${window.location.origin}/profile/blogger-premium?cancelled=true`,
        }),
      });

      const { sessionId, url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        await clientStripe.redirectToCheckout(sessionId);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const price = variant === 'yearly' ? '$190/year' : '$19/month';
  const savings = variant === 'yearly' ? 'Save $38/year!' : '';

  return (
    <div className={className}>
      <button
        onClick={handleUpgrade}
        disabled={isLoading}
        className={`${styles.upgradeButton} ${variant === 'yearly' ? styles.yearlyButton : ''}`}
      >
        {isLoading ? (
          <span className={styles.loadingSpinner}>⏳</span>
        ) : (
          <>
            <span className={styles.upgradeText}>
              Upgrade to Premium
            </span>
            <span className={styles.priceText}>
              {price}
              {savings && <span className={styles.savings}>{savings}</span>}
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default PremiumUpgradeButton;
