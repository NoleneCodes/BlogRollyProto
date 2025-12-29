import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/Investors.module.css";
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
        // Store token and investor data in backend/session
        await fetch('/api/investor/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.token, investor: data.investor })
        });
        // Redirect to investor dashboard
        router.push('/investors');
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
    <Layout 
      title="Investors - BlogRolly"
      description="Join the BlogRolly investor community and back the independent web. Invest in the future of creator-owned content and help empower independent voices."
      canonical="https://blogrolly.com/investors"
    >
      <div className={styles.pageWrapper}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Investors</h1>
          <p className={styles.description}>
            Back the independent web. Empower creators.
          </p>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.visionSection}>
            <h2 className={styles.sectionTitle}>Our Vision, Opportunity & Strategy</h2>
            
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>The Next Wave of the Creator Economy</h3>
              <div className={styles.featureGrid}>
                <div className={styles.featureItem}>
                  <h4 className={styles.featureHeading}>Owned</h4>
                  <p className={styles.featureText}>
                    Creators want independence. Instead of building on platforms that can change the rules overnight, they keep full ownership of their sites, content, and audiences.
                  </p>
                </div>
                <div className={styles.featureItem}>
                  <h4 className={styles.featureHeading}>Trusted</h4>
                  <p className={styles.featureText}>
                    Readers are tired of clickbait and shallow content. Depth, quality, and expertise are what attract and retain loyal audiences.
                  </p>
                </div>
                <div className={styles.featureItem}>
                  <h4 className={styles.featureHeading}>Networked</h4>
                  <p className={styles.featureText}>
                    Solo creators struggle to grow alone. Collective visibility and shared SEO momentum unlock scalable, compounding growth.
                  </p>
                </div>
              </div>
              <p className={styles.summaryText}>
                BlogRolly sits at the intersection of these shifts; giving creators ownership; amplifying trusted content; and turning isolated blogs into a network that grows stronger together.
              </p>
            </div>
          </div>

          <div className={styles.opportunitySection}>
            <h2 className={styles.sectionTitle}>Why Now</h2>
            <p className={styles.sectionDescription}>
              The creator economy is booming and set to expand to over $500 billion by 2030 yet independent bloggers are underserved.
            </p>
            
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>30M+</div>
                <p className={styles.statText}>bloggers worldwide run their own sites, many as full/part-time businesses.</p>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statText}>They face rising acquisition costs, SEO battles, and reliance on volatile platforms.</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statText}>The old engines of discovery ie blogrolls, organic linking, curated directories are disappearing.</div>
              </div>
            </div>
            
            <p className={styles.summaryText}>
              BlogRolly revives and modernises these engines, building a self-reinforcing discovery network that scales exponentially.
            </p>
          </div>

          {/* Join Our Investor Community Section */}
          <div className={styles.investorCommunitySection} id="join-investor-community">
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

          <div className={styles.strategySection}>
            <h2 className={styles.sectionTitle}>How We'll Win</h2>
            <div className={styles.strategyGrid}>
              <div className={styles.strategyItem}>
                <h4 className={styles.strategyHeading}>Serve the overlooked</h4>
                <p className={styles.strategyText}>
                  A platform designed specifically for self-hosted and independent bloggers.
                </p>
              </div>
              <div className={styles.strategyItem}>
                <h4 className={styles.strategyHeading}>Rebuild lost infrastructure</h4>
                <p className={styles.strategyText}>
                  Organic linking, curated collections, and visibility that rewards quality.
                </p>
              </div>
              <div className={styles.strategyItem}>
                <h4 className={styles.strategyHeading}>Fuel monetisation</h4>
                <p className={styles.strategyText}>
                  More visibility means more readers. More readers create more opportunities for creators to monetise through ads, sponsorships, products, or services — on their own terms.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.roadmapSection}>
            <h2 className={styles.sectionTitle}>Product Roadmap — Building in Public</h2>
            
            <div className={styles.roadmapPhase}>
              <h3 className={styles.phaseTitle}>MVP Launch — Sept 2025</h3>
              <div className={styles.phaseItems}>
                <div className={styles.phaseItem}>Blogger directory submissions (searchable)</div>
                <div className={styles.phaseItem}>Reader onboarding + interest-based exploration</div>
                <div className={styles.phaseItem}>Early engagement tools (save, follow)</div>
                <div className={styles.phaseItem}>SEO-friendly profiles</div>
              </div>
            </div>

            <div className={styles.roadmapPhase}>
              <h3 className={styles.phaseTitle}>Phase 2 - Oct 2025 –Early 2026</h3>
              <div className={styles.phaseItems}>
                <div className={styles.phaseItem}>Blogger and Investor analytics dashboard</div>
                <div className={styles.phaseItem}>Value-based curated tagging and categories (Blog Collections)</div>
              </div>
            </div>

            <div className={styles.roadmapPhase}>
              <h3 className={styles.phaseTitle}>Vision - Mid 2026 and Beyond</h3>
              <div className={styles.phaseItems}>
                <div className={styles.phaseItem}>Dynamic AI-assisted blog collections answering niche search queries</div>
                <div className={styles.phaseItem}>Monetisation layers for advocates (affiliate programs, partnerships)</div>
                <div className={styles.phaseItem}>Indie press tools (newsletter syndication, blogger events)</div>
              </div>
            </div>
          </div>

          <div className={styles.closingSection}>
            <p className={styles.closingText}>
              BlogRolly isn't just a platform — it's the connective tissue of the independent web.
              <br />
              Invest now, and be part of the growth engine that grows stronger with every new voice.
              <br />
              Together, we can return power to creators.
            </p>

            <div className={styles.ctaButtonContainer}>
              <button
                className={styles.ctaButton}
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
            <h2 className={styles.sectionTitle}>Contact</h2>
            <p className={styles.contactDescription}>Ready to join the BlogRolly journey?</p>
            
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span>Email: <a href="mailto:invest@blogrolly.com">invest@blogrolly.com</a></span>
              </div>
              <div className={styles.contactItem}>
                <span>Follow us:</span>
                <div className={styles.socialLinks}>
                  {/* @ts-ignore-next-line */}
                  {require('../components/SocialIcons').default()}
                </div>
              </div>
            </div>
            
            <p className={styles.contactFooter}>
              Let&apos;s reshape how the world discovers thoughtful, independent voices.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Investors;