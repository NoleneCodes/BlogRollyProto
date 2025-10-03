
import React from 'react';
import styles from '../../styles/BloggerProfile.module.css';

export default function BloggerStatsTab({ blogStats, blogSubmissions }: any) {
  if (!blogStats) return null;
  return (
    <div className={styles.content}>
      <h2>Analytics & Stats</h2>
      <div className={styles.statsOverview}>
        <div className={styles.statCard}>
          <h4>Total Blog Views</h4>
          <span className={styles.statNumber}>{blogStats.totalViews.toLocaleString()}</span>
          <p className={styles.statDescription}>Views across all your approved blogs</p>
        </div>
        <div className={styles.statCard}>
          <h4>Total Clicks</h4>
          <span className={styles.statNumber}>{blogStats.totalClicks}</span>
          <p className={styles.statDescription}>Clicks to your blog from BlogRolly</p>
        </div>
        <div className={styles.statCard}>
          <h4>Click-through Rate</h4>
          <span className={styles.statNumber}>{blogStats.clickThroughRate}%</span>
          <p className={styles.statDescription}>Percentage of views that resulted in clicks</p>
        </div>
      </div>
      <div className={styles.performanceSection}>
        <h3>Blog Performance</h3>
        <div className={styles.performanceList}>
          {blogSubmissions
            .filter((sub: any) => sub.status === 'approved')
            .map((submission: any) => (
              <div key={submission.id} className={styles.performanceItem}>
                <div className={styles.performanceDetails}>
                  <h4>{submission.title}</h4>
                  <p>{submission.category}</p>
                </div>
                <div className={styles.performanceMetrics}>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>{submission.views}</span>
                    <span className={styles.metricLabel}>Views</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>{submission.clicks}</span>
                    <span className={styles.metricLabel}>Clicks</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>
                      {submission.views ? ((submission.clicks / submission.views) * 100).toFixed(1) : 0}%
                    </span>
                    <span className={styles.metricLabel}>CTR</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
