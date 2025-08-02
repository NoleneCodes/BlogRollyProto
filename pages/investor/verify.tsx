
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/Home.module.css';

const InvestorVerify = () => {
  const router = useRouter();
  const { token } = router.query;
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || typeof token !== 'string') return;

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/investor/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setVerificationStatus('success');
          setMessage(data.message);
          
          // If LinkedIn verification is required, redirect there
          if (data.nextStep === 'linkedin_verification') {
            setTimeout(() => {
              router.push(`/investor/linkedin-verification?email=${encodeURIComponent(data.investor.email)}`);
            }, 3000);
          } else {
            // Otherwise redirect to login
            setTimeout(() => {
              router.push('/investors');
            }, 3000);
          }
        } else {
          setVerificationStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('Network error occurred during verification');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <Layout title="Email Verification - BlogRolly Investors">
      <div className={styles.hero}>
        <div className={styles.verificationContainer}>
          {verificationStatus === 'loading' && (
            <div className={styles.loadingSection}>
              <div className={styles.loader}></div>
              <h1>Verifying Your Email...</h1>
              <p>Please wait while we verify your investor account.</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className={styles.successSection}>
              <div className={styles.successIcon}>✅</div>
              <h1>Email Verified Successfully!</h1>
              <p>{message}</p>
              <p>Redirecting to LinkedIn verification...</p>
              <button 
                onClick={() => router.push('/investor/linkedin-verification')}
                className={styles.primaryButton}
              >
                Continue to LinkedIn Verification
              </button>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className={styles.errorSection}>
              <div className={styles.errorIcon}>❌</div>
              <h1>Verification Failed</h1>
              <p>{message}</p>
              <p>Please contact our support team if you continue to have issues.</p>
              <div className={styles.buttonGroup}>
                <button 
                  onClick={() => router.push('/investors')}
                  className={styles.primaryButton}
                >
                  Back to Investor Portal
                </button>
                <a 
                  href="mailto:investors@blogrolly.com"
                  className={styles.secondaryButton}
                >
                  Contact Support
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InvestorVerify;
