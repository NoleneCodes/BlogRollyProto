import React, { useState } from "react";
import { supabase } from "../lib/supabase";



const JoinInvestorCommunity = ({
  activeTab,
  setActiveTab,
  styles
}: any) => {
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [investorForm, setInvestorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    investmentRange: "",
    investorType: "",
    linkedinUrl: "",
    interests: "",
    message: "",
    password: "",
    confirmPassword: ""
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvestorForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("");
    setSubmitMessage("");
    if (investorForm.password !== investorForm.confirmPassword) {
      setSubmitStatus("error");
      setSubmitMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }
    // Supabase sign up
    const { data, error } = await supabase.auth.signUp({
      email: investorForm.email,
      password: investorForm.password
    });
    if (error) {
      setSubmitStatus("error");
      setSubmitMessage(error.message);
      setIsSubmitting(false);
      return;
    }
    const userId = data?.user?.id;
    if (!userId) {
      setSubmitStatus("error");
      setSubmitMessage("User creation failed.");
      setIsSubmitting(false);
      return;
    }
    // Insert investor profile
    const { error: profileError } = await supabase.from("investor_profiles").insert({
      user_id: userId,
      first_name: investorForm.firstName,
      last_name: investorForm.lastName,
      email: investorForm.email,
      company: investorForm.company,
      investment_range: investorForm.investmentRange,
      investor_type: investorForm.investorType,
      linkedin_url: investorForm.linkedinUrl,
      interests: investorForm.interests,
      message: investorForm.message
    });
    if (profileError) {
      setSubmitStatus("error");
      setSubmitMessage(profileError.message);
      setIsSubmitting(false);
      return;
    }
    setSubmitStatus("success");
    setSubmitMessage("Account created! Please check your email to verify your account.");
    setIsSubmitting(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("");
    setSubmitMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password
    });
    if (error) {
      setSubmitStatus("error");
      setSubmitMessage(error.message);
      setIsSubmitting(false);
      return;
    }
    setSubmitStatus("success");
    setSubmitMessage("Login successful!");
    setIsSubmitting(false);
  };
  return (
  <div className={styles.investorSignupSection}>
    <h2>Join the Investor Community</h2>
    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}> Create an Investor account to get exclusive access to:</div>
      <ul style={{
        margin: 0,
        paddingLeft: 0,
        display: 'inline-block',
        textAlign: 'left',
        listStyle: 'disc',
      }}>
        <li style={{ marginBottom: 2 }}>Our private dashboard</li>
        <li style={{ marginBottom: 2 }}>Live performance metrics</li>
        <li>Early investment opportunities</li>
      </ul>
    </div>
    <div className={styles.tabNavigation}>
      <button
        type="button"
        className={`${styles.tabButton} ${activeTab === 'signup' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('signup')}
      >
        Create Account
      </button>
      <button
        type="button"
        className={`${styles.tabButton} ${activeTab === 'login' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('login')}
      >
        Sign In
      </button>
    </div>
    {submitStatus === 'success' && (
      <div className={styles.successMessage}>
        <h3>✅ Success!</h3>
        <p>{submitMessage}</p>
      </div>
    )}
    {submitStatus === 'error' && (
      <div className={styles.errorMessage}>
        <h3>❌ Error</h3>
        <p>{submitMessage}</p>
      </div>
    )}
    {activeTab === 'signup' && submitStatus !== 'success' && (
  <form onSubmit={handleSignupSubmit} className={styles.investorForm}>
        <div className={styles.formRow}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={investorForm.firstName}
            onChange={handleInputChange}
            required
            className={styles.formInput}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={investorForm.lastName}
            onChange={handleInputChange}
            required
            className={styles.formInput}
          />
        </div>
        <div className={styles.formRow}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={investorForm.email}
            onChange={handleInputChange}
            required
            className={styles.formInput}
          />
          <input
            type="text"
            name="company"
            placeholder="Company (optional)"
            value={investorForm.company}
            onChange={handleInputChange}
            className={styles.formInput}
          />
        </div>
        <div className={styles.formRow}>
          <select
            name="investmentRange"
            value={investorForm.investmentRange}
            onChange={handleInputChange}
            required
            className={styles.formSelect}
          >
            <option value="">Investment Range</option>
            <option value="< $10k">&lt; $10k</option>
            <option value="$10k-$50k">$10k-$50k</option>
            <option value="> $50k">&gt; $50k</option>
          </select>
          <select
            name="investorType"
            value={investorForm.investorType}
            onChange={handleInputChange}
            required
            className={styles.formSelect}
          >
            <option value="">Investor Type</option>
            <option value="Angel">Angel</option>
            <option value="VC">VC</option>
            <option value="Family Office">Family Office</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className={styles.formRow}>
          <input
            type="text"
            name="linkedinUrl"
            placeholder="LinkedIn URL (optional)"
            value={investorForm.linkedinUrl}
            onChange={handleInputChange}
            className={styles.formInput}
          />
          <input
            type="text"
            name="interests"
            placeholder="Interests (comma separated)"
            value={investorForm.interests}
            onChange={handleInputChange}
            className={styles.formInput}
          />
        </div>
        <div className={styles.formRow}>
          <textarea
            name="message"
            placeholder="Message (optional)"
            value={investorForm.message}
            onChange={handleInputChange}
            className={styles.formTextarea}
            rows={2}
          />
        </div>
        <div className={styles.formRow}>
          <input
            type="password"
            name="password"
            placeholder="Password (min 8 chars)"
            value={investorForm.password}
            onChange={handleInputChange}
            required
            className={styles.formInput}
            minLength={8}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={investorForm.confirmPassword}
            onChange={handleInputChange}
            required
            className={styles.formInput}
            minLength={8}
          />
        </div>
        <button type="submit" className={styles.investorSubmitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    )}
    {activeTab === 'login' && (
  <form onSubmit={handleLoginSubmit} className={styles.investorForm}>
        <div className={styles.formRow}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={e => setLoginForm((prev: any) => ({ ...prev, email: e.target.value }))}
            required
            className={styles.formInput}
          />
        </div>
        <div className={styles.formRow}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={e => setLoginForm((prev: any) => ({ ...prev, password: e.target.value }))}
            required
            className={styles.formInput}
          />
        </div>
        <button type="submit" className={styles.investorSubmitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    )}
  </div>
  );
};

export default JoinInvestorCommunity;
