import React, { useState, useEffect } from 'react';
// Import Supabase client (adjust path as needed)
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import styles from '../styles/AuthForm.module.css';
import BloggerSignupForm from './BloggerSignupForm';
import { MAIN_CATEGORIES, validateCustomInput, formatCustomInput } from '../lib/categories-tags';
import { CustomCategoryInput } from './CustomCategoryInput';

interface AuthFormProps {
  onAuthenticated?: (userInfo: UserInfo) => void;
}

interface UserInfo {
  id: string;
  name: string;
  roles: string[];
}

interface ReaderFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  surname: string;
  username: string;
  dateOfBirth: string;
  topics: string[];
  otherTopic: string;
  agreeToTerms: boolean;
  subscribeToUpdates: boolean;
}

interface SignInFormData {
  email: string;
  password: string;
}

// Initialize Supabase client (replace with your actual keys or use env vars)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type AuthMode = 'selection' | 'signin' | 'signup' | 'resetPassword';

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('selection');
  // Reset password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resetError, setResetError] = useState('');
  // Handle password reset submit
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('idle');
    setResetError('');
    if (!resetEmail) {
      setResetError('Email is required');
      return;
    }
    // Send password reset email via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
    });
    if (error) {
      setResetStatus('error');
      setResetError(error.message);
    } else {
      setResetStatus('success');
    }
  };
  const [activeTab, setActiveTab] = useState<'reader' | 'blogger'>('reader');

  // Reader form state
  const [readerForm, setReaderForm] = useState<ReaderFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    surname: '',
    username: '',
    dateOfBirth: '',
    topics: [],
    otherTopic: '',
    agreeToTerms: false,
    subscribeToUpdates: false
  });

  const [customTopic, setCustomTopic] = useState('');

  // Sign in form state
  const [signInForm, setSignInForm] = useState<SignInFormData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});



  useEffect(() => {
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

  // Handle tab parameter from URL
  useEffect(() => {
    if (router.query.tab === 'blogger') {
      setActiveTab('blogger');
      setAuthMode('signup');
    }
  }, [router.query]);

  const validateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return false;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  };

  const handleReaderTopicChange = (topic: string, checked: boolean) => {
    if (topic === 'Other') {
      if (checked) {
        setReaderForm(prev => ({
          ...prev,
          topics: [...prev.topics, 'Other']
        }));
      } else {
        setReaderForm(prev => ({
          ...prev,
          topics: prev.topics.filter(t => t !== 'Other' && t !== prev.otherTopic),
          otherTopic: ''
        }));
        setCustomTopic('');
      }
    } else {
      setReaderForm(prev => ({
        ...prev,
        topics: checked 
          ? [...prev.topics, topic]
          : prev.topics.filter(t => t !== topic)
      }));
    }
  };

  const handleCustomTopicChange = (value: string) => {
    setCustomTopic(value);
    const validation = validateCustomInput(value);

    if (validation.isValid && value.trim()) {
      const formattedTopic = formatCustomInput(value);
      setReaderForm(prev => ({
        ...prev,
        topics: [...prev.topics.filter(t => t !== prev.otherTopic), formattedTopic],
        otherTopic: formattedTopic
      }));
    } else if (readerForm.otherTopic) {
      setReaderForm(prev => ({
        ...prev,
        topics: prev.topics.filter(t => t !== prev.otherTopic),
        otherTopic: ''
      }));
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Basic email format validation
    if (!signInForm.email) newErrors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(signInForm.email)) newErrors.email = 'Enter a valid email address';
    if (!signInForm.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Real Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInForm.email,
      password: signInForm.password
    });

    if (error) {
      // Show a friendly error for invalid credentials
      let message = error.message;
      if (
        message.toLowerCase().includes('invalid login credentials') ||
        message.toLowerCase().includes('invalid email or password') ||
        message.toLowerCase().includes('invalid credentials')
      ) {
        message = 'Hmm, those details don\'t match. Want to try again?';
      }
      setErrors({ general: message });
      return;
    }

    // Optionally fetch user roles/profile from your DB if needed
    // For now, just redirect to reader profile
    router.push('/profile/reader');
    // Optionally: setUserInfo({ ... })
  };

  const handleReaderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!readerForm.email) newErrors.email = 'Email is required';
    if (!readerForm.password) newErrors.password = 'Password is required';
    else if (readerForm.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!readerForm.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (readerForm.password !== readerForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!readerForm.firstName) newErrors.firstName = 'First name is required';
    if (!readerForm.surname) newErrors.surname = 'Surname is required';
    if (!readerForm.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else if (!validateAge(readerForm.dateOfBirth)) newErrors.dateOfBirth = 'You must be 18 or older';
    if (readerForm.topics.length === 0) newErrors.topics = 'Please select at least one topic';
    if (!readerForm.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

    // Username uniqueness check
    if (readerForm.username) {
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(readerForm.username)}`);
        const data = await res.json();
        if (!res.ok || data.exists) {
          newErrors.username = 'This username is already taken. Please choose another.';
        }
      } catch (err) {
        newErrors.username = 'Could not check username. Please try again.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Implement Supabase authentication
    console.log('Reader form submitted:', readerForm);
    alert('Account created successfully! Welcome to BlogRolly!');

  // Redirect to personalized reader dashboard
  router.push(`/reader/${readerForm.username}`);
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

  // Mode selection screen
  if (authMode === 'selection') {
    return (
      <div className={styles.container}>
        <div className={styles.authCard}>
          <h2>Welcome to Blogrolly</h2>
          <p>Join our community of readers and bloggers</p>

          <div className={styles.modeSelection}>
            <button 
              className={styles.modeButton}
              onClick={() => setAuthMode('signup')}
            >
              <h3>Create Account</h3>
              <p>New to Blogrolly? Sign up to start discovering amazing blogs or share your own.</p>
            </button>

            <button 
              className={styles.modeButton}
              onClick={() => setAuthMode('signin')}
            >
              <h3>Sign In</h3>
              <p>Already have an account? Sign in to access your dashboard and submissions.</p>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              className={styles.linkButton}
              onClick={() => router.push('/')}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sign in form
  if (authMode === 'signin') {
    return (
      <div className={styles.container}>
        <div className={styles.authCard}>
          <h2>Sign In</h2>
          <p>Welcome back to Blogrolly</p>

          <form onSubmit={handleSignIn} className={styles.form}>
            {errors.general && (
              <div className={styles.formGroup}>
                <span className={styles.error}>{errors.general}</span>
              </div>
            )}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Email Address *
              </label>
              <input
                type="email"
                value={signInForm.email}
                onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Password *
              </label>
              <input
                type="password"
                value={signInForm.password}
                onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <button type="submit" className={styles.submitButton}>
              Sign In
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              className={styles.linkButton}
              onClick={() => setAuthMode('selection')}
            >
              ← Back to options
            </button>
            <span style={{ margin: '0 1rem', color: '#6b7280' }}>|</span>
            <button 
              className={styles.linkButton}
              onClick={() => setAuthMode('signup')}
            >
              Don&apos;t have an account? Sign up
            </button>
            <span style={{ margin: '0 1rem', color: '#6b7280' }}>|</span>
            <button
              className={styles.linkButton}
              onClick={() => setAuthMode('resetPassword')}
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  if (authMode === 'resetPassword') {
    return (
      <div className={styles.container}>
        <div className={styles.authCard}>
          <h2>Reset Password</h2>
          <p>Enter your email address and we’ll send you a link to reset your password.</p>
          <form onSubmit={handleResetPassword} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address *</label>
              <input
                type="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className={styles.textInput}
                required
              />
            </div>
            {resetError && <span className={styles.error}>{resetError}</span>}
            {resetStatus === 'success' && (
              <span className={styles.success}>Password reset email sent! Please check your inbox.</span>
            )}
            <button type="submit" className={styles.submitButton}>
              Send Reset Link
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              className={styles.linkButton}
              onClick={() => setAuthMode('signin')}
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sign up forms (existing functionality)
  return (
    <div className={styles.container}>
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'reader' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reader')}
        >
            I&apos;m a Reader
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'blogger' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('blogger')}
        >
          I&apos;m a Blogger
        </button>
      </div>

      {activeTab === 'reader' ? (
        <div className={styles.authCard}>
          <h2>Join as a Reader</h2>
          <p>Discover amazing blogs tailored to your interests</p>

          <form onSubmit={handleReaderSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                First Name *
              </label>
              <input
                type="text"
                value={readerForm.firstName}
                onChange={(e) => setReaderForm(prev => ({ ...prev, firstName: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Surname *
              </label>
              <input
                type="text"
                value={readerForm.surname}
                onChange={(e) => setReaderForm(prev => ({ ...prev, surname: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.surname && <span className={styles.error}>{errors.surname}</span>}
              <small className={styles.hint}>Your name helps us personalise your experience.</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Email Address *
              </label>
              <input
                type="email"
                value={readerForm.email}
                onChange={(e) => setReaderForm(prev => ({ ...prev, email: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
              <small className={styles.hint}>This will be your login email address.</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Date of Birth *
              </label>
              <input
                type="date"
                value={readerForm.dateOfBirth}
                onChange={(e) => setReaderForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.dateOfBirth && <span className={styles.error}>{errors.dateOfBirth}</span>}
              <small className={styles.hint}>We use your age to filter out mature content (must be 18+).</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Password *
              </label>
              <input
                type="password"
                value={readerForm.password}
                onChange={(e) => setReaderForm(prev => ({ ...prev, password: e.target.value }))}
                className={styles.textInput}
                minLength={8}
                required
              />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
              <small className={styles.hint}>Must be at least 8 characters long.</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Confirm Password *
              </label>
              <input
                type="password"
                value={readerForm.confirmPassword}
                onChange={(e) => setReaderForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
              <small className={styles.hint}>Re-enter your password to confirm.</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Username (optional)
              </label>
              <input
                type="text"
                value={readerForm.username}
                onChange={(e) => setReaderForm(prev => ({ ...prev, username: e.target.value }))}
                className={styles.textInput}
                placeholder="Pick a name readers can see"
              />
              <small className={styles.hint}>Pick a name readers can see (optional).</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Topics You&apos;re Into *</label>
              <div className={styles.checkboxGrid}>
                {MAIN_CATEGORIES.map(category => (
                  <label key={category} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={readerForm.topics.includes(category)}
                      onChange={(e) => handleReaderTopicChange(category, e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>{category}</span>
                  </label>
                ))}
              </div>

              <CustomCategoryInput
                selectedCategories={readerForm.topics}
                onCategoryChange={(categories) => 
                  setReaderForm(prev => ({ ...prev, topics: categories }))
                }
                maxWords={3}
                label="Add your custom topic (one word at a time, max 3 words)"
              />

              {errors.topics && <span className={styles.error}>{errors.topics}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={readerForm.agreeToTerms}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                  className={styles.checkbox}
                  required
                />
                <span className={styles.checkboxText}>
                  I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> *
                </span>
              </label>
              {errors.agreeToTerms && <span className={styles.error}>{errors.agreeToTerms}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={readerForm.subscribeToUpdates}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, subscribeToUpdates: e.target.checked }))}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  Subscribe to occasional updates on new blog drops
                </span>
              </label>
              <small className={styles.hint}>No spam. Just brilliant blogs you might love.</small>
            </div>

            <button type="submit" className={styles.submitButton}>
              Start Exploring
            </button>
          </form>
        </div>
      ) : (
        <BloggerSignupForm onAuthenticated={onAuthenticated} />
      )}

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button 
          className={styles.linkButton}
          onClick={() => setAuthMode('selection')}
        >
          ← Back to options
        </button>
        <span style={{ margin: '0 1rem', color: '#6b7280' }}>|</span>
        <button 
          className={styles.linkButton}
          onClick={() => setAuthMode('signin')}
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
};

export default AuthForm;