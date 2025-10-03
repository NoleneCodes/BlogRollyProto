import React from 'react';
import styles from '../../styles/BloggerProfilePremium.module.css';

export default function PremiumAnalyticsTab({ blogStats, blogSubmissions, selectedTimeframe, setSelectedTimeframe, viewsToggle, setViewsToggle, clicksToggle, setClicksToggle }: any) {
  if (!blogStats) return null;
  return (
    <div className={styles.content}>
      <h2 className={styles.brandHeading}>Advanced Analytics</h2>
      <div className={styles.premiumStatsGrid}>
        <div className={styles.statCard} onClick={() => setViewsToggle(viewsToggle === 'total' ? 'monthly' : 'total')}>
          <div className={styles.statCardHeader}>
            <h4>{viewsToggle === 'total' ? 'Total Views' : 'Views This Month'}</h4>
            <button className={styles.toggleButton}>
              {viewsToggle === 'total' ? 'Monthly' : 'Total'}
            </button>
          </div>
          <span className={styles.statNumber}>
            {viewsToggle === 'total'
              ? blogStats.totalViews.toLocaleString()
              : blogStats.monthlyViews.toLocaleString()
            }
          </span>
          <span className={styles.statGrowth}>
            {viewsToggle === 'total'
              ? `+${blogStats.monthlyGrowth}% this month`
              : 'Current month performance'}
          </span>
          <span className={styles.statDescription}>Views across all your approved blogs</span>
        </div>
        <div className={styles.statCard} onClick={() => setClicksToggle(clicksToggle === 'total' ? 'monthly' : 'total')}>
          <div className={styles.statCardHeader}>
            <h4>{clicksToggle === 'total' ? 'Total Clicks' : 'Clicks This Month'}</h4>
            <button className={styles.toggleButton}>
              {clicksToggle === 'total' ? 'Monthly' : 'Total'}
            </button>
          </div>
          <span className={styles.statNumber}>
            {clicksToggle === 'total'
              ? blogStats.totalClicks.toLocaleString()
              : blogStats.monthlyClicks.toLocaleString()
            }
          </span>
          <span className={styles.statGrowth}>
            {clicksToggle === 'total'
              ? `+${blogStats.monthlyClicks} this month`
              : 'Current month performance'}
          </span>
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
                    <span className={styles.metricValue}>
                      {viewsToggle === 'total' ? (submission.views || 0) : (submission.monthlyViews || 0)}
                    </span>
                    <span className={styles.metricLabel}>{viewsToggle === 'total' ? 'Views' : 'Monthly Views'}</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>
                      {clicksToggle === 'total' ? (submission.clicks || 0) : (submission.monthlyClicks || 0)}
                    </span>
                    <span className={styles.metricLabel}>{clicksToggle === 'total' ? 'Clicks' : 'Monthly Clicks'}</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>
                      {viewsToggle === 'total'
                        ? (submission.views ? ((submission.clicks / submission.views) * 100).toFixed(1) : 0)
                        : (submission.monthlyViews ? ((submission.monthlyClicks / submission.monthlyViews) * 100).toFixed(1) : 0)
                      }%
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
