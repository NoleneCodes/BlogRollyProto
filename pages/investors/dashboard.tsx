import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/InvestorDashboard.module.css';

import DashboardTabFounder from '../../components/investor/DashboardTabFounder';
import DashboardTabPitch from '../../components/investor/DashboardTabPitch';
import DashboardTabReports from '../../components/investor/DashboardTabReports';
import DashboardTabStatistics from '../../components/investor/DashboardTabStatistics';
import DashboardTabInvestment from '../../components/investor/DashboardTabInvestment';
import DashboardTabCommunication from '../../components/investor/DashboardTabCommunication';
import DashboardTabDownloadables from '../../components/investor/DashboardTabDownloadables';

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
  const [activeTab, setActiveTab] = useState<string>('founder');

  useEffect(() => {
    // BYPASS AUTH: Always show dashboard for design purposes
    setInvestor({
      id: 'demo',
      email: 'demo@blogrolly.com',
      name: 'Demo User',
      company: 'Demo Company',
      investorType: 'Angel'
    });
    setIsLoading(false);
  }, []);

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

  // Tab definitions
  const tabs = [
  { key: 'pitch', label: 'Pitch Deck' },
  { key: 'downloadables', label: 'Downloadables' },
  { key: 'reports', label: 'Quarterly Reports' },
  { key: 'statistics', label: 'Statistics' },
  { key: 'investment', label: 'Investment Opportunities' },
  { key: 'communication', label: 'Direct Communication' },
  { key: 'founder', label: 'Meet the Founder' }
  ];

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

        <div className={styles.dashboardMain}>
          <nav className={styles.sidebar}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={activeTab === tab.key ? styles.activeTab : styles.tabButton}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className={styles.tabContent}>
            {activeTab === 'founder' && <DashboardTabFounder />}
            {activeTab === 'pitch' && <DashboardTabPitch />}
            {activeTab === 'reports' && <DashboardTabReports />}
            {activeTab === 'statistics' && <DashboardTabStatistics />}
            {activeTab === 'investment' && <DashboardTabInvestment />}
            {activeTab === 'communication' && <DashboardTabCommunication />}
            {activeTab === 'downloadables' && <DashboardTabDownloadables />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvestorDashboard;
