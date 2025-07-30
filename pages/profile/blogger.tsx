import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogSubmissionForm from '../../components/BlogSubmissionForm';
import SubmissionGuidelinesPopup from '../../components/SubmissionGuidelinesPopup';
import ContactSupportPopup from '../../components/ContactSupportPopup';
import BugReportModal from '../../components/BugReportModal';
import HowItWorksPopup from '../../components/HowItWorksPopup';
import styles from '../../styles/BloggerProfile.module.css';
import PremiumFeatureGuard from '../../components/PremiumFeatureGuard';

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
  description?: string;
  image?: string;
  imageDescription?: string;
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
  const [showContactSupportPopup, setShowContactSupportPopup] = useState<boolean>(false);
  const [showBugReportPopup, setShowBugReportPopup] = useState<boolean>(false);
  const [showStripePricingModal, setShowStripePricingModal] = useState<boolean>(false);
  const [blogrollFilter, setBlogrollFilter] = useState<string>('all');


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
            isActive: true,
            description: 'Exploring how remote work is reshaping the modern workplace and what it means for the future.',
            image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=200&fit=crop'
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
            isActive: true,
            description: 'Simple strategies to create morning routines that set you up for success throughout the day.',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop'
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
            isActive: true,
            description: 'Practical tips for maintaining healthy boundaries between your professional and personal life.',
            image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=200&fit=crop'
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
            isActive: false,
            description: 'Deep dive into advanced JavaScript concepts and patterns that every developer should know.',
            image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop'
          },
          {
            id: '5',
            title: 'AI in Content Creation',
            url: 'https://techlifeinsights.com/ai-content',
            category: 'Tech',
            status: 'pending',
            submittedDate: '2024-01-25',
            views: 0,
            clicks: 0,
            description: 'How artificial intelligence is transforming the way we create and consume content online.',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop'
          },
          {
            id: '6',
            title: 'Productivity Hacks for Developers',
            url: '',
            category: 'Tech',
            status: 'draft',
            submittedDate: '2024-01-28',
            views: 0,
            clicks: 0,
            description: 'Boost your coding productivity with these proven techniques and tools.',
            image: null
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
            imageDescription: draftFormData.imageDescription || ''
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
      url: formData.postUrl,
      category: formData.category,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      views: 0,
      clicks: 0,
      description: formData.description,
      image: formData.image ? URL.createObjectURL(formData.image) : null,
      imageDescription: formData.imageDescription
    };
    setBlogSubmissions(prev => [newSubmission, ...prev]);
    setShowBlogSubmissionForm(false);
    setActiveSection('blogroll');
  };

  const startEditingBlog = (blog: BlogSubmission) => {
    setEditingBlog(blog.id);
    setEditForm({
      title: blog.title,
      description: blog.description || '',
      url: blog.url,
      image: null,
      imagePreview: blog.image || null
    });
  };

  const cancelEditingBlog = () => {
    setEditingBlog(null);
    setEditForm({
      title: '',
      description: '',
      url: '',
      image: null,
      imagePreview: null
    });
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setEditForm(prev => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm(prev => ({ ...prev, imagePreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEditedBlog = (blogId: string) => {
    setBlogSubmissions(prev => prev.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          title: editForm.title,
          description: editForm.description,
          url: editForm.url,
          image: editForm.image ? URL.createObjectURL(editForm.image) : editForm.imagePreview
        };
      }
      return blog;
    }));

    setEditingBlog(null);
    setEditForm({
      title: '',
      description: '',
      url: '',
      image: null,
      imagePreview: null
    });
  };

  const handleEditField = (submissionId: string, field: string, value: string) => {
    setEditingSubmission(submissionId);
    setEditingField(field);
    switch (field) {
      case 'title':
        setEditedTitle(value);
        break;
      case 'description':
        setEditedDescription(value);
        break;
      case 'image':
        setEditedImage(value);
        break;
      default:
        break;
    }
  };

  const handleSaveEdit = (submissionId: string, field: string, value: string) => {
    setBlogSubmissions(prev => prev.map(submission => {
      if (submission.id === submissionId) {
        return {
          ...submission,
          [field]: value
        };
      }
      return submission;
    }));
    setEditingSubmission(null);
    setEditingField(null);
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

            {blogSubmissions.length === 0 ? (
              <p className={styles.emptyState}>No blog submissions yet. Submit your first blog post!</p>
            ) : (
              <>
                <div className={styles.tierLimitation}>
                 <div className={styles.tierBanner}>
                  <div className={styles.tierText}>Free Tier: You can have up to 3 active blog posts</div>
                  <div className={styles.postCount}>You currently have <span className={styles.currentCount}>{blogSubmissions.filter(post => post.status === 'approved' && post.isActive).length}</span>/3 active posts</div>
                 </div>
                </div>
                
                <div className={styles.blogrollFilters}>
                  <div className={styles.filterButtons}>
                    <button 
                      className={`${styles.filterButton} ${blogrollFilter === 'all' ? styles.active : ''}`}
                      onClick={() => setBlogrollFilter('all')}
                    >
                      All ({blogSubmissions.length})
                    </button>
                    <button 
                      className={`${styles.filterButton} ${blogrollFilter === 'draft' ? styles.active : ''}`}
                      onClick={() => setBlogrollFilter('draft')}
                    >
                      Drafts ({blogSubmissions.filter(post => post.status === 'draft').length})
                    </button>
                    <button 
                      className={`${styles.filterButton} ${blogrollFilter === 'live' ? styles.active : ''}`}
                      onClick={() => setBlogrollFilter('live')}
                    >
                      Live ({blogSubmissions.filter(post => post.status === 'approved' && post.isActive).length})
                    </button>
                    <button 
                      className={`${styles.filterButton} ${blogrollFilter === 'inactive' ? styles.active : ''}`}
                      onClick={() => setBlogrollFilter('inactive')}
                    >
                      Inactive ({blogSubmissions.filter(post => post.status === 'approved' && !post.isActive).length})
                    </button>
                    <button 
                      className={`${styles.filterButton} ${blogrollFilter === 'pending' ? styles.active : ''}`}
                      onClick={() => setBlogrollFilter('pending')}
                    >
                      Pending ({blogSubmissions.filter(post => post.status === 'pending').length})
                    </button>
                  </div>
                </div>
                <div className={styles.submissionsList}>
                  {blogSubmissions.filter(submission => {
                    if (blogrollFilter === 'all') return true;
                    if (blogrollFilter === 'draft') return submission.status === 'draft';
                    if (blogrollFilter === 'live') return submission.status === 'approved' && submission.isActive;
                    if (blogrollFilter === 'inactive') return submission.status === 'approved' && !submission.isActive;
                    if (blogrollFilter === 'pending') return submission.status === 'pending';
                    return true;
                  }).map(submission => (
                    <div key={submission.id} className={styles.submissionItem}>
                      {editingBlog === submission.id ? (
                        <div className={styles.editBlogForm}>
                          <div className={styles.editImageSection}>
                            {editForm.imagePreview && (
                              <div className={styles.editImagePreview}>
                                <img src={editForm.imagePreview} alt="Blog preview" />
                              </div>
                            )}
                            <div className={styles.editImageUpload}>
                              <input
                                type="file"
                                id={`editImage-${submission.id}`}
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={handleEditImageChange}
                                className={styles.fileInput}
                              />
                              <label htmlFor={`editImage-${submission.id}`} className={styles.uploadButton}>
                                {editForm.imagePreview ? 'Change Image' : 'Add Image'}
                              </label>
                            </div>
                          </div>
                          <div className={styles.editFormFields}>
                            <div className={styles.editField}>
                              <label>Title</label>
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                className={styles.editInput}
                              />
                            </div>
                            <div className={styles.editField}>
                              <label>Description</label>
                              <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                className={styles.editTextarea}
                                rows={3}
                              />
                            </div>
                            <div className={styles.editField}>
                              <label>URL</label>
                              <input
                                type="url"
                                value={editForm.url}
                                onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                                className={styles.editInput}
                              />
                            </div>
                          </div>
                          <div className={styles.editActions}>
                            <button 
                              className={styles.saveButton}
                              onClick={() => saveEditedBlog(submission.id)}
                            >
                              Save Changes
                            </button>
                            <button 
                              className={styles.cancelButton}
                              onClick={cancelEditingBlog}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (



                    <div key={submission.id} className={styles.submissionCard}>
                          <div className={styles.submissionImageContainer}>
                            {editingSubmission === submission.id && editingField === 'image' ? (
                              <input
                                type="url"
                                value={editedImage}
                                onChange={(e) => setEditedImage(e.target.value)}
                                className={styles.editInput}
                                placeholder="Image URL"
                                onBlur={() => handleSaveEdit(submission.id, 'image', editedImage)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(submission.id, 'image', editedImage)}
                                autoFocus
                              />
                            ) : submission.image ? (
                              <img 
                                src={submission.image} 
                                alt={submission.title}
                                className={styles.submissionImage}
                                onClick={() => handleEditField(submission.id, 'image', submission.image)}
                              />
                            ) : (
                              <div 
                                className={styles.submissionImagePlaceholder}
                                onClick={() => handleEditField(submission.id, 'image', '')}
                              >
                                Click to add image
                              </div>
                            )}
                          </div>

                          <div className={styles.submissionContent}>
                            <div className={styles.submissionHeader}>
                              <div className={styles.submissionDetails}>
                                <h4 className={styles.submissionTitle}>
                                  {editingSubmission === submission.id && editingField === 'title' ? (
                                    <input
                                      type="text"
                                      value={editedTitle}
                                      onChange={(e) => setEditedTitle(e.target.value)}
                                      className={styles.editInput}
                                      onBlur={() => handleSaveEdit(submission.id, 'title', editedTitle)}
                                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(submission.id, 'title', editedTitle)}
                                      autoFocus
                                    />
                                  ) : (
                                    <span onClick={() => handleEditField(submission.id, 'title', submission.title)}>
                                      {submission.title}
                                      {submission.status === 'approved' && !submission.isActive && (
                                        <span className={styles.inactiveIndicator}> • Inactive</span>
                                      )}
                                    </span>
                                  )}
                                </h4>

                                <p className={styles.submissionDescription}>
                                  {editingSubmission === submission.id && editingField === 'description' ? (
                                    <textarea
                                      value={editedDescription}
                                      onChange={(e) => setEditedDescription(e.target.value)}
                                      className={styles.editTextarea}
                                      onBlur={() => handleSaveEdit(submission.id, 'description', editedDescription)}
                                      autoFocus
                                      rows={2}
                                    />
                                  ) : (
                                    <span onClick={() => handleEditField(submission.id, 'description', submission.description)}>
                                      {submission.description}
                                    </span>
                                  )}
                                </p>

                              </div>
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
                                  {submission.status === 'approved' && !submission.isActive && (
                                    <span className={styles.inactiveIndicator}> • Inactive</span>
                                  )}
                                </span>
                              </div>
                          </div>
                          <div className={styles.submissionActions}>
                            <button 
                              className={styles.editButton}
                              onClick={() => startEditingBlog(submission)}
                            >
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





                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'stats':
        return (
          <PremiumFeatureGuard>
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
          </PremiumFeatureGuard>
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
                    <li>List up to 3 blogs</li>
                    <li>Basic analytics</li>
                    <li>Community support</li>
                  </ul>
                </div>
              </div>
              <div className={styles.upgradeSection}>
                <h3>Upgrade to Pro</h3>
                <div className={styles.proFeatures}>
                  <ul>
                    <li>Unlimited blog listings</li>
                    <li>Advanced analytics and insights</li>
                    <li>Priority review for submissions</li>
                    <li>Priority Support</li>
                  </ul>
                </div>
                <button 
                  className={styles.upgradeButton}
                  onClick={() => setShowStripePricingModal(true)}
                >
                  Upgrade to Pro
                </button>
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
                <h3>Report a Bug</h3>
                <p>Help us improve BlogRolly by reporting any bugs or issues you encounter</p>
                <button 
                  className={styles.helpButton}
                  onClick={() => setShowBugReportPopup(true)}
                >
                  Report a Bug
                </button>
              </div>
              <div className={styles.helpItem}>
                <h3>Submission Guidelines</h3>
                <p>Learn about our content guidelines and best practices for blog submissions</p>
                <button 
                  className={styles.helpButton}
                  onClick={() => setShowSubmissionGuidelinesPopup(true)}
                >
                  View Guidelines
                </button>
              </div>
              <div className={styles.helpItem}>
                <h3>How It Works</h3>
                <p>Learn about our submission and review process for getting your blog featured</p>
                <button 
                  className={styles.helpButton}
                  onClick={() => setShowHowItWorksPopup(true)}
                >
                  Learn How It Works
                </button>
              </div>
              <div className={styles.helpItem}>
                <h3>Contact Support</h3>
                <p>Get help from our support team</p>
                <button 
                  className={styles.helpButton}
                  onClick={() => setShowContactSupportPopup(true)}
                >
                  Contact Us
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
    <Layout title="Blogger Profile - Blogrolly">
      <div className={styles.profileContainer}>
```python
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
            </button>            <button 
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

      {/* Contact Support Popup */}
      <ContactSupportPopup
        isOpen={showContactSupportPopup}
        onClose={() => setShowContactSupportPopup(false)}
      />

      {/* Bug Report Modal */}
      <BugReportModal
        isOpen={showBugReportPopup}
        onClose={() => setShowBugReportPopup(false)}
      />

      {/* Stripe Pricing Modal */}
      {showStripePricingModal && (
        <div className={styles.blogSubmissionOverlay}>
          <div className={styles.blogSubmissionContainer}>
            <div className={styles.blogSubmissionHeader}>
              <h3>Upgrade to Premium</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowStripePricingModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.stripePricingModalContent}>
              <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
              <stripe-pricing-table 
                pricing-table-id="prctbl_1RmgGoDyKgK2ioTOXJv76mNC"
                publishable-key="pk_live_51RmdBHDyKgK2ioTOQUE5HobCaWumlQZBswYQE02RvD9NOyOc1uKoRxuadHu8hS9i8MIbfMTOdi7oSHrGSJr444MD00A8xUCfbL">
              </stripe-pricing-table>
            </div>
          </div>
        </div>
      )}


    </Layout>
  );
};

export default BloggerProfile;