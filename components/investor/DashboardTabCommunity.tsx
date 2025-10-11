import React from 'react';
import styles from '../../styles/InvestorDashboard.module.css';

const DashboardTabCommunity = () => (
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
);

export default DashboardTabCommunity;
