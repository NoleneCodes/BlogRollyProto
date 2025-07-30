
import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import styles from '../styles/ProFeatureGuard.module.css';

interface ProFeatureGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const ProFeatureGuard: React.FC<ProFeatureGuardProps> = ({
  children,
  fallback,
  showUpgradePrompt = true
}) => {
  const { user } = useSupabaseAuth();
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProStatus = async () => {
      if (!user) {
        setIsPro(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/check-pro-status', {
          headers: {
            'Authorization': `Bearer ${user.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsPro(data.isPro);
        } else {
          setIsPro(false);
        }
      } catch (error) {
        console.error('Error checking pro status:', error);
        setIsPro(false);
      } finally {
        setLoading(false);
      }
    };

    checkProStatus();
  }, [user]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (isPro) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <div className={styles.upgradePrompt}>
        <div className={styles.promptContent}>
          <h3>🔒 Pro Feature</h3>
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

export default ProFeatureGuard;
