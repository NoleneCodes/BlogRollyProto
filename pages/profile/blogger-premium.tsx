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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Mock pro blogger user data
        setUserInfo({
          id: 'pro-blogger-123',
          name: 'Pro Blogger',
          email: 'pro@example.com',
          displayName: 'Pro Content Creator',
          bio: 'Professional content creator and thought leader in tech innovation',
          joinedDate: '2023-06-15',
          blogName: 'Innovation Insights Pro',
          blogUrl: 'https://innovationinsightspro.com',
          topics: ['Tech', 'Innovation', 'Business', 'AI'],
          roles: ['blogger'],
          tier: 'pro'
        });

        // Initialize social links
        setSocialLinks({
          twitter: 'https://twitter.com/problogger',
          linkedin: 'https://linkedin.com/in/problogger',
          instagram: '',
          youtube: '',
          tiktok: '',
          github: 'https://github.com/problogger'
        });

        // Mock pro blog submissions (unlimited)
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
            ctr: 8.2,
            bounceRate: 24.8,
            tags: ['AI', 'Enterprise', 'Software Development', 'Future Tech']
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
            ctr: 8.0,
            bounceRate: 18.5,
            tags: ['SaaS', 'Architecture', 'Scalability']
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
            ctr: 7.5,
            bounceRate: 28.3,
            tags: ['Leadership', 'Remote Work', 'Team Management']
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
            ctr: 8.9,
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
            ctr: 7.6,
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
            ctr: 0,
            bounceRate: 0
          }
        ]);

        // Mock pro blog stats
        setBlogStats({
          totalViews: 17800,
          monthlyViews: 4250,
          totalClicks: 1450,
          monthlyClicks: 312,
          totalSubmissions: 15,
          approvedSubmissions: 12,
          clickThroughRate: 8.1,
          averageTimeOnSite: 5.4,
          monthlyGrowth: 23.7,
          topPerformingCategory: 'Tech',
          readerRetention: 68.3
        });

        // Load saved drafts from localStorage
        loadSavedDrafts();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadSavedDrafts = () => {
    const savedDraft = localStorage.getItem('blogSubmissionDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const { savedAt, ...draftFormData } = draft;

        // Only add draft if it has meaningful content
        if (draftFormData.title || draftFormData.description || draftFormData.postUrl) {
          const draftSubmission: BlogSubmission = {
            id: 'draft-' + Date.now().toString(),
            title: draftFormData.title || 'Untitled Draft',
            url: draftFormData.postUrl || '',
            category: draftFormData.category || 'Other',
            status: 'draft',
            submittedDate: new Date().toISOString().split('T')[0],
            views: 0,
            clicks: 0,
            description: draftFormData.description || 'Draft in progress...',
            image: null,
            imageDescription: draftFormData.imageDescription || '',
            ctr: 0,
            bounceRate: 0
          };

          setBlogSubmissions(prev => {
            // Check if draft already exists to avoid duplicates
            const existingDraftIndex = prev.findIndex(sub => sub.status === 'draft' && sub.title === draftSubmission.title);
            if (existingDraftIndex >= 0) {
              // Update existing draft
              const updated = [...prev];
              updated[existingDraftIndex] = draftSubmission;
              return updated;
            } else {
              // Add new draft
              return [draftSubmission, ...prev];
            }
          });
        }
      } catch (error) {
        console.error('Error loading saved draft:', error);
      }
    }
  };

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


  if (isLoading) {
    return (
      <Layout title="Pro Blogger Profile - Blogrolly">
        <div className={styles.loading}>
          <h2>Loading your pro profile...</h2>
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
          <PremiumOverviewTab
            userInfo={userInfo}
            blogStats={blogStats}
            blogSubmissions={blogSubmissions}
            viewsToggle={viewsToggle}
            setViewsToggle={setViewsToggle}
            clicksToggle={clicksToggle}
            setClicksToggle={setClicksToggle}
          />
        );
      case 'blogroll':
        return (
          <PremiumBlogrollTab
            blogSubmissions={blogSubmissions}
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
            blogStats={blogStats}
            blogSubmissions={blogSubmissions}
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
                <label>Username</label>
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
                <div className={styles.blogUrlSection}>
                  <input 
                    type="url" 
                    value={userInfo.blogUrl} 
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
                  defaultValue={userInfo.bio} 
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
                    {userInfo.topics && userInfo.topics.length > 0 ? (
                      userInfo.topics.map(topic => (
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
                  displayName={userInfo.displayName}
                  bloggerId={userInfo.id}
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