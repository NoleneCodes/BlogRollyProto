import React from 'react';
import styles from '../../styles/BloggerProfilePremium.module.css';
import { FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaTiktok, FaGithub } from 'react-icons/fa';

interface ProSocialLinksProps {
  socialLinks: {
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    tiktok: string;
    github: string;
  };
  handleSocialLinkChange: (platform: string, value: string) => void;
}

const ProSocialLinks: React.FC<ProSocialLinksProps> = ({ socialLinks, handleSocialLinkChange }) => (
  <div className={styles.formGroup}>
    <label>Social Links</label>
    <small className={styles.hint}>Add your social media and professional links</small>
    <div className={styles.socialLinksGrid}>
      <div className={styles.socialLinkItem}>
        <label className={styles.socialLabel}>
          <span className={styles.socialIcon}><FaTwitter /></span>
          Twitter/X
        </label>
        <input
          type="url"
          value={socialLinks.twitter}
          onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
          placeholder="https://twitter.com/yourusername"
          className={styles.socialInput}
        />
      </div>
      <div className={styles.socialLinkItem}>
        <label className={styles.socialLabel}>
          <span className={styles.socialIcon}><FaLinkedin /></span>
          LinkedIn
        </label>
        <input
          type="url"
          value={socialLinks.linkedin}
          onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
          placeholder="https://linkedin.com/in/yourusername"
          className={styles.socialInput}
        />
      </div>
      <div className={styles.socialLinkItem}>
        <label className={styles.socialLabel}>
          <span className={styles.socialIcon}><FaInstagram /></span>
          Instagram
        </label>
        <input
          type="url"
          value={socialLinks.instagram}
          onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
          placeholder="https://instagram.com/yourusername"
          className={styles.socialInput}
        />
      </div>
      <div className={styles.socialLinkItem}>
        <label className={styles.socialLabel}>
          <span className={styles.socialIcon}><FaYoutube /></span>
          YouTube
        </label>
        <input
          type="url"
          value={socialLinks.youtube}
          onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
          placeholder="https://youtube.com/@yourusername"
          className={styles.socialInput}
        />
      </div>
      <div className={styles.socialLinkItem}>
        <label className={styles.socialLabel}>
          <span className={styles.socialIcon}><FaTiktok /></span>
          TikTok
        </label>
        <input
          type="url"
          value={socialLinks.tiktok}
          onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
          placeholder="https://tiktok.com/@yourusername"
          className={styles.socialInput}
        />
      </div>
      <div className={styles.socialLinkItem}>
        <label className={styles.socialLabel}>
          <span className={styles.socialIcon}><FaGithub /></span>
          GitHub
        </label>
        <input
          type="url"
          value={socialLinks.github}
          onChange={(e) => handleSocialLinkChange('github', e.target.value)}
          placeholder="https://github.com/yourusername"
          className={styles.socialInput}
        />
      </div>
    </div>
  </div>
);

export default ProSocialLinks;
