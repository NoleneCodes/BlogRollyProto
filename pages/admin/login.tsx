import React, { useState, useEffect, useCallback } from 'react';
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
  const [showLoginFallback, setShowLoginFallback] = useState(false);
  const router = useRouter();
  const { user, loading, error, signIn } = useSupabaseAuth();
  // Fallback effect: show login form if loading takes too long
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowLoginFallback(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowLoginFallback(false);
    }
  }, [loading]);
  const [isChecking, setIsChecking] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthorized' | 'error'>('loading');

  const checkAdminAuth = useCallback(async () => {
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
  }, [user, isChecking]);

  // Only set unauthorized if not loading and no user
  useEffect(() => {
    if (!user && !loading) {
      setAuthStatus('unauthorized');
    }
  }, [user, loading]);

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
      } else {
        // After successful login, check admin authorization
        await checkAdminAuth();
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


  if (authStatus === 'authenticated') {
    // Redirect handled in checkAdminAuth, just return null
    return null;
  }

  return (
    <Layout title="Admin Login - BlogRolly">
      <div className={styles.adminLogin}>
        <div className={styles.loginContainer}>
          <div className={styles.loginHeader}>
            <h1>BlogRolly Admin</h1>
            <p>Sign in with your BlogRolly admin account</p>
          </div>
          <form onSubmit={handleLogin} className={styles.loginForm} autoComplete="on">
            <h2>Admin Sign In</h2>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
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
                autoComplete="current-password"
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
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
