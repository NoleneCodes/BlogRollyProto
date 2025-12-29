import React, { useState, useEffect } from 'react';
// Import Supabase client (adjust path as needed)
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import styles from '../styles/AuthForm.module.css';
import SignInForm from './SignInForm';
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
  const [authMode, setAuthMode] = useState<AuthMode>('selection'); // Start with selection screen
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

    // Basic validation - allow email OR username
    if (!signInForm.email) {
      newErrors.email = 'Email or username is required';
    }
    if (!signInForm.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const loginInput = signInForm.email.trim();
    let emailToUse = loginInput;

    // Check if input looks like an email (contains @ and .)
    const isEmail = loginInput.includes('@') && loginInput.includes('.');
    
    if (!isEmail) {
      // Input is likely a username, need to find the corresponding email
      try {
        console.log('🔍 Looking up email for username:', loginInput);
        
        const response = await fetch('/api/lookup-email-by-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: loginInput })
        });

        const data = await response.json();

        if (!response.ok || !data.found) {
          setErrors({ 
            general: 'Username not found. Please check your username or use your email address instead.' 
          });
          return;
        }

        emailToUse = data.email;
        console.log('🔍 Found email for username, proceeding with authentication');

      } catch (error) {
        console.error('Username lookup error:', error);
        setErrors({ 
          general: 'Error looking up username. Please try using your email address.' 
        });
        return;
      }
    }

    // Proceed with email-based authentication
    try {
      console.log('🔍 Attempting authentication with email:', emailToUse);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
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
          if (isEmail) {
            message = 'Hmm, those details don\'t match. Want to try again?';
          } else {
            message = 'Username or password incorrect. Please try again.';
          }
        }
        setErrors({ general: message });
        return;
      }

      // Fetch user profile to determine role
      let userId = data?.user?.id;
      if (!userId) {
        setErrors({ general: 'Could not find user. Please try again.' });
        return;
      }

      console.log('🔍 Authentication successful, updating login timestamp');

      // Update last_login timestamp
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

      // Get user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, username')
        .eq('user_id', userId)
        .single();

      if (profileError || !profileData) {
        console.log('🔍 No profile found, redirecting to reader dashboard');
        router.push('/profile/reader');
        return;
      }

      console.log('🔍 Profile found, redirecting based on role:', profileData.role);

      // Redirect based on role to the correct profile pages
      if (profileData.role === 'blogger') {
        router.push('/profile/blogger');
      } else {
        router.push('/profile/reader');
      }

    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    }
  };

  const handleReaderSubmit = async (e: React.FormEvent) => {
  console.log('🔍 handleReaderSubmit function called!');
  e.preventDefault();
  console.log('🔍 Form submission started, form data:', readerForm);
    
    const newErrors: Record<string, string> = {};

  if (!readerForm.email) newErrors.email = 'Email is required';
  if (!readerForm.password) {
  newErrors.password = 'Password is required';
} else if (readerForm.password.length < 12) {
  newErrors.password = 'Password must be at least 12 characters long';
} else {
  // Check for common weak patterns
  const isWeak = /^(password|123456|qwerty|admin|letmein)/i.test(readerForm.password);
  const hasUpperCase = /[A-Z]/.test(readerForm.password);
  const hasNumbers = /\d/.test(readerForm.password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(readerForm.password);
  
  if (isWeak) {
    newErrors.password = 'This password is too common. Please choose something more unique.';
  } else if (!hasUpperCase || !hasNumbers || !hasSpecialChars) {
    newErrors.password = 'Password must include uppercase letters, numbers, and special characters';
  }
}
  if (!readerForm.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
  else if (readerForm.password !== readerForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
  if (!readerForm.firstName) newErrors.firstName = 'First name is required';
  if (!readerForm.surname) newErrors.surname = 'Surname is required';
  if (!readerForm.username) newErrors.username = 'Username is required';
  if (!readerForm.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
  else if (!validateAge(readerForm.dateOfBirth)) newErrors.dateOfBirth = 'You must be 18 or older';
  if (readerForm.topics.length === 0) newErrors.topics = 'Please select at least one topic';
  if (!readerForm.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

    // Username uniqueness check
    if (readerForm.username) {
      try {
        console.log('🔍 Checking username availability...');
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(readerForm.username)}`);
        const data = await res.json();
        console.log('🔍 Username check result:', { exists: data.exists, username: readerForm.username });
        
        if (!res.ok || data.exists) {
          newErrors.username = 'This username is already taken. Please choose another.';
        }
      } catch (err) {
        console.error('❌ Username check error:', err);
        newErrors.username = 'Could not check username. Please try again.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Validation errors:', newErrors);
      setErrors(newErrors);
      return;
    }
    console.log('✅ Validation passed, proceeding to signup...');

    try {
      console.log('🔍 Starting Supabase auth signup...');
      
      // Supabase signup
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: readerForm.email,
        password: readerForm.password,
        options: {
          data: {
            first_name: readerForm.firstName,
            surname: readerForm.surname,
            username: readerForm.username,
            date_of_birth: readerForm.dateOfBirth,
            role: 'reader',
            tier: 'free'
          }
        }
      });

      console.log('🔍 Signup result:', { 
        user: signUpData?.user?.id, 
        session: !!signUpData?.session,
        error: signUpError?.message 
      });

      if (signUpError) {
        console.error('❌ Signup error:', signUpError);
        setErrors({ general: signUpError.message });
        return;
      }

      // Get user id from signup response
      const userId = signUpData?.user?.id;
      if (!userId) {
        console.error('❌ No user ID returned from signup');
        setErrors({ general: 'Could not create user account. Please try again.' });
        return;
      }

      console.log('✅ Created auth user:', userId);

      // Insert user profile
      console.log('🔍 Creating user profile...');
      const { error: profileError } = await supabase.from('user_profiles').insert({
        user_id: userId,
        first_name: readerForm.firstName,
        surname: readerForm.surname,
        username: readerForm.username,
        date_of_birth: readerForm.dateOfBirth,
        age_verified: true,
        role: 'reader',
        tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        setErrors({ general: 'Failed to create profile. Please try again.' });
        return;
      }

      console.log('✅ Created user profile');

      // Insert reader profile
      console.log('🔍 Creating reader profile...');
      const { error: readerError } = await supabase.from('reader_profiles').insert({
        user_id: userId,
        topics: readerForm.topics,
        other_topic: readerForm.otherTopic,
        subscribe_to_updates: readerForm.subscribeToUpdates,
        notification_preferences: {
          email: true,
          push: false
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (readerError) {
        console.error('⚠️ Reader profile creation error:', readerError);
        console.warn('Reader profile creation failed but continuing...');
      } else {
        console.log('✅ Created reader profile');
      }

      console.log('✅ Account creation completed successfully!');
      alert('Account created successfully! Welcome to BlogRolly!');
      
      // Wait a moment for session to be established
      console.log('🔍 Waiting for session to be established...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we have a session before redirecting
      const { data: { session: newSession }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 Post-signup session check:', { 
        hasSession: !!newSession, 
        sessionError: sessionError?.message 
      });

      console.log('🔍 Attempting redirect to /profile/reader...');
      
      // Force a hard redirect to ensure the session is available
      window.location.href = '/profile/reader';

    } catch (error) {
      console.error('❌ Unexpected signup error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.loadingCard}>
          <h2>Checking authentication...</h2>
          <p>Just a moment while we verify your status.</p>
        </div>
      </div>
    );
  }

  if (userInfo) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.welcomeCard}>
          <h2>Welcome, {userInfo.name}!</h2>
          <p>You are authenticated and ready to submit your blog.</p>
        </div>
      </div>
    );
  }

  // Mode selection screen
  if (authMode === 'selection') {
    return (
      <div className={styles.authContainer}>
        <div className={styles.selectionCard}>
          <h2 className={styles.selectionTitle}>Welcome to BlogRolly</h2>
          <p className={styles.selectionDescription}>Join our community of readers and bloggers</p>

          <div className={styles.modeSelection}>
            <button 
              className={styles.modeButton}
              onClick={() => setAuthMode('signup')}
            >
              <h3 className={styles.modeTitle}>Create Account</h3>
              <p className={styles.modeDescription}>New to BlogRolly? Sign up to start discovering amazing blogs or share your own.</p>
            </button>

            <button 
              className={styles.modeButton}
              onClick={() => setAuthMode('signin')}
            >
              <h3 className={styles.modeTitle}>Sign In</h3>
              <p className={styles.modeDescription}>Already have an account? Sign in to access your dashboard and submissions.</p>
            </button>
          </div>

          <div className={styles.backButtonContainer}>
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
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h2 className={styles.authTitle}>Sign In</h2>
          <p className={styles.authDescription}>Welcome back to BlogRolly</p>

          <form onSubmit={handleSignIn} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email or Username *</label>
              <input
                type="text"
                value={signInForm.email}
                onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                className={styles.textInput}
                placeholder="Enter your email or username"
                required
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
              <small className={styles.hint}>You can sign in with either your email address or username</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Password *</label>
              <input
                type="password"
                value={signInForm.password}
                onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            {errors.general && (
              <div className={styles.errorMessage}>
                <span className={styles.error}>{errors.general}</span>
              </div>
            )}

            <button type="submit" className={styles.submitButton}>
              Sign In
            </button>
          </form>

          <div className={styles.linkContainer}>
            <button 
              className={styles.linkButton}
              onClick={() => setAuthMode('resetPassword')}
            >
              Forgot your password?
            </button>
          </div>

          <div className={styles.authFooter}>
            <button 
              className={styles.linkButton}
              onClick={() => setAuthMode('selection')}
            >
              ← Back to options
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  if (authMode === 'resetPassword') {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h2 className={styles.authTitle}>Reset Password</h2>
          <p className={styles.authDescription}>Enter your email address and we'll send you a link to reset your password.</p>
          
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
            
            {resetError && (
              <div className={styles.errorMessage}>
                <span className={styles.error}>{resetError}</span>
              </div>
            )}
            
            {resetStatus === 'success' && (
              <div className={styles.successMessage}>
                <span className={styles.success}>Password reset email sent! Please check your inbox.</span>
              </div>
            )}
            
            <button type="submit" className={styles.submitButton}>
              Send Reset Link
            </button>
          </form>
          
          <div className={styles.authFooter}>
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

  // Sign up forms with tabs (when authMode === 'signup')
  return (
    <div className={styles.authContainer}>
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'reader' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reader')}
        >
          I'm a Reader
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'blogger' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('blogger')}
        >
          I'm a Blogger
        </button>
      </div>

      {activeTab === 'reader' ? (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Join as a Reader</h2>
          <p className={styles.formDescription}>Discover amazing blogs tailored to your interests</p>

          <form onSubmit={handleReaderSubmit} className={styles.form}>
            {/* Row 1: First Name and Surname */}
            <div className={styles.formGridTwo}>
              <div className={styles.formGroup}>
                <label className={styles.label}>First Name *</label>
                <input
                  type="text"
                  value={readerForm.firstName}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className={styles.input}
                  required
                />
                {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Surname *</label>
                <input
                  type="text"
                  value={readerForm.surname}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, surname: e.target.value }))}
                  className={styles.input}
                  required
                />
                {errors.surname && <span className={styles.error}>{errors.surname}</span>}
              </div>
            </div>

            {/* Row 2: Username and Date of Birth */}
            <div className={styles.formGridTwo}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Username *</label>
                <input
                  type="text"
                  value={readerForm.username}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, username: e.target.value }))}
                  className={styles.input}
                  required
                />
                {errors.username && <span className={styles.error}>{errors.username}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth *</label>
                <input
                  type="date"
                  value={readerForm.dateOfBirth}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className={styles.input}
                  required
                />
                {errors.dateOfBirth && <span className={styles.error}>{errors.dateOfBirth}</span>}
              </div>
            </div>

            {/* Row 3: Email (full width) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address *</label>
              <input
                type="email"
                value={readerForm.email}
                onChange={(e) => setReaderForm(prev => ({ ...prev, email: e.target.value }))}
                className={styles.input}
                required
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            {/* Row 4: Password and Confirm Password */}
            <div className={styles.formGridTwo}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Password *</label>
                <input
                  type="password"
                  value={readerForm.password}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, password: e.target.value }))}
                  className={styles.input}
                  minLength={8}
                  required
                />
                {errors.password && <span className={styles.error}>{errors.password}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password *</label>
                <input
                  type="password"
                  value={readerForm.confirmPassword}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={styles.input}
                  required
                />
                {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* Topics Selection - 2 Column Layout with Multiple Rows */}
            <div className={styles.topicsSection}>
              <label className={styles.sectionLabel}>Topics You're Into *</label>
              <div className={styles.topicsGridTwoColumn}>
                {[
                  'Lifestyle', 
                  'Health & Wellness', 
                  'Business & Finance', 
                  'Tech & Digital Life', 
                  'Creative & Arts', 
                  'Education & Learning', 
                  'Travel & Adventure', 
                  'Food & Cooking', 
                  'Entertainment', 
                  'Sports & Fitness',
                  'Personal Development',
                  'Other'
                ].map(category => (
                  <label key={category} className={styles.topicLabel}>
                    <input
                      type="checkbox"
                      checked={readerForm.topics.includes(category)}
                      onChange={(e) => handleReaderTopicChange(category, e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.topicText}>{category}</span>
                  </label>
                ))}
              </div>
              {errors.topics && <span className={styles.error}>{errors.topics}</span>}
            </div>

            {/* Agreement and Submit Row */}
            <div className={styles.agreementSection}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={readerForm.agreeToTerms}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                  className={styles.checkbox}
                  required
                />
                <span className={styles.checkboxText}>
                  I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a> *
                </span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={readerForm.subscribeToUpdates}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, subscribeToUpdates: e.target.checked }))}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Subscribe to weekly updates about new blogs</span>
              </label>
            </div>

            {errors.general && (
              <div className={styles.errorMessage}>
                <span className={styles.error}>{errors.general}</span>
              </div>
            )}

            <div className={styles.submitRow}>
              <button type="submit" className={styles.submitButton}>
                Create Reader Account
              </button>
            </div>
          </form>

          <div className={styles.authFooter}>
            <button 
              className={styles.linkButton}
              onClick={() => setAuthMode('selection')}
            >
              ← Back to options
            </button>
          </div>
        </div>
      ) : (
        <BloggerSignupForm onAuthenticated={onAuthenticated} />
      )}

      <div className={styles.authFooter}>
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