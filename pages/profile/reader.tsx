import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ReaderOverviewTab from '../../components/reader/ReaderOverviewTab';
import ReaderSavedTab from '../../components/reader/ReaderSavedTab';
import ReaderFollowingTab from '../../components/reader/ReaderFollowingTab';
import ReaderHistoryTab from '../../components/reader/ReaderHistoryTab';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BugReportPopup from '../../components/BugReportPopup';
import FeedbackPopup from '../../components/FeedbackPopup';
import ContactSupportPopup from '../../components/ContactSupportPopup';
import styles from '../../styles/ReaderProfile.module.css';
import { MAIN_CATEGORIES, TAGS } from '../../lib/categories-tags';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SavedBlog {
  id: string;
  title: string;
  author: string;
  savedDate: string;
  url: string;
  category: string;
  description?: string;
  image?: string;
  notes?: string;
}

interface ReadingHistory {
  id: string;
  title: string;
  author: string;
  readDate: string;
  url: string;
  timeSpent?: number;
  category: string;
  description?: string;
  image?: string;
}

interface FollowedBlogger {
  id: string;
  username: string;
  blogName: string;
  blogUrl: string;
  avatar?: string;
  bio?: string;
  followedDate: string;
  category: string;
}

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
  tier?: 'free' | 'pro';
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
  const [isUploading, setIsUploading] = useState(false);
  const [showBugReportPopup, setShowBugReportPopup] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [showContactSupportPopup, setShowContactSupportPopup] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log('🔍 Fetching profile data...');
        
        // Check authentication first
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          console.log('❌ No authenticated session, redirecting to auth');
          router.push('/auth');
          return;
        }

        console.log('✅ User authenticated:', session.user.id);

        // Fetch user profile data from database
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) {
          console.error('❌ Error fetching user profile:', profileError);
          // Fallback to API endpoint
          const userRes = await fetch('/api/reader/info');
          const userData = await userRes.json();
          setUserInfo(userData);
        } else {
          console.log('✅ User profile loaded from database');
          
          // Get reader-specific data
          const { data: readerProfile } = await supabase
            .from('reader_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          // Format user data
          const userData: UserInfo = {
            id: session.user.id,
            name: `${userProfile.first_name || ''} ${userProfile.surname || ''}`.trim(),
            email: session.user.email || '',
            displayName: userProfile.username || userProfile.first_name,
            bio: userProfile.bio || '',
            joinedDate: userProfile.created_at,
            avatar: userProfile.profile_image_url || '',
            topics: readerProfile?.topics || [],
            roles: [userProfile.role],
            tier: userProfile.tier || 'free'
          };

          setUserInfo(userData);
          console.log('✅ User data loaded:', userData);
        }

        // Fetch saved blogs using enhanced client
        if (userInfo?.id) {
          try {
            const { getSavedBlogs } = await import('../../lib/savedBlogsClient');
            const savedData = await getSavedBlogs(userInfo.id);
            setSavedBlogs(savedData.blogs || []);
          } catch (error) {
            console.error('Error fetching saved blogs:', error);
          }

          try {
            const { getReadingHistory } = await import('../../lib/readingHistoryClient');
            const historyData = await getReadingHistory(userInfo.id);
            setReadingHistory(historyData.history || []);
          } catch (error) {
            console.error('Error fetching reading history:', error);
          }

          try {
            const { getFollowedBloggers } = await import('../../lib/followClient');
            const followData = await getFollowedBloggers(userInfo.id);
            setFollowedBloggers(followData.bloggers || []);
          } catch (error) {
            console.error('Error fetching followed bloggers:', error);
          }
        }

      } catch (error) {
        console.error('❌ Failed to fetch profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

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

  const uploadProfilePicture = async (file: File, userId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      console.log('🔍 Uploading profile picture...');

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      console.log('✅ Profile picture uploaded:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error) {
      console.error('❌ Error uploading profile picture:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!userInfo) return;

    try {
      console.log('🔍 Saving user settings...');
      let avatarUrl = userInfo.avatar;

      // Upload profile picture if one was selected
      if (profilePictureFile) {
        const uploadedUrl = await uploadProfilePicture(profilePictureFile, userInfo.id);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        } else {
          alert('Failed to upload profile picture. Please try again.');
          return;
        }
      }

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          profile_image_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userInfo.id);

      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
        alert('Failed to save settings. Please try again.');
        return;
      }

      console.log('✅ Settings saved successfully');

      // Update local state
      setUserInfo(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      
      alert('Settings saved successfully!');

    } catch (error) {
      console.error('❌ Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleEditTopics = () => {
    if (userInfo) {
      setSelectedTopics([...userInfo.topics]);
      setShowTopicEditPopup(true);
    }
  };

  const handleSaveTopics = async () => {
    if (!userInfo) return;

    try {
      console.log('🔍 Saving topic preferences...');

      // Update reader profile with new topics
      const { error: updateError } = await supabase
        .from('reader_profiles')
        .update({
          topics: selectedTopics,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userInfo.id);

      if (updateError) {
        console.error('❌ Error updating topics:', updateError);
        alert('Failed to save topics. Please try again.');
        return;
      }

      console.log('✅ Topics saved successfully');

      // Update local state
      setUserInfo(prev => prev ? { ...prev, topics: selectedTopics } : null);
      setShowTopicEditPopup(false);

    } catch (error) {
      console.error('❌ Error saving topics:', error);
      alert('Failed to save topics. Please try again.');
    }
  };

  const handleCancelTopicEdit = () => {
    setShowTopicEditPopup(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      router.push('/');
    }
  };

  const removeSavedBlog = (blogId: string) => {
    setSavedBlogs(prev => prev.filter(blog => blog.id !== blogId));
  };

  const unfollowBlogger = (bloggerId: string) => {
    setFollowedBloggers(prev => prev.filter(blogger => blogger.id !== bloggerId));
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
    return (
      <Layout title="Profile - Blogrolly">
        <div className={styles.loading}>
          <h2>Please sign in to view your profile</h2>
          <button onClick={() => router.push('/auth')}>Go to Sign In</button>
        </div>
      </Layout>
    );
  }

  const renderSettings = () => (
    <div className={styles.content}>
      <h2 style={{ color: '#c42142' }}>Account Settings</h2>
      <div className={styles.settingsSection}>
        <div className={styles.settingItem}>
          <h3>Profile Picture</h3>
          <div className={styles.profilePictureSection}>
            <div className={styles.currentPicture}>
              {(profilePicturePreview || userInfo.avatar) ? (
                <Image
                  src={profilePicturePreview || userInfo.avatar!}
                  alt="Profile"
                  width={80}
                  height={80}
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.defaultAvatar}>
                  {getInitials(userInfo.name)}
                </div>
              )}
            </div>
            <div className={styles.pictureControls}>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className={styles.fileInput}
                id="profile-picture"
                disabled={isUploading}
              />
              <label htmlFor="profile-picture" className={styles.uploadButton}>
                {isUploading ? 'Uploading...' : 'Choose New Picture'}
              </label>
              <small className={styles.hint}>Max 2MB, JPG/PNG/WebP only</small>
            </div>
          </div>
        </div>
        
        <button 
          className={styles.saveButton} 
          onClick={handleSaveSettings}
          disabled={isUploading}
        >
          {isUploading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <ReaderOverviewTab
            userInfo={userInfo}
            savedBlogs={savedBlogs}
            followedBloggers={followedBloggers}
            readingHistory={readingHistory}
          />
        );
      case 'saved':
        return (
          <ReaderSavedTab
            readerId={userInfo.id}
          />
        );
      case 'following':
        return (
          <ReaderFollowingTab
            followedBloggers={followedBloggers}
            unfollowBlogger={unfollowBlogger}
          />
        );
      case 'history':
        return (
          <ReaderHistoryTab
            readingHistory={readingHistory}
          />
        );
      case 'preferences':
        return (
          <div className={styles.content}>
            <h2 style={{ color: '#c42142' }}>Preferences</h2>
            <div className={styles.preferencesSection}>
              <h3>Topics You Follow</h3>
              <div className={styles.topicTags}>
                {userInfo.topics.map(topic => (
                  <span key={topic} className={styles.topicTag}>{topic}</span>
                ))}
              </div>
              <button className={styles.editTopicsButton} onClick={handleEditTopics}>
                Edit Topics
              </button>
            </div>
          </div>
        );
      case 'settings':
        return renderSettings();
      case 'help':
        return (
          <div className={styles.content}>
            <h2 style={{ color: '#c42142' }}>Help & Support</h2>
            <div className={styles.helpSection}>
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
              <div className={styles.helpItem}>
                <h3>Send Feedback</h3>
                <p>Help us improve BlogRolly</p>
                <button 
                  className={styles.helpButton}
                  onClick={() => setShowFeedbackPopup(true)}
                >
                  Give Feedback
                </button>
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
        return renderSettings();
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
                  Select the topics you're interested in. This helps us personalise your blog recommendations.
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

        {/* Feedback Popup */}
        <FeedbackPopup
          isOpen={showFeedbackPopup}
          onClose={() => setShowFeedbackPopup(false)}
        />

        {/* Contact Support Popup */}
        <ContactSupportPopup
          isOpen={showContactSupportPopup}
          onClose={() => setShowContactSupportPopup(false)}
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
          </nav>
          <div className={styles.accountActionsSection}>
            {Array.isArray(userInfo.roles) && userInfo.roles.includes('blogger') && (
              <button 
                className={`${styles.navItem} ${styles.switch}`}
                onClick={() => {
                  const targetRoute = userInfo.tier === 'pro' ? '/profile/blogger-premium' : '/profile/blogger';
                  router.push(targetRoute);
                }}
              >
                Switch to Blogger
              </button>
            )}
            <button 
              className={`${styles.navItem} ${styles.logout}`}
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </aside>
        <main className={styles.main}>
          {renderContent()}
        </main>
      </div>
    </Layout>
  );
};

export default ReaderProfile;