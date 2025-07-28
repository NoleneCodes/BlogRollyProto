
import React from 'react';
import styles from '../styles/AuthForm.module.css';

interface HowItWorksPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowItWorksPopup: React.FC<HowItWorksPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
        <div className={styles.formHeader}>
          <h3>How It Works</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={styles.howItWorksContent}>
          <div className={styles.workflowSteps}>
            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Submit Your Blog</h4>
                <p>Once you've signed up for a Blogger Account, use the submission form to share a URL to a live blog post from your main site. We're looking for full, original pieces—not link dumps, teasers, or redirects.</p>
              </div>
            </div>

            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Review Process</h4>
                <p>Every submission is reviewed to make sure it meets our content and safety standards. This helps keep the blogroll clean, useful, and trustworthy for readers.</p>
              </div>
            </div>

            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>If Approved</h4>
                <p>Your blog post will be added to the Blogroll, making it easy for new readers to discover your work and click through to your site. We don't republish your content—we simply help readers find it.</p>
              </div>
            </div>

            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>If Rejected</h4>
                <p>You'll receive a short reason for the rejection and can resubmit after making changes. Most rejections are quick fixes like broken links or teaser-only content.</p>
              </div>
            </div>
          </div>

          <div className={styles.reviewSection}>
            <h4>🔍 Review & Approval – What We Check For</h4>
            <p>We're all about making blog discovery simple, safe, and worth people's time. Before a blog goes live, we check that:</p>
            <ul className={styles.checkList}>
              <li>The link loads properly and goes to a working blog post</li>
              <li>The post is a complete piece—not a teaser, summary, or gated content</li>
              <li>The blog post lives on your main blog domain (not a subdomain or unrelated redirect)</li>
              <li>The content is free from spam, scams, or harmful material</li>
              <li>It shows original thought and genuine effort</li>
            </ul>
          </div>

          <div className={styles.rejectionSection}>
            <h4>🚫 What We Don't List</h4>
            <ul className={styles.rejectionList}>
              <li>Broken or dead links</li>
              <li>Redirects to social media, unrelated third-party sites, or paywalls</li>
              <li>Teasers that require "Subscribe to read more"</li>
              <li>Anything flagged as spammy, misleading, or unsafe</li>
            </ul>
          </div>

          <div className={styles.supportSection}>
            <h4>Updates & Support</h4>
            <div className={styles.supportItem}>
              <strong>Edit or Resubmit:</strong>
              <p>You can easily update your blog post's title, description, or cover image from your Blogger Dashboard—no need for reapproval.</p>
            </div>
            <div className={styles.supportItem}>
              <strong>Changed the URL?</strong>
              <p>If the blog post URL changes, it'll need to go through the review process again. This helps us make sure the new link is working, safe, and still matches our quality standards.</p>
            </div>
            <div className={styles.supportItem}>
              <strong>Need Help?</strong>
              <p>Got questions or stuck somewhere? Reach out anytime. We're building this platform with independent bloggers in mind and are happy to help.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPopup;
