import React from 'react';
import styles from '../../styles/InvestorDashboard.module.css';

const DashboardTabSchedule = () => (
  <div className={styles.dashboardCard}>
    <h2>📅 Schedule a Call</h2>
    <p>Book a 15-minute call with our founder to discuss vision, strategy, or potential partnership.</p>
    <div className={styles.calendlySection}>
      <p>Let&apos;s talk vision, strategy, or potential partnership.</p>
      <button className={styles.actionButton}>Schedule Call with Nolene</button>
    </div>
  </div>
);

export default DashboardTabSchedule;
