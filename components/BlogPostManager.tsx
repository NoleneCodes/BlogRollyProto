
import React, { useState } from 'react';
import { InternalBlogPost, addInternalBlogPost, updateInternalBlogPost, deleteInternalBlogPost } from '../lib/internalBlogData';
import styles from '../styles/BloggerProfilePremium.module.css';

interface BlogPostManagerProps {
  onClose: () => void;
  existingPost?: InternalBlogPost;
  mode: 'add' | 'edit';
}

const BlogPostManager: React.FC<BlogPostManagerProps> = ({ onClose, existingPost, mode }) => {
  const [formData, setFormData] = useState<Partial<InternalBlogPost>>({
    title: existingPost?.title || '',
    author: existingPost?.author || 'BlogRolly Team',
    authorProfile: existingPost?.authorProfile || '/about',
    bloggerId: existingPost?.bloggerId || 'admin',
    bloggerDisplayName: existingPost?.bloggerDisplayName || 'BlogRolly Team',
    description: existingPost?.description || '',
    category: existingPost?.category || 'Platform Updates',
    tags: existingPost?.tags || [],
    slug: existingPost?.slug || '',
    imageUrl: existingPost?.imageUrl || '/replit.svg',
    readTime: existingPost?.readTime || '5 min read',
    publishDate: existingPost?.publishDate || new Date().toISOString().split('T')[0],
    isPublished: existingPost?.isPublished ?? true,
    content: existingPost?.content || ''
  });

  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: keyof InternalBlogPost, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    const slug = formData.slug || generateSlug(formData.title);
    
    const postData = {
      ...formData,
      slug,
      tags: formData.tags || [],
    } as Omit<InternalBlogPost, 'id'>;

    if (mode === 'add') {
      addInternalBlogPost(postData);
    } else if (mode === 'edit' && existingPost) {
      updateInternalBlogPost(existingPost.id, postData);
    }

    onClose();
    window.location.reload(); // Refresh to show changes
  };

  return (
    <div className={styles.blogSubmissionOverlay}>
      <div className={styles.blogSubmissionContainer}>
        <div className={styles.blogSubmissionHeader}>
          <h3>{mode === 'add' ? 'Add New Blog Post' : 'Edit Blog Post'}</h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <div className={styles.blogSubmissionContent}>
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Slug (URL path)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="Auto-generated from title"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                >
                  <option value="Platform Updates">Platform Updates</option>
                  <option value="Community">Community</option>
                  <option value="Vision">Vision</option>
                  <option value="Tips & Guides">Tips & Guides</option>
                  <option value="Industry News">Industry News</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Read Time
                </label>
                <input
                  type="text"
                  value={formData.readTime}
                  onChange={(e) => handleInputChange('readTime', e.target.value)}
                  placeholder="5 min read"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Tags
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  style={{ padding: '0.5rem 1rem', background: '#c42142', color: 'white', border: 'none', borderRadius: '8px' }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.tags?.map((tag, index) => (
                  <span 
                    key={index}
                    style={{ 
                      background: '#f3f4f6', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '16px', 
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Publish Date
              </label>
              <input
                type="date"
                value={formData.publishDate}
                onChange={(e) => handleInputChange('publishDate', e.target.value)}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Content * (HTML supported)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={15}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontFamily: 'monospace' }}
                placeholder="Write your blog content here. You can use HTML tags like <h2>, <p>, <ul>, <li>, <strong>, etc."
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                />
                Published
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px', 
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                style={{ padding: '0.75rem 1.5rem' }}
              >
                {mode === 'add' ? 'Add Post' : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogPostManager;
