import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";
import JoinInvestorCommunity from "../components/JoinInvestorCommunity";

const Investors: NextPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signup' | 'login' | null>(null);
  const [investorForm, setInvestorForm] = useState({
  firstName: '',
  lastName: '',
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
          firstName: '',
          lastName: '',
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
          Back the independent web. Empower creators.
        </p>
      </div>

      <div className={styles.missionSection}>
        <h2>Our Vision, Opportunity & Strategy</h2>
        <p><b>The Next Wave of the Creator Economy:</b></p>
        <ul>
          <li><b>Owned</b> - Creators want independence. Instead of building on platforms that can change the rules overnight, they keep full ownership of their sites, content, and audiences.</li>
          <li><b>Trusted</b> - Readers are tired of clickbait and shallow content. Depth, quality, and expertise are what attract and retain loyal audiences.</li>
          <li><b>Networked</b> - Solo creators struggle to grow alone. Collective visibility and shared SEO momentum unlock scalable, compounding growth.</li>
        </ul>
        <p>BlogRolly sits at the intersection of these shifts; giving creators ownership; amplifying trusted content; and turning isolated blogs into a network that grows stronger together.</p>
        <h2>Why Now</h2>
        <p>The creator economy is booming and set to expand to over $500 billion by 2030 yet independent bloggers are underserved.</p>
        <ul>
          <li>30M+ bloggers worldwide run their own sites, many as full/part-time businesses.</li>
          <li>They face rising acquisition costs, SEO battles, and reliance on volatile platforms.</li>
          <li>The old engines of discovery ie blogrolls, organic linking, curated directories are disappearing.</li>
        </ul>


        <p>BlogRolly revives and modernises these engines, building a self-reinforcing discovery network that scales exponentially.</p>

        {/* Join Our Investor Community Section - now a component */}
        <div id="join-investor-community">
          <JoinInvestorCommunity
            activeTab={activeTab}
            setActiveTab={(tab) => setActiveTab(prev => prev === tab ? null : tab)}
            submitStatus={submitStatus}
            submitMessage={submitMessage}
            handleSignupSubmit={handleSignupSubmit}
            handleLoginSubmit={handleLoginSubmit}
            investorForm={investorForm}
            handleInputChange={handleInputChange}
            isSubmitting={isSubmitting}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            styles={styles}
          />
        </div>

        <h2>How We’ll Win</h2>
        <ul>
          <li>Serve the overlooked — A platform designed specifically for self-hosted and independent bloggers.</li>
          <li>Rebuild lost infrastructure — Organic linking, curated collections, and visibility that rewards quality.</li>
          <li>Fuel monetisation — More visibility means more readers. More readers create more opportunities for creators to monetise through ads, sponsorships, products, or services — on their own terms.</li>
        </ul>
        <h2>Product Roadmap — Building in Public</h2>
        <b>MVP Launch — Sept 2025</b>
        <ul>
          <li>Blogger directory submissions (searchable)</li>
          <li>Reader onboarding + interest-based exploration</li>
          <li>Early engagement tools (save, follow)</li>
          <li>SEO-friendly profiles</li>
        </ul>
        <b>Phase 2 - Oct 2025 –Early 2026</b>
        <ul>
          <li>Blogger and Investor analytics dashboard</li>
          <li>Value-based curated tagging and categories (Blog Collections)</li>
        </ul>
        <b>Vision - Mid 2026 and Beyond</b>
        <ul>
          <li>Dynamic AI-assisted blog collections answering niche search queries</li>
          <li>Monetisation layers for advocates (affiliate programs, partnerships)</li>
          <li>Indie press tools (newsletter syndication, blogger events)</li>
        </ul>
        <p>BlogRolly isn’t just a platform — it’s the connective tissue of the independent web.<br />
        Invest now, and be part of the growth engine that grows stronger with every new voice.<br />
        Together, we can return power to creators.</p>

        {/* CTA Button to Join Investor Community */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2.5rem 0' }}>
          <button
            className={styles.investorSubmitButton}
            style={{ fontSize: '1.15rem', padding: '1.1rem 2.5rem' }}
            onClick={() => {
              const el = document.getElementById('join-investor-community');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          >
            Join Our Investor Community
          </button>
        </div>
      </div>



      <div className={styles.contactSection}>
        <h2>Contact</h2>
        <p style={{ textAlign: 'center' }}>Ready to join the BlogRolly journey?</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
          <div className={styles.contactItem} style={{ textAlign: 'center' }}>
            <span>Email: <a href="mailto:invest@blogrolly.com">invest@blogrolly.com</a></span>
          </div>
          <div className={styles.contactItem} style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <span>Follow us:</span>
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              {/* @ts-ignore-next-line */}
              {require('../components/SocialIcons').default()}
            </div>
          </div>
        </div>
        <p>Let&apos;s reshape how the world discovers thoughtful, independent voices.</p>
      </div>
    </Layout>
  );
};

export default Investors;