import { useEffect, useState } from 'react';
import styles from '../../styles/InvestorDashboard.module.css';
import { supabase } from '../../lib/supabase';

const fetchStats = async () => {
  // Example: Replace with your actual Supabase queries
  const { data: userStats } = await supabase.from('users').select('id', { count: 'exact' });
  const { data: blogStats } = await supabase.from('blog_submissions').select('id', { count: 'exact' });
  const { data: searchStats } = await supabase.from('search_history').select('id', { count: 'exact' });
  // Add more queries as needed
  return {
    activeUsers: userStats?.length || 0,
    blogsSubmitted: blogStats?.length || 0,
    searchCount: searchStats?.length || 0,
    // ...other stats
  };
};

const DashboardTabStatistics = () => {

  const [stats, setStats] = useState({
    mau: 0,
    growthPercent: '0',
    creatorReaderRatio: '0.00',
    blogsSubmitted: 0,
    topCategories: [],
    totalVisits: 0,
    uniqueUsers: 0,
    totalRevenue: 0,
    revenueGrowthPercent: '0',
    conversionRate: '0',
    featureAdoption: '0',
    searchCount: 0,
    searchPercent: '0',
  });

  useEffect(() => {
    async function fetchStats() {
      // Growth: Active users (MAU) = users who logged in at least once this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      const { data: users } = await supabase.from('users').select('id,last_login');
      const mau = users ? users.filter(u => u.last_login && new Date(u.last_login) >= startOfMonth).length : 0;

      // Creator-to-reader ratio: bloggers with at least one blog / readers
      const { data: bloggers } = await supabase.from('user_profiles').select('user_id,role');
      const { data: blogs } = await supabase.from('blog_submissions').select('id,blogger_id');
      const bloggerIdsWithBlog = blogs ? Array.from(new Set(blogs.map(b => b.blogger_id))) : [];
      const creatorCount = bloggers ? bloggers.filter(b => b.role === 'blogger' && bloggerIdsWithBlog.includes(b.user_id)).length : 0;
      const readerCount = bloggers ? bloggers.filter(b => b.role === 'reader').length : 0;
      const creatorReaderRatio = readerCount > 0 ? `${creatorCount}:${readerCount}` : '0:0';

      // Content: Blogs submitted this month (approved)
      const { data: approvedBlogs } = await supabase
        .from('blog_submissions')
        .select('id,created_at,status')
        .eq('status', 'approved');
      const blogsSubmitted = approvedBlogs ? approvedBlogs.filter(b => new Date(b.created_at) >= startOfMonth).length : 0;

      // Top content/categories: most-read blog categories for current month
      const { data: reads } = await supabase
        .from('page_views')
        .select('category,created_at');
      const currentMonthReads = reads ? reads.filter(r => r.created_at && new Date(r.created_at) >= startOfMonth) : [];
      const categoryCounts = {};
      currentMonthReads.forEach(r => {
        if (r.category) categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      });
      const topCategories = Object.entries(categoryCounts)
  .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 3)
        .map(([cat]) => cat);

      // Marketing: Total visits and unique users this month
      const { data: visits } = await supabase.from('page_views').select('user_id,created_at');
      const monthVisits = visits ? visits.filter(v => v.created_at && new Date(v.created_at) >= startOfMonth) : [];
      const totalVisits = monthVisits.length;
      const uniqueUsers = monthVisits ? new Set(monthVisits.map(v => v.user_id)).size : 0;

      // Marketing: MoM for visits and unique users
      const prevMonth = new Date(startOfMonth);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const prevMonthEnd = new Date(startOfMonth);
      prevMonthEnd.setDate(0);
      const prevMonthVisits = visits ? visits.filter(v => v.created_at && new Date(v.created_at) >= prevMonth && new Date(v.created_at) < startOfMonth) : [];
      const prevTotalVisits = prevMonthVisits.length;
      const prevUniqueUsers = prevMonthVisits ? new Set(prevMonthVisits.map(v => v.user_id)).size : 0;
      const visitsMoM = prevTotalVisits > 0 ? (((totalVisits - prevTotalVisits) / prevTotalVisits) * 100).toFixed(1) : '0';
      const uniqueUsersMoM = prevUniqueUsers > 0 ? (((uniqueUsers - prevUniqueUsers) / prevUniqueUsers) * 100).toFixed(1) : '0';

      // Revenue: Stripe columns, total revenue month vs last month
      const { data: revenueRows } = await supabase.from('blogger_profiles').select('stripe_total_revenue,stripe_last_month_revenue,stripe_this_month_revenue');
      const totalRevenue = revenueRows ? revenueRows.reduce((sum, r) => sum + (r.stripe_this_month_revenue || 0), 0) : 0;
      const lastMonthRevenue = revenueRows ? revenueRows.reduce((sum, r) => sum + (r.stripe_last_month_revenue || 0), 0) : 0;
      const revenueGrowthPercent = lastMonthRevenue > 0 ? (((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1) : '0';

      // Conversion rate: paid users / free users * 100
      const { data: userTiers } = await supabase.from('user_profiles').select('tier');
      const paidUsers = userTiers ? userTiers.filter(u => u.tier === 'paid').length : 0;
      const freeUsers = userTiers ? userTiers.filter(u => u.tier === 'free').length : 0;
      const conversionRate = freeUsers > 0 ? ((paidUsers / freeUsers) * 100).toFixed(1) : '0';

      // Product: Feature adoption (% of users who used AI Search at least once this month)
      const { data: searches } = await supabase.from('search_history').select('user_id,created_at');
      const monthSearches = searches ? searches.filter(s => s.created_at && new Date(s.created_at) >= startOfMonth) : [];
      const aiSearchUsers = monthSearches ? new Set(monthSearches.map(s => s.user_id)).size : 0;
      const featureAdoption = mau > 0 ? ((aiSearchUsers / mau) * 100).toFixed(1) : '0';

      // Product: Search count (total number of searches in current month)
      const searchCount = monthSearches.length;
      // Search percent MoM
      const prevMonthSearches = searches ? searches.filter(s => s.created_at && new Date(s.created_at) >= prevMonth && new Date(s.created_at) < startOfMonth) : [];
      const searchPercent = prevMonthSearches.length > 0 ? (((searchCount - prevMonthSearches.length) / prevMonthSearches.length) * 100).toFixed(1) : '0';

      setStats(prev => ({
        ...prev,
        mau,
        growthPercent: visitsMoM,
        creatorReaderRatio,
        blogsSubmitted,
        topCategories,
        totalVisits,
        uniqueUsers,
        revenueGrowthPercent,
        totalRevenue,
        conversionRate,
        featureAdoption,
        searchCount,
        searchPercent,
      }));
    }
    fetchStats();
  }, []);

  return (
    <div className={styles.dashboardGrid}>
      {/* Growth Card */}
      <div className={styles.dashboardCard}>
        <h2>Growth</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Active users (MAU)</span>
            <span className={styles.metricValue}>{stats.mau.toLocaleString()} ({stats.growthPercent}% MoM)</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Creator-to-reader ratio</span>
            <span className={styles.metricValue}>{stats.creatorReaderRatio}</span>
          </div>
        </div>
      </div>
      {/* Content Card */}
      <div className={styles.dashboardCard}>
        <h2>Content</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Blogs submitted this month</span>
            <span className={styles.metricValue}>{stats.blogsSubmitted.toLocaleString()}</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Top content / categories</span>
            <span className={styles.metricValue}>{Array.isArray(stats.topCategories) ? stats.topCategories.join(', ') : stats.topCategories}</span>
          </div>
        </div>
      </div>
      {/* Marketing Card */}
      <div className={styles.dashboardCard}>
        <h2>Marketing</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Traffic overview</span>
            <span className={styles.metricValue}>{stats.totalVisits.toLocaleString()}, {stats.uniqueUsers.toLocaleString()} unique users</span>
          </div>
        </div>
      </div>
      {/* Revenue Card */}
      <div className={styles.dashboardCard}>
        <h2>Revenue</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Revenue growth % (month-over-month)</span>
            <span className={styles.metricValue}>{stats.revenueGrowthPercent}% MoM</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Conversion rate (free → paid)</span>
            <span className={styles.metricValue}>{stats.conversionRate}%</span>
          </div>
        </div>
      </div>
      {/* Product Card */}
      <div className={styles.dashboardCard}>
        <h2>Product</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Feature adoption</span>
            <span className={styles.metricValue}>{stats.featureAdoption}% of users used AI Search in last month</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Search count</span>
            <span className={styles.metricValue}>{stats.searchCount.toLocaleString()} ({stats.searchPercent}% MoM)</span>
          </div>
        </div>
      </div>
      {/* Team Card */}
      <div className={styles.dashboardCard}>
        <h2>Team</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Headcount</span>
            <span className={styles.metricValue}>1 Full-Time</span>
          </div>
        </div>
      </div>
    </div>
  );

    return (
      <div className={styles.dashboardGrid}>
        {/* Growth Card */}
        <div className={styles.dashboardCard}>
          <h2>Growth</h2>
          <div className={styles.statisticsList}>
            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>Active users (MAU)</span>
              <span className={styles.metricValue}>{stats.mau.toLocaleString()} ({stats.growthPercent}% MoM)</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>Creator-to-reader ratio</span>
              <span className={styles.metricValue}>{stats.creatorReaderRatio}</span>
            </div>
          </div>
        </div>
        {/* Content Card */}
        <div className={styles.dashboardCard}>
          <h2>Content</h2>
          <div className={styles.statisticsList}>
            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>Blogs submitted this month</span>
              <span className={styles.metricValue}>{stats.blogsSubmitted.toLocaleString()}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>Top content / categories</span>
              <span className={styles.metricValue}>{Array.isArray(stats.topCategories) ? stats.topCategories.join(', ') : stats.topCategories}</span>
            </div>
          </div>
        </div>
        {/* Marketing Card */}
        <div className={styles.dashboardCard}>
          <h2>Marketing</h2>
          <div className={styles.statisticsList}>
            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>Traffic overview</span>
              <span className={styles.metricValue}>{stats.totalVisits.toLocaleString()}, {stats.uniqueUsers.toLocaleString()} unique users</span>
            </div>
          </div>
        </div>
        {/* Revenue Card */}
        <div className={styles.dashboardCard}>
          <h2>Revenue</h2>
          <div className={styles.statisticsList}>
            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>Revenue growth % (month-over-month)</span>
              <span className={styles.metricValue}>{stats.revenueGrowthPercent}% MoM</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>Conversion rate (free → paid)</span>
              <span className={styles.metricValue}>{stats.conversionRate}%</span>
            </div>
          </div>
        </div>
        {/* Product Card */}
        <div className={styles.dashboardCard}>
          <h2>Product</h2>
          <div className={styles.statisticsList}>
            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>Feature adoption</span>
              <span className={styles.metricValue}>{stats.featureAdoption}% of users used AI Search in last month</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>Search count</span>
              <span className={styles.metricValue}>{stats.searchCount.toLocaleString()} ({stats.searchPercent}% MoM)</span>
            </div>
          </div>
        </div>
      </div>
    );
};

export default DashboardTabStatistics;
