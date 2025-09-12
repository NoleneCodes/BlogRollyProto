
import React from 'react';
import styles from '../../styles/ReaderProfile.module.css';
import { unfollowBlogger } from '../../lib/followClient';

export default function ReaderFollowingTab({ readerId, followedBloggers, onUnfollow }: any) {
  const handleUnfollow = async (bloggerId: string) => {
    await unfollowBlogger(readerId, bloggerId);
    if (onUnfollow) onUnfollow(bloggerId);
  };

  return (
    <div className={styles.content}>
  <h2 style={{ color: '#c42142' }}>Following</h2>
      {followedBloggers.length === 0 ? (
        <p className={styles.emptyState}>You&apos;re not following any bloggers yet. Discover and follow bloggers you love!</p>
      ) : (
        <div className={styles.followingList}>
          {followedBloggers.map((blogger: any) => (
            <div key={blogger.id} className={styles.followingItem}>
              <div className={styles.bloggerInfo}>
                <div className={styles.bloggerAvatar} style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '2px solid #eee' }}>
                  {blogger.avatar ? (
                    <img src={blogger.avatar} alt={blogger.username} style={{ borderRadius: '0', width: '48px', height: '48px', objectFit: 'cover', border: 'none' }} />
                  ) : (
                    <div className={styles.bloggerInitials} style={{ borderRadius: '0', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', fontWeight: 600 }}>
                      {blogger.username.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.bloggerDetails}>
                  <h4>{blogger.username}</h4>
                  <p className={styles.blogName}>{blogger.blogName}</p>
                  {blogger.bio && <p className={styles.bloggerBio}>{blogger.bio}</p>}
                  <div className={styles.bloggerMeta}>
                    <span className={styles.category}>{blogger.category}</span>
                  </div>
                </div>
              </div>
              <div className={styles.bloggerActions}>
                <a href={`/blogger/${blogger.id}`} className={styles.visitButton}>View Profile</a>
                <button onClick={() => handleUnfollow(blogger.id)} className={styles.unfollowButton}>Unfollow</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
