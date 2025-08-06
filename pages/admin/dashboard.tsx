import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogPostManager from '../../components/BlogPostManager';
import { getAllInternalBlogPosts, deleteInternalBlogPost, InternalBlogPost } from '../../lib/internalBlogData';
import { getAllBugReports, getBugReportById, updateBugReportStatus, BugReport } from '../../lib/bugReportData';
import { getAllSupportRequests, getSupportRequestById, updateSupportRequestStatus, addEmailToThread, SupportRequest } from '../../lib/supportRequestData';
import { BlogSubmission, BlogStatus, RejectionReason, BlogStatusHelpers } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import { securityLogger } from '../../lib/security-logger';
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
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState<RejectionReason | ''>('');
  const [customRejectionReason, setCustomRejectionReason] = useState('');

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

  const handleApproveLinkedIn = async (verificationToken: string, approved: boolean, rejectionReason?: string) => {
    try {
      const response = await fetch('/api/investor/approve-linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationToken,
          approved,
          rejectionReason
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

  const handleRejectVerification = (verification: any) => {
    setSelectedVerification(verification);
    setShowRejectionModal(true);
  };

  const handleSubmitRejection = async () => {
    if (!selectedVerification) return;

    let rejectionReason = selectedRejectionReason;

    if (selectedRejectionReason === 'other') {
      rejectionReason = customRejectionReason;
    }

    await handleApproveLinkedIn(selectedVerification.linkedin_verification_token, false, rejectionReason);
    setShowRejectionModal(false);
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
                      onClick={() => handleRejectVerification(verification)}
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
                onClick={() => handleRejectVerification(verification)}
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

      {/* Rejection Reason Modal */}
      {showRejectionModal && selectedVerification && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Reject LinkedIn Verification</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowRejectionModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.rejectionReasonForm}>
              <div className={styles.rejectionSection}>
                <h5>Investor: {selectedVerification.name}</h5>
                <p>Please select a reason for rejecting this LinkedIn verification:</p>
              </div>

              <div className={styles.rejectionReasons}>
                <label className={styles.reasonOption}>
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="incomplete_profile"
                    checked={selectedRejectionReason === 'incomplete_profile'}
                    onChange={(e) => setSelectedRejectionReason(e.target.value)}
                  />
                  <span>Incomplete LinkedIn profile</span>
                  <small>Profile is missing key professional information</small>
                </label>

                <label className={styles.reasonOption}>
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="insufficient_experience"
                    checked={selectedRejectionReason === 'insufficient_experience'}
                    onChange={(e) => setSelectedRejectionReason(e.target.value)}
                  />
                  <span>Insufficient investment experience</span>
                  <small>Profile lacks relevant investment or business background</small>
                </label>

                <label className={styles.reasonOption}>
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="unverified_identity"
                    checked={selectedRejectionReason === 'unverified_identity'}
                    onChange={(e) => setSelectedRejectionReason(e.target.value)}
                  />
                  <span>Identity verification failed</span>
                  <small>Unable to verify profile belongs to the applicant</small>
                </label>

                <label className={styles.reasonOption}>
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="fake_profile"
                    checked={selectedRejectionReason === 'fake_profile'}
                    onChange={(e) => setSelectedRejectionReason(e.target.value)}
                  />
                  <span>Suspicious or fake profile</span>
                  <small>Profile appears to be inauthentic</small>
                </label>

                <label className={styles.reasonOption}>
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="privacy_settings"
                    checked={selectedRejectionReason === 'privacy_settings'}
                    onChange={(e) => setSelectedRejectionReason(e.target.value)}
                  />
                  <span>Privacy settings too restrictive</span>
                  <small>Profile privacy prevents proper verification</small>
                </label>

                <label className={styles.reasonOption}>
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="other"
                    checked={selectedRejectionReason === 'other'}
                    onChange={(e) => setSelectedRejectionReason(e.target.value)}
                  />
                  <span>Other reason</span>
                  <small>Specify custom rejection reason</small>
                </label>

                {selectedRejectionReason === 'other' && (
                  <div className={styles.customReasonInput}>
                    <textarea
                      value={customRejectionReason}
                      onChange={(e) => setCustomRejectionReason(e.target.value)}
                      placeholder="Please provide a specific reason for rejection..."
                      className={styles.rejectionTextarea}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className={styles.rejectionActions}>
                <button 
                  className={styles.confirmRejectButton}
                  onClick={handleSubmitRejection}
                  disabled={!selectedRejectionReason || (selectedRejectionReason === 'other' && !customRejectionReason.trim())}
                >
                  Confirm Rejection
                </button>
                <button 
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowRejectionModal(false);
                    setSelectedRejectionReason('');
                    setCustomRejectionReason('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SupportRequests = () => {
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'critical'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'responded' | 'closed'>('all');
  const [supportRequestsData, setSupportRequestsData] = useState<SupportRequest[]>([]);
  const [selectedSupportRequest, setSelectedSupportRequest] = useState<SupportRequest | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    // Load support requests data
    const requests = getAllSupportRequests();
    setSupportRequestsData(requests);
  }, []);

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

        if (sortConfig.key === 'date') {
          aValue = a.dateSort;
          bValue = b.dateSort;
        }

        // Special handling for priority column to order low-medium-high-critical
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

  const handleStatusChange = (requestId: string, newStatus: 'open' | 'responded' | 'closed') => {
    const success = updateSupportRequestStatus(requestId, newStatus);
    if (success) {
      // Refresh the data
      const updatedRequests = getAllSupportRequests();
      setSupportRequestsData(updatedRequests);
      alert(`Support request ${requestId} status updated to ${newStatus}`);
    } else {
      alert('Failed to update request status');
    }
  };

  const handleViewSupportRequest = (requestId: string) => {
    const request = getSupportRequestById(requestId);
    if (request) {
      setSelectedSupportRequest(request);
      setShowViewModal(true);
    }
  };

  const handleRespondToRequest = (requestId: string) => {
    const request = getSupportRequestById(requestId);
    if (request) {
      setSelectedSupportRequest(request);
      setShowResponseModal(true);
    }
  };

  const handleSubmitResponse = () => {
    if (!selectedSupportRequest || !adminResponse.trim()) return;

    // Add the admin response to the email thread
    const emailSuccess = addEmailToThread(selectedSupportRequest.id, {
      from: 'admin',
      sender: 'support@blogrolly.com',
      content: adminResponse
    });

    if (emailSuccess) {
      // In a real implementation, you'd also send the actual email here
      const updatedRequests = getAllSupportRequests();
      setSupportRequestsData(updatedRequests);
      setShowResponseModal(false);
      setAdminResponse('');
      alert('Response sent successfully!');
    } else {
      alert('Failed to send response');
    }
  };

  const sortedAndFilteredData = getSortedAndFilteredData();

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Support Requests</h2>
        <p>Manage and respond to user support inquiries</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.status === 'open').length}</h3>
          <p>Open Requests</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.priority === 'high' || item.priority === 'critical').length}</h3>
          <p>High Priority</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.status === 'closed').length}</h3>
          <p>Resolved</p>
        </div>
      </div>

      <div className={styles.tableFilters}>
        <div className={styles.filterGroup}>
          <label htmlFor="priority-filter">Priority:</label>
          <select 
            id="priority-filter"
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low' | 'critical')}
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
          <label htmlFor="status-filter">Status:</label>
          <select 
            id="status-filter"
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
                Request ID{getSortIcon('id')}
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
              <th onClick={() => handleSort('date')} className={styles.sortableHeader}>
                Date{getSortIcon('date')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredData.map((request) => (
              <tr key={request.id}>
                <td><strong>{request.id}</strong></td>
                <td>{request.subject}</td>
                <td>
                  <span className={getPriorityClass(request.priority)}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                </td>
                <td>{request.user}</td>
                <td>
                  <select 
                    value={request.status}
                    onChange={(e) => handleStatusChange(request.id, e.target.value as 'open' | 'responded' | 'closed')}
                    className={`${styles.statusSelect} ${getStatusClass(request.status)}`}
                  >
                    <option value="open">Open</option>
                    <option value="responded">Responded</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td>{request.created}</td>
                <td>
                  <div className={styles.supportRequestActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleViewSupportRequest(request.id)}
                    >
                      View
                    </button>
                    <button 
                      className={styles.approveButton}
                      onClick={() => handleRespondToRequest(request.id)}
                    >
                      Respond
                    </button>
                  </div>
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
                {selectedSupportRequest.email && (
                  <div className={styles.metaItem}>
                    <strong>Contact Email:</strong> {selectedSupportRequest.email}
                  </div>
                )}
                <div className={styles.metaItem}>
                  <strong>Submitted:</strong> {new Date(selectedSupportRequest.submittedAt).toLocaleString()}
                </div>
                <div className={styles.metaItem}>
                  <strong>Messages:</strong> {selectedSupportRequest.emailThread?.length || 0}
                </div>
              </div>

              <div className={styles.supportRequestSection}>
                <h5>Email Conversation</h5>
                <div className={styles.emailThread}>
                  {selectedSupportRequest.emailThread?.map((message, index) => (
                    <div 
                      key={message.id} 
                      className={`${styles.emailMessage} ${message.from === 'admin' ? styles.adminMessage : styles.userMessage}`}
                    >
                      <div className={styles.messageHeader}>
                        <span className={styles.messageSender}>
                          {message.from === 'admin' ? '🛠️ Support Team' : '👤 User'}: {message.sender}
                        </span>
                        <span className={styles.messageTime}>
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.messageContent}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution Analysis */}
              {selectedSupportRequest.emailThread && selectedSupportRequest.emailThread.length > 1 && (
                <div className={styles.supportRequestSection}>
                  <h5>Resolution Analysis</h5>
                  <div className={styles.resolutionAnalysis}>
                    {(() => {
                      const lastMessage = selectedSupportRequest.emailThread[selectedSupportRequest.emailThread.length - 1];
                      const userResponses = selectedSupportRequest.emailThread.filter(msg => msg.from === 'user');
                      const adminResponses = selectedSupportRequest.emailThread.filter(msg => msg.from === 'admin');

                      return (
                        <div className={styles.resolutionDetails}>
                          <p><strong>Admin Responses:</strong> {adminResponses.length}</p>
                          <p><strong>User Responses:</strong> {userResponses.length}</p>
                          <p><strong>Last Message From:</strong> {lastMessage.from === 'admin' ? 'Support Team' : 'User'}</p>
                          <p><strong>Last Activity:</strong> {new Date(lastMessage.timestamp).toLocaleString()}</p>

                          {lastMessage.from === 'user' && adminResponses.length > 0 && (
                            <div className={styles.resolutionSuggestion}>
                              <p>💡 <strong>Suggestion:</strong> User responded after support team. Review their message to determine if:</p>
                              <ul>
                                <li>Issue is resolved (consider closing)</li>
                                <li>Additional assistance needed</li>
                                <li>Follow-up questions remain</li>
                              </ul>
                            </div>
                          )}

                          {lastMessage.from === 'admin' && (
                            <div className={styles.resolutionSuggestion}>
                              <p>⏳ <strong>Status:</strong> Waiting for user response to latest support message.</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.approveButton}
                onClick={() => {
                  setShowViewModal(false);
                  handleRespondToRequest(selectedSupportRequest.id);
                }}
              >
                Respond to Request
              </button>
              {selectedSupportRequest.status !== 'closed' && (
                <button 
                  className={styles.resolveButton}
                  onClick={() => {
                    if (confirm('Are you sure you want to close this support request? This should only be done when the issue is fully resolved.')) {
                      handleStatusChange(selectedSupportRequest.id, 'closed');
                      setShowViewModal(false);
                    }
                  }}
                >
                  Mark as Resolved
                </button>
              )}
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

      {/* Response Modal */}
      {showResponseModal && selectedSupportRequest && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Respond to Support Request - {selectedSupportRequest.id}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowResponseModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.responseForm}>
              <div className={styles.supportRequestSection}>
                <h5>Original Request</h5>
                <p><strong>Subject:</strong> {selectedSupportRequest.subject}</p>
                <p><strong>Message:</strong> {selectedSupportRequest.message}</p>
              </div>

              <div className={styles.supportRequestSection}>
                <h5>Your Response</h5>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Type your response to the user..."
                  className={styles.responseTextarea}
                  rows={6}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.approveButton}
                onClick={handleSubmitResponse}
                disabled={!adminResponse.trim()}
              >
                Send Response
              </button>
              <button 
                className={styles.cancelButton}
                onClick={() => {
                  setShowResponseModal(false);
                  setAdminResponse('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sentry monitoring component
const SentryMonitoring = () => {
  const [sentryStats, setSentryStats] = useState<any>({
    recentErrors: [],
    errorCount24h: 0,
    userAffected: 0,
    performanceScore: 0,
    isConfigured: false
  });
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSentryData();
    // Refresh every 5 minutes
    const interval = setInterval(loadSentryData, 300000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadSentryData = async () => {
    setLoading(true);
    try {
      // Check if Sentry is configured
      const isConfigured = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

      if (!isConfigured) {
        setSentryStats(prev => ({ ...prev, isConfigured: false }));
        setLoading(false);
        return;
      }

      // In a real implementation, you would fetch from Sentry API
      // For now, we'll simulate some data
      const mockData = {
        recentErrors: [
          {
            id: '1',
            title: 'TypeError: Cannot read property of undefined',
            culprit: 'components/BlogSubmissionForm.tsx',
            count: 12,
            userCount: 8,
            firstSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            lastSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            level: 'error',
            project: 'blogrolly-frontend'
          },
          {
            id: '2',
            title: 'Network Error: Failed to fetch',
            culprit: 'lib/supabase.ts',
            count: 5,
            userCount: 4,
            firstSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            lastSeen: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            level: 'error',
            project: 'blogrolly-frontend'
          },
          {
            id: '3',
            title: 'Stripe payment processing failed',
            culprit: 'pages/api/stripe/checkout.ts',
            count: 2,
            userCount: 2,
            firstSeen: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            level: 'error',
            project: 'blogrolly-backend'
          }
        ],
        errorCount24h: 19,
        userAffected: 14,
        performanceScore: 87,
        isConfigured: true
      };

      setSentryStats(mockData);
    } catch (error) {
      console.error('Failed to load Sentry data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getErrorLevelClass = (level: string) => {
    switch (level) {
      case 'error': return styles.errorLevelError;
      case 'warning': return styles.errorLevelWarning;
      case 'info': return styles.errorLevelInfo;
      default: return '';
    }
  };

  const getErrorLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  const openSentryDashboard = () => {
    if (sentryStats.isConfigured) {
      // In a real implementation, you'd construct the actual Sentry URL
      window.open('https://sentry.io/organizations/your-org/projects/', '_blank');
    } else {
      alert('Sentry is not configured. Please set NEXT_PUBLIC_SENTRY_DSN in your environment variables.');
    }
  };

  const resolveError = (errorId: string) => {
    // In a real implementation, you'd call Sentry API to resolve the error
    alert(`Resolving error ${errorId} (demo - implement Sentry API integration)`);
  };

  if (!sentryStats.isConfigured) {
    return (
      <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
          <h2>Error Tracking (Sentry)</h2>
          <p>Sentry error tracking is not configured</p>
        </div>

        <div className={styles.configurationRequired}>
          <div className={styles.configCard}>
            <h3>🔧 Setup Required</h3>
            <p>To enable error tracking, you need to configure Sentry:</p>
            <ol>
              <li>Create a Sentry account at <a href="https://sentry.io" target="_blank" rel="noopener noreferrer">sentry.io</a></li>
              <li>Create a new project for BlogRolly</li>
              <li>Copy your DSN from the project settings</li>
              <li>Add <code>NEXT_PUBLIC_SENTRY_DSN</code> to your environment variables</li>
              <li>Restart your application</li>
            </ol>
            <button 
              className={styles.primaryButton}
              onClick={() => window.open('https://sentry.io', '_blank')}
            >
              Go to Sentry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
          <h2>Error Tracking (Sentry)</h2>
          <p>Loading error tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Error Tracking (Sentry)</h2>
        <p>Monitor application errors and performance metrics</p>
        <button 
          className={styles.primaryButton}
          onClick={openSentryDashboard}
        >
          Open Full Sentry Dashboard
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{sentryStats.errorCount24h}</h3>
          <p>Errors (24h)</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sentryStats.userAffected}</h3>
          <p>Users Affected</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sentryStats.performanceScore}%</h3>
          <p>Performance Score</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sentryStats.recentErrors.length}</h3>
          <p>Active Issues</p>
        </div>
      </div>

      <div className={styles.tableFilters}>
        <div className={styles.filterGroup}>
          <label htmlFor="time-range-filter">Time Range:</label>
          <select 
            id="time-range-filter"
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        <button 
          className={styles.refreshButton}
          onClick={loadSentryData}
        >
          refresh
        </button>
      </div>

      <div className={styles.sentryErrorsList}>
        <h3>Recent Errors</h3>
        {sentryStats.recentErrors.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No recent errors! 🎉</h3>
            <p>Your application is running smoothly.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Error</th>
                  <th>Location</th>
                  <th>Count</th>
                  <th>Users</th>
                  <th>Last Seen</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sentryStats.recentErrors.map((error: any) => (
                  <tr key={error.id}>
                    <td>
                      <div className={styles.errorInfo}>
                        <span className={`${styles.errorLevel} ${getErrorLevelClass(error.level)}`}>
                          {getErrorLevelIcon(error.level)}
                        </span>
                        <div>
                          <strong>{error.title}</strong>
                          <div className={styles.errorProject}>{error.project}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className={styles.errorCulprit}>{error.culprit}</code>
                    </td>
                    <td>
                      <span className={styles.errorCount}>{error.count}</span>
                    </td>
                    <td>
                      <span className={styles.userCount}>{error.userCount}</span>
                    </td>
                    <td>
                      <span className={styles.timestamp}>
                        {new Date(error.lastSeen).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div className={styles.errorActions}>
                        <button 
                          className={styles.actionButton}
                          onClick={() => window.open(`https://sentry.io/organizations/your-org/issues/${error.id}/`, '_blank')}
                        >
                          View
                        </button>
                        <button 
                          className={styles.resolveButton}
                          onClick={() => resolveError(error.id)}
                        >
                          Resolve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.sentryInsights}>
        <h3>Insights & Recommendations</h3>
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <h4>🔥 Most Frequent Error</h4>
            <p>TypeError in BlogSubmissionForm.tsx</p>
            <small>12 occurrences affecting 8 users</small>
          </div>
          <div className={styles.insightCard}>
            <h4>📈 Error Trend</h4>
            <p>19% increase from last week</p>
            <small>Consider reviewing recent deployments</small>
          </div>
          <div className={styles.insightCard}>
            <h4>⚡ Performance</h4>
            <p>Average response time: 240ms</p>
            <small>Performance score: {sentryStats.performanceScore}%</small>
          </div>
          <div className={styles.insightCard}>
            <h4>🎯 Priority Focus</h4>
            <p>Frontend error handling</p>
            <small>Most errors originate from client-side code</small>
          </div>
        </div>
      </div>
    </div>
  );
};

// Security monitoring component
const SecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'rate_limit' | 'auth_attempt' | 'suspicious_request' | 'error'>('all');
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [suspiciousIPs, setSuspiciousIPs] = useState<string[]>([]);

  useEffect(() => {
    loadSecurityData();
    // Refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, [eventTypeFilter, timeFilter]);

  const loadSecurityData = () => {
    // Get recent security events
    const events = securityLogger.getRecentEvents(eventTypeFilter === 'all' ? undefined : eventTypeFilter, 100);

    // Filter by time
    const now = new Date();
    const filteredEvents = events.filter(event => {
      const eventTime = new Date(event.timestamp);
      const hoursDiff = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);

      switch (timeFilter) {
        case '24h': return hoursDiff <= 24;
        case '7d': return hoursDiff <= 168; // 7 * 24
        case '30d': return hoursDiff <= 720; // 30 * 24
        default: return true;
      }
    });

    setSecurityEvents(filteredEvents);
    setSuspiciousIPs(securityLogger.getSuspiciousIPs());
  };

  const getEventTypeClass = (type: string) => {
    switch (type) {
      case 'rate_limit': return styles.eventRateLimit;
      case 'auth_attempt': return styles.eventAuthAttempt;
      case 'suspicious_request': return styles.eventSuspicious;
      case 'error': return styles.eventError;
      default: return '';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'rate_limit': return '🚦';
      case 'auth_attempt': return '🔐';
      case 'suspicious_request': return '⚠️';
      case 'error': return '❌';
      default: return '📋';
    }
  };

  const blockSuspiciousIP = async (ip: string) => {
    // In a real implementation, you would add this IP to a blocklist
    // For now, we'll just show an alert
    if (confirm(`Block IP address ${ip}? This will prevent all requests from this IP.`)) {
      alert(`IP ${ip} has been blocked. (This is a demo - implement actual IP blocking in production)`);
    }
  };

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Security Monitoring</h2>
        <p>Monitor suspicious activities and security events</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{securityEvents.filter(e => e.type === 'rate_limit').length}</h3>
          <p>Rate Limit Events</p>
        </div>
        <div className={styles.statCard}>
          <h3>{securityEvents.filter(e => e.type === 'suspicious_request').length}</h3>
          <p>Suspicious Requests</p>
        </div>
        <div className={styles.statCard}>
          <h3>{suspiciousIPs.length}</h3>
          <p>Flagged IPs</p>
        </div>
        <div className={styles.statCard}>
          <h3>{securityEvents.filter(e => e.type === 'auth_attempt').length}</h3>
          <p>Auth Attempts</p>
        </div>
      </div>

      {suspiciousIPs.length > 0 && (
        <div className={styles.suspiciousIPsSection}>
          <h3>🚨 Suspicious IP Addresses</h3>
          <div className={styles.suspiciousIPsList}>
            {suspiciousIPs.map((ip, index) => (
              <div key={index} className={styles.suspiciousIPItem}>
                <span className={styles.ipAddress}>{ip}</span>
                <div className={styles.ipActions}>
                  <button 
                    className={styles.blockButton}
                    onClick={() => blockSuspiciousIP(ip)}
                  >
                    Block IP
                  </button>
                  <button 
                    className={styles.whitelistButton}
                    onClick={() => alert(`IP ${ip} whitelisted (demo)`)}
                  >
                    Whitelist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.tableFilters}>
        <div className={styles.filterGroup}>
          <label htmlFor="event-type-filter">Event Type:</label>
          <select 
            id="event-type-filter"
            value={eventTypeFilter} 
            onChange={(e) => setEventTypeFilter(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="all">All Events</option>
            <option value="rate_limit">Rate Limits</option>
            <option value="auth_attempt">Auth Attempts</option>
            <option value="suspicious_request">Suspicious Requests</option>
            <option value="error">Errors</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="time-filter">Time Range:</label>
          <select 
            id="time-filter"
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className={styles.resultsInfo}>
          Showing {securityEvents.length} security events
        </div>

        <button 
          className={styles.refreshButton}
          onClick={loadSecurityData}
        >
          refresh
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Type</th>
              <th>IP Address</th>
              <th>User Agent</th>
              <th>Details</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {securityEvents.map((event, index) => (
              <tr key={index}>
                <td>
                  <span className={`${styles.eventTypeBadge} ${getEventTypeClass(event.type)}`}>
                    {getEventTypeIcon(event.type)} {event.type.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={styles.ipAddress}>{event.ip}</span>
                  {suspiciousIPs.includes(event.ip) && (
                    <span className={styles.suspiciousFlag}>🚨</span>
                  )}
                </td>
                <td>
                  <span className={styles.userAgent}>
                    {event.userAgent ? event.userAgent.substring(0, 50) + '...' : 'Unknown'}
                  </span>
                </td>
                <td>
                  <div className={styles.eventDetails}>
                    {typeof event.details === 'object' ? JSON.stringify(event.details, null, 2) : event.details}
                  </div>
                </td>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
                <td>
                  <div className={styles.securityActions}>
                    <button 
                      className={styles.blockButton}
                      onClick={() => blockSuspiciousIP(event.ip)}
                    >
                      Block
                    </button>
                    <button 
                      className={styles.investigateButton}
                      onClick={() => alert(`Investigating IP ${event.ip} (demo)`)}
                    >
                      Investigate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {securityEvents.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No security events found</h3>
            <p>No security events match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('submissions');
  const [submissions, setSubmissions] = useState<BlogSubmissionWithReview[]>([]);
  const [filter, setFilter] = useState<BlogStatus | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'newest' | 'oldest'>('all');
  const [loading, setLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState<InternalBlogPost[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [editingPost, setEditingPost] = useState<InternalBlogPost | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [testEmail, setTestEmail] = useState('');
  const [testFirstName, setTestFirstName] = useState('');
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [emailTestResults, setEmailTestResults] = useState<any[]>([]);
  const [discordTestLoading, setDiscordTestLoading] = useState(false);
  const [discordTestResult, setDiscordTestResult] = useState<any>(null);

  const testEmailTemplates = [
    { name: 'Welcome Blogger', endpoint: '/api/test-email/welcome-blogger' },
    { name: 'Welcome Reader', endpoint: '/api/test-email/welcome-reader' },
    { name: 'Blog Submission Received', endpoint: '/api/test-email/blog-submission-received' },
    { name: 'Blog Approved', endpoint: '/api/test-email/blog-approved' },
    { name: 'Blog Rejected', endpoint: '/api/test-email/blog-rejected' },
    { name: 'Payment Successful', endpoint: '/api/test-email/payment-successful' },
    { name: 'Payment Failed First Notice', endpoint: '/api/test-email/payment-failed-first' },
    { name: 'Blog Delisted Payment', endpoint: '/api/test-email/blog-delisted-payment' },
    { name: 'Bug Report Received', endpoint: '/api/test-email/bug-report-received' },
    { name: 'Support Request Received', endpoint: '/api/test-email/support-request-received' },
    { name: 'Support Request Reply', endpoint: '/api/test-email/support-request-reply' },
    { name: 'Password Reset', endpoint: '/api/test-email/password-reset' }
  ];

  useEffect(() => {
    loadSubmissions();
    loadBlogPosts();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const { data: submissionsData, error } = await supabase
        .from('blog_submissions')
        .select(`
          *,
          blogger_profiles (
            display_name,
            email,
            tier
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const submissionsWithReview = submissionsData?.map(submission => ({
        ...submission,
        blogger_name: submission.blogger_profiles?.display_name || 'Unknown',
        blogger_email: submission.blogger_profiles?.email || 'unknown@email.com',
        blogger_tier: submission.blogger_profiles?.tier || 'free',
        review_count: 0,
        last_reviewed_at: null
      })) || [];

      // Add mock data for testing purposes when no real data exists
      if (submissionsWithReview.length === 0) {
        const mockSubmissions: BlogSubmissionWithReview[] = [
          {
            id: 'mock-1',
            user_id: 'user-1',
            title: 'The Future of Remote Work: 10 Trends Shaping 2025',
            description: 'An in-depth analysis of how remote work is evolving and what trends will dominate the workplace in 2025. From AI-powered collaboration tools to virtual reality offices.',
            url: 'https://techinsights.blog/remote-work-trends-2025',
            image_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop',
            image_description: 'Modern office workspace with laptops and technology',
            category: 'Tech',
            tags: ['remote work', 'technology', 'future of work', 'AI', 'productivity'],
            status: 'pending',
            has_adult_content: false,
            is_live: false,
            views: 0,
            clicks: 0,
            ctr: 0,
            bounce_rate: 0,
            submitted_at: '2025-01-25T10:30:00Z',
            created_at: '2025-01-25T10:30:00Z',
            updated_at: '2025-01-25T10:30:00Z',
            blogger_name: 'Sarah Chen',
            blogger_email: 'sarah.chen@techinsights.blog',
            blogger_tier: 'pro',
            review_count: 0,
            last_reviewed_at: null
          },
          {
            id: 'mock-9',
            user_id: 'user-9',
            title: '15 Quick Breakfast Recipes for Busy Mornings',
            description: 'Start your day right with these nutritious and delicious breakfast recipes that take less than 10 minutes to prepare.',
            url: 'https://quickbreakfast.blog/15-quick-recipes',
            image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=250&fit=crop',
            image_description: 'Colorful breakfast spread with fruits and toast',
            category: 'Food',
            tags: ['breakfast', 'quick recipes', 'healthy eating', 'meal prep', 'nutrition'],
            status: 'pending',
            has_adult_content: false,
            is_live: false,
            views: 0,
            clicks: 0,
            ctr: 0,
            bounce_rate: 0,
            submitted_at: '2025-01-25T11:45:00Z',
            created_at: '2025-01-25T11:45:00Z',
            updated_at: '2025-01-25T11:45:00Z',
            blogger_name: 'Chef Maria',
            blogger_email: 'maria@quickbreakfast.blog',
            blogger_tier: 'free',
            review_count: 0,
            last_reviewed_at: null
          },
          {
            id: 'mock-10',
            user_id: 'user-10',
            title: 'Building Your First E-commerce Store: A Complete Guide',
            description: 'Everything you need to know about starting an online store, from choosing platforms to marketing strategies.',
            url: 'https://ecommerceguide.com/first-store-guide',
            image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop',
            image_description: 'Online shopping cart interface on laptop screen',
            category: 'Business',
            tags: ['e-commerce', 'online business', 'entrepreneurship', 'shopify', 'marketing'],
            status: 'approved',
            has_adult_content: false,
            is_live: false,
            views: 0,
            clicks: 0,
            ctr: 0,
            bounce_rate: 0,
            submitted_at: '2025-01-24T14:20:00Z',
            approved_at: '2025-01-25T09:15:00Z',
            created_at: '2025-01-24T14:20:00Z',
            updated_at: '2025-01-25T09:15:00Z',
            blogger_name: 'Ryan Mitchell',
            blogger_email: 'ryan@ecommerceguide.com',
            blogger_tier: 'pro',
            review_count: 1,
            last_reviewed_at: '2025-01-25T09:15:00Z'
          },
          {
            id: 'mock-11',
            user_id: 'user-11',
            title: 'Photography Tips: Mastering Natural Light',
            description: 'Learn professional photography techniques for capturing stunning photos using only natural light sources.',
            url: 'https://photographyessentials.co/natural-light-tips',
            image_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=250&fit=crop',
            image_description: 'Camera with natural lighting setup',
            category: 'Art',
            tags: ['photography', 'natural light', 'portrait photography', 'techniques', 'camera tips'],
            status: 'rejected',
            has_adult_content: false,
            is_live: false,
            views: 0,
            clicks: 0,
            ctr: 0,
            bounce_rate: 0,
            submitted_at: '2025-01-23T09:30:00Z',
            rejected_at: '2025-01-24T16:45:00Z',
            created_at: '2025-01-23T09:30:00Z',
            updated_at: '2025-01-24T16:45:00Z',
            blogger_name: 'Lisa Park',
            blogger_email: 'lisa@photographyessentials.co',
            blogger_tier: 'free',
            review_count: 1,
            last_reviewed_at: '2025-01-24T16:45:00Z'
          },
          {
            id: 'mock-12',
            user_id: 'user-12',
            title: 'Travel Hacks: How to Pack Light and Smart',
            description: 'Expert tips for minimalist travel packing that will save you money and stress on your next adventure.',
            url: 'https://smarttravel.blog/packing-light-guide',
            image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop',
            image_description: 'Organized travel suitcase with folded clothes',
            category: 'Travel',
            tags: ['travel', 'packing', 'minimalism', 'travel tips', 'budget travel'],
            status: 'live',
            has_adult_content: false,
            is_live: true,
            views: 2156,
            clicks: 187,
            ctr: 0.0867,
            bounce_rate: 0.24,
            submitted_at: '2025-01-20T12:15:00Z',
            approved_at: '2025-01-21T08:30:00Z',
            live_at: '2025-01-21T08:30:00Z',
            created_at: '2025-01-20T12:15:00Z',
            updated_at: '2025-01-21T08:30:00Z',
            blogger_name: 'Adventure Alex',
            blogger_email: 'alex@smarttravel.blog',
            blogger_tier: 'pro',
            review_count: 1,
            last_reviewed_at: '2025-01-21T08:30:00Z'
          },
          {
            id: 'mock-13',
            user_id: 'user-13',
            title: 'Understanding Personal Finance: Budget Basics',
            description: 'A beginner-friendly guide to creating and maintaining a personal budget that actually works.',
            url: 'https://moneywise101.com/budget-basics',
            image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
            image_description: 'Calculator and financial planning documents',
            category: 'Finance',
            tags: ['personal finance', 'budgeting', 'money management', 'savings', 'financial planning'],
            status: 'pending',
            has_adult_content: false,
            is_live: false,
            views: 0,
            clicks: 0,
            ctr: 0,
            bounce_rate: 0,
            submitted_at: '2025-01-25T07:20:00Z',
            created_at: '2025-01-25T07:20:00Z',
            updated_at: '2025-01-25T07:20:00Z',
            blogger_name: 'Financial Frank',
            blogger_email: 'frank@moneywise101.com',
            blogger_tier: 'free',
            review_count: 0,
            last_reviewed_at: null
          },
          {
            id: 'mock-2',
            user_id: 'user-2',
            title: 'Mindful Morning Routines for Better Mental Health',
            description: 'Discover science-backed morning practices that can improve your mental well-being, reduce anxiety, and set a positive tone for your entire day.',
            url: 'https://wellnessjourney.com/mindful-morning-routines',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
            image_description: 'Peaceful morning scene with coffee and journal',
            category: 'Lifestyle',
            tags: ['mental health', 'morning routine', 'mindfulness', 'wellness', 'self-care'],
            status: 'approved',
            has_adult_content: false,
            is_live: true,
            views: 1247,
            clicks: 89,
            ctr: 0.0714,
            bounce_rate: 0.32,
            submitted_at: '2025-01-24T09:15:00Z',
            approved_at: '2025-01-24T14:22:00Z',
            live_at: '2025-01-24T14:22:00Z',
            created_at: '2025-01-24T09:15:00Z',
            updated_at: '2025-01-24T14:22:00Z',
            blogger_name: 'Maya Rodriguez',
            blogger_email: 'maya@wellnessjourney.com',
            blogger_tier: 'free',
            review_count: 1,
            last_reviewed_at: '2025-01-24T14:22:00Z'
          },
          {
            id: 'mock-3',
            user_id: 'user-3',
            title: 'Cryptocurrency Investment Guide for Beginners',
            description: 'A comprehensive beginner\'s guide to cryptocurrency investing, covering basics, risk management, and practical strategies for new investors.',
            url: 'https://cryptobeginners101.com/investment-guide',
            image_url: 'https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=400&h=250&fit=crop',
            image_description: 'Bitcoin and cryptocurrency concept with digital graphics',
            category: 'Finance',
            tags: ['cryptocurrency', 'investing', 'bitcoin', 'finance', 'beginners guide'],
            status: 'rejected',
            has_adult_content: false,
            is_live: false,
            views: 0,
            clicks: 0,
            ctr: 0,
            bounce_rate: 0,
            submitted_at: '2025-01-23T16:45:00Z',
            rejected_at: '2025-01-24T11:10:00Z',
            created_at: '2025-01-23T16:45:00Z',
            updated_at: '2025-01-24T11:10:00Z',
            blogger_name: 'Alex Thompson',
            blogger_email: 'alex@cryptobeginners101.com',
            blogger_tier: 'free',
            review_count: 1,
            last_reviewed_at: '2025-01-24T11:10:00Z'
          },
          {
            id: 'mock-4',
            user_id: 'user-4',
            title: 'Plant-Based Nutrition: Complete Protein Sources',
            description: 'Everything you need to know about getting complete proteins from plant-based sources. Includes meal plans, recipes, and nutritional breakdowns.',
            url: 'https://plantpowereats.com/complete-proteins',
            image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop',
            image_description: 'Colorful array of plant-based foods and vegetables',
            category: 'Health',
            tags: ['plant-based', 'nutrition', 'protein', 'vegan', 'healthy eating'],
            status: 'live',
            has_adult_content: false,
            is_live: true,
            views: 892,
            clicks: 67,
            ctr: 0.0751,
            bounce_rate: 0.28,
            submitted_at: '2025-01-22T13:20:00Z',
            approved_at: '2025-01-22T17:45:00Z',
            live_at: '2025-01-22T17:45:00Z',
            created_at: '2025-01-22T13:20:00Z',
            updated_at: '2025-01-22T17:45:00Z',
            blogger_name: 'Jordan Kim',
            blogger_email: 'jordan@plantpowereats.com',
            blogger_tier: 'pro',
            review_count: 1,
            last_reviewed_at: '2025-01-22T17:45:00Z'
          },
          {
            id: 'mock-5',
            user_id: 'user-5',
            title: 'Digital Marketing Strategies for Small Businesses',
            description: 'Practical, budget-friendly digital marketing strategies that small business owners can implement immediately to grow their online presence.',
            url: 'https://smallbizmarketing.co/digital-strategies',
            image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
            image_description: 'Digital marketing analytics dashboard on computer screen',
            category: 'Business',
            tags: ['digital marketing', 'small business', 'social media', 'SEO', 'entrepreneurship'],
            status: 'pending',
            has_adult_content: false,
            is_live: false,
            views: 0,
            clicks: 0,
            ctr: 0,
            bounce_rate: 0,
            submitted_at: '2025-01-25T08:12:00Z',
            created_at: '2025-01-25T08:12:00Z',
            updated_at: '2025-01-25T08:12:00Z',
            blogger_name: 'Emily Foster',
            blogger_email: 'emily@smallbizmarketing.co',
            blogger_tier: 'free',
            review_count: 0,
            last_reviewed_at: null
          },
          {
            id: 'mock-6',
            user_id: 'user-6',
            title: 'Sustainable Fashion: Building an Ethical Wardrobe',
            description: 'A comprehensive guide to sustainable fashion, including how to identify ethical brands, care for clothes to make them last longer, and build a capsule wardrobe.',
            url: 'https://ethicalstyle.blog/sustainable-wardrobe-guide',
            image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=250&fit=crop',
            image_description: 'Sustainable clothing hanging on wooden hangers',
            category: 'Lifestyle',
            tags: ['sustainable fashion', 'ethical clothing', 'environment', 'minimalism', 'conscious living'],
            status: 'approved',
            has_adult_content: false,
            is_live: false,
            views: 0,
            clicks: 0,
            ctr: 0,
            bounce_rate: 0,
            submitted_at: '2025-01-21T15:30:00Z',
            approved_at: '2025-01-22T09:15:00Z',
            created_at: '2025-01-21T15:30:00Z',
            updated_at: '2025-01-22T09:15:00Z',
            blogger_name: 'Ava Martinez',
            blogger_email: 'ava@ethicalstyle.blog',
            blogger_tier: 'pro',
            review_count: 1,
            last_reviewed_at: '2025-01-22T09:15:00Z'
          },
          {
            id: 'mock-7',
            user_id: 'user-7',
            title: 'Home Workout Routines: No Equipment Needed',
            description: 'Effective workout routines you can do at home without any equipment. Includes beginner to advanced exercises with video demonstrations.',
            url: 'https://homefitness.guide/no-equipment-workouts',
            image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
            image_description: 'Person doing bodyweight exercises at home',
            category: 'Health',
            tags: ['fitness', 'home workouts', 'bodyweight exercises', 'health', 'no equipment'],
            status: 'inactive',
            has_adult_content: false,
            is_live: false,
            views: 567,
            clicks: 34,
            ctr: 0.0600,
            bounce_rate: 0.41,
            submitted_at: '2025-01-20T11:45:00Z',
            approved_at: '2025-01-20T16:20:00Z',
            live_at: '2025-01-20T16:20:00Z',
            created_at: '2025-01-20T11:45:00Z',
            updated_at: '2025-01-24T10:30:00Z',
            blogger_name: 'Marcus Johnson',
            blogger_email: 'marcus@homefitness.guide',
            blogger_tier: 'free',
            review_count: 1,
            last_reviewed_at: '2025-01-20T16:20:00Z'
          },
          {
            id: 'mock-8',
            user_id: 'user-8',
            title: 'Adult Content Warning: Relationship Intimacy Guide',
            description: 'A mature, educational guide to improving intimacy in relationships. Contains adult themes and is intended for readers 18+.',
            url: 'https://relationshipwellness.com/intimacy-guide',
            image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=250&fit=crop',
            image_description: 'Romantic couple silhouette at sunset',
            category: 'Lifestyle',
            tags: ['relationships', 'intimacy', 'adult content', 'couples', 'wellness'],
            status: 'pending',
            has_adult_content: true,
            is_live: false,
            views: 0,
            clicks: 0,
            ctr: 0,
            bounce_rate: 0,
            submitted_at: '2025-01-25T14:20:00Z',
            created_at: '2025-01-25T14:20:00Z',
            updated_at: '2025-01-25T14:20:00Z',
            blogger_name: 'Dr. Lisa Chen',
            blogger_email: 'dr.lisa@relationshipwellness.com',
            blogger_tier: 'pro',
            review_count: 0,
            last_reviewed_at: null
          }
        ];

        setSubmissions(mockSubmissions);
      } else {
        setSubmissions(submissionsWithReview);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
      // Fallback to mock data if there's an error loading from database
      const mockSubmissions: BlogSubmissionWithReview[] = [
        {
          id: 'mock-1',
          user_id: 'user-1',
          title: 'The Future of Remote Work: 10 Trends Shaping 2025',
          description: 'An in-depth analysis of how remote work is evolving and what trends will dominate the workplace in 2025.',
          url: 'https://techinsights.blog/remote-work-trends-2025',
          image_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop',
          category: 'Tech',
          tags: ['remote work', 'technology', 'future of work'],
          status: 'pending',
          has_adult_content: false,
          is_live: false,
          views: 0,
          clicks: 0,
          ctr: 0,
          bounce_rate: 0,
          submitted_at: '2025-01-25T10:30:00Z',
          created_at: '2025-01-25T10:30:00Z',
          updated_at: '2025-01-25T10:30:00Z',
          blogger_name: 'Sarah Chen',
          blogger_email: 'sarah.chen@techinsights.blog',
          blogger_tier: 'pro',
          review_count: 0,
          last_reviewed_at: null
        }
      ];
      setSubmissions(mockSubmissions);
    } finally {
      setLoading(false);
    }
  };

  const loadBlogPosts = () => {
    const posts = getAllInternalBlogPosts();
    setBlogPosts(posts);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleAddNew = () => {
    setEditingPost(null);
    setMode('create');
    setShowManager(true);
  };

  const handleEdit = (post: InternalBlogPost) => {
    setEditingPost(post);
    setMode('edit');
    setShowManager(true);
  };

  const handleCloseManager = () => {
    setShowManager(false);
    setEditingPost(null);
    loadBlogPosts();
  };

  const handleDelete = (postId: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      const success = deleteInternalBlogPost(postId);
      if (success) {
        loadBlogPosts();
        alert('Blog post deleted successfully!');
      } else {
        alert('Failed to delete blog post.');
      }
    }
  };

  const sendTestEmail = async (template: any) => {
    if (!testEmail) {
      alert('Please enter a test email address first.');
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
          firstName: testFirstName || 'Test User'
        }),
      });

      const result = await response.json();
      const testResult = {
        template: template.name,
        success: response.ok,
        result: result,
        timestamp: new Date().toLocaleString()
      };

      setEmailTestResults(prev => [testResult, ...prev]);

      if (response.ok) {
        alert(`Test email "${template.name}" sent successfully to ${testEmail}!`);
      } else {
        alert(`Failed to send test email "${template.name}": ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Test email error:', error);
      alert(`Network error sending test email "${template.name}"`);
    } finally {
      setEmailTestLoading(false);
    }
  };

  const sendDiscordTest = async () => {
    setDiscordTestLoading(true);
    setDiscordTestResult(null);

    try {
      const response = await fetch('/api/test-discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setDiscordTestResult({
        success: response.ok,
        result: result,
        timestamp: new Date().toLocaleString()
      });

      if (response.ok) {
        alert('Discord test alert sent successfully! Check your Discord channel.');
      } else {
        alert(`Discord test failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Discord test error:', error);
      setDiscordTestResult({
        success: false,
        result: { error: 'Network error' },
        timestamp: new Date().toLocaleString()
      });
      alert('Network error sending Discord test');
    } finally {
      setDiscordTestLoading(false);
    }
  };

  const sendAllTestEmails = async () => {
    if (!testEmail) {
      alert('Please enter a test email address first.');
      return;
    }

    setEmailTestLoading(true);
    setEmailTestResults([]);

    for (const template of testEmailTemplates) {
      try {
        const response = await fetch(template.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: testEmail,
            firstName: testFirstName || 'Test User'
          }),
        });

        const result = await response.json();
        const testResult = {
          template: template.name,
          success: response.ok,
          result: result,
          timestamp: new Date().toLocaleString()
        };

        setEmailTestResults(prev => [testResult, ...prev]);

        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Test email error for ${template.name}:`, error);
        const testResult = {
          template: template.name,
          success: false,
          result: { error: 'Network error' },
          timestamp: new Date().toLocaleString()
        };
        setEmailTestResults(prev => [testResult, ...prev]);
      }
    }

    setEmailTestLoading(false);
    alert(`All test emails completed! Check results below.`);
  };

  // Filter submissions based on current filters
  const filteredSubmissions = submissions.filter(submission => {
    if (filter !== 'all' && submission.status !== filter) return false;
    if (tierFilter !== 'all' && submission.blogger_tier !== tierFilter) return false;
    return true;
  });

  // Sort submissions based on date filter
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (dateFilter === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (dateFilter === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return 0; // Default order
  });

  if (loading) {
    return (
      <Layout title="Admin Dashboard - BlogRolly">
        <div className={styles.adminDashboard}>
          <div className={styles.loading}>
            <h2>Loading admin dashboard...</h2>
            <p>Please wait while we load your data.</p>
          </div>
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

        <div className={styles.adminContainer}>
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h3>Admin Panel</h3>
            </div>
            <div className={styles.sidebarNav}>
              <button 
                className={`${styles.navItem} ${activeTab === 'submissions' ? styles.active : ''}`}
                onClick={() => setActiveTab('submissions')}
              >
                📝 Blog Submissions
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'manager' ? styles.active : ''}`}
                onClick={() => setActiveTab('manager')}
              >
                📚 Blog Manager
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'linkedin-verifications' ? styles.active : ''}`}
                onClick={() => setActiveTab('linkedin-verifications')}
              >
                💼 LinkedIn Verifications
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'bug-reports' ? styles.active : ''}`}
                onClick={() => setActiveTab('bug-reports')}
              >
                🐛 Bug Reports
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'support-requests' ? styles.active : ''}`}
                onClick={() => setActiveTab('support-requests')}
              >
                🎧 Support Requests
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'stats' ? styles.active : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                📊 Stats
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'email-testing' ? styles.active : ''}`}
                onClick={() => setActiveTab('email-testing')}
              >
                📧 Email Testing
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'security' ? styles.active : ''}`}
                onClick={() => setActiveTab('security')}
              >
                🔒 Security
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'sentry' ? styles.active : ''}`}
                onClick={() => setActiveTab('sentry')}
              >
                🚨 Error Tracking
              </button>
            </div>
          </div>

          <div className={styles.main}>

        {activeTab === 'submissions' && (
          <div className={styles.content}>
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
          <div className={styles.content}>
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
          <div className={styles.content}>
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
          <div className={styles.content}>
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

              {/* Discord Webhook Testing Section */}
              <div className={styles.discordTestSection} style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <h3>Discord Webhook Testing</h3>
                <p>Test the Discord webhook integration for admin notifications</p>
                
                <button
                  onClick={sendDiscordTest}
                  disabled={discordTestLoading}
                  className={styles.primaryButton}
                  style={{ marginBottom: '20px' }}
                >
                  {discordTestLoading ? 'Sending Discord Test...' : 'Send Discord Test Alert'}
                </button>

                {discordTestResult && (
                  <div className={styles.discordTestResults}>
                    <h4>Discord Test Result</h4>
                    <div className={`${styles.testResult} ${discordTestResult.success ? styles.testSuccess : styles.testError}`}>
                      <div className={styles.testResultHeader}>
                        <strong>Discord Webhook Test</strong> - {discordTestResult.timestamp}
                        <span className={styles.testStatus}>
                          {discordTestResult.success ? '✅ Success' : '❌ Failed'}
                        </span>
                      </div>
                      <div className={styles.testResultDetails}>
                        <small>{JSON.stringify(discordTestResult.result, null, 2)}</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && <SecurityMonitoring />}

        {activeTab === 'sentry' && <SentryMonitoring />}
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;