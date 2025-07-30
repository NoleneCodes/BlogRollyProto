
import React, { useState } from 'react';
import BlogEditForm from './BlogEditForm';
import styles from '../styles/ProBlogCard.module.css';

interface BlogSubmission {
  id: string;
  title: string;
  url: string;
  category: string;
  status: 'approved' | 'pending' | 'draft' | 'rejected';
  submittedDate: string;
  views?: number;
  clicks?: number;
  isActive?: boolean;
  description?: string;
  image?: string;
  imageDescription?: string;
  ctr?: number;
  avgTimeOnPage?: number;
  bounceRate?: number;
  tags?: string[];
}

interface ProBlogCardProps {
  submission: BlogSubmission;
  isEditing: boolean;
  onEdit: (blogId: string) => void;
  onSaveEdit: (blogId: string, updatedData: any) => void;
  onCancelEdit: () => void;
  onToggleActivation: (postId: string) => void;
  showMetrics?: boolean;
}

const ProBlogCard: React.FC<ProBlogCardProps> = ({
  submission,
  isEditing,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleActivation,
  showMetrics = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'draft': return '#6b7280';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isEditing) {
    return (
      <div className={styles.blogCard}>
        <BlogEditForm
          blog={submission}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          isVisible={true}
        />
      </div>
    );
  }

  return (
    <div className={styles.blogCard}>
      <div className={styles.cardHeader}>
        <div className={styles.statusInfo}>
          <span 
            className={styles.status}
            style={{ backgroundColor: getStatusColor(submission.status) }}
          >
            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
          </span>
          <span className={styles.submittedDate}>
            Submitted {formatDate(submission.submittedDate)}
          </span>
        </div>
        <div className={styles.cardActions}>
          {submission.status !== 'pending' && (
            <button
              className={styles.editButton}
              onClick={() => onEdit(submission.id)}
            >
              Edit
            </button>
          )}
          {submission.status === 'approved' && (
            <button
              className={`${styles.toggleButton} ${submission.isActive ? styles.deactivate : styles.activate}`}
              onClick={() => onToggleActivation(submission.id)}
            >
              {submission.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
      </div>

      {submission.image && (
        <div className={styles.imageContainer}>
          <img src={submission.image} alt={submission.imageDescription || submission.title} />
        </div>
      )}

      <div className={styles.cardContent}>
        <h3 className={styles.title}>{submission.title}</h3>
        {submission.description && (
          <p className={styles.description}>{submission.description}</p>
        )}
        <p className={styles.url}>
          <a href={submission.url} target="_blank" rel="noopener noreferrer">
            {submission.url}
          </a>
        </p>
        <div className={styles.categoryContainer}>
          <span className={styles.category}>{submission.category}</span>
          {submission.tags && submission.tags.length > 0 && (
            <div className={styles.tags}>
              {submission.tags.slice(0, 3).map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
              {submission.tags.length > 3 && (
                <span className={styles.tag}>+{submission.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      {showMetrics && submission.status === 'approved' && submission.isActive && (
        <div className={styles.metricsContainer}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Views</span>
            <span className={styles.metricValue}>{submission.views?.toLocaleString() || 0}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Clicks</span>
            <span className={styles.metricValue}>{submission.clicks?.toLocaleString() || 0}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>CTR</span>
            <span className={styles.metricValue}>{submission.ctr?.toFixed(1) || 0}%</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Avg. Time</span>
            <span className={styles.metricValue}>{submission.avgTimeOnPage?.toFixed(1) || 0}m</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProBlogCard;
