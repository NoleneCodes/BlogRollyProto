import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogPostManager from '../../components/BlogPostManager';
import { getAllInternalBlogPosts, deleteInternalBlogPost, InternalBlogPost } from '../../lib/internalBlogData';
import { getAllBugReports, getBugReportById, updateBugReportStatus, BugReport } from '../../lib/bugReportData';
import { BlogSubmission, BlogStatus, RejectionReason, BlogStatusHelpers } from '../../lib/supabase';
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
                  {bug.status === 'open' && (
                    <button className={styles.actionButton}>Assign</button>
                  )}
                  {bug.status === 'in-progress' && (
                    <button className={styles.actionButton}>Update</button>
                  )}
                  {bug.status === 'resolved' && (
                    <button className={styles.actionButton}>Archive</button>
                  )}
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

const SupportRequests = () => (
  <div className={styles.sectionContent}>
    <div className={styles.sectionHeader}>
      <h2>Support Requests</h2>
      <p>Handle user inquiries and support tickets</p>
    </div>

    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <h3>8</h3>
        <p>Open Tickets</p>
      </div>
      <div className={styles.statCard}>
        <h3>2</h3>
        <p>Urgent</p>
      </div>
      <div className={styles.statCard}>
        <h3>24hr</h3>
        <p>Avg Response Time</p>
      </div>
    </div>

    <div className={styles.tableContainer}>
      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Subject</th>
            <th>Priority</th>
            <th>User</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#SUP-001</td>
            <td>Cannot access premium features</td>
            <td><span className={styles.priorityHigh}>High</span></td>
            <td>premium@user.com</td>
            <td><span className={styles.statusPending}>Open</span></td>
            <td>2025-01-24</td>
            <td>
              <button className={styles.actionButton}>Reply</button>
              <button className={styles.actionButton}>Close</button>
            </td>
          </tr>
          <tr>
            <td>#SUP-002</td>
            <td>Question about blog submission</td>
            <td><span className={styles.priorityLow}>Low</span></td>
            <td>newuser@blog.com</td>
            <td><span className={styles.statusInProgress}>Responded</span></td>
            <td>2025-01-23</td>
            <td>
              <button className={styles.actionButton}>View</button>
              <button className={styles.actionButton}>Follow Up</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

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

      <div className={styles.statsMainCard}>
        <div className={styles.cardHeader}>
          <h3>Blog Statistics</h3>
          <p>Content submission and approval metrics</p>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>2,156</h3>
            <p>Total Blogs</p>
          </div>
          <div className={styles.statCard}>
            <h3>45</h3>
            <p>Pending Approval</p>
          </div>
          <div className={styles.statCard}>
            <h3>12</h3>
            <p>Rejected This Week</p>
          </div>
          <div className={styles.statCard}>
            <h3>2,099</h3>
            <p>Approved Blogs</p>
          </div>
        </div>
      </div>

      <div className={styles.statsMainCard}>
        <div className={styles.cardHeader}>
          <h3>Monthly Growth</h3>
          <p>Growth metrics and performance indicators</p>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>+127</h3>
            <p>New Users</p>
          </div>
          <div className={styles.statCard}>
            <h3>+89</h3>
            <p>New Blogs</p>
          </div>
          <div className={styles.statCard}>
            <h3>+15</h3>
            <p>Premium Upgrades</p>
          </div>
          <div className={styles.statCard}>
            <h3>94.2%</h3>
            <p>User Satisfaction</p>
          </div>
        </div>
      </div>

      <div className={styles.statsMainCard}>
        <div className={styles.cardHeader}>
          <h3>Top Categories</h3>
          <p>Most popular blog categories by volume</p>
        </div>
        <div className={styles.categoryStats}>
          <div className={styles.categoryItem}>
            <span>Lifestyle</span>
            <span>245 blogs</span>
          </div>
          <div className={styles.categoryItem}>
            <span>Technology</span>
            <span>198 blogs</span>
          </div>
          <div className={styles.categoryItem}>
            <span>Health & Wellness</span>
            <span>167 blogs</span>
          </div>
          <div className={styles.categoryItem}>
            <span>Business</span>
            <span>134 blogs</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submissions');

  const [submissions, setSubmissions] = useState<BlogSubmissionWithReview[]>([]);
  const [filter, setFilter] = useState<BlogStatus | 'all'>('pending');
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

  useEffect(() => {
    setAdminUser({
      authenticated: true,
      authorized: true,
      userId: 'dev-user',
      userName: 'Developer',
      userRoles: 'admin'
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (adminUser) {
      if (activeTab === 'submissions') {
        loadSubmissions();
      } else if (activeTab === 'manager') {
        loadBlogPosts();
      }
    }
  }, [adminUser, activeTab, filter]);

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
          review_count: 0
        }
      ];

      const filteredSubmissions = filter === 'all' 
        ? mockSubmissions 
        : mockSubmissions.filter(sub => sub.status === filter);

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
        </div>
      </Layout>
    );
  }

  if (!adminUser) {
    return (
      <Layout title="Access Denied">
        <div className={styles.accessDenied}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this admin dashboard.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard - BlogRolly">
      <div className={styles.adminDashboard}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <div className={styles.adminInfo}>
            <span>Welcome, {adminUser.userName}</span>
            <span className={styles.adminBadge}>ADMIN</span>
          </div>
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
                          onClick={() => handleReviewSubmission(submission, 'approve')}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className={styles.rejectButton}
                          onClick={() => handleReviewSubmission(submission, 'reject')}
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
              {blogPosts.map((post) => (
                <div key={post.id} className={styles.blogPostCard}>
                  <div className={styles.blogPostHeader}>
                    <h3>{post.title}</h3>
                    <div className={styles.blogPostActions}>
                      <button onClick={() => handleEdit(post)} className={styles.editButton}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(post.id)} className={styles.deleteButton}>
                        Delete
                      </button>
                      <a href={`/blog/post/${post.slug}`} target="_blank" rel="noopener noreferrer" className={styles.viewButton}>
                        View
                      </a>
                    </div>
                  </div>

                  <p className={styles.blogPostDescription}>{post.description}</p>

                  <div className={styles.blogPostMeta}>
                    <span>Category: {post.category}</span>
                    <span>Published: {post.publishDate}</span>
                    <span>Status: {post.isPublished ? 'Published' : 'Draft'}</span>
                  </div>

                  <div className={styles.blogPostTags}>
                    {post.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bug-reports' && <BugReports />}
        {activeTab === 'support-requests' && <SupportRequests />}
        {activeTab === 'stats' && <AdminStats />}

        {showReviewModal && selectedSubmission && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>{reviewAction === 'approve' ? 'Approve' : 'Reject'} Blog Submission</h3>

              <div className={styles.modalSubmissionInfo}>
                <h4>{selectedSubmission.title}</h4>
                <p>by {selectedSubmission.blogger_name}</p>
                <p><a href={selectedSubmission.url} target="_blank" rel="noopener noreferrer">
                  {selectedSubmission.url}
                </a></p>
              </div>

              {reviewAction === 'approve' && (
                <div className={styles.approvalConfirm}>
                  <p>This will:</p>
                  <ul>
                    <li>Mark the submission as approved</li>
                    <li>Send approval email to the blogger</li>
                    <li>Make it available for the blogger to set live (subject to tier limits)</li>
                  </ul>
                </div>
              )}

              {reviewAction === 'reject' && (
                <div className={styles.rejectionForm}>
                  <label htmlFor="rejection-reason">Rejection Reason *</label>
                  <select 
                    id="rejection-reason"
                    value={rejectionReason} 
                    onChange={(e) => setRejectionReason(e.target.value as RejectionReason)}
                    className={styles.rejectionSelect}
                    required
                  >
                    <option value="">Select a reason...</option>
                    {getRejectionReasons().map(reason => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="rejection-note">Additional Note (Optional)</label>
                  <textarea
                    id="rejection-note"
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    className={styles.rejectionNote}
                    placeholder="Add any specific feedback or instructions..."
                    rows={3}
                  />

                  <p className={styles.rejectionInfo}>
                    The blogger will receive an email with the rejection reason and can resubmit after making changes.
                  </p>
                </div>
              )}

              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowReviewModal(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button 
                  className={reviewAction === 'approve' ? styles.confirmApprove : styles.confirmReject}
                  onClick={submitReview}
                  disabled={isProcessing || (reviewAction === 'reject' && !rejectionReason)}
                >
                  {isProcessing ? 'Processing...' : `Confirm ${reviewAction === 'approve' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {showManager && (
          <BlogPostManager
            onClose={handleCloseManager}
            existingPost={editingPost}
            mode={mode}
          />
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;