
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { supabaseDB } from '../../lib/supabase';
import BlogEditForm from '../../components/BlogEditForm';
import styles from '../../styles/BloggerProfilePremium.module.css';

interface BlogSubmission {
  id: string;
  blog_title: string;
  blog_url: string;
  blog_description: string;
  category: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  approved_at?: string;
  views?: number;
  clicks?: number;
  rejection_reason?: string;
  rejection_note?: string;
  image_url?: string;
}

export default function BloggerPremiumProfile() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState<BlogSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [editingBlog, setEditingBlog] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      fetchSubmissions();
    }
  }, [user, loading, router]);

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

  const saveEditedBlog = async (blogId: string, updatedData: any) => {
    try {
      const { error } = await supabaseDB.updateBlogSubmission(blogId, updatedData);
      if (error) {
        console.error('Error updating blog:', error);
        alert('Failed to update blog. Please try again.');
      } else {
        await fetchSubmissions();
        setEditingBlog(null);
        alert('Blog updated successfully!');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Failed to update blog. Please try again.');
    }
  };

  const cancelEditingBlog = () => {
    setEditingBlog(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className={styles.content}>
            <h2>Premium Dashboard</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Submissions</h3>
                <p className={styles.statNumber}>{submissions.length}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Approved Blogs</h3>
                <p className={styles.statNumber}>
                  {submissions.filter(s => s.status === 'approved').length}
                </p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Views</h3>
                <p className={styles.statNumber}>
                  {submissions.reduce((total, s) => total + (s.views || 0), 0)}
                </p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Clicks</h3>
                <p className={styles.statNumber}>
                  {submissions.reduce((total, s) => total + (s.clicks || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        );

      case 'blogs':
        return (
          <div className={styles.content}>
            <h2>My Blogroll</h2>
            {loadingSubmissions ? (
              <p>Loading your submissions...</p>
            ) : submissions.length === 0 ? (
              <p>No blog submissions yet.</p>
            ) : (
              <div className={styles.blogGrid}>
                {submissions.map((submission) => (
                  <div key={submission.id} className={styles.blogCard}>
                    {editingBlog === submission.id ? (
                      <BlogEditForm
                        blog={submission}
                        onSave={saveEditedBlog}
                        onCancel={cancelEditingBlog}
                        isVisible={true}
                      />
                    ) : (
                      <>
                        {submission.image_url && (
                          <img
                            src={submission.image_url}
                            alt={submission.blog_title}
                            className={styles.blogImage}
                          />
                        )}
                        <div className={styles.blogContent}>
                          <h3>{submission.blog_title}</h3>
                          <p className={styles.blogDescription}>
                            {submission.blog_description}
                          </p>
                          <div className={styles.blogMeta}>
                            <span className={styles.category}>
                              {submission.category}
                            </span>
                            <div className={styles.tags}>
                              {submission.tags?.map((tag, index) => (
                                <span key={index} className={styles.tag}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className={styles.blogStats}>
                            <span>Views: {submission.views || 0}</span>
                            <span>Clicks: {submission.clicks || 0}</span>
                          </div>
                          <div className={styles.blogActions}>
                            <span className={`${styles.status} ${styles[submission.status]}`}>
                              {submission.status.toUpperCase()}
                            </span>
                            <button 
                              className={styles.editButton}
                              onClick={() => setEditingBlog(submission.id)}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className={styles.content}>
            <h2>Advanced Analytics</h2>
            <div className={styles.analyticsSection}>
              <div className={styles.chartContainer}>
                <h3>Performance Overview</h3>
                <p>Detailed analytics coming soon...</p>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className={styles.content}>
            <h2>Account Settings</h2>
            <div className={styles.settingsSection}>
              <h3>Premium Features</h3>
              <ul>
                <li>✅ Unlimited blog submissions</li>
                <li>✅ Advanced analytics</li>
                <li>✅ Priority support</li>
                <li>✅ Custom branding options</li>
              </ul>
            </div>
          </div>
        );

      default:
        return <div>Select a tab to view content</div>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.container}>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Premium Blogger Dashboard</h1>
          <p>Welcome back, {user.email}</p>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navButton} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'blogs' ? styles.active : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            My Blogroll
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'analytics' ? styles.active : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>

        {renderContent()}
      </div>
    </Layout>
  );
}
