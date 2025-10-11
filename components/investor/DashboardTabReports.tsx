import React from 'react';
import styles from '../../styles/InvestorDashboard.module.css';

const DashboardTabReports = () => (
  <div className={styles.dashboardCard}>
    <h2>Quarterly Reports</h2>
    <p>Track our progress with detailed quarterly metrics and growth updates.</p>
    <div className={styles.reportsList}>
      <div className={styles.reportItem}>
        <span>Q1 2025 Report</span>
        <span className={styles.comingSoonSmall}>Coming Soon</span>
      </div>
    </div>
  </div>
);

export default DashboardTabReports;
