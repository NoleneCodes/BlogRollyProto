import React, { useState } from 'react';
import SignInForm from '../components/SignInForm';
import styles from '../styles/AuthForm.module.css';
import homeStyles from '../styles/Home.module.css';
import Layout from '../components/Layout';

const SignInPage: React.FC = () => {
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!signInForm.email) newErrors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(signInForm.email)) newErrors.email = 'Enter a valid email address';
    if (!signInForm.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // TODO: Add authentication logic here
    // For now, just clear errors and show a success message
    setErrors({});
    alert('Signed in successfully!');
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
          />
        </div>
      </>
    </Layout>
  );
};

export default SignInPage;
