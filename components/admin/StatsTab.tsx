

import React, { useEffect, useState } from 'react';
import styles from '../../styles/AdminDashboard.module.css';
import { activityTracker } from '../../lib/userActivityTracker';

type Stats = {
  totalUsers: number;
  activeBloggers: number;
  readers: number;
  premiumMembers: number;
  investors: number;
  bloggers: number;
  repeatUsers?: number;
};

const StatsTab = () => {

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateView, setDateView] = useState<'1month' | '3month' | 'all'>('all');
  const [repeatUsers, setRepeatUsers] = useState<number | null>(null);


  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/user-stats?range=${dateView}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load stats');
        setLoading(false);
      });
    // Fetch repeat users from activity tracker
    activityTracker.getRepeatVisitorAnalytics().then(result => {
      if (result) setRepeatUsers(result.repeatVisitors);
    });
  }, [dateView]);

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h2>Dashboard Overview</h2>
        <p>Overview of BlogRolly performance and metrics</p>
      </div>
      <div className={styles.statsCardsGrid}>
        <div className={styles.statsMainCard}>
          <div className={styles.cardHeader}>
            <h3>Platform Statistics</h3>
            <p>Current user metrics and platform health</p>
          </div>
          <div className={styles.tableFilters}>
            <div className={styles.filterGroup}>
              <label htmlFor="date-view">Date Range:</label>
              <select
                id="date-view"
                value={dateView}
                onChange={e => setDateView(e.target.value as '1month' | '3month' | 'all')}
                className={styles.filterSelect}
              >
                <option value="1month">Last 1 Month</option>
                <option value="3month">Last 3 Months</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
          <div className={styles.statsGrid}>
            {loading ? (
              <div className={styles.loading}><h2>Loading stats...</h2></div>
            ) : error ? (
              <div className={styles.emptyState}><h3>{error}</h3></div>
            ) : stats ? (
              <>
                <div className={styles.statCard}><h3>{typeof stats.totalUsers === 'number' && stats.totalUsers >= 0 ? stats.totalUsers : 0}</h3><p>Total Users</p></div>
                <div className={styles.statCard}><h3>{typeof stats.activeBloggers === 'number' && stats.activeBloggers >= 0 ? stats.activeBloggers : 0}</h3><p>Active Bloggers</p></div>
                <div className={styles.statCard}><h3>{typeof stats.readers === 'number' && stats.readers >= 0 ? stats.readers : 0}</h3><p>Readers</p></div>
                <div className={styles.statCard}><h3>{typeof stats.premiumMembers === 'number' && stats.premiumMembers >= 0 ? stats.premiumMembers : 0}</h3><p>Premium Members</p></div>
                <div className={styles.statCard}><h3>{typeof stats.investors === 'number' && stats.investors >= 0 ? stats.investors : 0}</h3><p>Investors</p></div>
                <div className={styles.statCard}><h3>{typeof stats.bloggers === 'number' && stats.bloggers >= 0 ? stats.bloggers : 0}</h3><p>Bloggers</p></div>
                <div className={styles.statCard}><h3>{typeof repeatUsers === 'number' && repeatUsers >= 0 ? repeatUsers : 0}</h3><p>Repeat Users</p></div>
                <div className={styles.statCard}>
                  <h3>{(typeof stats.bloggers === 'number' && stats.bloggers > 0 && typeof stats.readers === 'number') ? (stats.readers / stats.bloggers).toFixed(2) : '0.00'}</h3>
                  <p>Reader/Blogger Ratio</p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTab;
