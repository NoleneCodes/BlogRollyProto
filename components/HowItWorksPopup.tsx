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
          <h4 style={{ color: '#c42142', fontWeight: 700, fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem' }}>Your blog powers the network. The network powers your blog.</h4>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '1.1rem' }}>
            BlogRolly is a living blogroll - every post you submit strengthens the network’s reach, and every new connection in the network drives more discovery for you. Here’s how your part in the cycle unfolds:
          </p>
          <ol style={{ color: '#374151', lineHeight: '1.7', fontSize: '1.08rem', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            <li style={{ marginBottom: '1.2rem' }}>
              <strong>Submit Your Blog</strong><br />
              Sign up for a Blogger Account and share a full, original blog post from your site. No teasers, redirects, or filler - just your best work, live and accessible.
            </li>
            <li style={{ marginBottom: '1.2rem' }}>
              <strong>Quality Review</strong><br />
              A real human checks your post to ensure it’s safe, relevant, and reader-worthy. This keeps the network clean and credible, protecting your reputation as well as everyone else’s.
            </li>
            <li style={{ marginBottom: '1.2rem' }}>
              <strong>Go Live</strong><br />
              Once approved, your post joins the BlogRolly feed and directory, making your work instantly discoverable by readers actively looking for quality blogs. As they engage, you gain traffic, visibility, and authority.
            </li>
            <li style={{ marginBottom: '1.2rem' }}>
              <strong>Link Back for Maximum Impact</strong><br />
              Adding a link from your blog to your BlogRolly profile or category page strengthens the network’s SEO authority. The stronger the network, the higher your own blog ranks in search, it’s a win-win.
            </li>
            <li style={{ marginBottom: '1.2rem' }}>
              <strong>The Flywheel Effect</strong><br />
              Together, these actions fuel a growth loop that multiplies value for everyone:
              <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem', color: '#6b7280', fontSize: '1rem' }}>
                <li>Each new blog adds depth and attracts more readers</li>
                <li>Backlinks strengthen the network’s authority in search</li>
                <li>More visibility brings more readers</li>
                <li>More readers attract more bloggers</li>
                <li>And the cycle compounds - lifting every member higher</li>
              </ul>
              By submitting your post, linking back, and staying active, you help spin the flywheel - and the momentum flows back to your blog.
            </li>
          </ol>
          <h4 style={{ color: '#c42142', fontWeight: 600, fontSize: '1.15rem', marginBottom: '1rem' }}>Updates & Support</h4>
          <ul style={{ color: '#374151', lineHeight: '1.6', fontSize: '1.05rem', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            <li style={{ marginBottom: '0.7rem' }}><strong>Edit or Resubmit</strong> → Update your post’s title, description, or image anytime from your dashboard.</li>
            <li style={{ marginBottom: '0.7rem' }}><strong>Changed URL?</strong> → If your link changes, it’ll be re-reviewed to keep the network strong.</li>
            <li style={{ marginBottom: '0.7rem' }}><strong>Need Help?</strong> → We’re building BlogRolly for independent bloggers like you - reach out anytime and we’ll support your growth.</li>
          </ul>
          <p style={{ color: '#c42142', fontWeight: 600, fontSize: '1.08rem', marginTop: '1.5rem' }}>
            Join the network that grows stronger with every blog. Submit your post today.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPopup;