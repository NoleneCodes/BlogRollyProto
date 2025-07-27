import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
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

const AdminBlogSubmissions: React.FC = () => {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<BlogSubmissionWithReview[]>([]);
  const [filter, setFilter] = useState<BlogStatus | 'all'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<BlogSubmissionWithReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState<RejectionReason | ''>('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check admin authentication
  useEffect(() => {
    // Check admin authentication - BYPASSED FOR DEVELOPMENT
    useEffect(() => {
      // Bypass authentication for development
      setAdminUser({
        authenticated: true,
        authorized: true,
        userId: 'dev-user',
        userName: 'Developer',
        userRoles: 'admin'
      });
      setIsLoading(false);
    }, []);
  }, [router]);

  // Load submissions
  useEffect(() => {
    if (adminUser) {
      loadSubmissions();
    }
  }, [adminUser, filter]);

  const loadSubmissions = async () => {
    try {
      // TODO: Replace with actual API call
      console.log('Loading submissions for filter:', filter);

      // Mock data for development
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
        },
        {
          id: '2',
          user_id: 'user-2',
          title: 'Adult Content Blog Post',
          description: 'This is an adult content blog post for testing age-gated content.',
          url: 'https://adult-blog.com/content',
          category: 'Lifestyle',
          tags: ['Adult', 'Lifestyle'],
          status: 'pending',
          has_adult_content: true,
          is_live: false,
          views: 0,
          clicks: 0,
          submitted_at: '2025-01-24T11:00:00Z',
          created_at: '2025-01-24T11:00:00Z',
          updated_at: '2025-01-24T11:00:00Z',
          blogger_name: 'Jane Smith',
          blogger_email: 'jane@example.com',
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
      const reviewData = {
        submissionId: selectedSubmission.id,
        action: reviewAction,
        reviewerId: adminUser?.userId,
        rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
        rejectionNote: reviewAction === 'reject' && rejectionNote ? rejectionNote : undefined
      };

      console.log('Submitting review:', reviewData);

      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/review-submission', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(reviewData)
      // });

      // Mock success for development
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(`Blog submission ${reviewAction}d successfully! Email notification sent to blogger.`);

      setShowReviewModal(false);
      setSelectedSubmission(null);
      setReviewAction(null);
      loadSubmissions(); // Refresh the list

    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to process review. Please try again.');
    } finally {
      setIsProcessing(false);
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
          <h2>Verifying admin access...</h2>
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
    <Layout title="Admin: Blog Submissions - BlogRolly">
      <div className={styles.adminDashboard}>
        <div className={styles.header}>
          <h1>Blog Submissions Dashboard</h1>
          <div className={styles.adminInfo}>
            <span>Welcome, {adminUser.userName}</span>
            <span className={styles.adminBadge}>ADMIN</span>
          </div>
        </div>

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

        {/* Review Modal */}
        {showReviewModal && selectedSubmission && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>
                {reviewAction === 'approve' ? 'Approve' : 'Reject'} Blog Submission
              </h3>

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
      </div>
    </Layout>
  );
};

export default AdminBlogSubmissions;