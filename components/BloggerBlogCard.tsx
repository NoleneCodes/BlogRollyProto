
import React from 'react';
import BlogEditForm from './BlogEditForm';
import styles from '../styles/BloggerBlogCard.module.css';

interface BlogSubmission {
  id: string;
  title: string;
  url: string;
  category: string;
  tags?: string[];
  status: 'approved' | 'pending' | 'draft' | 'rejected';
  submittedDate: string;
  views?: number;
  clicks?: number;
  isActive?: boolean;
  description?: string;
  image?: string;
  imageDescription?: string;
}

interface BloggerBlogCardProps {
  blog: BlogSubmission;
  isEditing: boolean;
  editingSubmission: string | null;
  editingField: string | null;
  editedTitle: string;
  editedDescription: string;
  editedImage: string;
  onStartEdit: (blog: BlogSubmission) => void;
  onCancelEdit: () => void;
  onSaveEdit: (blogId: string, updatedData: any) => void;
  onEditField: (submissionId: string, field: string, value: string) => void;
  onSaveFieldEdit: (submissionId: string, field: string, value: string) => void;
  onToggleActivation: (postId: string) => void;
  setEditedTitle: (title: string) => void;
  setEditedDescription: (description: string) => void;
  setEditedImage: (image: string) => void;
}

const BloggerBlogCard: React.FC<BloggerBlogCardProps> = ({
  blog,
  isEditing,
  editingSubmission,
  editingField,
  editedTitle,
  editedDescription,
  editedImage,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditField,
  onSaveFieldEdit,
  onToggleActivation,
  setEditedTitle,
  setEditedDescription,
  setEditedImage
}) => {
  if (isEditing) {
    return (
      <BlogEditForm
        blog={blog}
        onSave={onSaveEdit}
        onCancel={onCancelEdit}
        isVisible={true}
      />
    );
  }

  return (
    <div className={styles.submissionCard}>
      <div className={styles.submissionImageContainer}>
        {editingSubmission === blog.id && editingField === 'image' ? (
          <input
            type="url"
            value={editedImage}
            onChange={(e) => setEditedImage(e.target.value)}
            className={styles.editInput}
            placeholder="Image URL"
            onBlur={() => onSaveFieldEdit(blog.id, 'image', editedImage)}
            onKeyPress={(e) => e.key === 'Enter' && onSaveFieldEdit(blog.id, 'image', editedImage)}
            autoFocus
          />
        ) : blog.image ? (
          <img 
            src={blog.image} 
            alt={blog.title}
            className={styles.submissionImage}
            onClick={() => onEditField(blog.id, 'image', blog.image)}
          />
        ) : (
          <div 
            className={styles.submissionImagePlaceholder}
            onClick={() => onEditField(blog.id, 'image', '')}
          >
            Click to add image
          </div>
        )}
      </div>

      <div className={styles.submissionContent}>
        <div className={styles.submissionHeader}>
          <div className={styles.submissionDetails}>
            <h4 className={styles.submissionTitle}>
              {editingSubmission === blog.id && editingField === 'title' ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className={styles.editInput}
                  onBlur={() => onSaveFieldEdit(blog.id, 'title', editedTitle)}
                  onKeyPress={(e) => e.key === 'Enter' && onSaveFieldEdit(blog.id, 'title', editedTitle)}
                  autoFocus
                />
              ) : (
                <span onClick={() => onEditField(blog.id, 'title', blog.title)}>
                  {blog.title}
                  {blog.status === 'approved' && !blog.isActive && (
                    <span className={styles.inactiveIndicator}> • Inactive</span>
                  )}
                </span>
              )}
            </h4>

            <p className={styles.submissionDescription}>
              {editingSubmission === blog.id && editingField === 'description' ? (
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className={styles.editTextarea}
                  onBlur={() => onSaveFieldEdit(blog.id, 'description', editedDescription)}
                  autoFocus
                  rows={2}
                />
              ) : (
                <span onClick={() => onEditField(blog.id, 'description', blog.description)}>
                  {blog.description}
                </span>
              )}
            </p>
          </div>
        </div>

        <p className={styles.submissionUrl}>{blog.url || 'Draft - No URL yet'}</p>
        
        <div className={styles.submissionMeta}>
          <span className={styles.metaItem}>
            <strong>Status:</strong> 
            <span className={`${styles.status} ${styles[blog.status]}`}>
              {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
            </span>
          </span>
          <span className={styles.metaItem}>
            <strong>Category:</strong> {blog.category}
          </span>
          {blog.tags && blog.tags.length > 0 && (
            <span className={styles.metaItem}>
              <strong>Tags:</strong> 
              <div className={styles.tagsDisplay}>
                {blog.tags.map((tag, index) => (
                  <span key={index} className={styles.tagChip}>{tag}</span>
                ))}
              </div>
            </span>
          )}
        </div>
      </div>
      
      <div className={styles.submissionActions}>
        <button 
          className={styles.editButton}
          onClick={() => onStartEdit(blog)}
        >
          Edit
        </button>
        {blog.status === 'approved' && (
          <button 
            className={`${styles.activationButton} ${blog.isActive ? styles.deactivate : styles.activate}`}
            onClick={() => onToggleActivation(blog.id)}
          >
            {blog.isActive ? 'Deactivate' : 'Activate'}
          </button>
        )}
        {blog.status === 'approved' && blog.isActive && (
          <div className={styles.submissionStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Views</span>
              <span className={styles.statValue}>{blog.views}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Clicks</span>
              <span className={styles.statValue}>{blog.clicks}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloggerBlogCard;
