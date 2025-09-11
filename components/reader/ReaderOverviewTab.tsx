import React from 'react';
import styles from '../../styles/ReaderProfile.module.css';

export default function ReaderOverviewTab({ userInfo, savedBlogs, followedBloggers, readingHistory }: any) {
  if (!userInfo) return null;
  return (
    <div className={styles.content}>
      <h2>Profile Overview</h2>
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          {userInfo.avatar ? (
            <img src={userInfo.avatar} alt="Profile" />
          ) : (
            <div className={styles.initials}>
              {userInfo.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || userInfo.name}
            </div>
          )}
        </div>
        <div className={styles.profileInfo}>
          <h3>{userInfo.displayName || userInfo.name}</h3>
          <p className={styles.bio}>{userInfo.bio}</p>
        </div>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h4>Saved Blogs</h4>
          <span className={styles.statNumber}>{savedBlogs.length}</span>
        </div>
        <div className={styles.statCard}>
          <h4>Following</h4>
          <span className={styles.statNumber}>{followedBloggers.length}</span>
        </div>
        <div className={styles.statCard}>
          <h4>Blogs Read</h4>
          <span className={styles.statNumber}>{readingHistory.length}</span>
        </div>
        <div className={styles.statCard}>
          <h4>Topics Following</h4>
          <span className={styles.statNumber}>{userInfo.topics.length}</span>
        </div>
      </div>
    </div>
  );
}
