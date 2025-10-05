import React from 'react';
import Link from 'next/link';
import styles from '../styles/AuthForm.module.css';

interface SignInFormProps {
  onSubmit: (e: React.FormEvent) => void;
  errors: Record<string, string>;
  signInForm: {
    email: string;
    password: string;
  };
  setSignInForm: React.Dispatch<React.SetStateAction<{ email: string; password: string }>>;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSubmit, errors, signInForm, setSignInForm }) => (
  <div className={styles.container}>
    <div className={styles.authCard}>
      <h2>Sign In</h2>
      <p>Welcome back to Blogrolly</p>

      <form onSubmit={onSubmit} className={styles.form}>
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
        <Link href="/reset-password" className={styles.linkButton}>
          Forgot password?
        </Link>
      </div>
    </div>
  </div>
);

export default SignInForm;
