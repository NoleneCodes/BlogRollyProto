import React, { useState, useRef, useEffect } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { MAIN_CATEGORIES, TAGS } from '../lib/categories-tags';
import { CustomCategoryInput } from './CustomCategoryInput';
import styles from '../styles/BlogEditForm.module.css';

interface BlogEditFormProps {
  blog: {
    id: string;
    title: string;
    url: string;
    category: string;
    tags?: string[];
    description?: string;
    image?: string;
    imageDescription?: string;
  };
  onSave: (blogId: string, updatedData: BlogData) => void;
  onCancel: () => void;
  isVisible: boolean;
}

interface BlogData {
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  image: File | null;
  imagePreview: string | null;
  imageDescription: string;
  urlChangeReason?: string;
}



const BlogEditForm: React.FC<BlogEditFormProps> = ({ blog, onSave, onCancel, isVisible }) => {
  const { user } = useSupabaseAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [editForm, setEditForm] = useState<BlogData>({
    title: blog.title,
    description: blog.description || '',
    url: blog.url,
    category: blog.category,
    tags: blog.tags || [],
    image: null,
    imagePreview: blog.image || null,
    imageDescription: blog.imageDescription || ''
  });

  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [urlChangeReason, setUrlChangeReason] = useState('');
  const [originalUrl] = useState(blog.url); // Store original URL to detect changes
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check premium status
  useEffect(() => {
    const checkProStatus = async () => {
      if (!user) {
        // For the pro blogger demo page, simulate pro status
        if (window.location.pathname.includes('blogger-premium')) {
          setIsPremium(true);
          return;
        }
        setIsPremium(false);
        return;
      }

      try {
        const response = await fetch('/api/check-premium-status', {
          headers: {
            'Authorization': `Bearer ${user.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.isPremium || data.tier === 'pro');
        } else {
          // For demo purposes on pro page
          if (window.location.pathname.includes('blogger-premium')) {
            setIsPremium(true);
          } else {
            setIsPremium(false);
          }
        }
      } catch (error) {
        console.error('Error checking pro status:', error);
        // For demo purposes on pro page
        if (window.location.pathname.includes('blogger-premium')) {
          setIsPremium(true);
        } else {
          setIsPremium(false);
        }
      }
    };

    checkProStatus();
  }, [user]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    if (showTagDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTagDropdown]);

  if (!isVisible) return null;

  // Debug logging
  console.log('BlogEditForm - isPro:', isPremium, 'pathname:', window.location.pathname);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB');
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG, and WebP files are allowed');
        return;
      }
      setEditForm(prev => ({ ...prev, image: file, imageDescription: '' }));
      setImageChanged(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm(prev => ({ ...prev, imagePreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setEditForm(prev => ({ 
      ...prev, 
      category
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (editForm.tags.length < 10 && !editForm.tags.includes(tag)) {
      setEditForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const handleTagRemove = (tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getAllTags = () => {
    return Object.values(TAGS).flat();
  };

  const urlChangeReasons = [
    'Fixing broken or incorrect URL',
    'Updating to match content changes',
    'SEO optimization',
    'Rebranding or domain change',
    'Correcting typos in URL',
    'Moving content to better location',
    'Compliance with site guidelines',
    'User experience improvement',
    'Other (please specify in comments)'
  ];

  const filteredTags = getAllTags().filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !editForm.tags.includes(tag)
  );

  const handleSave = async () => {
    if (imageChanged && !editForm.imageDescription.trim()) {
      alert('Please provide an image description for the new image. This is used for accessibility and SEO.');
      return;
    }

    // Check if URL has changed and reason is required
    const urlHasChanged = editForm.url !== originalUrl;
    if (urlHasChanged && isPremium && !urlChangeReason.trim()) {
      alert('Please select a reason for changing the blog URL.');
      return;
    }

    // Validate that the new URL is from the verified domain if URL has changed
    if (urlHasChanged && isPremium) {
      try {
        const response = await fetch('/api/validate-blog-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.access_token}`
          },
          body: JSON.stringify({ postUrl: editForm.url })
        });

        const result = await response.json();

        if (!response.ok || !result.valid) {
          alert(result.error || 'The new URL must be from your verified domain.');
          return;
        }
      } catch (error) {
        console.error('Domain validation error:', error);
        alert('Unable to validate domain. Please try again.');
        return;
      }
    }

    // Handle URL changes with automatic deactivation
    if (urlHasChanged && isPremium) {
      try {
        const response = await fetch('/api/blogs/update-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.access_token}`
          },
          body: JSON.stringify({
            submissionId: blog.id,
            newUrl: editForm.url,
            changeReason: urlChangeReason
          })
        });

        const result = await response.json();

        if (!response.ok) {
          alert(result.error || 'Failed to update URL');
          return;
        }

        if (result.requiresReapproval) {
          alert('Your blog URL has been updated successfully. Since the URL changed, your blog has been deactivated and will need to go through the approval process again. You will be notified once it has been reviewed.');
        }

        // Update the form with the response data
        onSave(blog.id, {
          ...editForm,
          urlChangeReason: urlHasChanged ? urlChangeReason : undefined,
          // Include the updated status from the response
          status: result.data?.status,
          isLive: result.data?.is_live
        });
      } catch (error) {
        console.error('URL update error:', error);
        alert('Failed to update URL. Please try again.');
        return;
      }
    } else {
      // Regular save for non-URL changes
      const saveData = {
        ...editForm,
        urlChangeReason: urlHasChanged ? urlChangeReason : undefined
      };

      onSave(blog.id, saveData);
    }
  };

  return (
    <div className={styles.editBlogForm}>
      <div className={styles.editImageSection}>
        {editForm.imagePreview && (
          <div className={styles.editImagePreview}>
            <img src={editForm.imagePreview} alt="Blog preview" />
          </div>
        )}
        <div className={styles.editImageUpload}>
          <input
            type="file"
            id={`editImage-${blog.id}`}
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
          <label htmlFor={`editImage-${blog.id}`} className={styles.uploadButton}>
            {editForm.imagePreview ? 'Change Image' : 'Add Image'}
          </label>
          <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Max 2MB • JPG, PNG, WebP
          </small>
        </div>

        {editForm.imagePreview && (
          <div className={styles.editField} style={{ marginTop: '1rem' }}>
            <label>
              Image Description {imageChanged && '*'}
              {imageChanged && <span style={{ color: '#c42142', fontWeight: 'bold' }}> (Required for new image)</span>}
            </label>
            <input
              type="text"
              value={editForm.imageDescription}
              onChange={(e) => setEditForm(prev => ({ ...prev, imageDescription: e.target.value }))}
              className={styles.editInput}
              placeholder="Describe what's in the image for screen readers and SEO"
              maxLength={200}
              required={imageChanged}
            />
            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {editForm.imageDescription.length}/200 characters
              {imageChanged ? ' • This will be used as the alt text for your image' : ' • Used for accessibility and SEO'}
            </small>
          </div>
        )}
      </div>
      <div className={styles.editFormFields}>
        <div className={styles.editField}>
          <label>Title</label>
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
            className={styles.editInput}
            placeholder="Enter your blog post title..."
          />
        </div>
        <div className={styles.editField}>
          <label>Description</label>
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
            className={styles.editTextarea}
            rows={4}
            placeholder="Write a compelling description of your blog post..."
          />
        </div>
        <div className={styles.editField}>
          <label>
            URL
            {!isPremium && <span style={{ color: '#c42142', fontSize: '0.875rem', marginLeft: '0.5rem' }}>🔒 Pro Feature</span>}
          </label>
          <input
            type="url"
            value={editForm.url}
            onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
            onBlur={async (e) => {
              // Real-time validation when user finishes editing URL
              if (isPremium && e.target.value !== originalUrl && e.target.value.trim()) {
                try {
                  const response = await fetch('/api/validate-blog-url', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${user?.access_token}`
                    },
                    body: JSON.stringify({ postUrl: e.target.value })
                  });

                  const result = await response.json();

                  if (!response.ok || !result.valid) {
                    // Reset to original URL if validation fails
                    setEditForm(prev => ({ ...prev, url: originalUrl }));
                    alert(result.error || 'The URL must be from your verified domain.');
                  }
                } catch (error) {
                  console.error('URL validation error:', error);
                }
              }
            }}
            className={`${styles.editInput} ${!isPremium ? styles.readOnlyInput : ''} ${isPremium ? styles.proInput : ''}`}
            placeholder={isPremium ? "https://yourblog.com/post-url" : "Upgrade to Pro to edit URLs"}
            readOnly={!isPremium}
            disabled={!isPremium}
            style={!isPremium ? { backgroundColor: '#f9fafb', color: '#6b7280', cursor: 'not-allowed' } : { backgroundColor: '#f0fdf4', border: '2px solid #10b981' }}
          />
          
          {/* URL Change Reason Dropdown - Only show if URL has changed and user is premium */}
          {isPremium && editForm.url !== originalUrl && (
            <div style={{ marginTop: '0.75rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500', 
                color: '#374151',
                fontSize: '0.875rem' 
              }}>
                Reason for URL Change *
              </label>
              <select
                value={urlChangeReason}
                onChange={(e) => setUrlChangeReason(e.target.value)}
                className={styles.editSelect}
                required
                style={{ backgroundColor: '#fef3c7', border: '2px solid #f59e0b' }}
              >
                <option value="">Select a reason for changing the URL</option>
                {urlChangeReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
              <small style={{ 
                color: '#92400e', 
                fontSize: '0.75rem', 
                marginTop: '0.25rem', 
                display: 'block',
                fontWeight: '500'
              }}>
                ⚠️ This change will be logged for review purposes
              </small>
            </div>
          )}

          {!isPremium && (
            <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              URL editing is only available to Pro subscribers. 
              <a href="/profile/blogger#billing" style={{ color: '#c42142', textDecoration: 'underline' }}>
                Upgrade to Pro
              </a> to edit blog URLs.
            </small>
          )}
        </div>
        <div className={styles.editField}>
          <label>Category</label>
          <select
            value={editForm.category}
            onChange={handleCategoryChange}
            className={styles.editSelect}
          >
            <option value="">Select a main category</option>
            {MAIN_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        {editForm.category === 'Other' && (
            <CustomCategoryInput
              selectedCategories={editForm.category === 'Other' ? [editForm.category] : []}
              onCategoryChange={(categories) => {
                const customCategories = categories.filter(cat => cat.startsWith('custom:'));
                if (customCategories.length > 0) {
                  const customCategoryName = customCategories[customCategories.length - 1].replace('custom:', '');
                  setEditForm(prev => ({ ...prev, category: customCategoryName }));
                }
              }}
              maxWords={3}
              label="Enter your custom category (one word at a time, max 3 words)"
            />
          )}
        </div>
        <div className={styles.editField}>
          <label>
            Tags
            <span className={styles.optional}>(Up to 10 tags)</span>
          </label>

          <div className={styles.tagsContainer}>
            {editForm.tags.map(tag => (
              <span key={tag} className={styles.tag}>
                {tag}
                <button 
                  type="button" 
                  onClick={() => handleTagRemove(tag)}
                  className={styles.tagRemove}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {editForm.tags.length < 10 && (
            <div className={styles.tagInputContainer} ref={dropdownRef}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onFocus={() => setShowTagDropdown(true)}
                placeholder="Type to search tags..."
                className={styles.editInput}
              />

              {showTagDropdown && filteredTags.length > 0 && (
                <div className={styles.tagDropdown}>
                  {filteredTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagAdd(tag)}
                      className={styles.tagOption}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tag Categories */}
          <div className={styles.tagCategories}>
            <small className={styles.hint}>Browse by category:</small>
            {Object.entries(TAGS).map(([categoryName, tags]) => (
              <details key={categoryName} className={styles.tagCategory}>
                <summary className={styles.tagCategoryTitle}>{categoryName}</summary>
                <div className={styles.tagCategoryTags}>
                  {tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagAdd(tag)}
                      disabled={editForm.tags.includes(tag) || editForm.tags.length >= 10}
                      className={`${styles.tagCategoryTag} ${editForm.tags.includes(tag) ? styles.tagSelected : ''}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.editActions}>
        <button 
          className={styles.saveButton}
          onClick={handleSave}
        >
          Save Changes
        </button>
        <button 
          className={styles.cancelButton}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BlogEditForm;