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

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setIsValidToken(false);
          setIsCheckingToken(false);
          return;
        }

        // Check if user has a valid session from password reset
        if (session && session.user) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsValidToken(false);
      } finally {
        setIsCheckingToken(false);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session?.user?.id);
      
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setIsValidToken(true);
        setIsCheckingToken(false);
      }
    });

    // Check session immediately
    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!newPassword) {
      newErrors.password = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setErrors({ general: error.message });
      } else {
        // Success - show message and redirect
        alert('Password updated successfully! You can now sign in with your new password.');
        router.push('/auth');
      }
    } catch (error) {
      console.error('Password update error:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    }

    setIsLoading(false);
  };

  if (isCheckingToken) {
    return (
      <Layout title="Reset Password - BlogRolly">
        <div className={homeStyles.hero}>
          <h1 className={homeStyles.title}>Verifying Reset Link</h1>
          <p className={homeStyles.description}>
            Please wait while we verify your password reset link...
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
            <p>Verifying your reset link...</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Layout>
    );
  }

  if (!isValidToken) {
    return (
      <Layout title="Reset Password - BlogRolly">
        <div className={homeStyles.hero}>
          <h1 className={homeStyles.title}>❌ Invalid Reset Link</h1>
          <p className={homeStyles.description}>
            This password reset link is invalid, expired, or has already been used.
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
              <strong>Reset Link Invalid</strong>
            </div>

            <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
              This could happen if:
            </p>
            <ul style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <li>The reset link has expired (links expire after 1 hour)</li>
              <li>The link has already been used</li>
              <li>The link was corrupted when copied</li>
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
                Request New Reset Link
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
  }

  return (
    <Layout title="Reset Password - BlogRolly">
      <div className={homeStyles.hero}>
        <h1 className={homeStyles.title}>Reset Your Password</h1>
        <p className={homeStyles.description}>
          Enter your new password below
        </p>
      </div>

      <div className={styles.container}>
        <div className={styles.authCard}>
          <h2>Choose a New Password</h2>
          <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
            Please enter a secure password that you'll remember.
          </p>

          <form onSubmit={handlePasswordReset}>
            <div className={styles.formGroup}>
              <label className={styles.label}>New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.textInput}
                placeholder="Enter your new password"
                minLength={8}
                required
              />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
              <small className={styles.hint}>Must be at least 8 characters long</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.textInput}
                placeholder="Confirm your new password"
                required
              />
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
            </div>

            {errors.general && (
              <div className={styles.formGroup}>
                <div style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  {errors.general}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              className={styles.linkButton}
              onClick={() => router.push('/auth')}
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;