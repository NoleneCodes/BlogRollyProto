import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogCard from '../../components/BlogCard';
import PremiumFeatureGuard from '../../components/PremiumFeatureGuard';
import styles from '../../styles/PublicBloggerProfile.module.css';
import { FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaTiktok, FaGithub, FaHeart, FaRegHeart } from 'react-icons/fa';

interface BloggerProfile {
  id: string;
  displayName: string; // Full name
  username: string; // @handle
  bio: string;
  avatar?: string;
  blogName: string;
  blogUrl: string;
  joinedDate: string;
  topics: string[];
  isPro?: boolean;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    github?: string;
  };
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  authorProfile: string;
  bloggerId: string;
  bloggerDisplayName: string;
  description: string;
  category: string;
  tags: string[];
  postUrl: string;
  imageUrl?: string;
  dateAdded: string;
  views?: number;
  clicks?: number;
}

const PublicBloggerProfile: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [blogger, setBlogger] = useState<BloggerProfile | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadBloggerProfile(id as string);
      checkAuthStatus();
    }
  }, [id]);

  useEffect(() => {
    if (id && isAuthenticated) {
      checkFollowStatus(id as string);
    }
  }, [id, isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth-check');
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  const checkFollowStatus = async (bloggerId: string) => {
    try {
      // Use API to check if current user follows this blogger
      const readerId = window.localStorage.getItem('readerId'); // Replace with actual auth logic
      if (!readerId) return;
      const res = await fetch('/api/follow', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readerId, bloggerId })
      });
      const data = await res.json();
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    setFollowLoading(true);
    try {
      const readerId = window.localStorage.getItem('readerId'); // Replace with actual auth logic
      if (!readerId) return;
      if (isFollowing) {
        await fetch('/api/follow', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readerId, bloggerId: id })
        });
        setIsFollowing(false);
      } else {
        await fetch('/api/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readerId, bloggerId: id })
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const loadBloggerProfile = async (bloggerId: string) => {
    try {
      // Mock data - in production this would fetch from your API/Supabase
      // This would query your database for the blogger and their approved, active posts

      // Create different mock profiles based on blogger ID
  const mockProfiles: { [key: string]: BloggerProfile } = {
        'blogger_1': {
          id: bloggerId,
          displayName: 'Sarah Johnson',
          username: 'sarahjohnson', // @sarahjohnson
          bio: 'Passionate writer sharing insights on productivity, wellness, and personal growth. I believe small daily habits create extraordinary transformations.',
          avatar: 'https://picsum.photos/150/150?random=1',
          blogName: 'Mindful Productivity',
          blogUrl: 'https://mindfulproductivity.com',
          joinedDate: '2024-01-15',
          topics: ['Productivity', 'Wellness', 'Personal Growth'],
          isPro: true,
          socialLinks: {
            twitter: 'https://twitter.com/sarahjohnson',
            linkedin: 'https://linkedin.com/in/sarah-johnson-productivity',
            instagram: 'https://instagram.com/mindfulproductivity',
            youtube: '',
            tiktok: '',
            github: ''
          }
        },
        'blogger_2': {
          id: bloggerId,
          displayName: 'Alex Chen',
          username: 'alexchen', // @alexchen
          bio: 'Tech professional writing about mental health, work-life balance, and building sustainable careers in technology.',
          avatar: 'https://picsum.photos/150/150?random=2',
          blogName: 'Tech & Balance',
          blogUrl: 'https://techandbalance.com',
          joinedDate: '2024-02-10',
          topics: ['Tech', 'Mental Health', 'Career'],
          isPro: false
        },
        'blogger_3': {
          id: bloggerId,
          displayName: 'Maria Garcia',
          username: 'mariagarcia', // @mariagarcia
          bio: 'Food enthusiast and nutritionist sharing healthy recipes and sustainable eating habits for busy professionals.',
          avatar: 'https://picsum.photos/150/150?random=3',
          blogName: 'Nourish Daily',
          blogUrl: 'https://nourishdaily.com',
          joinedDate: '2024-01-28',
          topics: ['Food', 'Health', 'Nutrition'],
          isPro: true
        }
      };

      // Get the profile or use a default one
      const mockBlogger = mockProfiles[bloggerId] || {
        id: bloggerId,
        displayName: bloggerId,
        username: bloggerId, // @handle fallback
        bio: 'Welcome to my blog! I share insights and stories about my passions.',
        avatar: `https://picsum.photos/150/150?random=${Math.floor(Math.random() * 10)}`,
        blogName: 'My Blog',
        blogUrl: 'https://example.com',
        joinedDate: '2024-01-01',
        topics: ['General', 'Writing'],
        isPro: false
      };

      // Create different mock blog posts based on blogger ID
      const mockBlogPostsData: { [key: string]: BlogPost[] } = {
        'blogger_1': [
          {
            id: '1',
            title: 'The Complete Guide to Building a Sustainable Morning Routine',
            author: 'Sarah Johnson',
            authorProfile: `/blogger/${bloggerId}`,
            bloggerId: bloggerId,
            bloggerDisplayName: 'Sarah Johnson',
            description: 'Discover the science-backed strategies for creating a morning routine that actually sticks, without overwhelming yourself.',
            category: 'Lifestyle',
            tags: ['Morning Routine', 'Productivity', 'Habits'],
            postUrl: 'https://mindfulproductivity.com/morning-routine-guide',
            imageUrl: 'https://picsum.photos/400/250?random=1',
            dateAdded: '2024-01-20',
            views: 1250,
            clicks: 89
          },
          {
            id: '2',
            title: 'Why I Stopped Multitasking and How It Changed Everything',
            author: 'Sarah Johnson',
            authorProfile: `/blogger/${bloggerId}`,
            bloggerId: bloggerId,
            bloggerDisplayName: 'Sarah Johnson',
            description: 'The surprising benefits of single-tasking and practical strategies to break the multitasking habit.',
            category: 'Productivity',
            tags: ['Focus', 'Productivity', 'Deep Work'],
            postUrl: 'https://mindfulproductivity.com/stop-multitasking',
            imageUrl: 'https://picsum.photos/400/250?random=2',
            dateAdded: '2024-01-18',
            views: 890,
            clicks: 67
          }
        ],
        'blogger_2': [
          {
            id: '3',
            title: 'Mental Health in Tech: Finding Balance',
            author: 'Alex Chen',
            authorProfile: `/blogger/${bloggerId}`,
            bloggerId: bloggerId,
            bloggerDisplayName: 'Alex Chen',
            description: 'How to maintain mental wellness while working in the fast-paced tech industry.',
            category: 'Tech',
            tags: ['Mental Health', 'Tech', 'Balance'],
            postUrl: 'https://techandbalance.com/mental-health-tech',
            imageUrl: 'https://picsum.photos/400/250?random=4',
            dateAdded: '2024-02-15',
            views: 1050,
            clicks: 78
          },
          {
            id: '4',
            title: 'Remote Work: Setting Boundaries That Actually Work',
            author: 'Alex Chen',
            authorProfile: `/blogger/${bloggerId}`,
            bloggerId: bloggerId,
            bloggerDisplayName: 'Alex Chen',
            description: 'Practical strategies for maintaining work-life balance in remote work environments.',
            category: 'Career',
            tags: ['Remote Work', 'Boundaries', 'Work-Life Balance'],
            postUrl: 'https://techandbalance.com/remote-boundaries',
            imageUrl: 'https://picsum.photos/400/250?random=5',
            dateAdded: '2024-02-12',
            views: 820,
            clicks: 65
          }
        ],
        'blogger_3': [
          {
            id: '5',
            title: '15-Minute Healthy Meals for Busy Professionals',
            author: 'Maria Garcia',
            authorProfile: `/blogger/${bloggerId}`,
            bloggerId: bloggerId,
            bloggerDisplayName: 'Maria Garcia',
            description: 'Quick, nutritious recipes that fit into your hectic schedule without compromising health.',
            category: 'Food',
            tags: ['Healthy Eating', 'Quick Meals', 'Nutrition'],
            postUrl: 'https://nourishdaily.com/15-minute-meals',
            imageUrl: 'https://picsum.photos/400/250?random=6',
            dateAdded: '2024-02-01',
            views: 950,
            clicks: 72
          }
        ]
      };

      // Get the blog posts or use default empty array
      const mockBlogPosts = mockBlogPostsData[bloggerId] || [];

      setBlogger(mockBlogger);
      setBlogPosts(mockBlogPosts);
    } catch (error) {
      console.error('Error loading blogger profile:', error);
      setError('Failed to load blogger profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <Layout title="Loading Blogger Profile - Blogrolly">
        <div className={styles.loading}>
          <div className={styles.loadingSkeleton}>
            <div className={styles.skeletonHeader}></div>
            <div className={styles.skeletonBio}></div>
            <div className={styles.skeletonPosts}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !blogger) {
    return (
      <Layout title="Blogger Not Found - Blogrolly">
        <div className={styles.error}>
          <h2>Blogger Not Found</h2>
          <p>Sorry, we couldn&apos;t find the blogger profile you&apos;re looking for.</p>
          <button onClick={() => router.push('/blogroll')} className={styles.backButton}>
            Back to Blogroll
          </button>
        </div>
      </Layout>
    );
  }

  const handleTopicFilter = (topic: string) => {
    router.push(`/blogroll?tag=${encodeURIComponent(topic)}`);
  };

  return (
    <Layout title={`${blogger.displayName} - Blogrolly`}>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            {blogger.avatar ? (
              <img src={blogger.avatar} alt={blogger.displayName} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {getInitials(blogger.displayName)}
              </div>
            )}
          </div>

          <div className={styles.profileInfo}>
            <h1 className={styles.displayName}>{blogger.displayName}</h1>
            <div className={styles.username} style={{ marginBottom: '1.25rem' }}>
              <a href={`/blogger/${blogger.username}`} style={{ color: '#c42142', textDecoration: 'none', fontWeight: 500 }}>@{blogger.username}</a>
            </div>
            <div className={styles.blogInfo}>
              <span className={styles.blogLabel}>Blog:</span>
              <h2 className={styles.blogName}>{blogger.blogName}</h2>
            </div>

            {blogger.bio && (
              <p className={styles.bio}>{blogger.bio}</p>
            )}

            {blogger.isPro && (
              <div className={styles.profileMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Talks about:</span>
                  <div className={styles.topicTags}>
                    {blogger.topics.map((topic, index) => (
                      <a 
                        key={index} 
                        href={`/blogroll?tag=${encodeURIComponent(topic)}`}
                        className={styles.topicTag}
                      >
                        {topic}
                      </a>
                    ))}
                  </div>
                </div>
                {blogger.socialLinks && Object.entries(blogger.socialLinks).some(([_, url]) => url) && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Connect:</span>
                    <div className={styles.socialLinks}>
                      {blogger.socialLinks.twitter && (
                        <a 
                          href={blogger.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.socialLink}
                          title="Twitter"
                        >
                          <FaTwitter />
                        </a>
                      )}
                      {blogger.socialLinks.linkedin && (
                        <a 
                          href={blogger.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.socialLink}
                          title="LinkedIn"
                        >
                          <FaLinkedin />
                        </a>
                      )}
                      {blogger.socialLinks.instagram && (
                        <a 
                          href={blogger.socialLinks.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.socialLink}
                          title="Instagram"
                        >
                          <FaInstagram />
                        </a>
                      )}
                      {blogger.socialLinks.youtube && (
                        <a 
                          href={blogger.socialLinks.youtube} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.socialLink}
                          title="YouTube"
                        >
                          <FaYoutube />
                        </a>
                      )}
                      {blogger.socialLinks.tiktok && (
                        <a 
                          href={blogger.socialLinks.tiktok} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.socialLink}
                          title="TikTok"
                        >
                          <FaTiktok />
                        </a>
                      )}
                      {blogger.socialLinks.github && (
                        <a 
                          href={blogger.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.socialLink}
                          title="GitHub"
                        >
                          <FaGithub />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.profileActions}>
              <a 
                href={blogger.blogUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.visitBlogButton}
              >
                Visit {blogger.blogName} →
              </a>
              {blogger.isPro && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
                  title={isFollowing ? 'Unfollow this blogger' : 'Follow this blogger'}
                >
                  {followLoading ? (
                    <span className={styles.followButtonContent}>
                      <span className={styles.followSpinner}></span>
                      {isFollowing ? 'Unfollowing...' : 'Following...'}
                    </span>
                  ) : (
                    <span className={styles.followButtonContent}>
                      {isFollowing ? <FaHeart /> : <FaRegHeart />}
                      {isFollowing ? 'Following' : 'Follow'}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.blogPostsSection}>
          <div className={styles.sectionHeader}>
            <h3>Published on Blogrolly ({blogPosts.length})</h3>
            <p>These are {blogger.displayName.split(' ')[0]}&apos;s featured blog posts on Blogrolly</p>
          </div>

          {blogPosts.length > 0 ? (
            <div className={styles.blogrollGrid}>
              {blogPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  blog={post}
                  showAuthor={false}
                  showSaveButton={true}
                />
              ))}
            </div>
          ) : (
            <div className={styles.noPosts}>
              <p>No published posts yet.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PublicBloggerProfile;