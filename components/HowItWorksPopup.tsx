import React from 'react';
import styles from '../styles/AuthForm.module.css';
import profileStyles from '../styles/BloggerProfilePremium.module.css';

interface HowItWorksPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowItWorksPopup: React.FC<HowItWorksPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent} style={{ maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className={styles.popupHeader} style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, borderBottom: '1px solid #e5e7eb' }}>
          <h3>How It Works</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '2rem', overflow: 'auto', flex: 1 }}>
          <div className={profileStyles.workflowSteps}>
            <div className={profileStyles.workflowStep}>
              <div className={profileStyles.stepNumber}>1</div>
              <div className={profileStyles.stepContent}>
                <h4>Submit Your Blog</h4>
                <p>Once you&apos;ve signed up for a Blogger Account, use the submission form to share a URL to a live blog post from your main site. We&apos;re looking for full, original pieces—not link dumps, teasers, or redirects.</p>
              </div>
            </div>

            <div className={profileStyles.workflowStep}>
              <div className={profileStyles.stepNumber}>2</div>
              <div className={profileStyles.stepContent}>
                <h4>Review Process</h4>
                <p>Every submission is reviewed to make sure it meets our content and safety standards. This helps keep the blogroll clean, useful, and trustworthy for readers.</p>
              </div>
            </div>

            <div className={profileStyles.workflowStep}>
              <div className={profileStyles.stepNumber}>3</div>
              <div className={profileStyles.stepContent}>
                <h4>Go Live</h4>
                <p>Once approved, your blog post appears in the BlogRolly feed where readers can discover it. Your post gets exposure to people actively looking for quality content to read.</p>
              </div>
            </div>
          </div>

          <div className={profileStyles.supportSection}>
            <h4>Updates & Support</h4>
            <div className={profileStyles.supportItem}>
              <strong>Edit or Resubmit:</strong>
              <p>You can easily update your blog post&apos;s title, description, or cover image from your Blogger Dashboard—no need for reapproval.</p>
            </div>
            <div className={profileStyles.supportItem}>
              <strong>Changed the URL?</strong>
              <p>If the blog post URL changes, it&apos;ll need to go through the review process again. This helps us make sure the new link is working, safe, and still matches our quality standards.</p>
            </div>
            <div className={profileStyles.supportItem}>
              <strong>Need Help?</strong>
              <p>Got questions or stuck somewhere? Reach out anytime. We&apos;re building this platform with independent bloggers in mind and are happy to help.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPopup;