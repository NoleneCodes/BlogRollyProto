import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogPostManager from '../../components/BlogPostManager';
import BlogSubmissionForm from '../../components/BlogSubmissionForm';
import SecurityMonitoring from '../../components/admin/SecurityMonitoring';
import BugReports from '../../components/admin/BugReports';
import SupportRequests from '../../components/admin/SupportRequests';
import LinkedInVerifications from '../../components/admin/LinkedInVerifications';
import StatsTab from '../../components/admin/StatsTab';
import EmailTesting from '../../components/admin/EmailTesting';
import BlogSubmissions from '../../components/admin/BlogSubmissions';
import { getAllInternalBlogPosts, deleteInternalBlogPost, InternalBlogPost } from '../../lib/internalBlogData';
import { getAllBugReports, getBugReportById, updateBugReportStatus, BugReport } from '../../lib/bugReportData';
import { getAllSupportRequests, getSupportRequestById, updateSupportRequestStatus, addEmailToThread, SupportRequest } from '../../lib/supportRequestData';
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
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [testEmail, setTestEmail] = useState('');
  const [testFirstName, setTestFirstName] = useState('');
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [emailTestResults, setEmailTestResults] = useState<any[]>([]);

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

      setSubmissions(submissionsWithReview);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlogPosts = async () => {
    try {
      let posts: InternalBlogPost[] = [];
      if (typeof getAllInternalBlogPosts === 'function') {
        posts = await getAllInternalBlogPosts();
      }
      setBlogPosts(posts || []);
    } catch (error) {
      setBlogPosts([]);
    }
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
    setMode('add');
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
    <Layout>
      <div className={styles.dashboardLayout}>
        <nav className={styles.sidebarNav}>
          <button className={`${styles.sidebarTab} ${activeTab === 'submissions' ? styles.activeTab : ''}`} onClick={() => setActiveTab('submissions')}>Blog Submissions</button>
          <button className={`${styles.sidebarTab} ${activeTab === 'manager' ? styles.activeTab : ''}`} onClick={() => setActiveTab('manager')}>Blog Manager</button>
          <button className={`${styles.sidebarTab} ${activeTab === 'linkedin-verifications' ? styles.activeTab : ''}`} onClick={() => setActiveTab('linkedin-verifications')}>LinkedIn Verifications</button>
          <button className={`${styles.sidebarTab} ${activeTab === 'bug-reports' ? styles.activeTab : ''}`} onClick={() => setActiveTab('bug-reports')}>Bug Reports</button>
          <button className={`${styles.sidebarTab} ${activeTab === 'support-requests' ? styles.activeTab : ''}`} onClick={() => setActiveTab('support-requests')}>Support Requests</button>
          <button className={`${styles.sidebarTab} ${activeTab === 'stats' ? styles.activeTab : ''}`} onClick={() => setActiveTab('stats')}>Stats</button>
          <button className={`${styles.sidebarTab} ${activeTab === 'security-monitoring' ? styles.activeTab : ''}`} onClick={() => setActiveTab('security-monitoring')}>Security Monitoring</button>
          <button className={`${styles.sidebarTab} ${activeTab === 'email-testing' ? styles.activeTab : ''}`} onClick={() => setActiveTab('email-testing')}>Email Testing</button>
        </nav>
        <main className={styles.dashboardContent}>
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
                            <span>Status: {post.status === 'published' ? 'Published' : 'Draft'}</span>
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
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'security-monitoring' && <SecurityMonitoring />}
          {activeTab === 'email-testing' && <EmailTesting />}
          {activeTab === 'blogSubmissions' && <BlogSubmissions />}
        </main>
      </div>
    </Layout>
  );
};

export default AdminDashboard;