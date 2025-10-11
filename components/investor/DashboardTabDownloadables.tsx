import React from 'react';
import styles from '../../styles/InvestorDashboard.module.css';

const DashboardTabDownloadables = () => (
  <div className={styles.dashboardCard}>
    <h2>Downloadables</h2>
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
);

export default DashboardTabDownloadables;
