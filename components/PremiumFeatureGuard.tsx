
import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import styles from '../styles/PremiumFeatureGuard.module.css';

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({
  children,
  fallback,
  showUpgradePrompt = true
}) => {
  const { user } = useSupabaseAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/check-premium-status', {
          headers: {
            'Authorization': `Bearer ${user.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.isPremium);
        } else {
          setIsPremium(false);
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    checkPremiumStatus();
  }, [user]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <div className={styles.upgradePrompt}>
        <div className={styles.promptContent}>
          <h3>🔒 Premium Feature</h3>
          <p>This feature is only available to Pro subscribers.</p>
          <button 
            className={styles.upgradeButton}
            onClick={() => window.location.href = '/profile/blogger#billing'}
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PremiumFeatureGuard;
