import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import SignInForm from '../components/SignInForm';
import styles from '../styles/AuthForm.module.css';
import homeStyles from '../styles/Home.module.css';
import Layout from '../components/Layout';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SignInPage: React.FC = () => {
  const router = useRouter();
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors: Record<string, string> = {};
    
    if (!signInForm.email) newErrors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(signInForm.email)) newErrors.email = 'Enter a valid email address';
    if (!signInForm.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Actual Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInForm.email,
        password: signInForm.password
      });

      if (error) {
        let message = error.message;
        if (
          message.toLowerCase().includes('invalid login credentials') ||
          message.toLowerCase().includes('invalid email or password') ||
          message.toLowerCase().includes('invalid credentials')
        ) {
          message = 'Hmm, those details don\'t match. Want to try again?';
        }
        setErrors({ general: message });
        setIsLoading(false);
        return;
      }

      // Get user role to determine redirect
      const userId = data?.user?.id;
      if (!userId) {
        setErrors({ general: 'Could not find user. Please try again.' });
        setIsLoading(false);
        return;
      }

      // Update last_login timestamp
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

      // Get user profile to determine role
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, username')
        .eq('user_id', userId)
        .single();

      if (profileError || !profileData) {
        // Fallback: redirect to reader dashboard
        router.push('/profile/reader');
        return;
      }

      // Redirect based on role to the correct profile pages
      if (profileData.role === 'blogger') {
        router.push('/profile/blogger');
      } else {
        router.push('/profile/reader');
      }

    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Sign In - Blogrolly">
      <>
        <div className={homeStyles.hero}>
          <h1 className={homeStyles.title}>Sign In</h1>
          <p className={homeStyles.description} style={{ marginBottom: '1.5rem', paddingBottom: 0 }}>
            Welcome back to Blogrolly
          </p>
        </div>
        <div className={styles.container}>
          <SignInForm
            onSubmit={handleSignIn}
            errors={errors}
            signInForm={signInForm}
            setSignInForm={setSignInForm}
            isLoading={isLoading}
          />
        </div>
      </>
    </Layout>
  );
};

export default SignInPage;