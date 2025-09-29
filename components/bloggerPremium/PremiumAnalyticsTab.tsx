import React from 'react';
import styles from '../../styles/BloggerProfilePremium.module.css';

export default function PremiumAnalyticsTab({ blogStats, blogSubmissions, selectedTimeframe, setSelectedTimeframe }: any) {
  if (!blogStats) return null;
  return (
    <div className={styles.content}>
  <h2 className={styles.brandHeading}>Advanced Analytics</h2>
      <div className={styles.premiumStatsGrid}>
        <div className={styles.statCard}>
          <h4>Total Views</h4>
          <span className={styles.statNumber}>{blogStats.totalViews.toLocaleString()}</span>
          <span className={styles.statGrowth}>+{blogStats.monthlyGrowth}% this month</span>
          <span className={styles.statDescription}>Views across all your approved blogs</span>
        </div>
        <div className={styles.statCard}>
          <h4>Total Clicks</h4>
          <span className={styles.statNumber}>{blogStats.totalClicks.toLocaleString()}</span>
          <span className={styles.statGrowth}>+{blogStats.monthlyClicks} this month</span>
          <span className={styles.statDescription}>Clicks to your blog from BlogRolly</span>
        </div>
        <div className={styles.statCard}>
          <h4>Click Rate</h4>
          <span className={styles.statNumber}>{blogStats.clickThroughRate}%</span>
          <span className={styles.statDescription}>Percentage of views that resulted in clicks</span>
        </div>
        <div className={styles.statCard}>
          <h4>Active Blogs</h4>
          <span className={styles.statNumber}>{blogSubmissions.filter((post: any) => post.status === 'approved' && post.isActive).length}</span>
          <span className={styles.statDescription}>Unlimited</span>
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
