import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import BlogCard from './BlogCard';
import styles from '../styles/PersonalizedBlogroll.module.css';

interface BlogPost {
  id: string;
  image?: string;
  imageDescription?: string; // Added based on mock data usage
  title: string;
  author: string;
  authorProfile: string;
  bloggerId: string;
  bloggerDisplayName: string;
  description: string;
  category: string;
  tags: string[];
  postUrl: string;
  dateAdded: string;
  isRead?: boolean;
  isSaved?: boolean;
}

interface UserPreferences {
  categories: string[];
  tags: string[];
  engagementHistory: {
    categoryClicks: Record<string, number>;
    tagClicks: Record<string, number>;
  };
}

// Mock blog data - in production this would come from your API
const mockBlogs: BlogPost[] = [
  {
    id: '1',
    image: "https://picsum.photos/300/200?random=1",
    imageDescription: "A peaceful morning scene with a cup of coffee and journal on a wooden table near a window",
    title: "The Complete Guide to Building a Sustainable Morning Routine That Actually Works",
    author: "Sarah Johnson",
    authorProfile: "/blogger/sarah-johnson",
    bloggerId: "blogger_1",
    bloggerDisplayName: "Sarah Johnson",
    description: "Discover the science-backed strategies for creating a morning routine that sticks.",
    category: "Lifestyle",
    tags: ["Morning Routine", "Productivity", "Self-Care"],
    postUrl: "https://example.com/morning-routine-guide",
    dateAdded: "2024-01-15",
    isRead: false,
    isSaved: false
  },
  {
    id: '2',
    image: "https://picsum.photos/300/200?random=2",
    imageDescription: "A person working at a computer with stress-relief items like plants and calming lighting around their workspace",
    title: "Mental Health in Tech: Finding Balance",
    author: "Alexander Chen",
    authorProfile: "/blogger/blogger_2",
    bloggerId: "blogger_2",
    bloggerDisplayName: "Alex Chen",
    description: "An honest look at burnout, stress, and finding balance in the fast-paced world of technology.",
    category: "Health & Wellness",
    tags: ["Mental Health", "Tech", "Burnout Recovery"],
    postUrl: "https://example.com/mental-health-tech",
    dateAdded: "2024-01-14",
    isRead: true,
    isSaved: true
  },
  {
    id: '3',
    image: "https://picsum.photos/300/200?random=3",
    imageDescription: "A colorful plate of fresh, healthy meal ingredients arranged artistically on a kitchen counter",
    title: "15-Minute Healthy Meals for Busy Days",
    author: "Maria Garcia",
    authorProfile: "/blogger/blogger_3",
    bloggerId: "blogger_3",
    bloggerDisplayName: "Maria Garcia",
    description: "Quick and delicious meals that don't compromise on flavor or nutrition.",
    category: "Food & Drink",
    tags: ["Cooking", "Quick Meals", "Healthy Eating"],
    postUrl: "https://example.com/cooking-adventures",
    dateAdded: "2024-01-13",
    isRead: false,
    isSaved: false
  },
  {
    id: '4',
    image: "https://picsum.photos/300/200?random=4",
    title: "Remote Work Productivity Tips",
    author: "David Kim",
    authorProfile: "/blogger/david-kim",
    bloggerId: "blogger_4",
    bloggerDisplayName: "David Kim",
    description: "Essential strategies for staying productive while working from home.",
    category: "Tech & Digital Life",
    tags: ["Remote Work", "Productivity", "Work Life Balance"],
    postUrl: "https://example.com/remote-work-tips",
    dateAdded: "2024-01-12",
    isRead: false,
    isSaved: false
  }
];

interface PersonalizedBlogrollProps {
  maxItems?: number;
  showHeader?: boolean;
  className?: string; // Added className prop
}

const PersonalizedBlogroll: React.FC<PersonalizedBlogrollProps> = ({ 
  maxItems = 12, 
  showHeader = true,
  className = '' 
}) => {
  // Add error boundary
  try {
    const router = useRouter();
    const [personalizedBlogs, setPersonalizedBlogs] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

    useEffect(() => {
      loadUserPreferences();
    }, []);

    useEffect(() => {
      if (userPreferences) {
        const filtered = filterBlogsByPreferences(mockBlogs, userPreferences);
        setPersonalizedBlogs(filtered.slice(0, maxItems));
      } else {
        // If no preferences, show most recent blogs
        setPersonalizedBlogs(mockBlogs.slice(0, maxItems));
      }
      setIsLoading(false);
    }, [userPreferences, maxItems]);

    const loadUserPreferences = () => {
      // Check for authentication first
      const userId = getUserId(); // You'll need to implement this based on your auth system

      if (userId) {
        // Try to load from localStorage (in production, fetch from Supabase)
        const storedPreferences = localStorage.getItem(`user_preferences_${userId}`);
        const engagementHistory = localStorage.getItem(`user_engagement_${userId}`);

        if (storedPreferences) {
          const preferences = JSON.parse(storedPreferences);
          const engagement = engagementHistory ? JSON.parse(engagementHistory) : {
            categoryClicks: {},
            tagClicks: {}
          };

          setUserPreferences({
            categories: preferences.categories || [],
            tags: preferences.tags || [],
            engagementHistory: engagement
          });
        }
      }
    };

    const getUserId = () => {
      // Placeholder - implement based on your auth system
      // This could check for Replit auth headers or Supabase session
      return localStorage.getItem('current_user_id') || null;
    };

    const filterBlogsByPreferences = (blogs: BlogPost[], preferences: UserPreferences): BlogPost[] => {
      return blogs
        .map(blog => ({
          ...blog,
          relevanceScore: calculateRelevanceScore(blog, preferences)
        }))
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .filter(blog => (blog.relevanceScore || 0) > 0);
    };

    const calculateRelevanceScore = (blog: BlogPost, preferences: UserPreferences): number => {
      let score = 0;

      // Score based on user's selected categories
      if (preferences.categories.includes(blog.category)) {
        score += 10;
      }

      // Score based on user's selected tags
      blog.tags.forEach(tag => {
        if (preferences.tags.includes(tag)) {
          score += 8;
        }
      });

      // Score based on engagement history
      const categoryEngagement = preferences.engagementHistory.categoryClicks[blog.category] || 0;
      score += Math.min(categoryEngagement * 2, 10); // Cap at 10 points

      blog.tags.forEach(tag => {
        const tagEngagement = preferences.engagementHistory.tagClicks[tag] || 0;
        score += Math.min(tagEngagement * 1.5, 8); // Cap at 8 points per tag
      });

      return score;
    };

    const handleBlogInteraction = (blogId: string, action: 'save' | 'read' | 'click') => {
      const blog = personalizedBlogs.find(b => b.id === blogId);
      if (!blog) return;

      // Update engagement history
      const userId = getUserId();
      if (userId) {
        const currentEngagement = JSON.parse(localStorage.getItem(`user_engagement_${userId}`) || '{"categoryClicks": {}, "tagClicks": {}}');

        if (action === 'click') {
          currentEngagement.categoryClicks[blog.category] = (currentEngagement.categoryClicks[blog.category] || 0) + 1;
          blog.tags.forEach(tag => {
            currentEngagement.tagClicks[tag] = (currentEngagement.tagClicks[tag] || 0) + 1;
          });
          localStorage.setItem(`user_engagement_${userId}`, JSON.stringify(currentEngagement));
        }
      }

      // Update local state
      setPersonalizedBlogs(prev => prev.map(b => 
        b.id === blogId ? { 
          ...b, 
          isSaved: action === 'save' ? !b.isSaved : b.isSaved,
          isRead: action === 'read' ? true : b.isRead
        } : b
      ));
    };

    const handleViewAll = () => {
      router.push('/blogroll');
    };

    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSkeleton}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}></div>
            ))}
          </div>
        </div>
      );
    }

    if (personalizedBlogs.length === 0) {
      return (
        <div className={styles.emptyState}>
          <h3>No personalized content yet</h3>
          <p>Set your preferences in your profile to see personalized blog recommendations here!</p>
          <button 
            onClick={() => router.push('/profile/reader')}
            className={styles.setupButton}
          >
            Set Preferences
          </button>
        </div>
      );
    }

    return (
      <section className={`${styles.personalizedSection} ${className}`}>
        {showHeader && (
          <div className={styles.sectionHeader}>
            <button onClick={handleViewAll} className={styles.viewAllButton}>
              View All Blogs →
            </button>
          </div>
        )}

        <div className={styles.blogGrid}>
          {personalizedBlogs.map((blog) => (
            <div key={blog.id} onClick={() => handleBlogInteraction(blog.id, 'click')}>
              <BlogCard
                blog={blog}
                onToggleSave={(id) => handleBlogInteraction(id, 'save')}
                onMarkAsRead={(id) => handleBlogInteraction(id, 'read')}
                showAuthor={true}
                showSaveButton={true}
              />
            </div>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    console.error('PersonalizedBlogroll error:', error);
    return (
      <section className={`${styles.personalizedSection} ${className}`}>
        <div className={styles.emptyState}>
          <h3>Something went wrong</h3>
          <p>We're experiencing technical difficulties. Please try refreshing the page.</p>
        </div>
      </section>
    );
  }
};

export default PersonalizedBlogroll;