
import React, { useEffect, useState } from 'react';
import styles from '../../styles/ReaderProfile.module.css';
import { getReadingHistory } from '../../lib/readingHistoryClient';

export default function ReaderHistoryTab({ readerId }: any) {

  const [readingHistory, setReadingHistory] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      let history: any[] = [];
      if (readerId) {
        try {
          const res = await getReadingHistory(readerId);
          history = res && Array.isArray(res.history) ? res.history : [];
        } catch {
          history = [];
        }
      }
      // Always show mock data for demo/testing if no real history
      if (!readerId || history.length === 0) {
        history = [
          {
            blog_id: 'mock1',
            title: 'How to Build a Productive Morning Routine',
            url: 'https://mindfulproductivity.com/morning-routine',
            bloggerUsername: 'sarahjohnson',
            tags: ['Productivity', 'Habits', 'Morning Routine'],
          },
          {
            blog_id: 'mock2',
            title: 'The Ultimate Guide to Indie Blogging',
            url: 'https://techandbalance.com/indie-blogging-guide',
            bloggerUsername: 'alexchen',
            tags: ['Tech', 'Blogging', 'Indie'],
          }
        ];
      }
      setReadingHistory(history);
    }
    fetchHistory();
  }, [readerId]);

  const handleRemove = (blogId: string) => {
    setReadingHistory(readingHistory.filter(item => item.blog_id !== blogId));
  };

  return (
    <div className={styles.content}>
  <h2 style={{ color: '#c42142' }}>Reading History</h2>
      {readingHistory.length === 0 ? (
        <>
          <p className={styles.emptyState}>No reading history yet. <p> Start reading to build your history!</p> </p>
        </>
      ) : (
        <div className={styles.historyList}>
          {readingHistory.map((item: any) => (
            <div key={item.blog_id} className={styles.historyItem}>
              <div className={styles.historyDetails}>
                <h4>{item.title || item.blog_id}</h4>
                {item.bloggerUsername && (
                  <span style={{ marginLeft: 8, fontWeight: 500, display: 'inline-block', marginBottom: 10 }}>
                    <span style={{ color: '#222' }}>by </span>
                    <a
                      href={`/blogger/${item.bloggerUsername}`}
                      className={styles.bloggerHandle}
                      style={{ color: '#c42142', textDecoration: 'none', fontWeight: 500 }}
                    >
                      @{item.bloggerUsername}
                    </a>
                  </span>
                )}
                {/* Show up to 3 category/tags for the blog */}
                {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                  <div className={styles.tagsContainer} style={{ marginTop: 16 }}>
                    {item.tags.slice(0, 3).map((tag: string, idx: number) => (
                      <span key={idx} className={styles.tag} style={{ background: '#f3f4f6', color: '#c42142', borderRadius: '999px', padding: '2px 10px', marginRight: 6, fontSize: '0.95em' }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.historyActions}>
                <a href={item.url} className={styles.readButton} target="_blank" rel="noopener noreferrer">Revisit</a>
                <button onClick={() => handleRemove(item.blog_id)} className={styles.removeButton}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
