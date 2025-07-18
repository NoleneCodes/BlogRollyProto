
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogSubmissionForm from '../../components/BlogSubmissionForm';
import SubmissionGuidelinesPopup from '../../components/SubmissionGuidelinesPopup';
import styles from '../../styles/BloggerProfilePremium.module.css';

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
  tier: 'premium';
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
  isActive?: boolean;
  description?: string;
  image?: string;
  revenue?: number;
  ctr?: number;
  avgTimeOnPage?: number;
  bounceRate?: number;
}

interface BlogStats {
  totalViews: number;
  totalClicks: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  clickThroughRate: number;
  averageTimeOnSite: number;
  totalRevenue: number;
  monthlyGrowth: number;
  topPerformingCategory: string;
  readerRetention: number;
}

const BloggerProfilePremium: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [blogSubmissions, setBlogSubmissions] = useState<BlogSubmission[]>([]);
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [showBlogSubmissionForm, setShowBlogSubmissionForm] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [editingBlog, setEditingBlog] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    url: string;
    image: File | null;
    imagePreview: string | null;
  }>({
    title: '',
    description: '',
    url: '',
    image: null,
    imagePreview: null
  });
  const [editingSubmission, setEditingSubmission] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [editedImage, setEditedImage] = useState<string>('');
  const [showHowItWorksPopup, setShowHowItWorksPopup] = useState<boolean>(false);
  const [showSubmissionGuidelinesPopup, setShowSubmissionGuidelinesPopup] = useState<boolean>(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('30d');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Mock premium blogger user data
        setUserInfo({
          id: 'premium-blogger-123',
          name: 'Premium Blogger',
          email: 'premium@example.com',
          displayName: 'Premium Content Creator',
          bio: 'Professional content creator and thought leader in tech innovation',
          joinedDate: '2023-06-15',
          blogName: 'Innovation Insights Pro',
          blogUrl: 'https://innovationinsightspro.com',
          topics: ['Tech', 'Innovation', 'Business', 'AI'],
          roles: ['blogger'],
          tier: 'premium'
        });

        // Mock premium blog submissions (unlimited)
        setBlogSubmissions([
          {
            id: '1',
            title: 'The Future of AI in Enterprise Software',
            url: 'https://innovationinsightspro.com/ai-enterprise-future',
            category: 'Tech',
            status: 'approved',
            submittedDate: '2024-01-15',
            views: 5250,
            clicks: 430,
            isActive: true,
            description: 'Comprehensive analysis of how AI is transforming enterprise software development.',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop',
            revenue: 156.75,
            ctr: 8.2,
            avgTimeOnPage: 4.5,
            bounceRate: 24.8
          },
          {
            id: '2',
            title: 'Building Scalable SaaS Architecture',
            url: 'https://innovationinsightspro.com/scalable-saas',
            category: 'Tech',
            status: 'approved',
            submittedDate: '2024-01-20',
            views: 3890,
            clicks: 312,
            isActive: true,
            description: 'Deep dive into architectural patterns for building scalable SaaS applications.',
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop',
            revenue: 124.30,
            ctr: 8.0,
            avgTimeOnPage: 6.2,
            bounceRate: 18.5
          },
          {
            id: '3',
            title: 'Leadership in Remote Teams',
            url: 'https://innovationinsightspro.com/remote-leadership',
            category: 'Business',
            status: 'approved',
            submittedDate: '2024-01-18',
            views: 2650,
            clicks: 198,
            isActive: true,
            description: 'Essential strategies for leading and managing distributed teams effectively.',
            image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
            revenue: 89.45,
            ctr: 7.5,
            avgTimeOnPage: 5.1,
            bounceRate: 28.3
          },
          {
            id: '4',
            title: 'Machine Learning for Product Managers',
            url: 'https://innovationinsightspro.com/ml-product-management',
            category: 'AI',
            status: 'approved',
            submittedDate: '2024-01-22',
            views: 4120,
            clicks: 367,
            isActive: true,
            description: 'How product managers can leverage ML to build better products.',
            image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop',
            revenue: 145.60,
            ctr: 8.9,
            avgTimeOnPage: 7.3,
            bounceRate: 15.2
          },
          {
            id: '5',
            title: 'Startup Growth Hacking Strategies',
            url: 'https://innovationinsightspro.com/growth-hacking',
            category: 'Business',
            status: 'approved',
            submittedDate: '2024-01-25',
            views: 1890,
            clicks: 143,
            isActive: true,
            description: 'Proven growth strategies that helped startups scale from 0 to millions.',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
            revenue: 67.85,
            ctr: 7.6,
            avgTimeOnPage: 4.8,
            bounceRate: 32.1
          },
          {
            id: '6',
            title: 'The Evolution of DevOps Culture',
            url: 'https://innovationinsightspro.com/devops-culture',
            category: 'Tech',
            status: 'pending',
            submittedDate: '2024-01-28',
            views: 0,
            clicks: 0,
            description: 'How DevOps culture is evolving and what it means for engineering teams.',
            image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop',
            revenue: 0,
            ctr: 0,
            avgTimeOnPage: 0,
            bounceRate: 0
          }
        ]);

        // Mock premium blog stats
        setBlogStats({
          totalViews: 17800,
          totalClicks: 1450,
          totalSubmissions: 15,
          approvedSubmissions: 12,
          clickThroughRate: 8.1,
          averageTimeOnSite: 5.4,
          totalRevenue: 583.95,
          monthlyGrowth: 23.7,
          topPerformingCategory: 'Tech',
          readerRetention: 68.3
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
        return { ...post, isActive: !post.isActive };
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
      if (file.size > 5 * 1024 * 1024) { // Premium: 5MB limit
        alert('Image must be less than 5MB');
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG, WebP, and GIF files are allowed');
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
      clicks: 0,
      description: formData.description,
      image: formData.image ? URL.createObjectURL(formData.image) : null,
      revenue: 0,
      ctr: 0,
      avgTimeOnPage: 0,
      bounceRate: 0
    };
    setBlogSubmissions(prev => [newSubmission, ...prev]);
    setShowBlogSubmissionForm(false);
    setActiveSection('blogroll');
  };

  if (isLoading) {
    return (
      <Layout title="Premium Blogger Profile - Blogrolly">
        <div className={styles.loading}>
          <h2>Loading your premium profile...</h2>
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
            <div className={styles.premiumBadge}>
              <span className={styles.premiumIcon}>👑</span>
              Premium Account
            </div>
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
                <p className={styles.joinDate}>Premium member since {new Date(userInfo.joinedDate).toLocaleDateString()}</p>
              </div>
            </div>
            {blogStats && (
              <div className={styles.premiumStatsGrid}>
                <div className={styles.statCard}>
                  <h4>Total Views</h4>
                  <span className={styles.statNumber}>{blogStats.totalViews.toLocaleString()}</span>
                  <span className={styles.statGrowth}>+{blogStats.monthlyGrowth}% this month</span>
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
                  <h4>Revenue</h4>
                  <span className={styles.statNumber}>${blogStats.totalRevenue}</span>
                </div>
                <div className={styles.statCard}>
                  <h4>Active Blogs</h4>
                  <span className={styles.statNumber}>{blogSubmissions.filter(post => post.status === 'approved' && post.isActive).length}</span>
                  <span className={styles.statDescription}>Unlimited</span>
                </div>
                <div className={styles.statCard}>
                  <h4>Reader Retention</h4>
                  <span className={styles.statNumber}>{blogStats.readerRetention}%</span>
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
              <div className={styles.blogSubmissionOverlay}>
                <div className={styles.blogSubmissionContainer}>
                  <div className={styles.blogSubmissionHeader}>
                    <h3>Submit a New Blog Post</h3>
                    <button 
                      className={styles.closeButton}
                      onClick={() => setShowBlogSubmissionForm(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className={styles.blogSubmissionContent}>
                    <BlogSubmissionForm 
                      onSubmit={handleBlogSubmit}
                      displayName={userInfo.displayName}
                      bloggerId={userInfo.id}
                      isBlogger={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {blogSubmissions.length === 0 ? (
              <p className={styles.emptyState}>No blog submissions yet. Submit your first blog post!</p>
            ) : (
              <>
                <div className={styles.premiumFeatures}>
                  <div className={styles.featureBanner}>
                    <div className={styles.featureText}>Premium Features: Unlimited blog posts • Priority review • Advanced analytics</div>
                  </div>
                </div>
                <div className={styles.submissionsList}>
                  {blogSubmissions.map(submission => (
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
                          <h4 className={styles.submissionTitle}>
                            {submission.title}
                            {submission.status === 'approved' && !submission.isActive && (
                              <span className={styles.inactiveIndicator}> • Inactive</span>
                            )}
                          </h4>
                          <p className={styles.submissionDescription}>
                            {submission.description}
                          </p>
                        </div>

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
                          </span>
                        </div>

                        {submission.status === 'approved' && submission.isActive && (
                          <div className={styles.premiumMetrics}>
                            <div className={styles.metricItem}>
                              <span className={styles.metricValue}>{submission.views}</span>
                              <span className={styles.metricLabel}>Views</span>
                            </div>
                            <div className={styles.metricItem}>
                              <span className={styles.metricValue}>{submission.clicks}</span>
                              <span className={styles.metricLabel}>Clicks</span>
                            </div>
                            <div className={styles.metricItem}>
                              <span className={styles.metricValue}>{submission.ctr}%</span>
                              <span className={styles.metricLabel}>CTR</span>
                            </div>
                            <div className={styles.metricItem}>
                              <span className={styles.metricValue}>${submission.revenue}</span>
                              <span className={styles.metricLabel}>Revenue</span>
                            </div>
                            <div className={styles.metricItem}>
                              <span className={styles.metricValue}>{submission.avgTimeOnPage}m</span>
                              <span className={styles.metricLabel}>Avg Time</span>
                            </div>
                            <div className={styles.metricItem}>
                              <span className={styles.metricValue}>{submission.bounceRate}%</span>
                              <span className={styles.metricLabel}>Bounce</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={styles.submissionActions}>
                        <button className={styles.editButton}>
                          Edit
                        </button>
                        {submission.status === 'approved' && (
                          <button 
                            className={`${styles.activationButton} ${submission.isActive ? styles.deactivate : styles.activate}`}
                            onClick={() => togglePostActivation(submission.id)}
                          >
                            {submission.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className={styles.content}>
            <div className={styles.sectionHeader}>
              <h2>Advanced Analytics</h2>
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className={styles.timeframeSelect}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            
            {blogStats && (
              <>
                <div className={styles.analyticsGrid}>
                  <div className={styles.analyticsCard}>
                    <h4>Performance Overview</h4>
                    <div className={styles.performanceMetrics}>
                      <div className={styles.performanceItem}>
                        <span className={styles.performanceLabel}>Total Revenue</span>
                        <span className={styles.performanceValue}>${blogStats.totalRevenue}</span>
                        <span className={styles.performanceGrowth}>+12.3% vs last period</span>
                      </div>
                      <div className={styles.performanceItem}>
                        <span className={styles.performanceLabel}>Avg. CTR</span>
                        <span className={styles.performanceValue}>{blogStats.clickThroughRate}%</span>
                        <span className={styles.performanceGrowth}>+0.8% vs last period</span>
                      </div>
                      <div className={styles.performanceItem}>
                        <span className={styles.performanceLabel}>Reader Retention</span>
                        <span className={styles.performanceValue}>{blogStats.readerRetention}%</span>
                        <span className={styles.performanceGrowth}>+5.2% vs last period</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.analyticsCard}>
                    <h4>Top Performing Content</h4>
                    <div className={styles.topContent}>
                      {blogSubmissions
                        .filter(sub => sub.status === 'approved' && sub.isActive)
                        .sort((a, b) => (b.views || 0) - (a.views || 0))
                        .slice(0, 3)
                        .map(submission => (
                          <div key={submission.id} className={styles.topContentItem}>
                            <div className={styles.contentTitle}>{submission.title}</div>
                            <div className={styles.contentStats}>
                              <span>{submission.views} views</span>
                              <span>${submission.revenue} revenue</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className={styles.analyticsCard}>
                    <h4>Traffic Sources</h4>
                    <div className={styles.trafficSources}>
                      <div className={styles.sourceItem}>
                        <span className={styles.sourceName}>BlogRolly Direct</span>
                        <span className={styles.sourcePercentage}>45%</span>
                      </div>
                      <div className={styles.sourceItem}>
                        <span className={styles.sourceName}>Social Media</span>
                        <span className={styles.sourcePercentage}>28%</span>
                      </div>
                      <div className={styles.sourceItem}>
                        <span className={styles.sourceName}>Search Engines</span>
                        <span className={styles.sourcePercentage}>22%</span>
                      </div>
                      <div className={styles.sourceItem}>
                        <span className={styles.sourceName}>Other</span>
                        <span className={styles.sourcePercentage}>5%</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.analyticsCard}>
                    <h4>Audience Insights</h4>
                    <div className={styles.audienceInsights}>
                      <div className={styles.insightItem}>
                        <span className={styles.insightLabel}>Top Category</span>
                        <span className={styles.insightValue}>{blogStats.topPerformingCategory}</span>
                      </div>
                      <div className={styles.insightItem}>
                        <span className={styles.insightLabel}>Avg Session Duration</span>
                        <span className={styles.insightValue}>{blogStats.averageTimeOnSite}m</span>
                      </div>
                      <div className={styles.insightItem}>
                        <span className={styles.insightLabel}>Monthly Growth</span>
                        <span className={styles.insightValue}>+{blogStats.monthlyGrowth}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className={styles.content}>
            <h2>Premium Account Settings</h2>
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
                      accept=".jpg,.jpeg,.png,.webp,.gif"
                      onChange={handleProfilePictureChange}
                      className={styles.fileInput}
                    />
                    <label htmlFor="profilePicture" className={styles.uploadButton}>
                      Choose New Picture
                    </label>
                    <small className={styles.uploadHint}>
                      Max size: 5MB. Formats: JPG, PNG, WebP, GIF
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
                  rows={4}
                  maxLength={500}
                />
                <small className={styles.hint}>Premium accounts get extended bio length (500 characters)</small>
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
            <h2>Premium Subscription</h2>
            <div className={styles.billingSection}>
              <div className={styles.currentPlan}>
                <div className={styles.planHeader}>
                  <h3>Current Plan: Premium</h3>
                  <span className={styles.premiumBadgeSmall}>👑 Premium</span>
                </div>
                <p>You're subscribed to our premium tier with unlimited features and priority support.</p>
                <div className={styles.planFeatures}>
                  <ul>
                    <li>✅ Unlimited blog submissions</li>
                    <li>✅ Advanced analytics and insights</li>
                    <li>✅ Priority review for submissions</li>
                    <li>✅ Revenue sharing program</li>
                    <li>✅ Custom blog categories</li>
                    <li>✅ Priority support</li>
                    <li>✅ Export analytics data</li>
                    <li>✅ Custom profile themes</li>
                  </ul>
                </div>
                <div className={styles.billingInfo}>
                  <p><strong>Next billing date:</strong> February 15, 2024</p>
                  <p><strong>Amount:</strong> $19/month</p>
                  <p><strong>Payment method:</strong> •••• 4242</p>
                </div>
                <div className={styles.billingActions}>
                  <button className={styles.manageButton}>Manage Subscription</button>
                  <button className={styles.invoicesButton}>View Invoices</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className={styles.content}>
            <h2>Premium Support</h2>
            <div className={styles.helpSection}>
              <div className={styles.helpItem}>
                <h3>Priority Support</h3>
                <p>Get direct access to our premium support team with guaranteed response times</p>
                <button className={styles.helpButton}>Contact Premium Support</button>
              </div>
              <div className={styles.helpItem}>
                <h3>Advanced Features Guide</h3>
                <p>Learn how to make the most of your premium analytics and features</p>
                <button className={styles.helpButton}>View Premium Guide</button>
              </div>
              <div className={styles.helpItem}>
                <h3>Revenue Optimization</h3>
                <p>Tips and strategies to maximize your blog's revenue potential</p>
                <button className={styles.helpButton}>Revenue Guide</button>
              </div>
              <div className={styles.helpItem}>
                <h3>Submission Guidelines</h3>
                <p>Premium guidelines for getting your content featured prominently</p>
                <button 
                  className={styles.helpButton}
                  onClick={() => setShowSubmissionGuidelinesPopup(true)}
                >
                  View Guidelines
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout title="Premium Blogger Profile - Blogrolly">
      <div className={styles.profileContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Premium Dashboard</h3>
            <span className={styles.premiumBadgeSmall}>👑</span>
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
              className={`${styles.navItem} ${activeSection === 'analytics' ? styles.active : ''}`}
              onClick={() => setActiveSection('analytics')}
            >
              Advanced Analytics
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
              Subscription
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'help' ? styles.active : ''}`}
              onClick={() => setActiveSection('help')}
            >
              Premium Support
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

      {/* Submission Guidelines Popup */}
      <SubmissionGuidelinesPopup
        isOpen={showSubmissionGuidelinesPopup}
        onClose={() => setShowSubmissionGuidelinesPopup(false)}
      />
    </Layout>
  );
};

export default BloggerProfilePremium;
