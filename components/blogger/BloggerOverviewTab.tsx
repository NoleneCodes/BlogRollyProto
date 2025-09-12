
import React from 'react';
import styles from '../../styles/BloggerProfile.module.css';

export default function BloggerOverviewTab({ userInfo, blogStats, blogSubmissions }: any) {
  if (!userInfo) return null;
  return (
    <div className={styles.content}>
  <h2 style={{ color: '#c42142' }}>Profile Overview</h2>
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
          <p className={styles.blogName}>{userInfo.blogName}</p>
          <p className={styles.bio}>{userInfo.bio}</p>
        </div>
      </div>
      {blogStats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h4>Total Views</h4>
            <span className={styles.statNumber}>{blogStats.totalViews.toLocaleString()}</span>
          </div>
          <div className={styles.statCard}>
            <h4>Total Clicks</h4>
            <span className={styles.statNumber}>{blogStats.totalClicks}</span>
          </div>
          <div className={styles.statCard}>
            <h4>Click Rate</h4>
            <span className={styles.statNumber}>{blogStats.clickThroughRate}%</span>
          </div>
          <div className={styles.statCard}>
            <h4>Active Blogs</h4>
            <span className={styles.statNumber}>{blogSubmissions.filter((post: any) => post.status === 'approved' && post.isActive).length}/3</span>
          </div>
        </div>
      )}
    </div>
  );
}
