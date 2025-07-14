
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogSubmissionForm from '../../components/BlogSubmissionForm';
import styles from '../../styles/BloggerProfile.module.css';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  bio?: string;
  joinedDate: string;
  avatar?: string;
  blogName?: string;
  blogUrl?: string;
  topics: string[];
  roles: string[];
}

interface BlogSubmission {
  id: string;
  title: string;
  url: string;
  category: string;
  status: 'approved' | 'pending' | 'draft' | 'rejected';
  submittedDate: string;
  views?: number;
  clicks?: number;
  isActive?: boolean; // Only matters for approved posts
}

interface BlogStats {
  totalViews: number;
  totalClicks: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  clickThroughRate: number;
  averageTimeOnSite: number;
}

const BloggerProfile: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [blogSubmissions, setBlogSubmissions] = useState<BlogSubmission[]>([]);
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [showBlogSubmissionForm, setShowBlogSubmissionForm] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Temporarily bypass auth check for design review
        // Mock blogger user data
        setUserInfo({
          id: 'demo-blogger-123',
          name: 'Demo Blogger',
          email: 'blogger@example.com',
          displayName: 'Demo Blogger',
          bio: 'Passionate writer sharing insights on tech and lifestyle',
          joinedDate: '2024-01-10',
          blogName: 'Tech & Life Insights',
          blogUrl: 'https://techlifeinsights.com',
          topics: ['Tech', 'Lifestyle', 'Productivity'],
          roles: ['blogger']
        });

        // Mock blog submissions
        setBlogSubmissions([
          {
            id: '1',
            title: 'The Future of Remote Work',
            url: 'https://techlifeinsights.com/remote-work-future',
            category: 'Tech',
            status: 'approved',
            submittedDate: '2024-01-15',
            views: 1250,
            clicks: 89,
            isActive: true
          },
          {
            id: '2',
            title: 'Building Better Morning Routines',
            url: 'https://techlifeinsights.com/morning-routines',
            category: 'Lifestyle',
            status: 'approved',
            submittedDate: '2024-01-20',
            views: 890,
            clicks: 67,
            isActive: true
          },
          {
            id: '3',
            title: 'Mastering Work-Life Balance',
            url: 'https://techlifeinsights.com/work-life-balance',
            category: 'Lifestyle',
            status: 'approved',
            submittedDate: '2024-01-18',
            views: 650,
            clicks: 45,
            isActive: true
          },
          {
            id: '4',
            title: 'Advanced JavaScript Techniques',
            url: 'https://techlifeinsights.com/advanced-js',
            category: 'Tech',
            status: 'approved',
            submittedDate: '2024-01-22',
            views: 0,
            clicks: 0,
            isActive: false
          },
          {
            id: '5',
            title: 'AI in Content Creation',
            url: 'https://techlifeinsights.com/ai-content',
            category: 'Tech',
            status: 'pending',
            submittedDate: '2024-01-25',
            views: 0,
            clicks: 0
          },
          {
            id: '6',
            title: 'Productivity Hacks for Developers',
            url: '',
            category: 'Tech',
            status: 'draft',
            submittedDate: '2024-01-28',
            views: 0,
            clicks: 0
          }
        ]);

        // Mock blog stats
        setBlogStats({
          totalViews: 2140,
          totalClicks: 156,
          totalSubmissions: 4,
          approvedSubmissions: 2,
          clickThroughRate: 7.3,
          averageTimeOnSite: 3.2
        });
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    router.push('/');
  };

  const handleSwitchToReader = () => {
    router.push('/profile/reader');
  };

  const togglePostActivation = (postId: string) => {
    setBlogSubmissions(prev => prev.map(post => {
      if (post.id === postId && post.status === 'approved') {
        const newActiveStatus = !post.isActive;
        
        // Check if we're trying to activate a post
        if (newActiveStatus) {
          const currentActivePosts = prev.filter(p => p.status === 'approved' && p.isActive).length;
          if (currentActivePosts >= 3) {
            alert('You can only have 3 active posts on the free tier. Deactivate another post first.');
            return post;
          }
        }
        
        return { ...post, isActive: newActiveStatus };
      }
      return post;
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'draft': return '#6b7280';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB');
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG, and WebP files are allowed');
        return;
      }
      setProfilePictureFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    if (profilePictureFile) {
      setUserInfo(prev => prev ? { ...prev, avatar: profilePicturePreview } : null);
    }
    alert('Settings saved successfully!');
  };

  const handleBlogSubmit = (formData: any) => {
    const newSubmission: BlogSubmission = {
      id: Date.now().toString(),
      title: formData.title,
      url: formData.url,
      category: formData.category,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      views: 0,
      clicks: 0
    };
    setBlogSubmissions(prev => [newSubmission, ...prev]);
    setShowBlogSubmissionForm(false);
    setActiveSection('blogroll');
  };

  if (isLoading) {
    return (
      <Layout title="Blogger Profile - Blogrolly">
        <div className={styles.loading}>
          <h2>Loading your profile...</h2>
        </div>
      </Layout>
    );
  }

  if (!userInfo) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className={styles.content}>
            <h2>Profile Overview</h2>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt="Profile" />
                ) : (
                  <div className={styles.initials}>
                    {getInitials(userInfo.displayName || userInfo.name)}
                  </div>
                )}
              </div>
              <div className={styles.profileInfo}>
                <h3>{userInfo.displayName || userInfo.name}</h3>
                <p className={styles.blogName}>{userInfo.blogName}</p>
                <p className={styles.bio}>{userInfo.bio}</p>
                <p className={styles.joinDate}>Joined {new Date(userInfo.joinedDate).toLocaleDateString()}</p>
              </div>
            </div>
            {blogStats && (
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h4>Total Views</h4>
                  <span className={styles.statNumber}>{blogStats.totalViews.toLocaleString()}</span>
                </div>
                <div className={styles.statCard}>
                  <h4>Total Clicks</h4>
                  <span className={styles.statNumber}>{blogStats.totalClicks}</span>
                </div>
                <div className={styles.statCard}>
                  <h4>Click Rate</h4>
                  <span className={styles.statNumber}>{blogStats.clickThroughRate}%</span>
                </div>
                <div className={styles.statCard}>
                  <h4>Active Blogs</h4>
                  <span className={styles.statNumber}>{blogSubmissions.filter(post => post.status === 'approved' && post.isActive).length}/3</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'blogroll':
        return (
          <div className={styles.content}>
            <div className={styles.sectionHeader}>
              <h2>My Blogroll</h2>
              <button 
                className={styles.primaryButton}
                onClick={() => setShowBlogSubmissionForm(true)}
              >
                Submit New Blog
              </button>
            </div>
            
            {showBlogSubmissionForm && (
              <div className={styles.formOverlay}>
                <div className={styles.formContainer}>
                  <div className={styles.formHeader}>
                    <h3>Submit a New Blog Post</h3>
                    <button 
                      className={styles.closeButton}
                      onClick={() => setShowBlogSubmissionForm(false)}
                    >
                      ×
                    </button>
                  </div>
                  <BlogSubmissionForm 
                    onSubmit={handleBlogSubmit}
                    displayName={userInfo.displayName}
                    bloggerId={userInfo.id}
                    isBlogger={true}
                  />
                </div>
              </div>
            )}

            {blogSubmissions.length === 0 ? (
              <p className={styles.emptyState}>No blog submissions yet. Submit your first blog post!</p>
            ) : (
              <>
                <div className={styles.tierLimitation}>
                  <p><strong>Free Tier:</strong> You can have up to 3 active blog posts. 
                  {blogSubmissions.filter(post => post.status === 'approved' && post.isActive).length}/3 active posts</p>
                </div>
                <div className={styles.submissionsList}>
                  {blogSubmissions.map(submission => (
                    <div key={submission.id} className={styles.submissionItem}>
                      <div className={styles.submissionDetails}>
                        <h4>{submission.title}</h4>
                        <p className={styles.submissionUrl}>{submission.url || 'Draft - No URL yet'}</p>
                        <div className={styles.submissionMeta}>
                          <span className={styles.category}>{submission.category}</span>
                          <span 
                            className={styles.status}
                            style={{ backgroundColor: getStatusColor(submission.status) }}
                          >
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                            {submission.status === 'approved' && submission.isActive && (
                              <span className={styles.activeIndicator}> • Live</span>
                            )}
                            {submission.status === 'approved' && !submission.isActive && (
                              <span className={styles.inactiveIndicator}> • Inactive</span>
                            )}
                          </span>
                          <span className={styles.date}>
                            {new Date(submission.submittedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={styles.submissionActions}>
                        {submission.status === 'approved' && (
                          <button 
                            className={`${styles.activationButton} ${submission.isActive ? styles.deactivate : styles.activate}`}
                            onClick={() => togglePostActivation(submission.id)}
                          >
                            {submission.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        {submission.status === 'approved' && submission.isActive && (
                          <div className={styles.submissionStats}>
                            <div className={styles.statItem}>
                              <span className={styles.statLabel}>Views</span>
                              <span className={styles.statValue}>{submission.views}</span>
                            </div>
                            <div className={styles.statItem}>
                              <span className={styles.statLabel}>Clicks</span>
                              <span className={styles.statValue}>{submission.clicks}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'stats':
        return (
          <div className={styles.content}>
            <h2>Analytics & Stats</h2>
            {blogStats && (
              <>
                <div className={styles.statsOverview}>
                  <div className={styles.statCard}>
                    <h4>Total Blog Views</h4>
                    <span className={styles.statNumber}>{blogStats.totalViews.toLocaleString()}</span>
                    <p className={styles.statDescription}>Views across all your approved blogs</p>
                  </div>
                  <div className={styles.statCard}>
                    <h4>Total Clicks</h4>
                    <span className={styles.statNumber}>{blogStats.totalClicks}</span>
                    <p className={styles.statDescription}>Clicks to your blog from BlogRolly</p>
                  </div>
                  <div className={styles.statCard}>
                    <h4>Click-through Rate</h4>
                    <span className={styles.statNumber}>{blogStats.clickThroughRate}%</span>
                    <p className={styles.statDescription}>Percentage of views that resulted in clicks</p>
                  </div>
                  <div className={styles.statCard}>
                    <h4>Avg. Time on Site</h4>
                    <span className={styles.statNumber}>{blogStats.averageTimeOnSite} min</span>
                    <p className={styles.statDescription}>Average time readers spend on your blog</p>
                  </div>
                </div>
                <div className={styles.performanceSection}>
                  <h3>Blog Performance</h3>
                  <div className={styles.performanceList}>
                    {blogSubmissions
                      .filter(sub => sub.status === 'approved')
                      .map(submission => (
                        <div key={submission.id} className={styles.performanceItem}>
                          <div className={styles.performanceDetails}>
                            <h4>{submission.title}</h4>
                            <p>{submission.category}</p>
                          </div>
                          <div className={styles.performanceMetrics}>
                            <div className={styles.metric}>
                              <span className={styles.metricValue}>{submission.views}</span>
                              <span className={styles.metricLabel}>Views</span>
                            </div>
                            <div className={styles.metric}>
                              <span className={styles.metricValue}>{submission.clicks}</span>
                              <span className={styles.metricLabel}>Clicks</span>
                            </div>
                            <div className={styles.metric}>
                              <span className={styles.metricValue}>
                                {submission.views ? ((submission.clicks! / submission.views) * 100).toFixed(1) : 0}%
                              </span>
                              <span className={styles.metricLabel}>CTR</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className={styles.content}>
            <h2>Account Settings</h2>
            <div className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label>Profile Picture</label>
                <div className={styles.profilePictureSection}>
                  <div className={styles.currentPicture}>
                    {profilePicturePreview || userInfo.avatar ? (
                      <img 
                        src={profilePicturePreview || userInfo.avatar} 
                        alt="Profile" 
                        className={styles.previewImage}
                      />
                    ) : (
                      <div className={styles.previewPlaceholder}>
                        {getInitials(userInfo.displayName || userInfo.name)}
                      </div>
                    )}
                  </div>
                  <div className={styles.pictureUpload}>
                    <input
                      type="file"
                      id="profilePicture"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleProfilePictureChange}
                      className={styles.fileInput}
                    />
                    <label htmlFor="profilePicture" className={styles.uploadButton}>
                      Choose New Picture
                    </label>
                    <small className={styles.uploadHint}>
                      Max size: 2MB. Formats: JPG, PNG, WebP
                    </small>
                  </div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Display Name</label>
                <input 
                  type="text" 
                  defaultValue={userInfo.displayName} 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input 
                  type="email" 
                  defaultValue={userInfo.email} 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Blog Name</label>
                <input 
                  type="text" 
                  defaultValue={userInfo.blogName} 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Blog URL</label>
                <input 
                  type="url" 
                  defaultValue={userInfo.blogUrl} 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Bio</label>
                <textarea 
                  defaultValue={userInfo.bio} 
                  className={styles.textarea}
                  rows={3}
                />
              </div>
              <button className={styles.saveButton} onClick={handleSaveSettings}>
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className={styles.content}>
            <h2>Billing & Subscription</h2>
            <div className={styles.billingSection}>
              <div className={styles.currentPlan}>
                <h3>Current Plan: Free Tier</h3>
                <p>You're currently on our free tier with basic analytics and up to 5 blog submissions per month.</p>
                <div className={styles.planFeatures}>
                  <ul>
                    <li>Up to 5 blog submissions per month</li>
                    <li>Basic analytics</li>
                    <li>Community support</li>
                  </ul>
                </div>
              </div>
              <div className={styles.upgradeSection}>
                <h3>Upgrade to Pro</h3>
                <div className={styles.proFeatures}>
                  <ul>
                    <li>Unlimited blog submissions</li>
                    <li>Advanced analytics and insights</li>
                    <li>Priority review for submissions</li>
                    <li>Custom blog categories</li>
                    <li>Priority support</li>
                  </ul>
                </div>
                <button className={styles.upgradeButton}>Upgrade to Pro - $9/month</button>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className={styles.content}>
            <h2>Help & Support</h2>
            <div className={styles.helpSection}>
              <div className={styles.helpItem}>
                <h3>Blogger FAQ</h3>
                <p>Find answers to commonly asked questions about being a blogger on BlogRolly</p>
                <button className={styles.helpButton}>View Blogger FAQ</button>
              </div>
              <div className={styles.helpItem}>
                <h3>Submission Guidelines</h3>
                <p>Learn about our content guidelines and best practices for blog submissions</p>
                <button className={styles.helpButton}>View Guidelines</button>
              </div>
              <div className={styles.helpItem}>
                <h3>Analytics Help</h3>
                <p>Understanding your blog analytics and how to improve performance</p>
                <button className={styles.helpButton}>Learn Analytics</button>
              </div>
              <div className={styles.helpItem}>
                <h3>Contact Support</h3>
                <p>Get help from our support team</p>
                <button className={styles.helpButton}>Contact Us</button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout title="Blogger Profile - Blogrolly">
      <div className={styles.profileContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Blogger Dashboard</h3>
          </div>
          <nav className={styles.sidebarNav}>
            <button 
              className={`${styles.navItem} ${activeSection === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              Profile Overview
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'blogroll' ? styles.active : ''}`}
              onClick={() => setActiveSection('blogroll')}
            >
              My Blogroll
            </button>
            <button 
              className={`${styles.navItem} ${styles.disabled}`}
              title="Stats are available in Pro tier"
              disabled
            >
              Stats (Pro)
            </button>
            <button 
              className={`${styles.navItem} ${styles.submitBlog} ${activeSection === 'submit' ? styles.active : ''}`}
              onClick={() => setShowBlogSubmissionForm(true)}
            >
              Submit a Blog
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              Account Settings
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'billing' ? styles.active : ''}`}
              onClick={() => setActiveSection('billing')}
            >
              Billing
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'help' ? styles.active : ''}`}
              onClick={() => setActiveSection('help')}
            >
              Help
            </button>
            <button 
              className={`${styles.navItem} ${styles.switch}`}
              onClick={handleSwitchToReader}
            >
              Switch to Reader
            </button>
            <button 
              className={`${styles.navItem} ${styles.logout}`}
              onClick={handleLogout}
            >
              Log Out
            </button>
          </nav>
        </aside>
        <main className={styles.main}>
          {renderContent()}
        </main>
      </div>
    </Layout>
  );
};

export default BloggerProfile;
