
import React from 'react';
import styles from '../styles/BlogCard.module.css';

interface BlogPost {
  id: string;
  image?: string;
  title: string;
  author: string;
  authorProfile: string;
  description: string;
  category: string;
  tags: string[];
  postUrl: string;
  dateAdded: string;
  isRead?: boolean;
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
    return text.slice(0, maxLength).trim() + '...';
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
            alt={blog.title}
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
            href={blog.authorProfile} 
            className={styles.blogAuthor}
          >
            {blog.author}
          </a>
        )}
        
        <p className={styles.blogDescription}>
          {truncateText(blog.description, compact ? 80 : 120)}
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
