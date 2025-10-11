import React from 'react';
import styles from '../../styles/InvestorDashboard.module.css';

const DashboardTabCommunication = () => (
  <div className={styles.dashboardCard}>
    <h2>Direct Communication</h2>
    <p>Connect directly with our founder and team.</p>
    <div className={styles.communicationOptions}>
  <button className={styles.actionButton} onClick={() => window.open('https://calendly.com/hello-blogrolly/30min', '_blank')}>Schedule Call</button>
  <a className={styles.secondaryButton} href="mailto:invest@blogrolly.com">Send Email</a>
    </div>
  </div>
);

export default DashboardTabCommunication;
