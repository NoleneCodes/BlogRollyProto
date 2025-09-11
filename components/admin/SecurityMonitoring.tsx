import React, { useState, useEffect } from 'react';
import styles from '../../styles/AdminDashboard.module.css';
import { fetchSecurityMetrics, fetchRecentSecurityEvents, fetchComplianceStatus } from '../../lib/securityAudit';

const SecurityMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSecurityData = async () => {
      setLoading(true);
      try {
        const [metricsData, eventsData, complianceData] = await Promise.all([
          fetchSecurityMetrics(),
          fetchRecentSecurityEvents(),
          fetchComplianceStatus()
        ]);
        setMetrics(metricsData);
        setEvents(eventsData);
        setCompliance(complianceData);
      } catch (error) {
        console.error('Failed to load security monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSecurityData();
  }, []);

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h2>Security Monitoring</h2>
        <p>Real-time security metrics, event logs, and compliance status</p>
      </div>
      {loading ? (
        <div className={styles.loading}><h3>Loading security data...</h3></div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>{metrics?.totalEvents ?? '-'}</h3>
              <p>Total Security Events</p>
            </div>
            <div className={styles.statCard}>
              <h3>{metrics?.anomaliesDetected ?? '-'}</h3>
              <p>Anomalies Detected</p>
            </div>
            <div className={styles.statCard}>
              <h3>{metrics?.threatsBlocked ?? '-'}</h3>
              <p>Threats Blocked</p>
            </div>
            <div className={styles.statCard}>
              <h3>{metrics?.gdprRequests ?? '-'}</h3>
              <p>GDPR Requests</p>
            </div>
          </div>
          <div className={styles.sectionSubHeader}><h3>Recent Security Events</h3></div>
          <div className={styles.tableContainer}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td colSpan={5}>No recent security events.</td></tr>
                ) : (
                  events.map((event, idx) => (
                    <tr key={idx}>
                      <td>{new Date(event.timestamp).toLocaleString()}</td>
                      <td>{event.event_type}</td>
                      <td>{event.user_id || 'System'}</td>
                      <td>{event.ip_address}</td>
                      <td>{event.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className={styles.sectionSubHeader}><h3>Compliance Status</h3></div>
          <div className={styles.complianceStatus}>
            <p><strong>GDPR:</strong> {compliance?.gdpr ?? 'Unknown'}</p>
            <p><strong>SOX:</strong> {compliance?.sox ?? 'Unknown'}</p>
            <p><strong>PCI DSS:</strong> {compliance?.pci ?? 'Unknown'}</p>
            <p><strong>Last Audit:</strong> {compliance?.lastAudit ? new Date(compliance.lastAudit).toLocaleDateString() : '-'}</p>
            <p><strong>Violations:</strong> {compliance?.violations ?? 0}</p>
            <p><strong>Recommendations:</strong> {compliance?.recommendations ?? 'None'}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default SecurityMonitoring;
