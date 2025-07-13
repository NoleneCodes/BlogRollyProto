
import React, { useState, useEffect } from 'react';
import styles from '../styles/AuthForm.module.css';

interface AuthFormProps {
  onAuthenticated?: (userInfo: UserInfo) => void;
}

interface UserInfo {
  id: string;
  name: string;
  roles: string[];
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated by checking for Repl Auth headers
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth-check');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            const user = {
              id: data.userId,
              name: data.userName,
              roles: data.userRoles ? data.userRoles.split(',') : []
            };
            setUserInfo(user);
            onAuthenticated?.(user);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [onAuthenticated]);

  const handleAuthSuccess = () => {
    // Reload the page to get fresh auth headers
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>Checking authentication...</h2>
        </div>
      </div>
    );
  }

  if (userInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.welcomeMessage}>
          <h2>Welcome, {userInfo.name}!</h2>
          <p>You are authenticated and ready to submit your blog.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <h2>Sign In to Submit Your Blog</h2>
        <p>Please authenticate with your Replit account to submit a blog to our directory.</p>
        
        <div className={styles.authButtonContainer}>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('message', function(event) {
                  if (event.data === 'repl-auth-success') {
                    window.location.reload();
                  }
                });
              `
            }}
          />
          <div id="repl-auth-button">
            <script
              src="https://auth.util.repl.co/script.js"
              data-authed="window.parent.postMessage('repl-auth-success', '*')"
            />
          </div>
        </div>

        <div className={styles.authInfo}>
          <h3>Why do I need to sign in?</h3>
          <ul>
            <li>Prevents spam and ensures quality submissions</li>
            <li>Allows us to contact you about your submission</li>
            <li>Enables future features like editing your submissions</li>
            <li>Helps build a trusted community</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
