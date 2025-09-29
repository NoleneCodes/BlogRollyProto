

// ...existing code...

// Place handler functions after state declarations (inside the component)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogSubmissionForm from '../../components/BlogSubmissionForm';
import HowItWorksPopup from '../../components/HowItWorksPopup';
import SubmissionGuidelinesPopup from '../../components/SubmissionGuidelinesPopup';
import ContactSupportPopup from '../../components/ContactSupportPopup';
import BugReportModal from '../../components/BugReportModal';
import PremiumBlogCard from '../../components/PremiumBlogCard';
import styles from '../../styles/BloggerProfilePremium.module.css';
import ProBillingSubscription from '../../components/bloggerPremium/ProBillingSubscription';
import FeedbackPopup from '../../components/FeedbackPopup';
import PremiumOverviewTab from '../../components/bloggerPremium/PremiumOverviewTab';
import PremiumBlogrollTab from '../../components/bloggerPremium/PremiumBlogrollTab';
import PremiumAnalyticsTab from '../../components/bloggerPremium/PremiumAnalyticsTab';
import ProHelpSupport from '../../components/bloggerPremium/ProHelpSupport';
import ProSocialLinks from '../../components/bloggerPremium/ProSocialLinks';
import { MAIN_CATEGORIES, TAGS } from '../../lib/categories-tags';
import { getBloggerProfileByUserId, supabaseDB } from '../../lib/supabase';
import { FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaTiktok, FaGithub } from 'react-icons/fa';

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
  tier: 'pro';
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
  imageDescription?: string;
  ctr?: number;
  bounceRate?: number;
  tags?: string[];
}

interface BlogStats {
  totalViews: number;
  monthlyViews: number;
  totalClicks: number;
  monthlyClicks: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  clickThroughRate: number;
  averageTimeOnSite: number;
  monthlyGrowth: number;
  topPerformingCategory: string;
  readerRetention: number;
}

const BloggerProfilePremium: React.FC = () => {
  useEffect(() => {
    // For demo/testing: always show the mock profile after loading
    setIsLoading(false);
  }, []);
  // Handler to toggle post activation status
  const togglePostActivation = (postId: string) => {
    setBlogSubmissions(prev => prev.map(post => {
      if (post.id === postId && post.status === 'approved') {
        return { ...post, isActive: !post.isActive };
      }
      return post;
    }));
  };

  // Handler to switch to reader view (placeholder)
  const handleSwitchToReader = () => {
    alert('Switching to reader view...');
    // Implement navigation logic as needed
  };

  // Handler to log out (placeholder)
  const handleLogout = () => {
    alert('Logging out...');
    // Implement logout logic as needed
  };

  // Handler for loading saved drafts (placeholder)
  const loadSavedDrafts = () => {
    // Implement logic to load saved drafts if needed
  };
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
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
  const [showHowItWorksPopup, setShowHowItWorksPopup] = useState<boolean>(false);
  const [showSubmissionGuidelinesPopup, setShowSubmissionGuidelinesPopup] = useState<boolean>(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('30d');
  const [viewsToggle, setViewsToggle] = useState<'total' | 'monthly'>('total');
  const [clicksToggle, setClicksToggle] = useState<'total' | 'monthly'>('total');
  const [showContactSupportPopup, setShowContactSupportPopup] = useState<boolean>(false);
  const [showBugReportPopup, setShowBugReportPopup] = useState<boolean>(false);
  const [showTopicEditPopup, setShowTopicEditPopup] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    linkedin: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    github: ''
  });
  const [blogrollFilter, setBlogrollFilter] = useState<string>('all');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // ...existing code...
  // ...existing code...
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Pro: 5MB limit
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
      url: formData.postUrl,
      category: formData.category,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      views: 0,
      clicks: 0,
      description: formData.description,
      image: formData.image ? URL.createObjectURL(formData.image) : null,
      imageDescription: formData.imageDescription,
      ctr: 0,
      bounceRate: 0
    };
    setBlogSubmissions(prev => [newSubmission, ...prev]);
    setShowBlogSubmissionForm(false);
    setActiveSection('blogroll');
  };

  const validateBlogUrl = (url: string): boolean => {
    const urlRegex = /^https:\/\/[a-zA-Z0-9\-\.]+\.[a-z]{2,}$/;
    return urlRegex.test(url);
  };

  const handleEditBlog = (blogId: string) => {
    setEditingBlog(blogId);
  };

  const handleSaveBlogEdit = (blogId: string, updatedData: any) => {
    setBlogSubmissions(prev => prev.map(submission => {
      if (submission.id === blogId) {
        return {
          ...submission,
          title: updatedData.title,
          description: updatedData.description,
          url: updatedData.url,
          category: updatedData.category,
          tags: updatedData.tags,
          image: updatedData.imagePreview || submission.image
        };
      }
      return submission;
    }));
    setEditingBlog(null);
  };

  const handleCancelBlogEdit = () => {
    setEditingBlog(null);
  };

  const handleEditTopics = () => {
    setSelectedTopics([...userInfo!.topics]);
    setShowTopicEditPopup(true);
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    if (userInfo) {
      setUserInfo(prev => prev ? { 
        ...prev, 
        topics: prev.topics.filter(topic => topic !== topicToRemove) 
      } : null);
    }
  };

  const handleSaveTopics = () => {
    if (userInfo) {
      setUserInfo(prev => prev ? { ...prev, topics: selectedTopics } : null);
    }
    setShowTopicEditPopup(false);
  };

  const handleCancelTopicEdit = () => {
    setShowTopicEditPopup(false);
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleTopicChange = (category: string, isChecked: boolean) => {
    setUserInfo(prev => {
      if (!prev) return prev;

      let updatedTopics = [...prev.topics];
      if (isChecked) {
        updatedTopics = [...updatedTopics, category];
      } else {
        updatedTopics = updatedTopics.filter(topic => topic !== category);
      }

      return { ...prev, topics: updatedTopics };
    });
  };



  // TEMPORARY: Allow page to render with fallback mock data if no userInfo (for testing UI)
  let displayUserInfo = userInfo;
  let displayBlogSubmissions = blogSubmissions;
  let displayBlogStats = blogStats;
  if (!displayUserInfo) {
    // Mock blog submissions (simulate real data)
    displayBlogSubmissions = [
      {
        id: 'mock-1',
        title: 'How to Grow Your Blog Audience in 2025',
        url: 'https://mockproblog.com/grow-audience',
        category: 'Tech',
        status: 'approved',
        submittedDate: '2025-08-01',
        views: 1200,
        clicks: 180,
        isActive: true,
        description: 'A comprehensive guide to growing your blog audience with actionable tips.',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        imageDescription: 'Laptop and coffee',
        ctr: 15,
        bounceRate: 40,
        tags: ['Growth', 'Audience']
      },
      {
        id: 'mock-2',
        title: 'Monetizing Your Blog: Pro Strategies',
        url: 'https://mockproblog.com/monetize',
        category: 'Lifestyle',
        status: 'approved',
        submittedDate: '2025-08-15',
        views: 900,
        clicks: 120,
        isActive: false,
        description: 'Learn how to monetize your blog with these proven strategies.',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
        imageDescription: 'Money and notebook',
        ctr: 13.3,
        bounceRate: 35,
        tags: ['Monetization', 'Strategy']
      },
      {
        id: 'mock-3',
        title: 'The Best Blogging Tools for Pros',
        url: 'https://mockproblog.com/tools',
        category: 'Tech',
        status: 'pending',
        submittedDate: '2025-09-01',
        views: 300,
        clicks: 30,
        isActive: true,
        description: 'A roundup of the best tools every pro blogger should use.',
        image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
        imageDescription: 'Desk with tech gadgets',
        ctr: 10,
        bounceRate: 50,
        tags: ['Tools', 'Productivity']
      }
    ];

    // Mock user info
    displayUserInfo = {
      id: 'mock-pro-user',
      name: 'Test Pro Blogger',
      email: 'pro@example.com',
      displayName: 'Test Pro Blogger',
      bio: 'This is a mock pro blogger profile for UI testing.',
      joinedDate: '2024-01-15',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91',
      blogName: 'Mock Pro Blog',
      blogUrl: 'https://mockproblog.com',
      topics: ['Lifestyle', 'Tech'],
      roles: ['blogger'],
      tier: 'pro'
    };

    // Mock blog stats (aggregate from mock submissions)
    const totalViews = displayBlogSubmissions.reduce((sum, sub) => sum + (sub.views || 0), 0);
    const totalClicks = displayBlogSubmissions.reduce((sum, sub) => sum + (sub.clicks || 0), 0);
    const monthlyViews = displayBlogSubmissions.filter(sub => sub.submittedDate.startsWith('2025-09')).reduce((sum, sub) => sum + (sub.views || 0), 0);
    const monthlyClicks = displayBlogSubmissions.filter(sub => sub.submittedDate.startsWith('2025-09')).reduce((sum, sub) => sum + (sub.clicks || 0), 0);
    const approvedSubmissions = displayBlogSubmissions.filter(sub => sub.status === 'approved').length;
    const clickThroughRate = totalViews > 0 ? ((totalClicks / totalViews) * 100) : 0;
    displayBlogStats = {
      totalViews,
      monthlyViews,
      totalClicks,
      monthlyClicks,
      totalSubmissions: displayBlogSubmissions.length,
      approvedSubmissions,
      clickThroughRate: parseFloat(clickThroughRate.toFixed(1)),
      averageTimeOnSite: 2.5,
      monthlyGrowth: 8.2,
      topPerformingCategory: 'Tech',
      readerRetention: 78
    };
  }

  if (isLoading) {
    return (
      <Layout title="Pro Blogger Profile - Blogrolly">
        <div className={styles.loading}>
          <h2>Loading your profile...</h2>
        </div>
      </Layout>
    );
  }

  const renderContent = () => {
    // Use displayBlogStats and displayBlogSubmissions for both real and mock
    switch (activeSection) {
      case 'overview':
        return (
          <PremiumOverviewTab
            userInfo={displayUserInfo}
            blogStats={displayBlogStats}
            blogSubmissions={displayBlogSubmissions}
            viewsToggle={viewsToggle}
            setViewsToggle={setViewsToggle}
            clicksToggle={clicksToggle}
            setClicksToggle={setClicksToggle}
          />
        );
      case 'blogroll':
        return (
          <PremiumBlogrollTab
            blogSubmissions={displayBlogSubmissions}
            blogrollFilter={blogrollFilter}
            setBlogrollFilter={setBlogrollFilter}
            editingBlog={editingBlog}
            startEditingBlog={handleEditBlog}
            cancelEditingBlog={handleCancelBlogEdit}
            saveEditedBlog={handleSaveBlogEdit}
            handleEditField={() => {}}
            handleSaveEdit={() => {}}
            togglePostActivation={togglePostActivation}
            setShowBlogSubmissionForm={setShowBlogSubmissionForm}
          />
        );
      case 'analytics':
        return (
          <PremiumAnalyticsTab
            blogStats={displayBlogStats}
            blogSubmissions={displayBlogSubmissions}
            selectedTimeframe={selectedTimeframe}
            setSelectedTimeframe={setSelectedTimeframe}
          />
        );

      case 'settings':
        return (
          <div className={styles.content}>
            <h2 style={{ color: '#c42142' }}>Account Settings</h2>
            <div className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label>Profile Picture</label>
                <div className={styles.profilePictureSection}>
                  <div className={styles.currentPicture}>
                    {profilePicturePreview || displayUserInfo.avatar ? (
                      <img 
                        src={profilePicturePreview || displayUserInfo.avatar} 
                        alt="profile picture" 
                        className={styles.previewImage}
                      />
                    ) : (
                      <div className={styles.previewPlaceholder}>
                        {getInitials(displayUserInfo.displayName || displayUserInfo.name)}
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
                <label>Username</label>
                <input 
                  type="text" 
                  defaultValue={displayUserInfo.displayName} 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input 
                  type="email" 
                  defaultValue={displayUserInfo.email} 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Blog Name</label>
                <input 
                  type="text" 
                  defaultValue={displayUserInfo.blogName} 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Blog URL</label>
                <div className={styles.blogUrlSection}>
                  <input 
                    type="url" 
                    value={displayUserInfo.blogUrl} 
                    className={`${styles.input} ${styles.readOnlyInput}`}
                    readOnly
                  />
                </div>
                <small className={styles.urlChangeHint}>
                  Blog URL cannot be changed after initial setup.
                </small>
              </div>
              <div className={styles.formGroup}>
                <label>Bio</label>
                <textarea 
                  defaultValue={displayUserInfo.bio} 
                  className={styles.textarea}
                  rows={4}
                  maxLength={500}
                />
                <small className={styles.hint}>Pro accounts get extended bio length (500 characters)</small>
              </div>

              <div className={styles.formGroup}>
                <label>Blog Topics / Niche</label>
                <small className={styles.hint}>Topics that describe your blog content</small>
                <div className={styles.topicsDisplaySection}>
                  <div className={styles.topicTags}>
                    {displayUserInfo.topics && displayUserInfo.topics.length > 0 ? (
                      displayUserInfo.topics.map(topic => (
                        <span key={topic} className={styles.topicTag}>
                          {topic}
                          <button 
                            type="button"
                            className={styles.topicRemove}
                            onClick={() => handleRemoveTopic(topic)}
                            title={`Remove ${topic}`}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className={styles.noTopics}>No topics selected</span>
                    )}
                  </div>
                  <button 
                    type="button"
                    className={styles.editTopicsButton} 
                    onClick={handleEditTopics}
                  >
                    Edit Topics
                  </button>
                </div>
              </div>

              <ProSocialLinks socialLinks={socialLinks} handleSocialLinkChange={handleSocialLinkChange} />

              <button className={styles.saveButton} onClick={handleSaveSettings}>
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'billing':
        return (
          <ProBillingSubscription onOpenFeedback={() => setShowFeedbackPopup(true)} />
        );

      case 'help':
        return (
          <ProHelpSupport
            setShowBugReportPopup={setShowBugReportPopup}
            setShowSubmissionGuidelinesPopup={setShowSubmissionGuidelinesPopup}
            setShowHowItWorksPopup={setShowHowItWorksPopup}
            setShowContactSupportPopup={setShowContactSupportPopup}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Layout title="Pro Blogger Profile - Blogrolly">
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
              className={`${styles.navItem} ${activeSection === 'analytics' ? styles.active : ''}`}
              onClick={() => setActiveSection('analytics')}
            >
              Advanced Analytics
            </button>
            <button className={`${styles.navItem} ${styles.submitBlog} ${activeSection === 'submit' ? styles.active : ''}`}
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

        {/* Blog Submission Popup - Available from any section */}
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
                  onDraftSaved={loadSavedDrafts}
                  displayName={displayUserInfo.displayName}
                  bloggerId={displayUserInfo.id}
                  isBlogger={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How It Works Popup */}
      <HowItWorksPopup
        isOpen={showHowItWorksPopup}
        onClose={() => setShowHowItWorksPopup(false)}
      />

      {/* Submission Guidelines Popup */}
      <SubmissionGuidelinesPopup
        isOpen={showSubmissionGuidelinesPopup}
        onClose={() => setShowSubmissionGuidelinesPopup(false)}
      />


      {/* Feedback Popup */}
      <FeedbackPopup
        isOpen={showFeedbackPopup}
        onClose={() => setShowFeedbackPopup(false)}
      />

      {/* Bug Report Modal */}
      <BugReportModal
        isOpen={showBugReportPopup}
        onClose={() => setShowBugReportPopup(false)}
      />

      {/* Topic Edit Popup */}
      {showTopicEditPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <div className={styles.popupHeader}>
              <h3>Edit Your Blog Topics</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCancelTopicEdit}
              >
                ×
              </button>
            </div>
            <div className={styles.popupBody}>
              <p className={styles.popupDescription}>
                  Select up to 7 topics that best describe your blog content. This helps readers discover your content.
                </p>

              <div className={styles.topicSection}>
                <h4>Main Categories</h4>
                <div className={styles.topicGrid}>
                  {MAIN_CATEGORIES.map(category => {
                          const isSelected = selectedTopics.includes(category);
                          const isDisabled = !isSelected && selectedTopics.length >= 7;
                          return (
                            <label 
                              key={category} 
                              className={`${styles.topicLabel} ${isDisabled ? styles.disabled : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleTopicToggle(category)}
                                className={styles.topicCheckbox}
                                disabled={isDisabled}
                              />
                              <span className={styles.topicText}>{category}</span>
                            </label>
                          );
                        })}
                </div>
              </div>

              <div className={styles.topicSection}>
                <h4>Specific Topics & Tags</h4>
                <div className={styles.tagCategories}>
                  {Object.entries(TAGS).map(([categoryName, tags]) => (
                    <details key={categoryName} className={styles.tagCategory}>
                      <summary className={styles.tagCategoryTitle}>{categoryName}</summary>
                      <div className={styles.tagCategoryGrid}>
                        {tags.filter(tag => tag !== 'Other').map(tag => {
                            const isSelected = selectedTopics.includes(tag);
                            const isDisabled = !isSelected && selectedTopics.length >= 5;
                            return (
                              <label 
                                key={tag} 
                                className={`${styles.topicLabel} ${isDisabled ? styles.disabled : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleTopicToggle(tag)}
                                  className={styles.topicCheckbox}
                                  disabled={isDisabled}
                                />
                                <span className={styles.topicText}>{tag}</span>
                              </label>
                            );
                          })}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              <div className={styles.popupActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={handleCancelTopicEdit}
                >
                  Cancel
                </button>
                <button 
                  className={styles.saveButton}
                  onClick={handleSaveTopics}
                >
                  Save Topics ({selectedTopics.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default BloggerProfilePremium;