import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/InvestorDashboard.module.css';

interface InvestorData {
  id: string;
  email: string;
  name: string;
  company?: string;
  investorType: string;
}

const InvestorDashboard = () => {
  const router = useRouter();
  const [investor, setInvestor] = useState<InvestorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    // Replace localStorage with backend/session logic
    fetch('/api/investor/session')
      .then(res => res.json())
      .then(({ token, investor }) => {
        if (!token || !investor) {
          router.push('/investors');
          return;
        }
        setInvestor(investor);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching investor session:', error);
        router.push('/investors');
      });
  }, [router]);

  const handleLogout = async () => {
    // Replace localStorage removal with backend/session logout
    await fetch('/api/investor/session', { method: 'DELETE' });
    router.push('/investors');
  };

  if (isLoading) {
    return (
      <Layout title="Investor Dashboard - BlogRolly">
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading your investor dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (!investor) {
    return null;
  }

  return (
    <Layout title="Investor Dashboard - BlogRolly">
      <div className={styles.dashboardContainer}>
        <header className={styles.dashboardHeader}>
          <div className={styles.headerContent}>
            <div>
              <h1>Welcome back, {investor.name}</h1>
              <p>Investor Dashboard</p>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Sign Out
            </button>
          </div>
        </header>

        <div className={styles.dashboardGrid}>
          {/* Founder Bio Section */}
          <div className={styles.dashboardCard}>
            <h2>👤 Meet the Founder</h2>
            <div className={styles.founderBio}>
              <h3>Nolene – Why Me, Why Now</h3>
              <p>Hi, I&apos;m Nolene, the founder of BlogRolly.</p>
              <p>As a researcher, and solo builder, I&apos;ve lived the silence that fell over the open web. I&apos;ve seen incredible creators publish great content&apos;only for it to disappear into the void.</p>
              <p>I started BlogRolly because I believe in digital sovereignty and the power of long-form thought. I want to make the web feel interconnected again not just performative and feed-based.</p>
              <p>With a background in [briefly list highlights, e.g. regulatory systems, content strategy, tech upskilling], I&apos;ve bootstrapped the MVP with no outside funding and designed a product informed by both cultural insight and user empathy.</p>
              <p><strong>I&apos;m building BlogRolly not to go viral but to last.</strong></p>
            </div>
          </div>

          {/* Interactive Pitch Deck Section */}
          <div className={styles.dashboardCard}>
            <h2>📈 Interactive Pitch Deck</h2>
            <p>Access our comprehensive pitch deck, financial projections, and market analysis.</p>
            <div className={styles.pitchDeckCarousel}>
              <div className={styles.carouselPlaceholder}>
                <p>Pitch deck slides coming soon...</p>
                <p>Stay tuned for our interactive presentation covering market opportunity, business model, and growth strategy.</p>
              </div>
            </div>
          </div>

          {/* Monthly Reports */}
          <div className={styles.dashboardCard}>
            <h2>📊 Monthly Reports</h2>
            <p>Track our progress with detailed monthly metrics and growth updates.</p>
            <div className={styles.reportsList}>
              <div className={styles.reportItem}>
                <span>Q1 2025 Report</span>
                <span className={styles.comingSoonSmall}>Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Product Updates */}
          <div className={styles.dashboardCard}>
            <h2>🚀 Product Updates</h2>
            <p>Early access to new features and roadmap updates.</p>
            <div className={styles.updatesList}>
              <div className={styles.updateItem}>
                <div className={styles.updateDate}>Jan 2025</div>
                <div className={styles.updateContent}>
                  <h4>MVP Development Progress</h4>
                  <p>Core directory and search functionality implemented. Beta testing begins Q2 2025.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Opportunities */}
          <div className={styles.dashboardCard}>
            <h2>💰 Investment Opportunities</h2>
            <p>Current funding rounds and investment options.</p>
            <div className={styles.investmentStatus}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Current Round:</span>
                <span className={styles.statusValue}>Pre-Seed</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Target:</span>
                <span className={styles.statusValue}>$250K</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Minimum Investment:</span>
                <span className={styles.statusValue}>$10K</span>
              </div>
            </div>
            <button className={styles.actionButton}>Express Investment Interest</button>
          </div>

          {/* Communication Hub */}
          <div className={styles.dashboardCard}>
            <h2>💬 Direct Communication</h2>
            <p>Connect directly with our founder and team.</p>
            <div className={styles.communicationOptions}>
              <button className={styles.actionButton}>Schedule Call</button>
              <button className={styles.secondaryButton}>Send Message</button>
            </div>
          </div>

          {/* Community */}
          <div className={styles.dashboardCard}>
            <h2>👥 Investor Community</h2>
            <p>Connect with fellow BlogRolly investors and advisors.</p>
            <div className={styles.communityStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>12</span>
                <span className={styles.statLabel}>Active Investors</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>3</span>
                <span className={styles.statLabel}>Advisory Board</span>
              </div>
            </div>
            <button className={styles.secondaryButton}>Join Community Forum</button>
          </div>

          {/* Downloadables Section */}
          <div className={styles.dashboardCard}>
            <h2>📄 Downloadables</h2>
            <p>Access key documents and reports about BlogRolly.</p>
            <div className={styles.downloadsList}>
              <div className={styles.downloadItem}>
                <div className={styles.downloadInfo}>
                  <h4>One-Pager PDF</h4>
                  <p>A quick overview of BlogRolly&apos;s mission, product, and market thesis</p>
                </div>
                <div className={styles.downloadCta}>
                  <span className={styles.comingSoonSmall}>Coming Soon</span>
                </div>
              </div>
              <div className={styles.downloadItem}>
                <div className={styles.downloadInfo}>
                  <h4>Market Deep Dive PDF</h4>
                    <p>A short report on the rising creator economy, SEO/content tool gaps, and &quot;indie web&quot; resurgence</p>
                </div>
                <div className={styles.downloadCta}>
                  <span className={styles.comingSoonSmall}>Coming Soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Call Section */}
          <div className={styles.dashboardCard}>
            <h2>📅 Schedule a Call</h2>
            <p>Book a 15-minute call with our founder to discuss vision, strategy, or potential partnership.</p>
            <div className={styles.calendlySection}>
              <p>Let&apos;s talk vision, strategy, or potential partnership.</p>
              <button className={styles.actionButton}>Schedule Call with Nolene</button>
            </div>
          </div>
        </div>

        <div className={styles.quickStats}>
          <h2>📋 Your Investment Profile</h2>
          <div className={styles.profileGrid}>
            <div className={styles.profileItem}>
              <span className={styles.profileLabel}>Investor Type:</span>
              <span className={styles.profileValue}>{investor.investorType}</span>
            </div>
            {investor.company && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>Company:</span>
                <span className={styles.profileValue}>{investor.company}</span>
              </div>
            )}
            <div className={styles.profileItem}>
              <span className={styles.profileLabel}>Member Since:</span>
              <span className={styles.profileValue}>January 2025</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvestorDashboard;
