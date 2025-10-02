
import React, { useState, useEffect } from 'react';
import { supabaseDB, BlogPostUrlChange } from '../lib/supabase';
import styles from '../styles/BlogUrlChangeHistory.module.css';

interface BlogUrlChangeHistoryProps {
  blogSubmissionId: string;
}

const BlogUrlChangeHistory: React.FC<BlogUrlChangeHistoryProps> = ({ blogSubmissionId }) => {
  const [changes, setChanges] = useState<BlogPostUrlChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUrlChanges = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseDB.getBlogPostUrlChanges(blogSubmissionId);
      
      if (error) {
        setError(error);
        return;
      }
      
      setChanges(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load URL change history');
    } finally {
      setLoading(false);
    }
  }, [blogSubmissionId]);

  useEffect(() => {
    fetchUrlChanges();
  }, [blogSubmissionId, fetchUrlChanges]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h4>URL Change History</h4>
        <div className={styles.loading}>Loading change history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h4>URL Change History</h4>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <div className={styles.container}>
        <h4>URL Change History</h4>
        <div className={styles.noChanges}>No URL changes recorded for this blog post.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h4>URL Change History</h4>
      <div className={styles.changesList}>
        {changes.map((change) => (
          <div key={change.id} className={styles.changeItem}>
            <div className={styles.changeHeader}>
              <span className={styles.changeDate}>{formatDate(change.changed_at)}</span>
            </div>
            <div className={styles.changeDetails}>
              <div className={styles.urlChange}>
                <div className={styles.urlRow}>
                  <span className={styles.urlLabel}>From:</span>
                  <span className={styles.oldUrl}>{change.old_url}</span>
                </div>
                <div className={styles.urlRow}>
                  <span className={styles.urlLabel}>To:</span>
                  <span className={styles.newUrl}>{change.new_url}</span>
                </div>
              </div>
              <div className={styles.reason}>
                <span className={styles.reasonLabel}>Reason:</span>
                <span className={styles.reasonText}>{change.change_reason}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogUrlChangeHistory;
