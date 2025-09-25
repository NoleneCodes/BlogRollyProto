import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/BloggerProfilePremium.module.css';

interface ProBillingSubscriptionProps {
  onOpenFeedback: () => void;
}


const ProBillingSubscription: React.FC<ProBillingSubscriptionProps> = ({ onOpenFeedback }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create portal session');
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('Could not get portal URL.');
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.content}>
      <h2 style={{ color: '#c42142' }}>Membership</h2>
      <div className={styles.billingSection}>
        <div className={styles.currentPlan}>
          <div className={styles.planHeader}>
            <h3>Current Plan: Pro</h3>
          </div>
          <p>You’re at the heart of the network </p>
          <div className={styles.planFeatures}>
            <ul>
              <li>
                <span style={{ color: '#c42142', fontWeight: 'bold' }}>Unlimited listings</span> - share every post you publish
              </li>
              <li>
                <span style={{ color: '#c42142', fontWeight: 'bold' }}>Advanced insights</span> - see what resonates and spot new opportunities
              </li>
              <li>
                <span style={{ color: '#c42142', fontWeight: 'bold' }}>Priority reviews & support</span> - faster approvals and real human help
              </li>
              <li>
                <span style={{ color: '#c42142', fontWeight: 'bold' }}>Followable profile with social links</span> -let readers connect with you directly
              </li>
              <li>
                <span style={{ color: '#c42142', fontWeight: 'bold' }}>Export your data</span> -your audience, your records, always yours
              </li>
              <li>Blogger Events (coming soon)</li>
            </ul>
            <p>We’re building even more Pro tools shaped by your feedback, to make sure they truly serve your growth.</p>
          </div>
          <div className={styles.billingActions}>
            <button 
              className={styles.feedbackButton}
              onClick={onOpenFeedback}
            >
              Send Feedback
            </button>
            <button 
              className={styles.manageButton}
              onClick={handleManageSubscription}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Manage Subscription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProBillingSubscription;
