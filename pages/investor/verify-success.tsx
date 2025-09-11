import Layout from '../../components/Layout';
import styles from '../../styles/Home.module.css';
import ContactSupportPopup from '../../components/ContactSupportPopup';
import { useState } from 'react';

const InvestorVerifySuccess = () => {
  const [showContactSupportPopup, setShowContactSupportPopup] = useState(false);
  return (
    <Layout title="Email Verified - BlogRolly Investors">
      <div className={styles.hero}>
        <div className={styles.successSection}>
          <h1>Thank You for Creating Your Investor Account!</h1>
          <p>Your email has been verified. We're grateful to have you join the BlogRolly investor community.</p>
          <p>Next, our team will review your LinkedIn profile.</p> 
            <p>You'll receive an email notification as soon as your account is approved and you have access to the investor dashboard.</p>
          <div className={styles.buttonGroup} style={{ marginTop: 32 }}>
            <a
              href="mailto:invest@blogrolly.com"
              className={styles.secondaryButton}
            >
        
            Investor Relations
            </a>
          </div>
        </div>
      </div>
      {showContactSupportPopup && (
        <ContactSupportPopup
          isOpen={showContactSupportPopup}
          onClose={() => setShowContactSupportPopup(false)}
        />
      )}
    </Layout>
  );
};

export default InvestorVerifySuccess;
