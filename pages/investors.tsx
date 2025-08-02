import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Investors: NextPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [investorForm, setInvestorForm] = useState({
    name: '',
    email: '',
    company: '',
    investmentRange: '',
    investorType: '',
    interests: '',
    message: '',
    password: '',
    confirmPassword: '',
    linkedinUrl: ''
  });
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvestorForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // Validate passwords match
      if (investorForm.password !== investorForm.confirmPassword) {
        setSubmitStatus('error');
        setSubmitMessage('Passwords do not match');
        return;
      }

      if (investorForm.password.length < 8) {
        setSubmitStatus('error');
        setSubmitMessage('Password must be at least 8 characters long');
        return;
      }

      const response = await fetch('/api/investor/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(investorForm)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(data.message);
        setInvestorForm({
          name: '',
          email: '',
          company: '',
          investmentRange: '',
          investorType: '',
          interests: '',
          message: '',
          password: '',
          confirmPassword: '',
          linkedinUrl: ''
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Error submitting investor signup:', error);
      setSubmitStatus('error');
      setSubmitMessage('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/investor/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('investorToken', data.token);
        localStorage.setItem('investorData', JSON.stringify(data.investor));

        // Redirect to investor dashboard
        router.push('/investor/dashboard');
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error during investor login:', error);
      setSubmitStatus('error');
      setSubmitMessage('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Investors - BlogRolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>Investors</h1>
        <p className={styles.description}>
          Join us in revolutionizing how people discover and organize content
        </p>
      </div>

      <div className={styles.missionSection}>
        <h2>Explore Our Vision, Opportunity & Strategy</h2>
        <p>BlogRolly is building the future of independent content discovery, one that puts power back in the hands of creators.</p>
        <p>We believe the next wave of the creator economy won't be algorithmic.</p>
        <p>It will be owned, authentic, and connected.</p>
        <p>We're not just rebuilding a tool.</p>
        <p><strong>We're rebuilding a culture.</strong></p>
        <p>BlogRolly is the next-generation blogroll our 'Y' is to become a platform that helps self-hosted bloggers grow, monetise, and build loyal readerships without relying on social feeds or SEO games.</p>

        <h3>How we'll win:</h3>
        <ul className={styles.featureList}>
          <li>• By serving the overlooked: 30M+ independent bloggers building businesses from scratch</li>
          <li>• By reviving lost discovery habits: organic linking, curated ecosystems, value-based visibility</li>
          <li>• By supporting modern, monetisation-friendly infrastructure for indie writers</li>
        </ul>
      </div>

      <div className={styles.roadmapSection}>
        <h2>Product Roadmap – Building in Public</h2>

        <div className={styles.roadmapPhase}>
          <h3>MVP Launch – Aug 2025</h3>
          <ul className={styles.featureList}>
            <li>• Blogger directory submissions (searchable)</li>
            <li>• Reader onboarding + interest-based exploration</li>
            <li>• Early engagement tools (save, follow)</li>
            <li>• SEO-friendly profiles</li>
          </ul>
        </div>

        <div className={styles.roadmapPhase}>
          <h3>Phase 2 – Sept–Dec 2025</h3>
          <ul className={styles.featureList}>
            <li>• Blogger analytics dashboard</li>
            <li>• Value-based curated tagging and categories (Blog Collections)</li>
          </ul>
        </div>

        <div className={styles.roadmapPhase}>
          <h3>Vision – 2026 and beyond</h3>
          <ul className={styles.featureList}>
            <li>• Dymaic AI-assisted blog collections directly addressing search queries</li>
            <li>• Monetisation layers for advocates (Affiliate Programs)</li>
            <li>• Indie press tools (newsletter/blogger events)</li>
          </ul>
        </div>
      </div>

      <div className={styles.investorSignupSection}>
        <h2>Join Our Investor Community</h2>
        <p>Create your exclusive investor account to access our dashboard and investment opportunities</p>

        {/* Tab Navigation */}
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

        {/* Signup Form */}
        {activeTab === 'signup' && submitStatus !== 'success' && (
          <form onSubmit={handleSignupSubmit} className={styles.investorForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={investorForm.name}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={investorForm.email}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="company">Company/Fund Name</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={investorForm.company}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="Optional"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="investmentRange">Investment Range *</label>
                <select
                  id="investmentRange"
                  name="investmentRange"
                  value={investorForm.investmentRange}
                  onChange={handleInputChange}
                  required
                  className={styles.formSelect}
                >
                  <option value="">Select range</option>
                  <option value="under-10k">Under $10K</option>
                  <option value="10k-50k">$10K - $50K</option>
                  <option value="50k-100k">$50K - $100K</option>
                  <option value="100k-500k">$100K - $500K</option>
                  <option value="500k-1m">$500K - $1M</option>
                  <option value="over-1m">Over $1M</option>
                  <option value="strategic">Strategic Partnership</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="investorType">Investor Type *</label>
                <select
                  id="investorType"
                  name="investorType"
                  value={investorForm.investorType}
                  onChange={handleInputChange}
                  required
                  className={styles.formSelect}
                >
                  <option value="">Select type</option>
                  <option value="angel">Angel Investor</option>
                  <option value="vc">Venture Capital</option>
                  <option value="fund">Investment Fund</option>
                  <option value="strategic">Strategic Investor</option>
                  <option value="family-office">Family Office</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="interests">Areas of Interest</label>
                <input
                  type="text"
                  id="interests"
                  name="interests"
                  value={investorForm.interests}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="e.g., Creator Economy, SaaS, Media Tech"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Message (Optional)</label>
              <textarea
                id="message"
                name="message"
                value={investorForm.message}
                onChange={handleInputChange}
                className={styles.formTextarea}
                rows={4}
                placeholder="Tell us about your investment thesis, relevant experience, or questions about BlogRolly..."
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={investorForm.password}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                  minLength={8}
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={investorForm.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                  placeholder="Confirm your password"
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
                <label htmlFor="linkedinUrl">LinkedIn URL *</label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={investorForm.linkedinUrl}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                  placeholder="LinkedIn Profile URL (e.g., https://linkedin.com/in/yourname)"
                />
              </div>

            <button 
              type="submit" 
              className={styles.investorSubmitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Investor Account'}
            </button>
          </form>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className={styles.investorForm}>
            <div className={styles.formGroup}>
              <label htmlFor="loginEmail">Email Address</label>
              <input
                type="email"
                id="loginEmail"
                name="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="loginPassword">Password</label>
              <input
                type="password"
                id="loginPassword"
                name="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
                className={styles.formInput}
              />
            </div>

            <button 
              type="submit" 
              className={styles.investorSubmitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Access Investor Dashboard'}
            </button>
          </form>
        )}
      </div>

      <div className={styles.contactSection}>
        <h2>Contact</h2>
        <p>Ready to join the BlogRolly journey?</p>

        <div className={styles.contactItem}>
          <span className={styles.contactIcon}>📧</span>
          <span>Email: <a href="mailto:invest@blogrolly.com">invest@blogrolly.com</a></span>
        </div>

        <div className={styles.contactItem}>
          <span>Follow us:</span>
        </div>

        <div className={styles.contactItem}>
          <span>Twitter/X: <a href="https://x.com/BlogRolly" target="_blank" rel="noopener noreferrer" className={styles.brandHandle}>@BlogRolly</a></span>
        </div>

        <div className={styles.contactItem}>
          <span>Instagram: <a href="https://www.instagram.com/blogrolly/" target="_blank" rel="noopener noreferrer" className={styles.brandHandle}>@blogrolly</a></span>
        </div>

        <div className={styles.contactItem}>
          <span>Facebook: <a href="https://www.facebook.com/blogrolly" target="_blank" rel="noopener noreferrer" className={styles.brandHandle}>@blogrolly</a></span>
        </div>

        <div className={styles.contactItem}>
          <span>TikTok: <a href="https://www.tiktok.com/@blogrolly" target="_blank" rel="noopener noreferrer" className={styles.brandHandle}>@blogrolly</a></span>
        </div>

        <p>Let's reshape how the world discovers thoughtful, independent voices.</p>
      </div>
    </Layout>
  );
};

export default Investors;