
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/Home.module.css';

const LinkedInVerification = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    linkedinUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    // Get email from query params if available
    if (router.query.email) {
      setFormData(prev => ({ ...prev, email: router.query.email as string }));
    }
  }, [router.query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/investor/verify-linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(data.message);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'LinkedIn verification submission failed');
      }
    } catch (error) {
      console.error('Error during LinkedIn verification:', error);
      setSubmitStatus('error');
      setSubmitMessage('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="LinkedIn Verification - BlogRolly Investors">
      <div className={styles.hero}>
        <div className={styles.authContainer}>
          <h1>LinkedIn Verification Required</h1>
          <p>To complete your investor account setup, please provide your LinkedIn profile for verification.</p>

          {submitStatus === 'success' ? (
            <div className={styles.successMessage}>
              <h2>✅ LinkedIn Verification Submitted</h2>
              <p>{submitMessage}</p>
              <p>You will receive an email notification once your LinkedIn profile has been reviewed.</p>
              <button 
                onClick={() => router.push('/investors')}
                className={styles.primaryButton}
              >
                Back to Investor Portal
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.authForm}>
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={styles.formInput}
              />

              <input
                type="url"
                name="linkedinUrl"
                placeholder="LinkedIn Profile URL (e.g., https://linkedin.com/in/yourname)"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                required
                className={styles.formInput}
              />

              <div className={styles.verificationInfo}>
                <h3>Why LinkedIn Verification?</h3>
                <ul>
                  <li>Verify your professional investment background</li>
                  <li>Ensure access is limited to qualified investors</li>
                  <li>Maintain the exclusivity of our investor community</li>
                  <li>Comply with investment regulations and best practices</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.primaryButton}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
              </button>

              {submitStatus === 'error' && (
                <div className={styles.errorMessage}>
                  <p>{submitMessage}</p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LinkedInVerification;
