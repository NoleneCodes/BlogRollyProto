
import React from 'react';
import styles from '../styles/BlogCard.module.css';

interface InternalBlogPost {
  id: string;
  title: string;
  author: string;
  authorProfile?: string;
  bloggerId: string;
  bloggerDisplayName: string;
  description: string;
  category: string;
  tags: string[];
  slug: string;
  imageUrl?: string;
  readTime?: string;
  publishDate: string;
  isPublished: boolean;
}

interface InternalBlogCardProps {
  blog: InternalBlogPost;
  showAuthor?: boolean;
  showSaveButton?: boolean;
  compact?: boolean;
}

const InternalBlogCard: React.FC<InternalBlogCardProps> = ({
  blog,
  showAuthor = true,
  showSaveButton = false,
  compact = false
}) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`${styles.blogCard} ${compact ? styles.compact : ''}`}>
      <div className={styles.imageContainer}>
        {blog.imageUrl && (
          <img 
            src={blog.imageUrl} 
            alt={blog.title}
            className={styles.blogImage}
          />
        )}
        <div className={styles.categoryTag}>
          <span>{blog.category}</span>
        </div>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.blogTitle}>
          {blog.title}
        </h3>

        {showAuthor && (
          <div className={styles.blogMeta}>
            <span className={styles.blogAuthor}>
              {blog.bloggerDisplayName || blog.author}
            </span>
            <span className={styles.blogDate}>
              {formatDate(blog.publishDate)}
            </span>
            {blog.readTime && (
              <span className={styles.readTime}>
                • {blog.readTime}
              </span>
            )}
          </div>
        )}

        <p className={styles.blogDescription}>
          {truncateText(blog.description, 120)}
        </p>

        <div className={styles.tagsContainer}>
          {blog.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className={styles.cardActions}>
          <a 
            href={`/blog/post/${blog.slug}`}
            className={styles.readButton}
          >
            Read More
          </a>
        </div>
      </div>
    </div>
  );
};

export default InternalBlogCard;
