
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/AdminLogin.module.css';

interface AdminUser {
  authenticated: boolean;
  authorized: boolean;
  userId?: string;
  userName?: string;
  userRoles?: string;
  message?: string;
}

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin-auth-check');
      const data: AdminUser = await response.json();
      
      setAdminUser(data);
      
      if (data.authenticated && data.authorized) {
        // Redirect to admin dashboard if already authorized
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Failed to check authentication status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    // Trigger Replit authentication
    window.location.reload();
  };

  if (isLoading) {
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
            <p>Access the admin dashboard</p>
          </div>

          {!adminUser?.authenticated ? (
            <div className={styles.loginForm}>
              <h2>Authentication Required</h2>
              <p>Please authenticate with your Replit account to continue.</p>
              
              <div className={styles.authSection}>
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      document.addEventListener('DOMContentLoaded', function() {
                        const script = document.createElement('script');
                        script.src = 'https://auth.util.repl.co/script.js';
                        script.setAttribute('authed', 'location.reload()');
                        document.getElementById('replit-auth').appendChild(script);
                      });
                    `
                  }}
                />
                <div id="replit-auth"></div>
              </div>
            </div>
          ) : !adminUser.authorized ? (
            <div className={styles.accessDenied}>
              <h2>Access Denied</h2>
              <p>{adminUser.message || 'You do not have permission to access the admin dashboard.'}</p>
              <div className={styles.userInfo}>
                <p><strong>User:</strong> {adminUser.userName}</p>
                <p><strong>User ID:</strong> {adminUser.userId}</p>
                <p><strong>Roles:</strong> {adminUser.userRoles || 'None'}</p>
              </div>
              <p className={styles.helpText}>
                If you believe this is an error, please contact the site administrator.
              </p>
            </div>
          ) : (
            <div className={styles.authorized}>
              <h2>Access Granted</h2>
              <p>Welcome, {adminUser.userName}! Redirecting to admin dashboard...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={checkAdminAuth} className={styles.retryButton}>
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
