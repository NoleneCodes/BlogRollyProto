import React from 'react';
import styles from '../../styles/BloggerProfile.module.css';

interface BillingSubscriptionProps {
  setShowStripePricingModal: (show: boolean) => void;
}



const BillingSubscription: React.FC<BillingSubscriptionProps> = ({ setShowStripePricingModal }) => (
  <div className={styles.content}>
    <h2 style={{ color: '#c42142' }}>Billing & Subscription</h2>
  {/* <BillingPromoBanner code="EarlyAdopter" /> */}
    <p style={{ margin: '1rem 0', color: '#374151', fontSize: '1.08rem' }}>
      Choose the plan that supports your blogging journey
    </p>
    <div className={styles.billingSection}>
      <div className={styles.currentPlan}>
        <h3>Free Tier</h3>
        <p>Perfect if you’re just getting started.</p>
        <div className={styles.planFeatures}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
            <li>List up to 3 Live blogs</li>
            <li>Basic analytics to track your reach</li>
            <li>Access to community support</li>
          </ul>
        </div>
      </div>
      <div className={styles.upgradeSection}>
        <h3>Pro</h3>
        <p>For bloggers ready to grow faster and go further.</p>
        <div className={styles.proFeatures}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
            <li><span className={styles.brandFeature}>Unlimited listings</span> - share every post you publish</li>
            <li><span className={styles.brandFeature}>Followable profile with social links</span> - let readers connect with you directly</li>
            <li><span className={styles.brandFeature}>Advanced insights</span> - see what resonates and discover new opportunities</li>
            <li><span className={styles.brandFeature}>Priority reviews & support</span> - faster approvals, real help when you need it</li>
            <li><span className={styles.brandFeature}>Blogger Events</span> (coming soon)</li>
          </ul>
        </div>
        <p style={{ margin: '1rem 0 0.5rem 0', color: '#374151', fontSize: '1.02rem' }}>
          The more you share, the stronger the network becomes and the easier it is for new readers to find you.
        </p>
        <button 
          className={styles.upgradeButton}
          onClick={() => setShowStripePricingModal(true)}
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  </div>
);

export default BillingSubscription;
