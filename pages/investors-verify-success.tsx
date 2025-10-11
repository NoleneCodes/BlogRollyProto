import React from 'react';
import Layout from '../components/Layout';
import styles from '../styles/InvestorDashboard.module.css';
import { useRouter } from 'next/router';

const InvestorsVerifySuccess: React.FC = () => {
  const router = useRouter();

  return (
    <Layout title="Investor Verification Success">
      <div className={styles.dashboardContainer}>
        <div className={styles.successBox}>
          <h1>Verification Successful!</h1>
          <p>Your investor account has been verified.</p>
          <button className={styles.dashboardButton} onClick={() => router.push('/investors')}>
            Go to Investors Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default InvestorsVerifySuccess;
