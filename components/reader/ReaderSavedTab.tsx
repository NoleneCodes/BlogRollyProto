

import React, { useEffect, useState } from 'react';
import styles from '../../styles/ReaderProfile.module.css';
import { getSavedBlogs, removeSavedBlog } from '../../lib/savedBlogsClient';

async function fetchBlogDetails(blogIds: string[]): Promise<any[]> {
  if (!blogIds.length) return [];
  const res = await fetch('/api/blogs/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blogIds }),
  });
  const data = await res.json();
  return data.blogs || [];
}

export default function ReaderSavedTab({ readerId }: any) {
  const [savedBlogs, setSavedBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchSaved() {
      let blogDetails: any[] = [];
      if (readerId) {
        try {
          const res = await getSavedBlogs(readerId);
          const blogIds = (res.blogs || []).map((b: any) => b.blog_id);
          blogDetails = await fetchBlogDetails(blogIds);
        } catch {
          blogDetails = [];
        }
      }
      // Always show mock data for demo/testing if no real saved blogs
      if (!readerId || blogDetails.length === 0) {
        blogDetails = [
          {
            id: 'mock1',
            title: 'How to Build a Productive Morning Routine',
            author: 'Sarah Johnson',
            category: 'Productivity',
            postUrl: 'https://mindfulproductivity.com/morning-routine',
          },
          {
            id: 'mock2',
            title: 'The Ultimate Guide to Indie Blogging',
            author: 'Alex Chen',
            category: 'Tech',
            postUrl: 'https://techandbalance.com/indie-blogging-guide',
          }
        ];
      }
      setSavedBlogs(blogDetails);
    }
    fetchSaved();
  }, [readerId]);

  const handleRemove = async (blogId: string) => {
    await removeSavedBlog(readerId, blogId);
    setSavedBlogs(savedBlogs.filter(b => b.id !== blogId));
  };

  return (
    <div className={styles.content}>
  <h2 style={{ color: '#c42142' }}>Saved Blogs</h2>
      {savedBlogs.length === 0 ? (
        <p className={styles.emptyState}>No saved blogs found for this account.</p>
      ) : (
        <div className={styles.blogList}>
          {savedBlogs.map((blog: any) => (
            <div key={blog.id} className={styles.blogItem}>
              <div className={styles.blogDetails}>
                <h4>{blog.title}</h4>
                <p>by {blog.author}</p>
                <span className={styles.category}>{blog.category}</span>
              </div>
              <div className={styles.blogActions}>
                <a href={blog.postUrl} className={styles.readButton}>Read</a>
                <button onClick={() => handleRemove(blog.id)} className={styles.removeButton}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
