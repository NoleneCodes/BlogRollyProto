import React, { useState } from 'react';
import { InternalBlogPost, addInternalBlogPost, updateInternalBlogPost, deleteInternalBlogPost, ContentImage } from '../lib/internalBlogData';
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
    imageDescription: existingPost?.imageDescription || '',
    readTime: existingPost?.readTime || '5 min read',
    publishDate: existingPost?.publishDate || new Date().toISOString().split('T')[0],
    isPublished: existingPost?.isPublished ?? true,
    content: existingPost?.content || '',
    contentImages: existingPost?.contentImages || []
  });

  const [tagInput, setTagInput] = useState('');
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const [isUploadingContentImage, setIsUploadingContentImage] = useState(false);
  const [contentImageDescription, setContentImageDescription] = useState('');

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

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload-image-cloudinary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMainImage(true);
    const imageUrl = await uploadImage(file);
    
    if (imageUrl) {
      handleInputChange('imageUrl', imageUrl);
    }
    
    setIsUploadingMainImage(false);
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contentImageDescription.trim()) {
      alert('Please provide an image description for accessibility');
      return;
    }

    setIsUploadingContentImage(true);
    const imageUrl = await uploadImage(file);
    
    if (imageUrl) {
      const newContentImage: ContentImage = {
        id: Date.now().toString(),
        url: imageUrl,
        description: contentImageDescription.trim(),
        position: (formData.contentImages?.length || 0) + 1
      };
      
      handleInputChange('contentImages', [...(formData.contentImages || []), newContentImage]);
      setContentImageDescription('');
    }
    
    setIsUploadingContentImage(false);
  };

  const removeContentImage = (imageId: string) => {
    const updatedImages = formData.contentImages?.filter(img => img.id !== imageId) || [];
    handleInputChange('contentImages', updatedImages);
  };

  const insertImageIntoContent = (imageUrl: string, description: string) => {
    const imageMarkdown = `\n![${description}](${imageUrl})\n`;
    const currentContent = formData.content || '';
    handleInputChange('content', currentContent + imageMarkdown);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      if (mode === 'add') {
        await addInternalBlogPost(postData);
      } else if (mode === 'edit' && existingPost) {
        await updateInternalBlogPost(existingPost.id, postData);
      }
      onClose();
      window.location.reload(); // Refresh to show changes
    } catch (error) {
      alert('Failed to save blog post. Please try again.');
    }
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Blog Card Image
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formData.imageUrl && formData.imageUrl !== '/replit.svg' && (
                  <div style={{ width: '100%', maxWidth: '300px' }}>
                    <img 
                      src={formData.imageUrl} 
                      alt="Blog preview" 
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '1px solid #d1d5db'
                      }} 
                    />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    disabled={isUploadingMainImage}
                    style={{ display: 'none' }}
                    id="main-image-upload"
                  />
                  <label 
                    htmlFor="main-image-upload"
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: isUploadingMainImage ? '#9ca3af' : '#c42142', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px',
                      cursor: isUploadingMainImage ? 'not-allowed' : 'pointer',
                      display: 'inline-block'
                    }}
                  >
                    {isUploadingMainImage ? 'Uploading...' : 'Upload Image'}
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="Or paste image URL"
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </div>
                <input
                  type="text"
                  value={formData.imageDescription}
                  onChange={(e) => handleInputChange('imageDescription', e.target.value)}
                  placeholder="Image description (for accessibility)"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>
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
                Content Images
              </label>
              <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={contentImageDescription}
                    onChange={(e) => setContentImageDescription(e.target.value)}
                    placeholder="Image description (required for accessibility)"
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleContentImageUpload}
                    disabled={isUploadingContentImage || !contentImageDescription.trim()}
                    style={{ display: 'none' }}
                    id="content-image-upload"
                  />
                  <label 
                    htmlFor="content-image-upload"
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: (isUploadingContentImage || !contentImageDescription.trim()) ? '#9ca3af' : '#c42142', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px',
                      cursor: (isUploadingContentImage || !contentImageDescription.trim()) ? 'not-allowed' : 'pointer',
                      display: 'inline-block'
                    }}
                  >
                    {isUploadingContentImage ? 'Uploading...' : 'Add Image'}
                  </label>
                </div>
                
                {formData.contentImages && formData.contentImages.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {formData.contentImages.map((image) => (
                      <div key={image.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem' }}>
                        <img 
                          src={image.url} 
                          alt={image.description}
                          style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }}
                        />
                        <p style={{ fontSize: '0.875rem', margin: '0 0 0.5rem 0', color: '#6b7280' }}>{image.description}</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => insertImageIntoContent(image.url, image.description)}
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              background: '#10b981', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Insert
                          </button>
                          <button
                            type="button"
                            onClick={() => removeContentImage(image.id)}
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              background: '#ef4444', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '1rem 0 0 0' }}>
                  Upload images to use in your blog content. Click &quot;Insert&quot; to add the image to your content below.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Content * (HTML and Markdown supported)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={15}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontFamily: 'monospace' }}
                placeholder="Write your blog content here. You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc. For images, use: ![description](image-url)"
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
