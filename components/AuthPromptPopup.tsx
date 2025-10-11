import React from 'react';
import Link from 'next/link';
import styles from '../styles/AuthPromptPopup.module.css';

interface AuthPromptPopupProps {
  onClose: () => void;
}

const AuthPromptPopup: React.FC<AuthPromptPopupProps> = ({ onClose }) => (
  <div className={styles.popupOverlay}>
    <div className={styles.popupContent}>
      <h3>Please sign in or create an account to save blogs</h3>
      <p>Saving blogs is available to registered readers. Sign in or create an account to use this feature.</p>
      <div className={styles.popupActions}>
        <Link href="/auth?tab=reader" passHref legacyBehavior>
          <a className={styles.authButton}>Sign In</a>
        </Link>
        <Link href="/auth?tab=reader&mode=signup" passHref legacyBehavior>
          <a className={styles.authButton}>Create Account</a>
        </Link>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

export default AuthPromptPopup;
