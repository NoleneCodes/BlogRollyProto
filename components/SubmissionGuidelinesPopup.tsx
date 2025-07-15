
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
      <div className={styles.popupContent} style={{ maxWidth: '800px', maxHeight: '90vh' }}>
        <div className={styles.popupHeader}>
          <h3>Submission Guidelines</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div style={{ padding: '2rem' }}>
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '2rem', 
            lineHeight: '1.6',
            fontSize: '1.1rem'
          }}>
            Before you submit your blog post, make sure it meets these guidelines. This helps keep the Blogroll clean, safe, and worth exploring for readers.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ 
              color: '#10b981', 
              marginBottom: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>✅</span> What We Accept
            </h4>
            <ul style={{ 
              color: '#374151', 
              lineHeight: '1.6',
              paddingLeft: '1.5rem',
              margin: 0
            }}>
              <li style={{ marginBottom: '0.5rem' }}>Original, complete blog posts (no teasers or "read more" paywalls)</li>
              <li style={{ marginBottom: '0.5rem' }}>Posts that are publicly accessible without needing to log in</li>
              <li style={{ marginBottom: '0.5rem' }}>Posts hosted on your main blog domain</li>
              <li style={{ marginBottom: '0.5rem' }}>Content that's safe, thoughtful, and created by a human</li>
              <li style={{ marginBottom: '0.5rem' }}>A working URL that loads properly</li>
            </ul>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ 
              color: '#ef4444', 
              marginBottom: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>❌</span> What We Don't Accept
            </h4>
            <ul style={{ 
              color: '#374151', 
              lineHeight: '1.6',
              paddingLeft: '1.5rem',
              margin: 0
            }}>
              <li style={{ marginBottom: '0.5rem' }}>Broken or dead links</li>
              <li style={{ marginBottom: '0.5rem' }}>Redirects to social media, unrelated third-party pages, or affiliate-only content</li>
              <li style={{ marginBottom: '0.5rem' }}>Posts that require sign-up, subscription, or payment to read</li>
              <li style={{ marginBottom: '0.5rem' }}>Posts flagged as spammy, scammy, or unsafe</li>
              <li style={{ marginBottom: '0.5rem' }}>AI-generated filler or content lacking real effort</li>
            </ul>
          </div>

          <div>
            <h4 style={{ 
              color: '#3b82f6', 
              marginBottom: '1rem',
              fontSize: '1.2rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>📝</span> Quick Tips
            </h4>
            <ul style={{ 
              color: '#374151', 
              lineHeight: '1.6',
              paddingLeft: '1.5rem',
              margin: 0
            }}>
              <li style={{ marginBottom: '0.5rem' }}>Make sure your post is complete and represents your blog well.</li>
              <li style={{ marginBottom: '0.5rem' }}>The title, description, and image you provide will appear in the blogroll. You can edit these later if needed.</li>
              <li style={{ marginBottom: '0.5rem' }}>If you change the URL after submission, your post will need to be re-reviewed.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionGuidelinesPopup;
