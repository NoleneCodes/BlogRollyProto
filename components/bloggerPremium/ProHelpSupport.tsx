import React from 'react';
import styles from '../../styles/BloggerProfilePremium.module.css';

interface ProHelpSupportProps {
  setShowBugReportPopup: (show: boolean) => void;
  setShowSubmissionGuidelinesPopup: (show: boolean) => void;
  setShowHowItWorksPopup: (show: boolean) => void;
  setShowContactSupportPopup: (show: boolean) => void;
}

const ProHelpSupport: React.FC<ProHelpSupportProps> = ({
  setShowBugReportPopup,
  setShowSubmissionGuidelinesPopup,
  setShowHowItWorksPopup,
  setShowContactSupportPopup
}) => (
  <div className={styles.content}>
    <h2 style={{ color: '#c42142' }}>Help & Support</h2>
    <div className={styles.helpSection}>
      <div className={styles.helpItem}>
        <h3>Report a Bug</h3>
        <p>Help us improve BlogRolly by reporting any bugs or issues you encounter</p>
        <button 
          className={styles.helpButton}
          onClick={() => setShowBugReportPopup(true)}
        >
          Report a Bug
        </button>
      </div>
      <div className={styles.helpItem}>
        <h3>Submission Guidelines</h3>
        <p>Learn about our content guidelines and best practices for blog submissions</p>
        <button 
          className={styles.helpButton}
          onClick={() => setShowSubmissionGuidelinesPopup(true)}
        >
          View Guidelines
        </button>
      </div>
      <div className={styles.helpItem}>
        <h3>How It Works</h3>
        <p>Learn about our submission and review process for getting your blog featured</p>
        <button 
          className={styles.helpButton}
          onClick={() => setShowHowItWorksPopup(true)}
        >
          Learn How It Works
        </button>
      </div>
      <div className={styles.helpItem}>
        <h3>Contact Support</h3>
        <p>Get help from our support team</p>
        <button 
          className={styles.helpButton}
          onClick={() => setShowContactSupportPopup(true)}
        >
          Contact Us
        </button>
      </div>
    </div>
  </div>
);

export default ProHelpSupport;
