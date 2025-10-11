import { useEffect, useState } from 'react';
import styles from '../../styles/InvestorDashboard.module.css';
import { supabase } from '../../lib/supabase';

async function fetchMonthlySearchStats() {
  // Get current month range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Format dates for Supabase
  const startStr = startOfMonth.toISOString();
  const endStr = endOfMonth.toISOString();
  const lastStartStr = lastMonthStart.toISOString();
  const lastEndStr = lastMonthEnd.toISOString();

  // Count searches for current month
  const { count: currentMonthCount } = await supabase
    .from('search_history')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startStr)
    .lte('created_at', endStr);

  // Count searches for last month
  const { count: lastMonthCount } = await supabase
    .from('search_history')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', lastStartStr)
    .lte('created_at', lastEndStr);

  // Calculate % change
  let percentChange = 0;
  if (typeof lastMonthCount === 'number' && lastMonthCount > 0) {
    percentChange = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
  }

  return {
    currentMonthCount: currentMonthCount || 0,
    percentChange: percentChange.toFixed(1),
  };
}

const DashboardTabStatistics = () => {
  const [searchStats, setSearchStats] = useState({ currentMonthCount: 0, percentChange: '0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlySearchStats().then((data) => {
      setSearchStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading statistics...</div>;

  return (
    <div>
      <div className={styles.dashboardGrid}>
        {/* ...existing cards... */}
        <div className={styles.dashboardCard}>
          <h2>Product</h2>
          <div className={styles.statisticsList}>
            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>Feature adoption</span>
              <span className={styles.metricValue}>65% of users used AI Search in last month</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>Search count (this month)</span>
              <span className={styles.metricValue}>{searchStats.currentMonthCount.toLocaleString()}</span>
              <span className={styles.metricValue} style={{ color: Number(searchStats.percentChange) >= 0 ? '#2ecc40' : '#c42142' }}>
                {Number(searchStats.percentChange) >= 0 ? '+' : ''}{searchStats.percentChange}% vs last month
              </span>
            </div>
          </div>
        </div>
        {/* ...other cards... */}
      </div>
    </div>
  );
};

export default DashboardTabStatistics;
