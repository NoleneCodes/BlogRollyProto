import React from 'react';
import styles from '../styles/BlogCard.module.css';

interface BlogPost {
  id: string;
  title: string;
  author: string; // This will be the blogger's display name
  authorProfile?: string;
  bloggerId: string; // ID of the blogger who submitted this
  bloggerDisplayName: string; // Display name from blogger's profile
  description: string;
  category: string;
  tags: string[];
  postUrl: string;
  imageUrl?: string;
  imageDescription?: string; // Description for image alt text
  hasAdultContent?: boolean;
  readTime?: string;
  publishDate?: string;
  isSaved?: boolean;
}

interface BlogCardProps {
  blog: BlogPost;
  onToggleSave?: (blogId: string) => void;
  onMarkAsRead?: (blogId: string) => void;
  showAuthor?: boolean;
  showSaveButton?: boolean;
  compact?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  onToggleSave,
  onMarkAsRead,
  showAuthor = true,
  showSaveButton = true,
  compact = false
}) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    // Find the last space before the maxLength to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
  };

  const handleReadMore = () => {
    if (onMarkAsRead) {
      onMarkAsRead(blog.id);
    }
  };

  const handleToggleSave = () => {
    if (onToggleSave) {
      onToggleSave(blog.id);
    }
  };

  return (
    <div className={`${styles.blogCard} ${compact ? styles.compact : ''}`}>
      <div className={styles.imageContainer}>
        {blog.image && (
          <img 
            src={blog.image} 
            alt={blog.imageDescription || blog.title}
            className={styles.blogImage}
          />
        )}
        <div className={styles.categoryTag}>
          <a href={`/blogroll?category=${encodeURIComponent(blog.category)}`}>
            {blog.category}
          </a>
        </div>
        {blog.isRead && (
          <div className={styles.readBadge}>
            Read
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.blogTitle}>
          {blog.title}
        </h3>

        {showAuthor && (
          <a 
            href={`/blogger/${blog.bloggerId}`}
            className={styles.blogAuthor}
          >
            {blog.bloggerDisplayName}
          </a>
        )}

        <p className={styles.blogDescription}>
          {blog.description}
        </p>

        <div className={styles.tagsContainer}>
          {blog.tags.slice(0, 3).map((tag, index) => (
            <a 
              key={index}
              href={`/blogroll?tag=${encodeURIComponent(tag)}`}
              className={styles.tag}
            >
              {tag}
            </a>
          ))}
        </div>

        <div className={styles.cardActions}>
          <a 
            href={blog.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.readButton}
            onClick={handleReadMore}
          >
            Read More
          </a>

          {showSaveButton && onToggleSave && (
            <button 
              onClick={handleToggleSave}
              className={`${styles.saveButton} ${blog.isSaved ? styles.saved : ''}`}
              title={blog.isSaved ? 'Remove from saved' : 'Save blog'}
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill={blog.isSaved ? "currentColor" : "none"}
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;