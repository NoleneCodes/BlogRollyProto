import { useEffect, useState } from 'react';
import styles from '../../styles/InvestorDashboard.module.css';
import { supabase } from '../../lib/supabase';

async function fetchFeatureAdoptionStats() {
  // Get total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });

  // Get unique users who used AI (Ask Rolly) search this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startStr = startOfMonth.toISOString();
  const endStr = endOfMonth.toISOString();

  const { data: searchData } = await supabase
    .from('search_history')
    .select('user_id', { count: 'exact', head: true })
    .eq('is_ai_search', true)
    .gte('created_at', startStr)
    .lte('created_at', endStr);

  // Calculate adoption rate
  let adoptionRate = 0;
  if (typeof totalUsers === 'number' && totalUsers > 0 && searchData) {
    adoptionRate = (searchData.length / totalUsers) * 100;
  }

  return {
    adoptionRate: adoptionRate.toFixed(1),
    userCount: searchData?.length || 0,
    totalUsers: totalUsers || 0,
  };
}

const DashboardTabStatistics = () => {
  const [featureStats, setFeatureStats] = useState({ adoptionRate: '0', userCount: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatureAdoptionStats().then((data) => {
      setFeatureStats(data);
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
              <span className={styles.metricTitle}>Feature adoption (AI Search)</span>
              <span className={styles.metricValue}>{featureStats.userCount.toLocaleString()} users ({featureStats.adoptionRate}% of all users) used Ask Rolly this month</span>
            </div>
            {/* ...other metrics... */}
          </div>
        </div>
        {/* ...other cards... */}
      </div>
    </div>
  );
};

export default DashboardTabStatistics;
