import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogPostManager from '../../components/BlogPostManager';
import { getAllInternalBlogPosts, deleteInternalBlogPost, InternalBlogPost } from '../../lib/internalBlogData';
import { getAllBugReports, getBugReportById, updateBugReportStatus, BugReport } from '../../lib/bugReportData';
import { BlogSubmission, BlogStatus, RejectionReason, BlogStatusHelpers } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import styles from '../../styles/AdminDashboard.module.css';

interface AdminUser {
  authenticated: boolean;
  authorized: boolean;
  userId: string;
  userName: string;
  userRoles: string;
}

interface BlogSubmissionWithReview extends BlogSubmission {
  blogger_name: string;
  blogger_email: string;
  blogger_tier: 'free' | 'pro';
  review_count: number;
  last_reviewed_at?: string;
}

// Bug Reports with enhanced table functionality
const BugReports = () => {
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');
  const [bugReportsData, setBugReportsData] = useState<BugReport[]>([]);
  const [selectedBugReport, setSelectedBugReport] = useState<BugReport | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    // Load bug reports data
    const reports = getAllBugReports();
    setBugReportsData(reports);
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredData = () => {
    let filteredData = [...bugReportsData];

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filteredData = filteredData.filter(item => item.priority === priorityFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(item => item.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig !== null) {
      filteredData.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof typeof a];
        let bValue = b[sortConfig.key as keyof typeof b];

        if (sortConfig.key === 'date') {
          aValue = a.dateSort;
          bValue = b.dateSort;
        }

        // Special handling for priority column to order low-medium-high
        if (sortConfig.key === 'priority') {
          const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return '';
    }
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return '';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open': return styles.statusPending;
      case 'in-progress': return styles.statusInProgress;
      case 'resolved': return styles.statusResolved;
      default: return '';
    }
  };

  const handleStatusChange = (bugId: string, newStatus: 'open' | 'in-progress' | 'resolved') => {
    const success = updateBugReportStatus(bugId, newStatus);
    if (success) {
      // Refresh the data
      const updatedReports = getAllBugReports();
      setBugReportsData(updatedReports);
      alert(`Bug ${bugId} status updated to ${newStatus}`);
    } else {
      alert('Failed to update bug status');
    }
  };

  const handleViewBugReport = (bugId: string) => {
    const report = getBugReportById(bugId);
    if (report) {
      setSelectedBugReport(report);
      setShowViewModal(true);
    }
  };

  const sortedAndFilteredData = getSortedAndFilteredData();

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Bug Reports</h2>
        <p>Manage and respond to user-reported bugs</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.status === 'open').length}</h3>
          <p>Open Reports</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.priority === 'high').length}</h3>
          <p>High Priority</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.status === 'resolved').length}</h3>
          <p>Resolved</p>
        </div>
      </div>

      <div className={styles.tableFilters}>
        <div className={styles.filterGroup}>
          <label htmlFor="priority-filter">Priority:</label>
          <select 
            id="priority-filter"
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
            className={styles.filterSelect}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="status-filter">Status:</label>
          <select 
            id="status-filter"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'in-progress' | 'resolved')}
            className={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className={styles.resultsInfo}>
          Showing {sortedAndFilteredData.length} of {bugReportsData.length} reports
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className={styles.sortableHeader}>
                Bug ID{getSortIcon('id')}
              </th>
              <th onClick={() => handleSort('title')} className={styles.sortableHeader}>
                Title{getSortIcon('title')}
              </th>
              <th onClick={() => handleSort('priority')} className={styles.sortableHeader}>
                Priority{getSortIcon('priority')}
              </th>
              <th onClick={() => handleSort('reporter')} className={styles.sortableHeader}>
                Reporter{getSortIcon('reporter')}
              </th>
              <th onClick={() => handleSort('status')} className={styles.sortableHeader}>
                Status{getSortIcon('status')}
              </th>
              <th onClick={() => handleSort('date')} className={styles.sortableHeader}>
                Date{getSortIcon('date')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredData.map((bug) => (
              <tr key={bug.id}>
                <td><strong>{bug.id}</strong></td>
                <td>{bug.title}</td>
                <td>
                  <span className={getPriorityClass(bug.priority)}>
                    {bug.priority.charAt(0).toUpperCase() + bug.priority.slice(1)}
                  </span>
                </td>
                <td>{bug.reporter}</td>
                <td>
                  <select 
                    value={bug.status}
                    onChange={(e) => handleStatusChange(bug.id, e.target.value as 'open' | 'in-progress' | 'resolved')}
                    className={`${styles.statusSelect} ${getStatusClass(bug.status)}`}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td>{bug.date}</td>
                <td>
                  <button 
                    className={styles.actionButton}
                    onClick={() => handleViewBugReport(bug.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedAndFilteredData.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No bug reports found</h3>
            <p>No reports match your current filters.</p>
          </div>
        )}
      </div>

      {/* Bug Report View Modal */}
      {showViewModal && selectedBugReport && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Bug Report Details - {selectedBugReport.id}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.bugReportDetails}>
              <div className={styles.bugReportHeader}>
                <h4>{selectedBugReport.title}</h4>
                <div className={styles.bugReportBadges}>
                  <span className={`${styles.priorityBadge} ${getPriorityClass(selectedBugReport.priority)}`}>
                    {selectedBugReport.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className={`${styles.statusBadge} ${getStatusClass(selectedBugReport.status)}`}>
                    {selectedBugReport.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className={styles.bugReportMeta}>
                <div className={styles.metaItem}>
                  <strong>Reporter:</strong> {selectedBugReport.reporter}
                </div>
                <div className={styles.metaItem}>
                  <strong>Submitted:</strong> {new Date(selectedBugReport.submittedAt).toLocaleString()}
                </div>
                <div className={styles.metaItem}>
                  <strong>Browser:</strong> {selectedBugReport.browser || 'Not specified'}
                </div>
                <div className={styles.metaItem}>
                  <strong>OS:</strong> {selectedBugReport.operatingSystem || 'Not specified'}
                </div>
              </div>

              <div className={styles.bugReportSection}>
                <h5>Description</h5>
                <p>{selectedBugReport.description}</p>
              </div>

              {selectedBugReport.stepsToReproduce && (
                <div className={styles.bugReportSection}>
                  <h5>Steps to Reproduce</h5>
                  <pre>{selectedBugReport.stepsToReproduce}</pre>
                </div>
              )}

              {selectedBugReport.expectedBehavior && (
                <div className={styles.bugReportSection}>
                  <h5>Expected Behavior</h5>
                  <p>{selectedBugReport.expectedBehavior}</p>
                </div>
              )}

              {selectedBugReport.actualBehavior && (
                <div className={styles.bugReportSection}>
                  <h5>Actual Behavior</h5>
                  <p>{selectedBugReport.actualBehavior}</p>
                </div>
              )}

              {selectedBugReport.additionalInfo && (
                <div className={styles.bugReportSection}>
                  <h5>Additional Information</h5>
                  <p>{selectedBugReport.additionalInfo}</p>
                </div>
              )}

              {selectedBugReport.images && selectedBugReport.images.length > 0 && (
                <div className={styles.bugReportSection}>
                  <h5>Screenshots</h5>
                  <div className={styles.bugReportImages}>
                    {selectedBugReport.images.map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`Screenshot ${index + 1}`}
                        className={styles.bugReportImage}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LinkedInVerifications = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      // In a real implementation, you'd fetch from your database
      // For now, I'll create mock data that would come from supabase
      const mockVerifications = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@investment.com',
          linkedin_url: 'https://linkedin.com/in/johnsmith-investor',
          linkedin_verification_token: 'token123',
          verification_status: 'pending_linkedin',
          created_at: '2025-01-24T10:00:00Z'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@venture.com',
          linkedin_url: 'https://linkedin.com/in/sarahjohnson-vc',
          linkedin_verification_token: 'token456',
          verification_status: 'pending_linkedin',
          created_at: '2025-01-24T11:30:00Z'
        }
      ];
      
      setVerifications(mockVerifications.filter(v => v.verification_status === 'pending_linkedin'));
    } catch (error) {
      console.error('Failed to load LinkedIn verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLinkedIn = async (verificationToken: string, approved: boolean) => {
    try {
      const response = await fetch('/api/investor/approve-linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationToken,
          approved
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`LinkedIn verification ${approved ? 'approved' : 'rejected'} successfully!`);
        loadVerifications(); // Refresh the list
        setShowViewModal(false);
      } else {
        alert(`Failed to ${approved ? 'approve' : 'reject'} verification: ${result.error}`);
      }
    } catch (error) {
      console.error('Error processing LinkedIn verification:', error);
      alert('Network error occurred. Please try again.');
    }
  };

  const handleViewVerification = (verification: any) => {
    setSelectedVerification(verification);
    setShowViewModal(true);
  };

  if (loading) {
    return (
      <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
          <h2>LinkedIn Verifications</h2>
          <p>Loading pending verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>LinkedIn Verifications</h2>
        <p>Review and approve investor LinkedIn profiles</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{verifications.length}</h3>
          <p>Pending Reviews</p>
        </div>
        <div className={styles.statCard}>
          <h3>24hr</h3>
          <p>Avg Review Time</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>LinkedIn Profile</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {verifications.map((verification) => (
              <tr key={verification.id}>
                <td><strong>{verification.name}</strong></td>
                <td>{verification.email}</td>
                <td>
                  <a 
                    href={verification.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.linkedinLink}
                  >
                    View Profile
                  </a>
                </td>
                <td>{new Date(verification.created_at).toLocaleDateString()}</td>
                <td>
                  <div className={styles.verificationActions}>
                    <button 
                      className={styles.approveButton}
                      onClick={() => handleApproveLinkedIn(verification.linkedin_verification_token, true)}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className={styles.rejectButton}
                      onClick={() => handleApproveLinkedIn(verification.linkedin_verification_token, false)}
                    >
                      ✗ Reject
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleViewVerification(verification)}
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {verifications.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No pending LinkedIn verifications</h3>
            <p>All investor LinkedIn profiles have been reviewed.</p>
          </div>
        )}
      </div>

      {/* Verification View Modal */}
      {showViewModal && selectedVerification && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>LinkedIn Verification Details</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.verificationDetails}>
              <div className={styles.verificationSection}>
                <h5>Investor Information</h5>
                <p><strong>Name:</strong> {selectedVerification.name}</p>
                <p><strong>Email:</strong> {selectedVerification.email}</p>
                <p><strong>Submitted:</strong> {new Date(selectedVerification.created_at).toLocaleString()}</p>
              </div>

              <div className={styles.verificationSection}>
                <h5>LinkedIn Profile</h5>
                <p><strong>URL:</strong> <a href={selectedVerification.linkedin_url} target="_blank" rel="noopener noreferrer">{selectedVerification.linkedin_url}</a></p>
                <p><em>Please review the LinkedIn profile to verify:</em></p>
                <ul>
                  <li>Profile belongs to a legitimate investor or investment professional</li>
                  <li>Profile shows relevant investment experience</li>
                  <li>Profile appears complete and professional</li>
                  <li>Name matches the registration information</li>
                </ul>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.approveButton}
                onClick={() => handleApproveLinkedIn(selectedVerification.linkedin_verification_token, true)}
              >
                ✓ Approve Verification
              </button>
              <button 
                className={styles.rejectButton}
                onClick={() => handleApproveLinkedIn(selectedVerification.linkedin_verification_token, false)}
              >
                ✗ Reject Verification
              </button>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SupportRequests = () => {
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'responded' | 'closed'>('all');
  const [supportRequestsData] = useState([
    {
      id: 'SUP-001',
      subject: 'Cannot access premium features',
      priority: 'high',
      user: 'premium@user.com',
      status: 'open',
      created: '2025-01-24',
      dateSort: new Date('2025-01-24').getTime(),
      message: 'I upgraded to premium but still cannot access premium features. The payment went through successfully.',
      email: 'premium@user.com',
      submittedAt: new Date('2025-01-24')
    },
    {
      id: 'SUP-002',
      subject: 'Question about blog submission',
      priority: 'low',
      user: 'newuser@blog.com',
      status: 'responded',
      created: '2025-01-23',
      dateSort: new Date('2025-01-23').getTime(),
      message: 'I would like to know more about the blog submission process and approval times.',
      email: 'newuser@blog.com',
      submittedAt: new Date('2025-01-23')
    }
  ]);
  const [selectedSupportRequest, setSelectedSupportRequest] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredData = () => {
    let filteredData = [...supportRequestsData];

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filteredData = filteredData.filter(item => item.priority === priorityFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(item => item.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig !== null) {
      filteredData.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof typeof a];
        let bValue = b[sortConfig.key as keyof typeof b];

        if (sortConfig.key === 'created') {
          aValue = a.dateSort;
          bValue = b.dateSort;
        }

        // Special handling for priority column to order low-medium-high
        if (sortConfig.key === 'priority') {
          const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return '';
    }
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'critical': return styles.priorityCritical;
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return '';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open': return styles.statusPending;
      case 'responded': return styles.statusInProgress;
      case 'closed': return styles.statusResolved;
      default: return '';
    }
  };

  const handleViewSupportRequest = (requestId: string) => {
    const request = supportRequestsData.find(req => req.id === requestId);
    if (request) {
      setSelectedSupportRequest(request);
      setShowViewModal(true);
    }
  };

  const sortedAndFilteredData = getSortedAndFilteredData();

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Support Requests</h2>
        <p>Handle user inquiries and support tickets</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.status === 'open').length}</h3>
          <p>Open Tickets</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.priority === 'high').length}</h3>
          <p>Urgent</p>
        </div>
        <div className={styles.statCard}>
          <h3>24hr</h3>
          <p>Avg Response Time</p>
        </div>
      </div>

      <div className={styles.tableFilters}>
        <div className={styles.filterGroup}>
          <label htmlFor="priority-filter-support">Priority:</label>
          <select 
            id="priority-filter-support"
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'critical' | 'high' | 'medium' | 'low')}
            className={styles.filterSelect}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="status-filter-support">Status:</label>
          <select 
            id="status-filter-support"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'responded' | 'closed')}
            className={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className={styles.resultsInfo}>
          Showing {sortedAndFilteredData.length} of {supportRequestsData.length} requests
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className={styles.sortableHeader}>
                Ticket ID{getSortIcon('id')}
              </th>
              <th onClick={() => handleSort('subject')} className={styles.sortableHeader}>
                Subject{getSortIcon('subject')}
              </th>
              <th onClick={() => handleSort('priority')} className={styles.sortableHeader}>
                Priority{getSortIcon('priority')}
              </th>
              <th onClick={() => handleSort('user')} className={styles.sortableHeader}>
                User{getSortIcon('user')}
              </th>
              <th onClick={() => handleSort('status')} className={styles.sortableHeader}>
                Status{getSortIcon('status')}
              </th>
              <th onClick={() => handleSort('created')} className={styles.sortableHeader}>
                Created{getSortIcon('created')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredData.map((ticket) => (
              <tr key={ticket.id}>
                <td><strong>#{ticket.id}</strong></td>
                <td>{ticket.subject}</td>
                <td>
                  <span className={getPriorityClass(ticket.priority)}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </td>
                <td>{ticket.user}</td>
                <td>
                  <span className={getStatusClass(ticket.status)}>
                    {ticket.status === 'responded' ? 'Responded' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </td>
                <td>{ticket.created}</td>
                <td>
                  <button 
                    className={styles.actionButton}
                    onClick={() => handleViewSupportRequest(ticket.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedAndFilteredData.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No support requests found</h3>
            <p>No requests match your current filters.</p>
          </div>
        )}
      </div>

      {/* Support Request View Modal */}
      {showViewModal && selectedSupportRequest && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Support Request Details - {selectedSupportRequest.id}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.supportRequestDetails}>
              <div className={styles.supportRequestHeader}>
                <h4>{selectedSupportRequest.subject}</h4>
                <div className={styles.supportRequestBadges}>
                  <span className={`${styles.priorityBadge} ${getPriorityClass(selectedSupportRequest.priority)}`}>
                    {selectedSupportRequest.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className={`${styles.statusBadge} ${getStatusClass(selectedSupportRequest.status)}`}>
                    {selectedSupportRequest.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className={styles.supportRequestMeta}>
                <div className={styles.metaItem}>
                  <strong>User:</strong> {selectedSupportRequest.user}
                </div>
                <div className={styles.metaItem}>
                  <strong>Email:</strong> {selectedSupportRequest.email}
                </div>
                <div className={styles.metaItem}>
                  <strong>Submitted:</strong> {new Date(selectedSupportRequest.submittedAt).toLocaleString()}
                </div>
                <div className={styles.metaItem}>
                  <strong>Priority:</strong> {selectedSupportRequest.priority}
                </div>
              </div>

              <div className={styles.supportRequestSection}>
                <h5>Message</h5>
                <p>{selectedSupportRequest.message}</p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminStats = () => (
  <div className={styles.sectionContent}>
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
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>1,247</h3>
            <p>Total Users</p>
          </div>
          <div className={styles.statCard}>
            <h3>342</h3>
            <p>Active Bloggers</p>
          </div>
          <div className={styles.statCard}>
            <h3>905</h3>
            <p>Readers</p>
          </div>
          <div className={styles.statCard}>
            <h3>89</h3>
            <p>Premium Members</p>
          </div>
        </div>
      </div>

      {/* The blog stats and monthly growth card have been removed as per instructions */}

      {/* Top categories card has been removed as per the instructions */}
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('submissions');

  const [submissions, setSubmissions] = useState<BlogSubmissionWithReview[]>([]);
  const [filter, setFilter] = useState<BlogStatus | 'all'>('pending');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'newest' | 'oldest'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<BlogSubmissionWithReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState<RejectionReason | ''>('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [blogPosts, setBlogPosts] = useState<InternalBlogPost[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [editingPost, setEditingPost] = useState<InternalBlogPost | undefined>();
  const [mode, setMode] = useState<'add' | 'edit'>('add');

  // Email testing states
  const [testEmail, setTestEmail] = useState('');
  const [testFirstName, setTestFirstName] = useState('John');
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [emailTestResults, setEmailTestResults] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          if (mounted) {
            window.location.href = '/admin/login';
          }
          return;
        }

        const response = await fetch('/api/admin-auth-check', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Auth check failed: ${response.status}`);
        }

        const data = await response.json();

        if (!mounted) return;

        if (data.authenticated && data.authorized) {
          setAdminUser({
            authenticated: true,
            authorized: true,
            userId: data.userId,
            userName: data.userEmail || 'Admin',
            userRoles: 'admin'
          });
        } else {
          setAuthError('Access denied');
          setTimeout(() => {
            if (mounted) {
              window.location.href = '/admin/login';
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (mounted) {
          setAuthError('Authentication failed');
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (adminUser) {
      if (activeTab === 'submissions') {
        loadSubmissions();
      } else if (activeTab === 'manager') {
        loadBlogPosts();
      }
    }
  }, [adminUser, activeTab, filter, tierFilter, dateFilter]);

  const loadSubmissions = async () => {
    try {
      const mockSubmissions: BlogSubmissionWithReview[] = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'How to Build Better React Components',
          description: 'A comprehensive guide to creating reusable React components with best practices.',
          url: 'https://example-blog.com/react-components',
          image_url: 'https://example-blog.com/images/react.jpg',
          category: 'Technology',
          tags: ['React', 'JavaScript', 'Frontend'],
          status: 'pending',
          has_adult_content: false,
          is_live: false,
          views: 0,
          clicks: 0,
          submitted_at: '2025-01-24T10:00:00Z',
          created_at: '2025-01-24T10:00:00Z',
          updated_at: '2025-01-24T10:00:00Z',
          blogger_name: 'John Developer',
          blogger_email: 'john@example.com',
          blogger_tier: 'free',
          review_count: 0
        },
        {
          id: '2',
          user_id: 'user-2',
          title: 'Advanced Node.js Performance Optimization',
          description: 'Deep dive into Node.js performance optimization techniques for production applications.',
          url: 'https://pro-blog.com/nodejs-optimization',
          image_url: 'https://pro-blog.com/images/nodejs.jpg',
          category: 'Technology',
          tags: ['Node.js', 'Performance', 'Backend'],
          status: 'pending',
          has_adult_content: false,
          is_live: false,
          views: 0,
          clicks: 0,
          submitted_at: '2025-01-24T11:30:00Z',
          created_at: '2025-01-24T11:30:00Z',
          updated_at: '2025-01-24T11:30:00Z',
          blogger_name: 'Sarah Pro',
          blogger_email: 'sarah@problog.com',
          blogger_tier: 'pro',
          review_count: 0
        },
        {
          id: '3',
          user_id: 'user-3',
          title: 'Getting Started with Web Development',
          description: 'A beginner-friendly guide to starting your web development journey.',
          url: 'https://beginner-blog.com/web-dev-start',
          category: 'Education',
          tags: ['Web Development', 'Beginner', 'Tutorial'],
          status: 'approved',
          has_adult_content: false,
          is_live: true,
          views: 245,
          clicks: 18,
          submitted_at: '2025-01-23T14:00:00Z',
          created_at: '2025-01-23T14:00:00Z',
          updated_at: '2025-01-23T15:30:00Z',
          blogger_name: 'Mike Beginner',
          blogger_email: 'mike@beginblog.com',
          blogger_tier: 'free',
          review_count: 1
        }
      ];

      let filteredSubmissions = mockSubmissions;

      // Apply status filter
      if (filter !== 'all') {
        filteredSubmissions = filteredSubmissions.filter(sub => sub.status === filter);
      }

      // Apply tier filter
      if (tierFilter !== 'all') {
        filteredSubmissions = filteredSubmissions.filter(sub => sub.blogger_tier === tierFilter);
      }

      // Apply date sorting
      if (dateFilter !== 'all') {
        // Sort by date
        filteredSubmissions = filteredSubmissions.sort((a, b) => {
          const dateA = new Date(a.submitted_at || a.created_at);
          const dateB = new Date(b.submitted_at || b.created_at);
          
          if (dateFilter === 'newest') {
            return dateB.getTime() - dateA.getTime(); // Most recent first
          } else {
            return dateA.getTime() - dateB.getTime(); // Oldest first
          }
        });
      }

      setSubmissions(filteredSubmissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    }
  };

  const loadBlogPosts = () => {
    const posts = getAllInternalBlogPosts();
    setBlogPosts(posts);
  };

  const handleReviewSubmission = (submission: BlogSubmissionWithReview, action: 'approve' | 'reject') => {
    setSelectedSubmission(submission);
    setReviewAction(action);
    setShowReviewModal(true);
    setRejectionReason('');
    setRejectionNote('');
  };

  const submitReview = async () => {
    if (!selectedSubmission || !reviewAction) return;

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Blog submission ${reviewAction}d successfully!`);
      setShowReviewModal(false);
      setSelectedSubmission(null);
      setReviewAction(null);
      loadSubmissions();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to process review. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddNew = () => {
    setEditingPost(undefined);
    setMode('add');
    setShowManager(true);
  };

  const handleEdit = (post: InternalBlogPost) => {
    setEditingPost(post);
    setMode('edit');
    setShowManager(true);
  };

  const handleDelete = (postId: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      deleteInternalBlogPost(postId);
      loadBlogPosts();
    }
  };

  const handleCloseManager = () => {
    setShowManager(false);
    setEditingPost(undefined);
    loadBlogPosts();
  };

  // Email testing functions
  const testEmailTemplates = [
    {
      name: 'Welcome Reader',
      endpoint: '/api/test-email/welcome-reader',
      params: { firstName: testFirstName }
    },
    {
      name: 'Welcome Blogger',
      endpoint: '/api/test-email/welcome-blogger',
      params: { firstName: testFirstName }
    },
    {
      name: 'Blog Submission Received',
      endpoint: '/api/test-email/blog-submission-received',
      params: { firstName: testFirstName, blogTitle: 'My Awesome Blog Post' }
    },
    {
      name: 'Blog Approved',
      endpoint: '/api/test-email/blog-approved',
      params: { firstName: testFirstName, blogTitle: 'My Awesome Blog Post', blogUrl: 'https://example.com/blog' }
    },
    {
      name: 'Blog Rejected',
      endpoint: '/api/test-email/blog-rejected',
      params: { firstName: testFirstName, blogTitle: 'My Blog Post', rejectionReason: 'Content quality', rejectionNote: 'Please improve readability' }
    },
    {
      name: 'Password Reset',
      endpoint: '/api/test-email/password-reset',
      params: { firstName: testFirstName, resetLink: 'https://blogrolly.com/reset?token=test123' }
    },
    {
      name: 'Bug Report Received',
      endpoint: '/api/test-email/bug-report-received',
      params: { firstName: testFirstName, reportId: 'BUG-001' }
    },
    {
      name: 'Support Request Received',
      endpoint: '/api/test-email/support-request-received',
      params: { firstName: testFirstName, ticketId: 'SUPPORT-001', supportMessage: 'I need help with my account' }
    },
    {
      name: 'Support Request Reply',
      endpoint: '/api/test-email/support-request-reply',
      params: { firstName: testFirstName, ticketId: 'SUPPORT-001', originalMessage: 'I need help', supportReply: 'We are here to help you!' }
    },
    {
      name: 'Payment Successful',
      endpoint: '/api/test-email/payment-successful',
      params: { firstName: testFirstName, amount: '$9.99', planName: 'Pro Monthly', invoiceUrl: 'https://example.com/invoice', nextBillingDate: '2025-02-28' }
    },
    {
      name: 'Payment Failed (First Notice)',
      endpoint: '/api/test-email/payment-failed-first',
      params: { firstName: testFirstName, planName: 'Pro Monthly', amount: '$9.99', retryDate: '2025-02-03' }
    },
    {
      name: 'Blog Delisted Payment',
      endpoint: '/api/test-email/blog-delisted-payment',
      params: { firstName: testFirstName, blogCount: 3, amount: '$9.99' }
    }
  ];

  const sendTestEmail = async (template: any) => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setEmailTestLoading(true);
    try {
      const response = await fetch(template.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          ...template.params
        }),
      });

      const result = await response.json();
      setEmailTestResults(prev => [...prev, {
        template: template.name,
        success: response.ok,
        result,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setEmailTestResults(prev => [...prev, {
        template: template.name,
        success: false,
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
    setEmailTestLoading(false);
  };

  const sendAllTestEmails = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setEmailTestLoading(true);
    setEmailTestResults([]);
    
    for (const template of testEmailTemplates) {
      await sendTestEmail(template);
      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setEmailTestLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const getRejectionReasons = (): { value: RejectionReason; label: string }[] => {
    return [
      { value: 'inappropriate_content', label: 'Inappropriate Content' },
      { value: 'broken_link', label: 'Broken Link' },
      { value: 'spam', label: 'Spam' },
      { value: 'teaser_paywall', label: 'Teaser / Paywall Site' },
      { value: 'malicious_site', label: 'Malicious Site' },
      { value: 'not_a_blog', label: 'Not a Blog' },
      { value: 'duplicate', label: 'Duplicate' },
      { value: 'ai_generated_low_quality', label: 'AI-Generated / Low Quality' },
      { value: 'copyright_violation', label: 'Copyright Violation' }
    ];
  };

  if (isLoading) {
    return (
      <Layout title="Loading...">
        <div className={styles.loading}>
          <h2>Loading admin dashboard...</h2>
          <p>Verifying your admin access...</p>
        </div>
      </Layout>
    );
  }

  if (authError || !adminUser) {
    return (
      <Layout title="Access Error">
        <div className={styles.accessDenied}>
          <h2>Access Error</h2>
          <p>{authError || 'Unable to verify admin access'}</p>
          <p>Redirecting to login...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard - BlogRolly">
      <div className={styles.adminDashboard}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <button 
            onClick={handleSignOut}
            className={styles.signOutButton}
          >
            Sign Out
          </button>
        </div>

        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'submissions' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            Blog Submissions
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'manager' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('manager')}
          >
            Blog Manager
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'linkedin-verifications' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('linkedin-verifications')}
          >
            LinkedIn Verifications
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'bug-reports' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('bug-reports')}
          >
            Bug Reports
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'support-requests' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('support-requests')}
          >
            Support Requests
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'stats' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'email-testing' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('email-testing')}
          >
            Email Testing
          </button>
        </div>

        {activeTab === 'submissions' && (
          <div className={styles.tabContent}>
            <div className={styles.controls}>
              <div className={styles.filterSection}>
                <label htmlFor="status-filter">Filter by Status:</label>
                <select 
                  id="status-filter"
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value as BlogStatus | 'all')}
                  className={styles.filterSelect}
                >
                  <option value="all">All Submissions</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="live">Live</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className={styles.filterSection}>
                <label htmlFor="tier-filter">Filter by Tier:</label>
                <select 
                  id="tier-filter"
                  value={tierFilter} 
                  onChange={(e) => setTierFilter(e.target.value as 'all' | 'free' | 'pro')}
                  className={styles.filterSelect}
                >
                  <option value="all">All Tiers</option>
                  <option value="free">Free Members</option>
                  <option value="pro">Pro Members</option>
                </select>
              </div>

              <div className={styles.filterSection}>
                <label htmlFor="date-filter">Sort by Date:</label>
                <select 
                  id="date-filter"
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value as 'all' | 'newest' | 'oldest')}
                  className={styles.filterSelect}
                >
                  <option value="all">Default Order</option>
                  <option value="newest">Most Recent First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{submissions.length}</span>
                  <span className={styles.statLabel}>Total</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {submissions.filter(s => s.status === 'pending').length}
                  </span>
                  <span className={styles.statLabel}>Pending</span>
                </div>
              </div>
            </div>

            <div className={styles.submissionsGrid}>
              {submissions.length === 0 ? (
                <div className={styles.emptyState}>
                  <h3>No submissions found</h3>
                  <p>No blog submissions match your current filter.</p>
                </div>
              ) : (
                submissions.map((submission) => (
                  <div key={submission.id} className={styles.submissionCard}>
                    <div className={styles.submissionHeader}>
                      <h3 className={styles.submissionTitle}>{submission.title}</h3>
                      <div className={styles.badges}>
                        <span className={`${styles.statusBadge} ${styles[submission.status]}`}>
                          {BlogStatusHelpers.getStatusLabel(submission.status)}
                        </span>
                        <span className={`${styles.tierBadge} ${styles[submission.blogger_tier]}`}>
                          {submission.blogger_tier.toUpperCase()}
                        </span>
                        {submission.has_adult_content && (
                          <span className={styles.adultBadge}>18+</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.submissionMeta}>
                      <p><strong>Blogger:</strong> {submission.blogger_name} ({submission.blogger_email})</p>
                      <p><strong>Category:</strong> {submission.category}</p>
                      <p><strong>URL:</strong> <a href={submission.url} target="_blank" rel="noopener noreferrer">{submission.url}</a></p>
                      <p><strong>Submitted:</strong> {new Date(submission.submitted_at || submission.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className={styles.submissionDescription}>
                      <p>{submission.description}</p>
                    </div>

                    <div className={styles.submissionTags}>
                      {submission.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>{tag}</span>
                      ))}
                    </div>

                    {submission.status === 'pending' && (
                      <div className={styles.actionButtons}>
                        <button 
                          className={styles.approveButton}
                          onClick={() => alert('Approve functionality coming soon!')}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className={styles.rejectButton}
                          onClick={() => alert('Reject functionality coming soon!')}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'manager' && (
          <div className={styles.tabContent}>
            {!showManager ? (
              <>
                <div className={styles.managerHeader}>
                  <h2>Internal Blog Posts</h2>
                  <button 
                    onClick={handleAddNew}
                    className={styles.primaryButton}
                  >
                    Add New Post
                  </button>
                </div>

                <div className={styles.blogPostsGrid}>
                  {blogPosts.length === 0 ? (
                    <div className={styles.emptyState}>
                      <h3>No blog posts found</h3>
                      <p>Start by creating your first internal blog post.</p>
                    </div>
                  ) : (
                    blogPosts.map((post) => (
                      <div key={post.id} className={styles.blogPostCard}>
                        <div className={styles.blogPostHeader}>
                          <h3>{post.title}</h3>
                          <div className={styles.blogPostActions}>
                            <button 
                              className={styles.editButton}
                              onClick={() => handleEdit(post)}
                            >
                              Edit
                            </button>
                            <button 
                              className={styles.deleteButton}
                              onClick={() => handleDelete(post.id)}
                            >
                              Delete
                            </button>
                            <a 
                              href={`/blog/post/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.viewButton}
                            >
                              View
                            </a>
                          </div>
                        </div>

                        <p className={styles.blogPostDescription}>
                          {post.description}
                        </p>

                        <div className={styles.blogPostMeta}>
                          <span>Category: {post.category}</span>
                          <span>Author: {post.author}</span>
                          <span>Published: {new Date(post.publishDate).toLocaleDateString()}</span>
                          <span>Status: {post.isPublished ? 'Published' : 'Draft'}</span>
                        </div>

                        <div className={styles.blogPostTags}>
                          {post.tags.map((tag, index) => (
                            <span key={index} className={styles.tag}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <BlogPostManager
                onClose={handleCloseManager}
                existingPost={editingPost}
                mode={mode}
              />
            )}
          </div>
        )}

        {activeTab === 'linkedin-verifications' && <LinkedInVerifications />}
        {activeTab === 'bug-reports' && <BugReports />}
        {activeTab === 'support-requests' && <SupportRequests />}
        {activeTab === 'stats' && (
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
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <h3>1,247</h3>
                    <p>Total Users</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>342</h3>
                    <p>Active Bloggers</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>905</h3>
                    <p>Readers</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>89</h3>
                    <p>Premium Members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email-testing' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Email Template Testing</h2>
              <p>Test all email templates to ensure they work correctly</p>
            </div>

            <div className={styles.emailTestingForm}>
              <div className={styles.formGroup}>
                <label htmlFor="test-email">Test Email Address:</label>
                <input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className={styles.emailInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="test-first-name">First Name (for personalization):</label>
                <input
                  id="test-first-name"
                  type="text"
                  value={testFirstName}
                  onChange={(e) => setTestFirstName(e.target.value)}
                  placeholder="John"
                  className={styles.emailInput}
                />
              </div>
              
              <button
                onClick={sendAllTestEmails}
                disabled={emailTestLoading || !testEmail}
                className={styles.primaryButton}
                style={{ marginBottom: '20px' }}
              >
                {emailTestLoading ? 'Sending All Tests...' : 'Send All Test Emails'}
              </button>

              <h3>Individual Email Tests</h3>
              <div className={styles.emailTestGrid}>
                {testEmailTemplates.map((template, index) => (
                  <div key={index} className={styles.emailTestItem}>
                    <span className={styles.emailTestName}>{template.name}</span>
                    <button
                      onClick={() => sendTestEmail(template)}
                      disabled={emailTestLoading || !testEmail}
                      className={styles.actionButton}
                    >
                      Send Test
                    </button>
                  </div>
                ))}
              </div>

              {emailTestResults.length > 0 && (
                <div className={styles.emailTestResults}>
                  <h3>Test Results</h3>
                  <div className={styles.resultsContainer}>
                    {emailTestResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`${styles.testResult} ${result.success ? styles.testSuccess : styles.testError}`}
                      >
                        <div className={styles.testResultHeader}>
                          <strong>{result.template}</strong> - {result.timestamp}
                          <span className={styles.testStatus}>
                            {result.success ? '✅ Success' : '❌ Failed'}
                          </span>
                        </div>
                        <div className={styles.testResultDetails}>
                          <small>{JSON.stringify(result.result, null, 2)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;