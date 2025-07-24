
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { BugReport, BugReportHelpers, BugReportStatus } from '../../lib/supabase';
import styles from '../../styles/AdminDashboard.module.css';

interface AdminUser {
  authenticated: boolean;
  authorized: boolean;
  userId: string;
  userName: string;
  userRoles: string;
}

const BugReportsAdmin: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch('/api/admin-auth-check');
        const data = await response.json();
        
        if (data.authenticated && data.authorized) {
          setAdminUser(data);
          fetchBugReports();
        } else {
          router.push('/auth');
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        router.push('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  const fetchBugReports = async () => {
    try {
      const response = await fetch('/api/admin/bug-reports');
      if (response.ok) {
        const data = await response.json();
        setBugReports(data);
      }
    } catch (error) {
      console.error('Error fetching bug reports:', error);
    }
  };

  const updateBugStatus = async (bugId: string, newStatus: BugReportStatus, adminNotes?: string) => {
    try {
      const response = await fetch(`/api/admin/bug-reports/${bugId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus, 
          admin_notes: adminNotes,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
        }),
      });

      if (response.ok) {
        fetchBugReports(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  const filteredBugReports = bugReports.filter(bug => {
    const statusMatch = selectedStatus === 'all' || bug.status === selectedStatus;
    const severityMatch = selectedSeverity === 'all' || bug.severity === selectedSeverity;
    return statusMatch && severityMatch;
  });

  if (isLoading) {
    return (
      <Layout title="Bug Reports - Admin Dashboard">
        <div className={styles.loading}>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Bug Reports - Admin Dashboard">
      <div className={styles.adminContainer}>
        <div className={styles.adminHeader}>
          <h1>Bug Reports Dashboard</h1>
          <div className={styles.adminNav}>
            <a href="/admin/blog-submissions" className={styles.adminNavLink}>
              Blog Submissions
            </a>
            <a href="/admin/bug-reports" className={`${styles.adminNavLink} ${styles.active}`}>
              Bug Reports
            </a>
          </div>
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <label>Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>Severity:</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className={styles.submissionsGrid}>
          {filteredBugReports.length === 0 ? (
            <div className={styles.noSubmissions}>
              <p>No bug reports found.</p>
            </div>
          ) : (
            filteredBugReports.map((bug) => (
              <div key={bug.id} className={styles.submissionCard}>
                <div className={styles.submissionHeader}>
                  <h3 className={styles.submissionTitle}>{bug.title}</h3>
                  <div className={styles.submissionMeta}>
                    <span 
                      className={styles.statusBadge}
                      style={{ 
                        backgroundColor: BugReportHelpers.getStatusColor(bug.status),
                        color: 'white'
                      }}
                    >
                      {BugReportHelpers.getStatusLabel(bug.status)}
                    </span>
                    <span 
                      className={styles.severityBadge}
                      style={{ 
                        backgroundColor: BugReportHelpers.getSeverityColor(bug.severity),
                        color: 'white'
                      }}
                    >
                      {bug.severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className={styles.submissionDetails}>
                  <p><strong>Description:</strong> {bug.description}</p>
                  {bug.page && <p><strong>Page:</strong> {bug.page}</p>}
                  {bug.user_email && <p><strong>Reporter:</strong> {bug.user_email}</p>}
                  <p><strong>Category:</strong> {bug.category}</p>
                  <p><strong>Reported:</strong> {new Date(bug.created_at).toLocaleDateString()}</p>
                  {bug.admin_notes && (
                    <p><strong>Admin Notes:</strong> {bug.admin_notes}</p>
                  )}
                </div>

                <div className={styles.actionButtons}>
                  {bug.status === 'open' && (
                    <>
                      <button
                        onClick={() => updateBugStatus(bug.id, 'in_progress')}
                        className={styles.actionButton}
                        style={{ backgroundColor: '#f59e0b' }}
                      >
                        Start Working
                      </button>
                      <button
                        onClick={() => updateBugStatus(bug.id, 'closed', 'Invalid or duplicate report')}
                        className={styles.actionButton}
                        style={{ backgroundColor: '#6b7280' }}
                      >
                        Close
                      </button>
                    </>
                  )}
                  
                  {bug.status === 'in_progress' && (
                    <button
                      onClick={() => updateBugStatus(bug.id, 'resolved')}
                      className={styles.actionButton}
                      style={{ backgroundColor: '#10b981' }}
                    >
                      Mark Resolved
                    </button>
                  )}
                  
                  {(bug.status === 'resolved' || bug.status === 'closed') && (
                    <button
                      onClick={() => updateBugStatus(bug.id, 'open')}
                      className={styles.actionButton}
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BugReportsAdmin;
