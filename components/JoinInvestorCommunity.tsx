import React from "react";



const JoinInvestorCommunity = ({
  activeTab,
  setActiveTab,
  submitStatus,
  submitMessage,
  handleSignupSubmit,
  handleLoginSubmit,
  investorForm,
  handleInputChange,
  isSubmitting,
  loginForm,
  setLoginForm,
  styles
}: any) => (
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

export default JoinInvestorCommunity;
