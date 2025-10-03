import React from 'react';
import styles from '../../styles/BloggerProfile.module.css';

import BloggerBlogCard from '../BloggerBlogCard';

export default function BloggerBlogsTab({ blogSubmissions, blogrollFilter, setBlogrollFilter, editingBlog, editingSubmission, editingField, editedTitle, editedDescription, editedImage, startEditingBlog, cancelEditingBlog, saveEditedBlog, handleEditField, handleSaveEdit, togglePostActivation, setEditedTitle, setEditedDescription, setEditedImage, setShowBlogSubmissionForm }: any) {
  return (
    <div className={styles.content}>
      <div className={styles.sectionHeader}>
  <h2 className={styles.brandHeading}>My Blogroll</h2>
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
          <div className={styles.tierLimitation}>
            <div className={styles.tierBanner}>
              <div className={styles.tierText}>Free Tier: You can have up to 3 active blog posts</div>
              <div className={styles.postCount}>You currently have <span className={styles.currentCount}>{blogSubmissions.filter((post: any) => post.status === 'approved' && post.isActive).length}</span>/3 active posts</div>
            </div>
          </div>
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
                <BloggerBlogCard
                  blog={submission}
                  isEditing={editingBlog === submission.id}
                  editingSubmission={editingSubmission}
                  editingField={editingField}
                  editedTitle={editedTitle}
                  editedDescription={editedDescription}
                  editedImage={editedImage}
                  onStartEdit={startEditingBlog}
                  onCancelEdit={cancelEditingBlog}
                  onSaveEdit={saveEditedBlog}
                  onEditField={handleEditField}
                  onSaveFieldEdit={handleSaveEdit}
                  onToggleActivation={togglePostActivation}
                  setEditedTitle={setEditedTitle}
                  setEditedDescription={setEditedDescription}
                  setEditedImage={setEditedImage}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
