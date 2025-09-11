import React from 'react';
import styles from '../../styles/BloggerProfilePremium.module.css';
import PremiumBlogCard from '../PremiumBlogCard';

export default function PremiumBlogrollTab({ blogSubmissions, blogrollFilter, setBlogrollFilter, editingBlog, startEditingBlog, cancelEditingBlog, saveEditedBlog, handleEditField, handleSaveEdit, togglePostActivation, setShowBlogSubmissionForm }: any) {
  return (
    <div className={styles.content}>
      <div className={styles.sectionHeader}>
        <h2>My Blogroll</h2>
        <button 
          className={styles.primaryButton}
          onClick={() => setShowBlogSubmissionForm(true)}
        >
          Submit New Blog
        </button>
      </div>
      {blogSubmissions.length === 0 ? (
        <p className={styles.emptyState}>No blog submissions yet. Submit your first blog post!</p>
      ) : (
        <>
          <div className={styles.blogrollFilters}>
            <div className={styles.filterButtons}>
              <button 
                className={`${styles.filterButton} ${blogrollFilter === 'all' ? styles.active : ''}`}
                onClick={() => setBlogrollFilter('all')}
              >
                All ({blogSubmissions.length})
              </button>
              <button 
                className={`${styles.filterButton} ${blogrollFilter === 'draft' ? styles.active : ''}`}
                onClick={() => setBlogrollFilter('draft')}
              >
                Drafts ({blogSubmissions.filter((post: any) => post.status === 'draft').length})
              </button>
              <button 
                className={`${styles.filterButton} ${blogrollFilter === 'live' ? styles.active : ''}`}
                onClick={() => setBlogrollFilter('live')}
              >
                Live ({blogSubmissions.filter((post: any) => post.status === 'approved' && post.isActive).length})
              </button>
              <button 
                className={`${styles.filterButton} ${blogrollFilter === 'inactive' ? styles.active : ''}`}
                onClick={() => setBlogrollFilter('inactive')}
              >
                Inactive ({blogSubmissions.filter((post: any) => post.status === 'approved' && !post.isActive).length})
              </button>
              <button 
                className={`${styles.filterButton} ${blogrollFilter === 'pending' ? styles.active : ''}`}
                onClick={() => setBlogrollFilter('pending')}
              >
                Pending ({blogSubmissions.filter((post: any) => post.status === 'pending').length})
              </button>
            </div>
          </div>
          <div className={styles.submissionsList}>
            {blogSubmissions.filter((submission: any) => {
              if (blogrollFilter === 'all') return true;
              if (blogrollFilter === 'draft') return submission.status === 'draft';
              if (blogrollFilter === 'live') return submission.status === 'approved' && submission.isActive;
              if (blogrollFilter === 'inactive') return submission.status === 'approved' && !submission.isActive;
              if (blogrollFilter === 'pending') return submission.status === 'pending';
              return true;
            }).map((submission: any) => (
              <div key={submission.id} className={styles.submissionItem}>
                <PremiumBlogCard
                  submission={submission}
                  isEditing={editingBlog === submission.id}
                  onEdit={startEditingBlog}
                  onSaveEdit={saveEditedBlog}
                  onCancelEdit={cancelEditingBlog}
                  onToggleActivation={togglePostActivation}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
