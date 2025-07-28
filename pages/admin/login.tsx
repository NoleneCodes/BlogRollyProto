
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
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkAdminAuth();
    }
  }, [user]);

  const checkAdminAuth = async () => {
    if (!user) return;
    
    setIsChecking(true);
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No access token found');
      }

      const response = await fetch('/api/admin-auth-check', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const data: AdminUser = await response.json();
      
      setAdminUser(data);
      
      if (data.authenticated && data.authorized) {
        // Redirect to admin dashboard if authorized
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setLoginError('Failed to check admin authorization');
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
      // If successful, the useEffect will handle admin check
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

  if (loading || isChecking) {
    return (
      <Layout title="Admin Login - BlogRolly">
        <div className={styles.adminLogin}>
          <div className={styles.loginContainer}>
            <div className={styles.loading}>
              <h2>Checking authentication...</h2>
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
                  placeholder="hello@blogrolly.com"
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
                  placeholder="Enter your password"
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
          ) : adminUser && !adminUser.authorized ? (
            <div className={styles.accessDenied}>
              <h2>Access Denied</h2>
              <p>{adminUser.message || 'You do not have permission to access the admin dashboard.'}</p>
              <div className={styles.userInfo}>
                <p><strong>Email:</strong> {adminUser.userEmail}</p>
                <p><strong>User ID:</strong> {adminUser.userId}</p>
              </div>
              <p className={styles.helpText}>
                Only BlogRolly administrators can access this area. If you believe this is an error, please contact support.
              </p>
              
              <button 
                onClick={() => {
                  // Sign out and reset form
                  setAdminUser(null);
                  setLoginForm({ email: '', password: '' });
                }} 
                className={styles.signOutButton}
              >
                Sign Out
              </button>
            </div>
          ) : adminUser && adminUser.authorized ? (
            <div className={styles.authorized}>
              <h2>Access Granted</h2>
              <p>Welcome, {adminUser.userEmail}! Redirecting to admin dashboard...</p>
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
