import React from 'react';
import styles from '../styles/AuthForm.module.css';

interface SubmissionGuidelinesPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubmissionGuidelinesPopup: React.FC<SubmissionGuidelinesPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent} style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className={styles.popupHeader} style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, borderBottom: '1px solid #e5e7eb' }}>
          <h3>Submission Guidelines</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '2rem', overflow: 'auto', flex: 1 }}>
          <h4 style={{ color: '#10b981', fontWeight: 700, fontSize: '1.25rem', marginTop: 0, marginBottom: '0.5rem' }}>Build a Network Worth Discovering</h4>
          <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: '1.6', fontSize: '1.1rem', marginTop: 0 }}>
            Every post you submit doesn’t just represent your blog, it strengthens the BlogRolly network for everyone. <br />
            By sharing authentic, accessible work, you help create a discovery system that rewards quality and gives every member more visibility, more authority, and more genuine readers.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✅</span> What We Welcome
            </h4>
            <ul style={{ color: '#374151', lineHeight: '1.6', paddingLeft: '1.5rem', margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>Original, complete posts → no teasers, “read more” paywalls, or placeholders</li>
              <li style={{ marginBottom: '0.5rem' }}>Publicly accessible content → no log-ins, subscriptions, or gated sections</li>
              <li style={{ marginBottom: '0.5rem' }}>Hosted on your main blog → authentic and connected to your brand</li>
              <li style={{ marginBottom: '0.5rem' }}>Safe, thoughtful, human-created work → quality over quantity</li>
              <li style={{ marginBottom: '0.5rem' }}>Stable, working URLs → so readers and search engines can always find you</li>
            </ul>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>❌</span> What We Can’t Accept
            </h4>
            <ul style={{ color: '#374151', lineHeight: '1.6', paddingLeft: '1.5rem', margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>Broken or dead links</li>
              <li style={{ marginBottom: '0.5rem' }}>Redirects to social profiles, unrelated sites, or affiliate-only content</li>
              <li style={{ marginBottom: '0.5rem' }}>Posts that require payment or sign-up to read</li>
              <li style={{ marginBottom: '0.5rem' }}>Spammy, scammy, or unsafe material</li>
              <li style={{ marginBottom: '0.5rem' }}>AI-generated filler or low-effort posts</li>
            </ul>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#3b82f6', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📝</span> Quick Tips for Maximum Impact
            </h4>
            <ul style={{ color: '#374151', lineHeight: '1.6', paddingLeft: '1.5rem', margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>Lead with your best work → your submission is often a reader’s first impression of your blog.</li>
              <li style={{ marginBottom: '0.5rem' }}>Optimise your title, description, and image → these appear across the network and help attract the right readers.</li>
              <li style={{ marginBottom: '0.5rem' }}>Keep URLs stable → if you update a link, it’ll be re-reviewed to maintain quality and search authority.</li>
              <li style={{ marginBottom: '0.5rem' }}>Close the loop → adding a link on your blog back to BlogRolly strengthens the network’s SEO — boosting discovery for you and every other member.</li>
            </ul>
          </div>

          <p style={{ color: '#6b7280', marginTop: '2rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
            By following these guidelines, you’re not just submitting a post. You’re helping build a trusted, thriving ecosystem where independent voices rise together.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmissionGuidelinesPopup;
