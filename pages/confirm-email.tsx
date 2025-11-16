import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Layout from '../components/Layout';
import styles from '../styles/AuthForm.module.css';
import homeStyles from '../styles/Home.module.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const ConfirmEmailPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [confirmationStatus, setConfirmationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if there's a session (user clicked confirmation link)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setConfirmationStatus('error');
          setErrorMessage('There was an error confirming your email. Please try again.');
          setIsLoading(false);
          return;
        }

        if (session && session.user) {
          // Email confirmed successfully
          console.log('Email confirmed for user:', session.user.id);
          
          // Update user's email_confirmed status if needed
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ email_verified: true })
            .eq('user_id', session.user.id);

          if (updateError) {
            console.error('Error updating email verification status:', updateError);
          }

          setConfirmationStatus('success');
          
          // Redirect to appropriate profile page after 3 seconds
          setTimeout(async () => {
            // Get user profile to determine redirect
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();

            if (profile?.role === 'blogger') {
              router.push('/profile/blogger');
            } else {
              router.push('/profile/reader');
            }
          }, 3000);
          
        } else {
          setConfirmationStatus('error');
          setErrorMessage('No valid session found. The confirmation link may have expired.');
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setConfirmationStatus('error');
        setErrorMessage('An unexpected error occurred during email confirmation.');
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (event === 'SIGNED_IN' && session) {
        handleEmailConfirmation();
      }
    });

    // Also check immediately in case user is already signed in
    handleEmailConfirmation();

    return () => subscription.unsubscribe();
  }, [router]);

  const handleResendConfirmation = async () => {
    try {
      // You'd need to store the email somewhere or ask the user to re-enter it
      // For now, redirect to signup
      router.push('/auth');
    } catch (error) {
      console.error('Error resending confirmation:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Confirming Email - BlogRolly">
        <div className={homeStyles.hero}>
          <h1 className={homeStyles.title}>Confirming Your Email</h1>
          <p className={homeStyles.description}>
            Please wait while we verify your email address...
          </p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className={styles.loading}>
            <div style={{ 
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #c42142',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Verifying your email...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (confirmationStatus === 'success') {
    return (
      <Layout title="Email Confirmed - BlogRolly">
        <div className={homeStyles.hero}>
          <h1 className={homeStyles.title}>✅ Email Confirmed!</h1>
          <p className={homeStyles.description}>
            Your email has been successfully verified. Welcome to BlogRolly!
          </p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            display: 'inline-block'
          }}>
            <strong>Success!</strong> Your account is now active.
          </div>
          <p style={{ marginBottom: '2rem' }}>
            You'll be redirected to your dashboard in a few seconds...
          </p>
          <button 
            onClick={() => router.push('/profile/reader')}
            style={{
              background: '#c42142',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard Now
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Email Confirmation Error - BlogRolly">
      <div className={homeStyles.hero}>
        <h1 className={homeStyles.title}>❌ Confirmation Failed</h1>
        <p className={homeStyles.description}>
          There was an issue confirming your email address.
        </p>
      </div>

      <div className={styles.container}>
        <div className={styles.authCard}>
          <div style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <strong>Error:</strong> {errorMessage}
          </div>

          <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
            This could happen if:
          </p>
          <ul style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <li>The confirmation link has expired</li>
            <li>The link has already been used</li>
            <li>There's a technical issue</li>
          </ul>

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => router.push('/auth')}
              style={{
                background: '#c42142',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              Try Signing Up Again
            </button>
            <button 
              onClick={() => router.push('/contact')}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmEmailPage;