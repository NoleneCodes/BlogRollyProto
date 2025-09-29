
import React from 'react';
import BlogEditForm from './BlogEditForm';
import styles from '../styles/PremiumBlogCard.module.css';

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

interface PremiumBlogCardProps {
  submission: BlogSubmission & { monthlyViews?: number; monthlyClicks?: number };
  isEditing: boolean;
  onEdit: (blogId: string) => void;
  onSaveEdit: (blogId: string, updatedData: any) => void;
  onCancelEdit: () => void;
  onToggleActivation: (blogId: string) => void;
  showMetrics?: boolean;
  // Only for pro profile blogroll/analytics, not public
  viewsToggle?: 'total' | 'monthly';
  clicksToggle?: 'total' | 'monthly';
}

const PremiumBlogCard: React.FC<PremiumBlogCardProps> = ({
  submission,
  isEditing,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleActivation,
  showMetrics = true,
  viewsToggle,
  clicksToggle,
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

  if (isEditing) {
    return (
      <div className={styles.submissionItem}>
        <BlogEditForm
          blog={{
            id: submission.id,
            title: submission.title,
            url: submission.url,
            category: submission.category,
            tags: submission.tags || [],
            description: submission.description || '',
            image: submission.image || '',
            imageDescription: submission.imageDescription || ''
          }}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          isVisible={true}
        />
      </div>
    );
  }

  return (
    <div className={styles.submissionItem}>
      <div className={styles.premiumSubmissionCard}>
        <div className={styles.submissionImageContainer}>
          {submission.image ? (
            <img
              src={submission.image}
              alt={submission.title}
              className={styles.submissionImage}
            />
          ) : (
            <div className={styles.submissionImagePlaceholder}>
              No image
            </div>
          )}
        </div>

        <div className={styles.submissionContent}>
          <div className={styles.submissionHeader}>
            <h4 className={styles.submissionTitle}>
              {submission.title}
              {submission.status === 'approved' && !submission.isActive && (
                <span className={styles.inactiveIndicator}> • Inactive</span>
              )}
            </h4>
            <p className={styles.submissionDescription}>
              {submission.description}
            </p>
          </div>

          <div className={styles.urlSection}>
            <p className={styles.submissionUrl}>
              {submission.url || 'Draft - No URL yet'}
            </p>
          </div>

          <div className={styles.submissionMeta}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Status:</span>
              <span
                className={styles.status}
                style={{ backgroundColor: getStatusColor(submission.status) }}
              >
                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                {submission.status === 'approved' && submission.isActive && (
                  <span className={styles.activeIndicator}> • Live</span>
                )}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Category:</span>
              <span className={styles.category}>{submission.category}</span>
            </div>
            {submission.tags && submission.tags.length > 0 && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Tags:</span>
                <div className={styles.tagsDisplay}>
                  {submission.tags.slice(0, 3).map(tag => (
                    <span key={tag} className={styles.tagChip}>
                      {tag}
                    </span>
                  ))}
                  {submission.tags.length > 3 && (
                    <span className={styles.tagChip}>
                      +{submission.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {showMetrics && submission.status === 'approved' && submission.isActive && (
            <div className={styles.premiumMetrics}>
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>
                  {viewsToggle === 'monthly'
                    ? (submission.monthlyViews || 0)
                    : (submission.views || 0)}
                </span>
                <span className={styles.metricLabel}>{viewsToggle === 'monthly' ? 'Monthly Views' : 'Views'}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>
                  {clicksToggle === 'monthly'
                    ? (submission.monthlyClicks || 0)
                    : (submission.clicks || 0)}
                </span>
                <span className={styles.metricLabel}>{clicksToggle === 'monthly' ? 'Monthly Clicks' : 'Clicks'}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>
                  {viewsToggle === 'monthly'
                    ? (submission.monthlyViews ? ((submission.monthlyClicks / submission.monthlyViews) * 100).toFixed(1) : 0)
                    : (submission.views ? ((submission.clicks / submission.views) * 100).toFixed(1) : 0)
                  }%
                </span>
                <span className={styles.metricLabel}>CTR</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.submissionActions}>
          <button 
            className={styles.editButton}
            onClick={() => onEdit(submission.id)}
          >
            Edit
          </button>
          {submission.status === 'approved' && (
            <button
              className={`${styles.activationButton} ${submission.isActive ? styles.deactivate : styles.activate}`}
              onClick={() => onToggleActivation(submission.id)}
            >
              {submission.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumBlogCard;
