
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogEditForm from '../../components/BlogEditForm';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { supabaseDB } from '../../lib/supabase';
import styles from '../../styles/BloggerProfilePremium.module.css';
import BugReportModal from '../../components/BugReportModal';

interface BlogData {
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  image: File | null;
  imagePreview: string | null;
}

interface BlogSubmission {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  tags?: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  image?: string;
  clicks?: number;
  views?: number;
}

const BloggerPremiumProfile = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-blogroll');
  const [submissions, setSubmissions] = useState<BlogSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [editingBlog, setEditingBlog] = useState<string | null>(null);
  const [showBugReportPopup, setShowBugReportPopup] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && activeTab === 'my-blogroll') {
      fetchSubmissions();
    }
  }, [user, activeTab]);

  const fetchSubmissions = async () => {
    if (!user) return;

    setLoadingSubmissions(true);
    try {
      const { data, error } = await supabaseDB.getUserSubmissions(user.id);
      if (error) {
        console.error('Error fetching submissions:', error);
      } else {
        setSubmissions(data || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleEditSave = async (blogId: string, updatedData: BlogData) => {
    try {
      const updatePayload = {
        title: updatedData.title,
        description: updatedData.description,
        url: updatedData.url,
        category: updatedData.category,
        tags: updatedData.tags
      };

      const { error } = await supabaseDB.updateBlogSubmission(blogId, updatePayload);
      
      if (error) {
        console.error('Error updating blog:', error);
        alert('Failed to update blog. Please try again.');
        return;
      }

      // Update local state
      setSubmissions(prev => prev.map(submission => 
        submission.id === blogId 
          ? { ...submission, ...updatePayload }
          : submission
      ));

      setEditingBlog(null);
      alert('Blog updated successfully!');
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Failed to update blog. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setEditingBlog(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'my-blogroll':
        return (
          <div className={styles.submissionsList}>
            {loadingSubmissions ? (
              <div className={styles.loading}>Loading your blog submissions...</div>
            ) : submissions.length === 0 ? (
              <div className={styles.emptyState}>
                No blog submissions yet. Start by submitting your first blog post!
              </div>
            ) : (
              submissions.map((submission) => (
                <div key={submission.id} className={styles.premiumSubmissionCard}>
                  <div className={styles.submissionImageContainer}>
                    {submission.image ? (
                      <img 
                        src={submission.image} 
                        alt={submission.title}
                        className={styles.submissionImage}
                      />
                    ) : (
                      <div className={styles.submissionImagePlaceholder}>
                        No image
                      </div>
                    )}
                  </div>
                  <div className={styles.submissionContent}>
                    <div className={styles.submissionHeader}>
                      <h4>{submission.title}</h4>
                    </div>
                    {submission.description && (
                      <p className={styles.submissionDescription}>
                        {submission.description}
                      </p>
                    )}
                    <p className={styles.submissionUrl}>{submission.url || 'Draft - No URL yet'}</p>
                    <div className={styles.submissionMeta}>
                      <span className={styles.metaItem}>
                        <strong>Status:</strong> 
                        <span className={`${styles.status} ${styles[submission.status]}`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </span>
                      <span className={styles.metaItem}>
                        <strong>Category:</strong> {submission.category}
                      </span>
                      {submission.tags && submission.tags.length > 0 && (
                        <span className={styles.metaItem}>
                          <strong>Tags:</strong> 
                          <div className={styles.tagsDisplay}>
                            {submission.tags.map((tag, index) => (
                              <span key={index} className={styles.tagChip}>{tag}</span>
                            ))}
                          </div>
                        </span>
                      )}
                      {submission.views !== undefined && (
                        <span className={styles.metaItem}>
                          <strong>Views:</strong> {submission.views || 0}
                        </span>
                      )}
                      {submission.clicks !== undefined && (
                        <span className={styles.metaItem}>
                          <strong>Clicks:</strong> {submission.clicks || 0}
                        </span>
                      )}
                    </div>
                    <div className={styles.submissionActions}>
                      <button 
                        className={styles.editButton}
                        onClick={() => setEditingBlog(submission.id)}
                      >
                        Edit
                      </button>
                    </div>
                    
                    <BlogEditForm
                      blog={submission}
                      onSave={handleEditSave}
                      onCancel={handleEditCancel}
                      isVisible={editingBlog === submission.id}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className={styles.content}>
            <h2>Analytics Dashboard</h2>
            <div className={styles.premiumFeatures}>
              <div className={styles.featureBanner}>
                <p className={styles.featureText}>
                  🚀 Premium Analytics: Track your blog performance with detailed insights
                </p>
              </div>
            </div>
            <p>Coming soon: Detailed analytics for your blog submissions including views, clicks, and engagement metrics.</p>
          </div>
        );

      case 'settings':
        return (
          <div className={styles.content}>
            <h2>Premium Settings</h2>
            <div className={styles.premiumFeatures}>
              <div className={styles.featureBanner}>
                <p className={styles.featureText}>
                  ⚙️ Premium Settings: Advanced customization options for your profile
                </p>
              </div>
            </div>
            <p>Manage your premium account settings and preferences.</p>
          </div>
        );

      case 'support':
        return (
          <div className={styles.content}>
            <h2>Premium Support</h2>
            <div className={styles.premiumFeatures}>
              <div className={styles.featureBanner}>
                <p className={styles.featureText}>
                  💬 Premium Support: Priority assistance from our team
                </p>
              </div>
            </div>
            <p>Get priority support as a premium member.</p>
            <button 
              className={styles.supportButton}
              onClick={() => setShowBugReportPopup(true)}
            >
              Contact Support
            </button>
          </div>
        );

      default:
        return <div>Select a tab to view content</div>;
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className={styles.loading}>Loading...</div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className={styles.profileContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.profileHeader}>
            <h1>Premium Dashboard</h1>
            <p>Welcome back, {user.email}</p>
          </div>
          <nav className={styles.sidebarNav}>
            <button 
              className={`${styles.navItem} ${activeTab === 'my-blogroll' ? styles.active : ''}`}
              onClick={() => setActiveTab('my-blogroll')}
            >
              My Blogroll
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'support' ? styles.active : ''}`}
              onClick={() => setActiveTab('support')}
            >
              Support
            </button>
          </nav>
        </aside>

        <main className={styles.main}>
          {renderTabContent()}
        </main>
      </div>

      <BugReportModal
        isOpen={showBugReportPopup}
        onClose={() => setShowBugReportPopup(false)}
      />
    </Layout>
  );
};

export default BloggerPremiumProfile;
