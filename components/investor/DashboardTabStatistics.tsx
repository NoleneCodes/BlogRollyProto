import React from 'react';
import styles from '../../styles/InvestorDashboard.module.css';

const DashboardTabStatistics = () => (
  <div>
    <div className={styles.dashboardGrid}>
      <div className={styles.dashboardCard}>
        <h2>Growth</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Active users (MAU)</span>
            <span className={styles.metricValue}>12.3K (+17% MoM)</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Creator-to-reader ratio</span>
            <span className={styles.metricValue}>1:10 — healthy ecosystem balance</span>
          </div>
        </div>
      </div>
      <div className={styles.dashboardCard}>
        <h2>Content</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Blogs submitted this month</span>
            <span className={styles.metricValue}>420</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Top content / categories</span>
            <span className={styles.metricValue}>“Self-growth”, “Tech”, “Money & Mindset” = 60% of total reads</span>
          </div>
        </div>
      </div>
      <div className={styles.dashboardCard}>
        <h2>Marketing</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Traffic overview</span>
            <span className={styles.metricValue}>45K visits, 32K unique users (+22% MoM)</span>
          </div>
        </div>
      </div>
      <div className={styles.dashboardCard}>
        <h2>Revenue</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Revenue growth % (month-over-month)</span>
            <span className={styles.metricValue}>+25% MoM</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Conversion rate (free → paid)</span>
            <span className={styles.metricValue}>4.2%</span>
          </div>
        </div>
      </div>
      <div className={styles.dashboardCard}>
        <h2>Product</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Feature adoption</span>
            <span className={styles.metricValue}>65% of users used AI Search in last month</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Search count</span>
            <span className={styles.metricValue}>12,500</span>
          </div>
        </div>
      </div>
      <div className={styles.dashboardCard}>
        <h2>Team</h2>
        <div className={styles.statisticsList}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Headcount</span>
            <span className={styles.metricValue}>6 full-time, 2 part-time</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardTabStatistics;
