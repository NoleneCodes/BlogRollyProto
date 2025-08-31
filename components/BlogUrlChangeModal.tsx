
import React, { useState } from 'react';
import styles from '../styles/BlogUrlChangeModal.module.css';

interface BlogUrlChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  blogTitle: string;
  onUrlChange: (newUrl: string, reason: string) => Promise<void>;
}

const BlogUrlChangeModal: React.FC<BlogUrlChangeModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  blogTitle,
  onUrlChange
}) => {
  const [newUrl, setNewUrl] = useState(currentUrl);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUrl.trim()) {
      setError('Please enter a new URL');
      return;
    }
    
    if (!reason.trim()) {
      setError('Please provide a reason for the URL change');
      return;
    }

    if (newUrl === currentUrl) {
      setError('New URL must be different from current URL');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onUrlChange(newUrl.trim(), reason.trim());
      onClose();
      setNewUrl(currentUrl);
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to update URL');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNewUrl(currentUrl);
      setReason('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Change Blog Post URL</h3>
          <button 
            onClick={handleClose} 
            className={styles.closeButton}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.blogInfo}>
            <strong>Blog Post:</strong> {blogTitle}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="currentUrl">Current URL:</label>
              <input
                id="currentUrl"
                type="url"
                value={currentUrl}
                disabled
                className={styles.disabledInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="newUrl">New URL: *</label>
              <input
                id="newUrl"
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://yourblog.com/new-post-path"
                required
                disabled={isSubmitting}
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="reason">Reason for Change: *</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you're changing this URL..."
                required
                disabled={isSubmitting}
                className={styles.textarea}
                rows={4}
              />
            </div>
            
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}
            
            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? 'Updating...' : 'Update URL'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogUrlChangeModal;
