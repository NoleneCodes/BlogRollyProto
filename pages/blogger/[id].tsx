
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogCard from '../../components/BlogCard';
import styles from '../../styles/PublicBloggerProfile.module.css';

interface BloggerProfile {
  id: string;
  displayName: string;
  bio: string;
  avatar?: string;
  blogName: string;
  blogUrl: string;
  joinedDate: string;
  topics: string[];
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

  useEffect(() => {
    if (id) {
      loadBloggerProfile(id as string);
    }
  }, [id]);

  const loadBloggerProfile = async (bloggerId: string) => {
    try {
      // Mock data - in production this would fetch from your API/Supabase
      // This would query your database for the blogger and their approved, active posts
      
      // Mock blogger profile
      const mockBlogger: BloggerProfile = {
        id: bloggerId,
        displayName: 'Sarah Johnson',
        bio: 'Passionate writer sharing insights on productivity, wellness, and personal growth. I believe small daily habits create extraordinary transformations.',
        avatar: 'https://picsum.photos/150/150?random=1',
        blogName: 'Mindful Productivity',
        blogUrl: 'https://mindfulproductivity.com',
        joinedDate: '2024-01-15',
        topics: ['Productivity', 'Wellness', 'Personal Growth']
      };

      // Mock approved and active blog posts
      const mockBlogPosts: BlogPost[] = [
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
        },
        {
          id: '3',
          title: 'The 5-Minute Evening Reflection That Changed My Life',
          author: 'Sarah Johnson',
          authorProfile: `/blogger/${bloggerId}`,
          bloggerId: bloggerId,
          bloggerDisplayName: 'Sarah Johnson',
          description: 'A simple evening practice that brings clarity, gratitude, and intentionality to your daily life.',
          category: 'Wellness',
          tags: ['Reflection', 'Mindfulness', 'Self-Care'],
          postUrl: 'https://mindfulproductivity.com/evening-reflection',
          imageUrl: 'https://picsum.photos/400/250?random=3',
          dateAdded: '2024-01-16',
          views: 650,
          clicks: 45
        }
      ];

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
          <p>Sorry, we couldn't find the blogger profile you're looking for.</p>
          <button onClick={() => router.push('/blogroll')} className={styles.backButton}>
            Back to Blogroll
          </button>
        </div>
      </Layout>
    );
  }

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
            <h2 className={styles.blogName}>{blogger.blogName}</h2>
            
            {blogger.bio && (
              <p className={styles.bio}>{blogger.bio}</p>
            )}
            
            <div className={styles.profileMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Writing since:</span>
                <span className={styles.metaValue}>
                  {new Date(blogger.joinedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>
              
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Topics:</span>
                <div className={styles.topicTags}>
                  {blogger.topics.map((topic, index) => (
                    <span key={index} className={styles.topicTag}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className={styles.profileActions}>
              <a 
                href={blogger.blogUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.visitBlogButton}
              >
                Visit {blogger.blogName} →
              </a>
            </div>
          </div>
        </div>

        <div className={styles.blogPostsSection}>
          <div className={styles.sectionHeader}>
            <h3>Published on Blogrolly ({blogPosts.length})</h3>
            <p>These are {blogger.displayName.split(' ')[0]}'s featured blog posts on Blogrolly</p>
          </div>
          
          {blogPosts.length > 0 ? (
            <div className={styles.blogGrid}>
              {blogPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  blog={post}
                  showAuthor={false}
                  showSaveButton={false}
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
