import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BugReportPopup from '../../components/BugReportPopup';
import styles from '../../styles/ReaderProfile.module.css';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  bio?: string;
  joinedDate: string;
  avatar?: string;
  topics: string[];
  roles: string[];
}

interface SavedBlog {
  id: string;
  title: string;
  author: string;
  savedDate: string;
  url: string;
  category: string;
}

interface ReadingHistory {
  id: string;
  title: string;
  author: string;
  readDate: string;
  url: string;
  timeSpent?: number;
}

interface FollowedBlogger {
  id: string;
  displayName: string;
  blogName: string;
  blogUrl: string;
  avatar?: string;
  bio?: string;
  followedDate: string;
  category: string;
}

const ReaderProfile: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [savedBlogs, setSavedBlogs] = useState<SavedBlog[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
  const [followedBloggers, setFollowedBloggers] = useState<FollowedBlogger[]>([]);
  const [showTopicEditPopup, setShowTopicEditPopup] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [showBugReportPopup, setShowBugReportPopup] = useState(false);

  // Categories and tags from blog submission form
  const MAIN_CATEGORIES = [
    'Lifestyle',
    'Health & Wellness',
    'Culture & Society',
    'Tech & Digital Life',
    'Creative Expression',
    'Work & Money',
    'Education & Learning',
    'Relationships & Emotions',
    'Art & Media',
    'Home & Garden',
    'Food & Drink',
    'Travel & Places',
    'Identity & Intersectionality',
    'Spirituality & Inner Work',
    'Opinion & Commentary',
    'Other'
  ];

  const TOPIC_TAGS = [
    'Mental Health', 'Self-Care', 'Productivity', 'Feminism', 'Queer Experience',
    'Black Joy', 'Ancestral Healing', 'Decolonization', 'Digital Minimalism',
    'Burnout Recovery', 'Entrepreneurship', 'Diaspora Life', 'Spiritual Practices',
    'Financial Literacy', 'Personal Growth', 'Tech for Good', 'Neurodivergence',
    'Motherhood', 'Body Image', 'Healing Justice', 'Climate & Ecology',
    'Herbalism', 'Relationships', 'Grief', 'Joy', 'Education Reform',
    'Activism', 'Sensuality', 'Conscious Living', 'Food Sovereignty',
    'Solo Travel', 'Ethical Consumption', 'Language & Identity', 'Book Reviews',
    'Film Criticism', 'Indie Publishing', 'Developer Life', 'Design Thinking',
    'Open Source', 'Minimalist Living', 'Mindful Parenting', 'Student Life',
    'Street Culture', 'AfroFuturism', 'Slow Fashion', 'Unschooling',
    'Sex Positivity', 'AI Reflections', 'Coding in Public', 'Personal Finance',
    'Freelance Tips', 'Sustainable Living', 'Home Projects', 'Permaculture',
    'Gardening', 'Beauty & Skincare', 'Journalism', 'Local Stories',
    'Tech Trends', 'Intimacy', 'Zine Culture', 'Religious Identity',
    'Addiction & Recovery', 'Chronic Illness'
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Temporarily bypass auth check for design review
        // const response = await fetch('/api/auth-check');
        // if (response.ok) {
        //   const data = await response.json();
        //   if (data.authenticated) {
            // Mock user data for design review
            setUserInfo({
              id: 'demo-user-123',
              name: 'Demo User',
              email: 'demo@example.com',
              displayName: 'Demo User',
              bio: 'Passionate reader exploring diverse topics',
              joinedDate: '2024-01-15',
              topics: ['Tech', 'Health & Wellness', 'Books & Media'],
              roles: ['reader']
            });

            // Mock saved blogs data
            setSavedBlogs([
              {
                id: '1',
                title: 'The Future of Web Development',
                author: 'Jane Smith',
                savedDate: '2024-01-20',
                url: '/blog/future-web-dev',
                category: 'Tech'
              },
              {
                id: '2',
                title: 'Mindful Living in a Digital Age',
                author: 'Alex Johnson',
                savedDate: '2024-01-18',
                url: '/blog/mindful-living',
                category: 'Health & Wellness'
              }
            ]);

            // Mock reading history
            setReadingHistory([
              {
                id: '1',
                title: 'The Future of Web Development',
                author: 'Jane Smith',
                readDate: '2024-01-20',
                url: '/blog/future-web-dev',
                timeSpent: 8
              },
              {
                id: '2',
                title: 'Building Better Habits',
                author: 'Mike Wilson',
                readDate: '2024-01-19',
                url: '/blog/better-habits',
                timeSpent: 12
              }
            ]);

            setFollowedBloggers([
              {
                id: '1',
                displayName: 'Jane Smith',
                blogName: 'Tech Insights Daily',
                blogUrl: 'https://techinsights.com',
                bio: 'Frontend developer sharing the latest in web technology',
                followedDate: '2024-01-15',
                category: 'Tech'
              },
              {
                id: '2',
                displayName: 'Alex Johnson',
                blogName: 'Mindful Moments',
                blogUrl: 'https://mindfulmoments.blog',
                bio: 'Wellness coach helping you live mindfully',
                followedDate: '2024-01-10',
                category: 'Health & Wellness'
              },
              {
                id: '3',
                displayName: 'Sarah Davis',
                blogName: 'Book Lover\'s Corner',
                blogUrl: 'https://bookloverscorner.com',
                bio: 'Avid reader reviewing the latest fiction and non-fiction',
                followedDate: '2024-01-08',
                category: 'Books & Media'
              }
            ]);
          // } else {
          //   router.push('/auth');
          // }
        // } else {
        //   router.push('/auth');
        // }
      } catch (error) {
        console.error('Auth check failed:', error);
        // router.push('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    // Implement logout logic
    router.push('/');
  };

  const removeSavedBlog = (blogId: string) => {
    setSavedBlogs(prev => prev.filter(blog => blog.id !== blogId));
  };

  const unfollowBlogger = (bloggerId: string) => {
    setFollowedBloggers(prev => prev.filter(blogger => blogger.id !== bloggerId));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  const handleSaveTopics = () => {
    if (userInfo) {
      setUserInfo(prev => prev ? { ...prev, topics: selectedTopics } : null);
    }
    setShowTopicEditPopup(false);
  };

  const handleCancelTopicEdit = () => {
    setShowTopicEditPopup(false);
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
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    // TODO: Implement actual save functionality with Supabase
    if (profilePictureFile) {
      // Update user avatar in userInfo for immediate UI update
      setUserInfo(prev => prev ? { ...prev, avatar: profilePicturePreview } : null);
    }
    alert('Settings saved successfully!');
  };

  if (isLoading) {
    return (
      <Layout title="Profile - Blogrolly">
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
                <p className={styles.bio}>{userInfo.bio}</p>
                <p className={styles.joinDate}>Joined {new Date(userInfo.joinedDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h4>Saved Blogs</h4>
                <span className={styles.statNumber}>{savedBlogs.length}</span>
              </div>
              <div className={styles.statCard}>
                <h4>Following</h4>
                <span className={styles.statNumber}>{followedBloggers.length}</span>
              </div>
              <div className={styles.statCard}>
                <h4>Blogs Read</h4>
                <span className={styles.statNumber}>{readingHistory.length}</span>
              </div>
              <div className={styles.statCard}>
                <h4>Topics Following</h4>
                <span className={styles.statNumber}>{userInfo.topics.length}</span>
              </div>
            </div>
          </div>
        );

      case 'saved':
        return (
          <div className={styles.content}>
            <h2>Saved Blogs</h2>
            {savedBlogs.length === 0 ? (
              <p className={styles.emptyState}>You haven't saved any blogs yet. Start exploring!</p>
            ) : (
              <div className={styles.blogList}>
                {savedBlogs.map(blog => (
                  <div key={blog.id} className={styles.blogItem}>
                    <div className={styles.blogDetails}>
                      <h4>{blog.title}</h4>
                      <p>by {blog.author}</p>
                      <span className={styles.category}>{blog.category}</span>
                      <span className={styles.date}>Saved {new Date(blog.savedDate).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.blogActions}>
                      <a href={blog.url} className={styles.readButton}>Read</a>
                      <button 
                        onClick={() => removeSavedBlog(blog.id)}
                        className={styles.removeButton}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'following':
        return (
          <div className={styles.content}>
            <h2>Following</h2>
            {followedBloggers.length === 0 ? (
              <p className={styles.emptyState}>You're not following any bloggers yet. Discover and follow bloggers you love!</p>
            ) : (
              <div className={styles.followingList}>
                {followedBloggers.map(blogger => (
                  <div key={blogger.id} className={styles.followingItem}>
                    <div className={styles.bloggerInfo}>
                      <div className={styles.bloggerAvatar}>
                        {blogger.avatar ? (
                          <img src={blogger.avatar} alt={blogger.displayName} />
                        ) : (
                          <div className={styles.bloggerInitials}>
                            {getInitials(blogger.displayName)}
                          </div>
                        )}
                      </div>
                      <div className={styles.bloggerDetails}>
                        <h4>{blogger.displayName}</h4>
                        <p className={styles.blogName}>{blogger.blogName}</p>
                        {blogger.bio && <p className={styles.bloggerBio}>{blogger.bio}</p>}
                        <div className={styles.bloggerMeta}>
                          <span className={styles.category}>{blogger.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.bloggerActions}>
                      <a href={`/blogger/${blogger.id}`} className={styles.visitButton}>
                        View Profile
                      </a>
                      <button 
                        onClick={() => unfollowBlogger(blogger.id)}
                        className={styles.unfollowButton}
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'history':
        return (
          <div className={styles.content}>
            <h2>Reading History</h2>
            {readingHistory.length === 0 ? (
              <p className={styles.emptyState}>No reading history yet. Start reading to build your history!</p>
            ) : (
              <div className={styles.historyList}>
                {readingHistory.map(item => (
                  <div key={item.id} className={styles.historyItem}>
                    <div className={styles.historyDetails}>
                      <h4>{item.title}</h4>
                      <p>by {item.author}</p>
                      {item.timeSpent && (
                        <span className={styles.timeSpent}>{item.timeSpent} min read</span>
                      )}
                    </div>
                    <div className={styles.historyActions}>
                      <a href={item.url} className={styles.revisitButton}>Revisit</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'preferences':
        return (
          <div className={styles.content}>
            <h2>Preferences</h2>
            <div className={styles.preferencesSection}>
              <h3>Topics You Follow</h3>
              <div className={styles.topicTags}>
                {userInfo.topics.map(topic => (
                  <span key={topic} className={styles.topicTag}>{topic}</span>
                ))}
              </div>
              <button className={styles.editButton} onClick={handleEditTopics}>Edit Topics</button>
            </div>
            <div className={styles.preferencesSection}>
              <h3>Newsletter Frequency</h3>
              <p className={styles.sectionDescription}>Get a digest of popular and insightful blogs based on your topic interests</p>
              <div className={styles.frequencyButtons}>
                <button className={`${styles.frequencyButton} ${styles.active}`}>
                  Weekly
                </button>
                <button className={styles.frequencyButton}>
                  Monthly
                </button>
                <button className={styles.frequencyButton}>
                  None
                </button>
              </div>
            </div>
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
            <div className={styles.dangerZone}>
              <h3>Danger Zone</h3>
              <button className={styles.deleteButton}>Delete Account</button>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className={styles.content}>
            <h2>Help & Support</h2>
            <div className={styles.helpSection}>
              <div className={styles.helpItem}>
                <h3>FAQ</h3>
                <p>Find answers to commonly asked questions</p>
                <button className={styles.helpButton}>View FAQ</button>
              </div>
              <div className={styles.helpItem}>
                <h3>Contact Support</h3>
                <p>Get help from our support team</p>
                <button className={styles.helpButton}>Contact Us</button>
              </div>
              <div className={styles.helpItem}>
                <h3>Send Feedback</h3>
                <p>Help us improve BlogRolly</p>
                <button className={styles.helpButton}>Give Feedback</button>
              </div>
              <div className={styles.helpItem}>
                <h3>Report a Bug</h3>
                <p>Found an issue? Let us know so we can fix it</p>
                <button 
                  className={styles.helpButton}
                  onClick={() => setShowBugReportPopup(true)}
                >
                  Report Bug
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
    <Layout title="Reader Profile - Blogrolly">
      <div className={styles.profileContainer}>
        {/* Topic Edit Popup */}
        {showTopicEditPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
              <div className={styles.popupHeader}>
                <h3>Edit Your Topics</h3>
                <button 
                  className={styles.closeButton}
                  onClick={handleCancelTopicEdit}
                >
                  ×
                </button>
              </div>
              <div className={styles.popupBody}>
                <p className={styles.popupDescription}>
                  Select the topics you're interested in. This helps us personalize your blog recommendations.
                </p>
                
                <div className={styles.topicSection}>
                  <h4>Main Categories</h4>
                  <div className={styles.topicGrid}>
                    {MAIN_CATEGORIES.map(category => (
                      <label key={category} className={styles.topicLabel}>
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(category)}
                          onChange={() => handleTopicToggle(category)}
                          className={styles.topicCheckbox}
                        />
                        <span className={styles.topicText}>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.topicSection}>
                  <h4>Specific Topics & Tags</h4>
                  <div className={styles.topicGrid}>
                    {TOPIC_TAGS.map(tag => (
                      <label key={tag} className={styles.topicLabel}>
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(tag)}
                          onChange={() => handleTopicToggle(tag)}
                          className={styles.topicCheckbox}
                        />
                        <span className={styles.topicText}>{tag}</span>
                      </label>
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

        {/* Bug Report Popup */}
        <BugReportPopup
          isOpen={showBugReportPopup}
          onClose={() => setShowBugReportPopup(false)}
        />

        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Reader Dashboard</h3>
          </div>
          <nav className={styles.sidebarNav}>
            <button 
              className={`${styles.navItem} ${activeSection === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              Profile Overview
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'saved' ? styles.active : ''}`}
              onClick={() => setActiveSection('saved')}
            >
              Saved Blogs
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'following' ? styles.active : ''}`}
              onClick={() => setActiveSection('following')}
            >
              Following
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'history' ? styles.active : ''}`}
              onClick={() => setActiveSection('history')}
            >
              Reading History
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'preferences' ? styles.active : ''}`}
              onClick={() => setActiveSection('preferences')}
            >
              Preferences
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              Account Settings
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'help' ? styles.active : ''}`}
              onClick={() => setActiveSection('help')}
            >
              Help
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

export default ReaderProfile;