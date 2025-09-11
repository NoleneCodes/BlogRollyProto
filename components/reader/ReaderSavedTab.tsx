import React from 'react';
import styles from '../../styles/ReaderProfile.module.css';

export default function ReaderSavedTab({ savedBlogs, removeSavedBlog }: any) {
  return (
    <div className={styles.content}>
      <h2>Saved Blogs</h2>
      {savedBlogs.length === 0 ? (
        <p className={styles.emptyState}>You haven&apos;t saved any blogs yet. Start exploring!</p>
      ) : (
        <div className={styles.blogList}>
          {savedBlogs.map((blog: any) => (
            <div key={blog.id} className={styles.blogItem}>
              <div className={styles.blogDetails}>
                <h4>{blog.title}</h4>
                <p>by {blog.author}</p>
                <span className={styles.category}>{blog.category}</span>
                <span className={styles.date}>Saved {new Date(blog.savedDate).toLocaleDateString()}</span>
              </div>
              <div className={styles.blogActions}>
                <a href={blog.url} className={styles.readButton}>Read</a>
                <button onClick={() => removeSavedBlog(blog.id)} className={styles.removeButton}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
