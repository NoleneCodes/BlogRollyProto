import React from 'react';
import styles from '../../styles/ReaderProfile.module.css';

export default function ReaderHistoryTab({ readingHistory }: any) {
  return (
    <div className={styles.content}>
      <h2>Reading History</h2>
      {readingHistory.length === 0 ? (
        <p className={styles.emptyState}>No reading history yet. Start reading to build your history!</p>
      ) : (
        <div className={styles.historyList}>
          {readingHistory.map((item: any) => (
            <div key={item.id} className={styles.historyItem}>
              <div className={styles.historyDetails}>
                <h4>{item.title}</h4>
                <p>by {item.author}</p>
                {item.timeSpent && (
                  <span className={styles.timeSpent}>{item.timeSpent} min read</span>
                )}
              </div>
              <div className={styles.historyActions}>
                {/* Add any history actions here */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
