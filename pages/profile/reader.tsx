
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
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

const ReaderProfile: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [savedBlogs, setSavedBlogs] = useState<SavedBlog[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth-check');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            // Mock user data - replace with actual data from your backend
            setUserInfo({
              id: data.userId,
              name: data.userName,
              email: 'user@example.com', // This would come from your database
              displayName: data.userName,
              bio: 'Passionate reader exploring diverse topics',
              joinedDate: '2024-01-15',
              topics: ['Tech', 'Health & Wellness', 'Books & Media'],
              roles: data.userRoles ? data.userRoles.split(',') : []
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
          } else {
            router.push('/auth');
          }
        } else {
          router.push('/auth');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth');
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
                <p className={styles.email}>{userInfo.email}</p>
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
                      <span className={styles.date}>Read {new Date(item.readDate).toLocaleDateString()}</span>
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
              <button className={styles.editButton}>Edit Topics</button>
            </div>
            <div className={styles.preferencesSection}>
              <h3>Reading Frequency</h3>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                Weekly digest email
              </label>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className={styles.content}>
            <h2>Account Settings</h2>
            <div className={styles.settingsForm}>
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
              <button className={styles.saveButton}>Save Changes</button>
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
                <h3>📋 FAQ</h3>
                <p>Find answers to commonly asked questions</p>
                <button className={styles.helpButton}>View FAQ</button>
              </div>
              <div className={styles.helpItem}>
                <h3>📧 Contact Support</h3>
                <p>Get help from our support team</p>
                <button className={styles.helpButton}>Contact Us</button>
              </div>
              <div className={styles.helpItem}>
                <h3>💬 Send Feedback</h3>
                <p>Help us improve BlogRolly</p>
                <button className={styles.helpButton}>Give Feedback</button>
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
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Reader Dashboard</h3>
          </div>
          <nav className={styles.sidebarNav}>
            <button 
              className={`${styles.navItem} ${activeSection === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              🏠 Profile Overview
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'saved' ? styles.active : ''}`}
              onClick={() => setActiveSection('saved')}
            >
              📚 Saved Blogs
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'history' ? styles.active : ''}`}
              onClick={() => setActiveSection('history')}
            >
              🕒 Reading History
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'preferences' ? styles.active : ''}`}
              onClick={() => setActiveSection('preferences')}
            >
              🛠️ Preferences
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              ⚙️ Account Settings
            </button>
            <button 
              className={`${styles.navItem} ${activeSection === 'help' ? styles.active : ''}`}
              onClick={() => setActiveSection('help')}
            >
              ❓ Help
            </button>
            <button 
              className={`${styles.navItem} ${styles.logout}`}
              onClick={handleLogout}
            >
              🚪 Log Out
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
