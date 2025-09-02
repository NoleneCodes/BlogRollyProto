import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { supabase } from '../../lib/supabase';
import styles from '../../styles/AdminLogin.module.css';

interface AdminUser {
  authenticated: boolean;
  authorized: boolean;
  userId?: string;
  userEmail?: string;
  message?: string;
}

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const { user, loading, error, signIn } = useSupabaseAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthorized' | 'error'>('loading');

  useEffect(() => {
    if (user && !isChecking) {
      checkAdminAuth();
    } else if (!user && !loading) {
      setAuthStatus('unauthorized');
    }
  }, [user, loading, checkAdminAuth, isChecking]);

  const checkAdminAuth = async () => {
    if (!user || isChecking) return;
    
    setIsChecking(true);
    setLoginError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication session found');
      }

      const response = await fetch('/api/admin-auth-check', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Authorization check failed: ${response.status}`);
      }
      
      const data: AdminUser = await response.json();
      
      if (data.authenticated && data.authorized) {
        setAuthStatus('authenticated');
        // Use window.location for reliable redirect
        window.location.href = '/admin/dashboard';
      } else {
        setAuthStatus('unauthorized');
        setLoginError(data.message || 'Access denied: Administrator privileges required');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthStatus('error');
      setLoginError(error instanceof Error ? error.message : 'Failed to check admin authorization');
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please enter both email and password');
      return;
    }

    try {
      const result = await signIn(loginForm.email, loginForm.password);
      
      if (result.error) {
        setLoginError(result.error.message);
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading || isChecking || authStatus === 'loading') {
    return (
      <Layout title="Admin Login - BlogRolly">
        <div className={styles.adminLogin}>
          <div className={styles.loginContainer}>
            <div className={styles.loading}>
              <h2>Checking authentication...</h2>
              <p>Please wait...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (authStatus === 'authenticated') {
    return (
      <Layout title="Admin Login - BlogRolly">
        <div className={styles.adminLogin}>
          <div className={styles.loginContainer}>
            <div className={styles.authorized}>
              <h2>Access Granted</h2>
              <p>Redirecting to admin dashboard...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Login - BlogRolly">
      <div className={styles.adminLogin}>
        <div className={styles.loginContainer}>
          <div className={styles.loginHeader}>
            <h1>BlogRolly Admin</h1>
            <p>Sign in with your BlogRolly admin account</p>
          </div>

          {!user ? (
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <h2>Admin Sign In</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit" className={styles.loginButton}>
                Sign In to Admin
              </button>

              {(loginError || error) && (
                <div className={styles.error}>
                  <p>{loginError || error}</p>
                </div>
              )}
            </form>
          ) : (
            <div className={styles.accessDenied}>
              <h2>Access Denied</h2>
              <p>{loginError || 'You do not have permission to access the admin dashboard.'}</p>
              <div className={styles.userInfo}>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
              <p className={styles.helpText}>
                Only BlogRolly administrators can access this area. If you believe this is an error, please contact support.
              </p>
              
              <button 
                onClick={() => {
                  setLoginForm({ email: '', password: '' });
                  setLoginError(null);
                  window.location.href = '/';
                }} 
                className={styles.signOutButton}
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
