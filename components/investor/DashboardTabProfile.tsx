import React from 'react';
import styles from '../../styles/InvestorDashboard.module.css';

interface InvestorProfileProps {
  investorType: string;
  company?: string;
}

const DashboardTabProfile: React.FC<InvestorProfileProps> = ({ investorType, company }) => (
  <div className={styles.dashboardCard}>
    <h2>📋 Your Investment Profile</h2>
    <div className={styles.profileGrid}>
      <div className={styles.profileItem}>
        <span className={styles.profileLabel}>Investor Type:</span>
        <span className={styles.profileValue}>{investorType}</span>
      </div>
      {company && (
        <div className={styles.profileItem}>
          <span className={styles.profileLabel}>Company:</span>
          <span className={styles.profileValue}>{company}</span>
        </div>
      )}
      <div className={styles.profileItem}>
        <span className={styles.profileLabel}>Member Since:</span>
        <span className={styles.profileValue}>January 2025</span>
      </div>
    </div>
  </div>
);

export default DashboardTabProfile;
