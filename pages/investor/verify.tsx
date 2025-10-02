
import { useEffect, useState } from 'react';
import ContactSupportPopup from '../../components/ContactSupportPopup';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/Home.module.css';

const InvestorVerify = () => {
  const router = useRouter();
  const { token } = router.query;
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [showContactSupportPopup, setShowContactSupportPopup] = useState(false);

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
                <h1>Thank you for Signing up!</h1>
                <p>Please verify your email. This will only take a moment.</p>
                <p> <strong>Note:</strong> If you don't see the email, please check your spam folder.</p>
                
                 <p>Don't share this code.</p>
                 <p>It's a one-time code.</p>
                 <p>You've got this!</p>
                <div className={styles.buttonGroup} style={{ marginTop: 32 }}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowContactSupportPopup(true)}
                  >
                    Contact Support
                  </button>
                </div>
              </div>
          )}
            {verificationStatus === 'success' && (
              <div className={styles.successSection}>
                <h1>Thank You for Creating Your Investor Account!</h1>
                <p>Your email has been verified. We&apos;re grateful to have you join the BlogRolly investor community.</p>
                <p>Next, our team will review your LinkedIn profile.</p>
                <p>You'll receive an email notification as soon as your account is approved and you have access to the investor dashboard.</p>
                <div className={styles.buttonGroup} style={{ marginTop: 32 }}>
                  <a
                    href="mailto:invest@blogrolly.com"
                    className={styles.secondaryButton}
                  >
                    Investor Relations
                  </a>
                </div>
              </div>
            )}
            {verificationStatus === 'error' && (
              <div className={styles.errorSection}>
                
                <h1>Verification Failed</h1>
                <p>{message}</p>
                <p>Please contact our support team if you continue to have issues.</p>
                <div className={styles.buttonGroup} style={{ marginTop: 32 }}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowContactSupportPopup(true)}
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
      {showContactSupportPopup && (
        <ContactSupportPopup
          isOpen={showContactSupportPopup}
          onClose={() => setShowContactSupportPopup(false)}
        />
      )}
    </Layout>
  );
};

export default InvestorVerify;
