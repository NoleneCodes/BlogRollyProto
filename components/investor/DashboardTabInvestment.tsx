import React from 'react';
import styles from '../../styles/InvestorDashboard.module.css';

const DashboardTabInvestment = () => (
  <div className={styles.dashboardCard}>
    <h2>Investment Opportunities</h2>
    <p>Current funding rounds and investment options.</p>
    <div className={styles.investmentStatus}>
      <div className={styles.statusItem}>
        <span className={styles.statusLabel}>Current Round:</span>
        <span className={styles.statusValue}>Not Currently Raising</span>
      </div>
      <div className={styles.statusItem}>
        <span className={styles.statusLabel}>Target:</span>
        <span className={styles.statusValue}>N/A</span>
      </div>
      <div className={styles.statusItem}>
        <span className={styles.statusLabel}>Minimum Investment:</span>
        <span className={styles.statusValue}>N/A</span>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <a className={styles.actionButton} href="mailto:invest@blogrolly.com">Express Investment Interest</a>
    </div>
  </div>
);

export default DashboardTabInvestment;
