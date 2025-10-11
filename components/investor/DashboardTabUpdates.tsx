import React from 'react';
import styles from '../../styles/InvestorDashboard.module.css';

const DashboardTabUpdates = () => (
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
);

export default DashboardTabUpdates;
