
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogPostManager from '../../components/BlogPostManager';
import { getAllInternalBlogPosts, deleteInternalBlogPost, InternalBlogPost } from '../../lib/internalBlogData';
import styles from '../../styles/Home.module.css';

interface UserInfo {
  id: string;
  name: string;
  roles: string[];
}

const BlogManagerPage: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [blogPosts, setBlogPosts] = useState<InternalBlogPost[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [editingPost, setEditingPost] = useState<InternalBlogPost | undefined>();
  const [mode, setMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    checkAuthAndAuthorization();
  }, []);

  const checkAuthAndAuthorization = async () => {
    try {
      const response = await fetch('/api/admin-auth-check');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          const user = {
            id: data.userId,
            name: data.userName,
            roles: data.userRoles ? data.userRoles.split(',') : []
          };
          setUserInfo(user);
          
          if (data.authorized) {
            setIsAuthorized(true);
            loadBlogPosts();
          } else {
            setIsAuthorized(false);
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBlogPosts = () => {
    const posts = getAllInternalBlogPosts();
    setBlogPosts(posts);
  };

  const handleAddNew = () => {
    setEditingPost(undefined);
    setMode('add');
    setShowManager(true);
  };

  const handleEdit = (post: InternalBlogPost) => {
    setEditingPost(post);
    setMode('edit');
    setShowManager(true);
  };

  const handleDelete = (postId: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      deleteInternalBlogPost(postId);
      loadBlogPosts();
    }
  };

  const handleCloseManager = () => {
    setShowManager(false);
    setEditingPost(undefined);
    loadBlogPosts();
  };

  if (isLoading) {
    return (
      <Layout title="Blog Manager - BlogRolly Admin">
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Loading...</h1>
            <p className={styles.description}>
              Checking authentication...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userInfo) {
    return (
      <Layout title="Blog Manager - BlogRolly Admin">
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Authentication Required</h1>
            <p className={styles.description}>
              Please sign in with your Replit account to access the admin panel.
            </p>
            <div className={styles.cta}>
              <div>
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      (function() {
                        const script = document.createElement('script');
                        script.src = 'https://auth.util.repl.co/script.js';
                        script.setAttribute('authed', 'location.reload()');
                        document.currentScript.parentNode.appendChild(script);
                      })();
                    `
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) {
    return (
      <Layout title="Access Denied - BlogRolly Admin">
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Access Denied</h1>
            <p className={styles.description}>
              Sorry {userInfo.name}, you don't have permission to access the admin panel. 
              Only BlogRolly team members can manage blog posts.
            </p>
            <div className={styles.cta}>
              <button 
                onClick={() => router.push('/')}
                className={styles.primaryButton}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Blog Manager - BlogRolly Admin">
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Blog Manager</h1>
          <p className={styles.description}>
            Welcome {userInfo.name}! Manage your internal blog posts below.
          </p>
          <div className={styles.cta}>
            <button 
              onClick={handleAddNew}
              className={styles.primaryButton}
            >
              Add New Post
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {blogPosts.map((post) => (
              <div 
                key={post.id}
                style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '1.5rem',
                  background: 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
                      {post.title}
                    </h3>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>
                      {post.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      <span>Category: {post.category}</span>
                      <span>Published: {post.publishDate}</span>
                      <span>Status: {post.isPublished ? 'Published' : 'Draft'}</span>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      {post.tags.map((tag, index) => (
                        <span 
                          key={index}
                          style={{ 
                            background: '#f3f4f6', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem',
                            marginRight: '0.5rem'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(post)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        background: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        background: '#ef4444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                    <a 
                      href={`/blog/post/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        padding: '0.5rem 1rem', 
                        background: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px',
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showManager && (
          <BlogPostManager
            onClose={handleCloseManager}
            existingPost={editingPost}
            mode={mode}
          />
        )}
      </div>
    </Layout>
  );
};

export default BlogManagerPage;
