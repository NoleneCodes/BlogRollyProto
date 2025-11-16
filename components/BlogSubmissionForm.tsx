import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useError } from './ErrorProvider';
import Link from 'next/link';

import { 
  MAIN_CATEGORIES, 
  TAGS 
} from '../lib/categories-tags';
import { CustomCategoryInput } from './CustomCategoryInput';
import styles from '../styles/BlogSubmissionForm.module.css';
import SubmissionGuidelinesPopup from './SubmissionGuidelinesPopup';
import DomainVerificationModal from './DomainVerificationModal';
import { supabase } from '../lib/supabase';

// Using your existing types
interface BlogSubmissionFormProps {
  onSubmit?: (formData: FormData) => void;
  onDraftSaved?: () => void;
  bloggerId?: string;
  isBlogger?: boolean;
  isEdit?: boolean;
  existingBlog?: any;
}

interface FormData {
  title: string;
  description: string;
  url: string;
  imageDescription: string;
  category: string;
  tags: string[];
  hasAdultContent: boolean;
  featuredBlog?: boolean;
  readingTime?: number;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  url?: string;
  imageDescription?: string;
  category?: string;
  tags?: string;
  general?: string;
}

// Enhanced validation functions
const validateUrl = (url: string): boolean => {
  const urlPattern = /^https:\/\/[^\/]+\/.+/;
  return urlPattern.test(url);
};

const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

const suggestTagsFromContent = (title: string, description: string): string[] => {
  const content = `${title} ${description}`.toLowerCase();
  const suggestions: string[] = [];
  
  // Enhanced tag suggestion logic
  const tagMappings: { [key: string]: string[] } = {
    'tech': ['technology', 'coding', 'software', 'programming', 'digital'],
    'health': ['fitness', 'wellness', 'nutrition', 'mental health', 'exercise'],
    'lifestyle': ['travel', 'food', 'fashion', 'home', 'family'],
    'business': ['startup', 'entrepreneur', 'marketing', 'finance', 'productivity'],
    'design': ['ui', 'ux', 'creative', 'art', 'visual'],
    'education': ['learning', 'tutorial', 'guide', 'tips', 'how-to']
  };

  Object.entries(tagMappings).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => content.includes(keyword))) {
      suggestions.push(tag);
    }
  });

  return suggestions.slice(0, 5); // Limit to 5 suggestions
};

export default function BlogSubmissionForm({ 
  onSubmit, 
  onDraftSaved, 
  bloggerId, 
  isBlogger = false,
  isEdit = false,
  existingBlog = null 
}: BlogSubmissionFormProps) {
  const { setError, clearError } = useError();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: existingBlog?.title || '',
    description: existingBlog?.description || '',
    url: existingBlog?.url || '',
    imageDescription: existingBlog?.image_description || '',
    category: existingBlog?.category || '',
    tags: existingBlog?.tags || [],
    hasAdultContent: existingBlog?.has_adult_content || false,
    featuredBlog: existingBlog?.featured || false,
    readingTime: existingBlog?.reading_time || 0
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuidelinesPopup, setShowGuidelinesPopup] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null);
  const [checkingUrl, setCheckingUrl] = useState(false);

  // Enhanced validation
  const validateField = useCallback((field: keyof FormData, value: any): string | undefined => {
    switch (field) {
      case 'title':
        if (!value || value.length < 10) return 'Title must be at least 10 characters';
        if (value.length > 100) return 'Title must be less than 100 characters';
        break;
      case 'description':
        if (!value || value.length < 50) return 'Description must be at least 50 characters';
        if (value.length > 2000) return 'Description must be less than 2000 characters';
        break;
      case 'url':
        if (!value) return 'URL is required';
        if (!validateUrl(value)) return 'URL must start with https:// and include a path';
        break;
      case 'imageDescription':
        if (!value) return 'Image description is required for accessibility';
        if (value.length < 10) return 'Image description must be at least 10 characters';
        break;
      case 'category':
        if (!value) return 'Category is required';
        break;
      case 'tags':
        if (!Array.isArray(value) || value.length === 0) return 'At least one tag is required';
        if (value.length > 10) return 'Maximum 10 tags allowed';
        break;
    }
    return undefined;
  }, []);

  // URL availability check
  const checkUrlAvailability = useCallback(async (url: string) => {
    if (!url || !validateUrl(url)) {
      setUrlAvailable(null);
      return;
    }

    setCheckingUrl(true);
    try {
      const response = await fetch(`/api/check-url-availability?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      setUrlAvailable(data.available);
    } catch (error) {
      console.error('Error checking URL availability:', error);
      setUrlAvailable(null);
    } finally {
      setCheckingUrl(false);
    }
  }, []);

  // Auto-suggest tags based on content
  useEffect(() => {
    if (formData.title && formData.description) {
      const suggestions = suggestTagsFromContent(formData.title, formData.description);
      setSuggestedTags(suggestions.filter(tag => !formData.tags.includes(tag)));
    }
  }, [formData.title, formData.description, formData.tags]);

  // URL availability check with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.url && !isEdit) {
        checkUrlAvailability(formData.url);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.url, isEdit, checkUrlAvailability]);

  // Calculate progress
  useEffect(() => {
    const fields = ['title', 'description', 'url', 'imageDescription', 'category'];
    const completed = fields.filter(field => formData[field as keyof FormData]).length;
    const tagProgress = formData.tags.length > 0 ? 1 : 0;
    setProgress(Math.round(((completed + tagProgress) / (fields.length + 1)) * 100));
  }, [formData]);

  // Calculate reading time
  useEffect(() => {
    if (formData.description) {
      const readingTime = calculateReadingTime(formData.description);
      setFormData(prev => ({ ...prev, readingTime }));
    }
  }, [formData.description]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTagAdd = (tag: string) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 10) {
      handleInputChange('tags', [...formData.tags, tag]);
      setSuggestedTags(prev => prev.filter(t => t !== tag));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveDraft = async () => {
    try {
      // Save draft logic here
      const draftData = { ...formData, status: 'draft' };
      
      // You can implement draft saving to your existing API
      const response = await fetch('/api/blog-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData)
      });

      if (response.ok) {
        onDraftSaved?.();
        setError('Draft saved successfully!');
      }
    } catch (error) {
      setError('Failed to save draft');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(formData).forEach(key => {
      const field = key as keyof FormData;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (!urlAvailable && !isEdit) {
      newErrors.url = 'This URL is already in use';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      if (onSubmit) {
        onSubmit(formData);
      } else {
        // Default submission logic
        const response = await fetch('/api/blogs', {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }

        setError('Blog submitted successfully!');
        
        if (!isEdit) {
          // Reset form for new submissions
          setFormData({
            title: '',
            description: '',
            url: '',
            imageDescription: '',
            category: '',
            tags: [],
            hasAdultContent: false,
            featuredBlog: false,
            readingTime: 0
          });
        }
      }
    } catch (error) {
      setError('Failed to submit blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.header}>
          <h2>{isEdit ? 'Edit Blog Post' : 'Submit Your Blog'}</h2>
          
          {/* Progress Bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={styles.progressText}>
              {progress}% complete
            </div>
          </div>
        </div>

        {/* Title Field */}
        <div className={styles.formGroup}>
          <label htmlFor="title">Blog Title *</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter a compelling title for your blog post"
            className={errors.title ? styles.inputError : ''}
            maxLength={100}
          />
          {errors.title && (
            <div className={styles.validationMessage}>
              ⚠️ {errors.title}
            </div>
          )}
          <div className={styles.charCount}>
            {formData.title.length}/100 characters
          </div>
        </div>

        {/* Description Field */}
        <div className={styles.formGroup}>
          <label htmlFor="description">
            Description * 
            {formData.readingTime > 0 && (
              <span className={styles.readingTime}>
                ~{formData.readingTime} min read
              </span>
            )}
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Provide a detailed description of your blog content..."
            className={errors.description ? styles.inputError : ''}
            rows={6}
            maxLength={2000}
          />
          {errors.description && (
            <div className={styles.validationMessage}>
              ⚠️ {errors.description}
            </div>
          )}
          <div className={styles.charCount}>
            {formData.description.length}/2000 characters
          </div>
        </div>

        {/* URL Field */}
        <div className={styles.formGroup}>
          <label htmlFor="url">Blog URL *</label>
          <input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            placeholder="https://yourblog.com/your-post"
            className={errors.url ? styles.inputError : ''}
            disabled={isEdit} // Don't allow URL changes in edit mode
          />
          {checkingUrl && (
            <div className={styles.validationMessage}>
              🔍 Checking URL availability...
            </div>
          )}
          {urlAvailable === true && (
            <div className={`${styles.validationMessage} ${styles.success}`}>
              ✅ URL is available
            </div>
          )}
          {urlAvailable === false && (
            <div className={styles.validationMessage}>
              ❌ This URL is already in use
            </div>
          )}
          {errors.url && (
            <div className={styles.validationMessage}>
              ⚠️ {errors.url}
            </div>
          )}
        </div>

        {/* Category Field - FIXED */}
        <div className={styles.formGroup}>
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={errors.category ? styles.inputError : ''}
          >
            <option value="">Select a category</option>
            {MAIN_CATEGORIES && Array.isArray(MAIN_CATEGORIES) ? (
              MAIN_CATEGORIES.map((cat, index) => {
                // Handle both object format {id, name, description} and string format
                if (typeof cat === 'object' && cat !== null) {
                  return (
                    <option key={cat.id || index} value={cat.name}>
                      {cat.name}{cat.description ? ` - ${cat.description}` : ''}
                    </option>
                  );
                } else {
                  // Handle string format
                  return (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  );
                }
              })
            ) : (
              // Fallback categories if MAIN_CATEGORIES is not available
              <>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Business & Finance">Business & Finance</option>
                <option value="Tech & Digital Life">Tech & Digital Life</option>
                <option value="Creative & Arts">Creative & Arts</option>
                <option value="Education & Learning">Education & Learning</option>
                <option value="Travel & Adventure">Travel & Adventure</option>
                <option value="Food & Cooking">Food & Cooking</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </>
            )}
          </select>
          {errors.category && (
            <div className={styles.validationMessage}>
              ⚠️ {errors.category}
            </div>
          )}
        </div>

        {/* Suggested Tags */}
        {suggestedTags.length > 0 && (
          <div className={styles.suggestedTags}>
            <label>Suggested Tags (based on your content):</label>
            <div className={styles.tagSuggestions}>
              {suggestedTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={styles.tagSuggestion}
                  onClick={() => handleTagAdd(tag)}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tags Field */}
        <div className={styles.formGroup}>
          <label>Tags * (Select from common tags or type custom ones)</label>
          
          {/* Common Tags */}
          <div className={styles.tagContainer}>
            {TAGS && Array.isArray(TAGS) ? (
              TAGS.map((tag, index) => (
                <button
                  key={typeof tag === 'string' ? tag : index}
                  type="button"
                  className={`${styles.tagButton} ${
                    formData.tags.includes(typeof tag === 'string' ? tag : tag.toString()) ? styles.tagSelected : ''
                  }`}
                  onClick={() => {
                    const tagValue = typeof tag === 'string' ? tag : tag.toString();
                    return formData.tags.includes(tagValue) 
                      ? handleTagRemove(tagValue)
                      : handleTagAdd(tagValue);
                  }}
                >
                  {typeof tag === 'string' ? tag : tag.toString()}
                </button>
              ))
            ) : (
              // Fallback tags
              ['Tech', 'Lifestyle', 'Health', 'Business', 'Travel', 'Food', 'Education'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`${styles.tagButton} ${
                    formData.tags.includes(tag) ? styles.tagSelected : ''
                  }`}
                  onClick={() => 
                    formData.tags.includes(tag) 
                      ? handleTagRemove(tag)
                      : handleTagAdd(tag)
                  }
                >
                  {tag}
                </button>
              ))
            )}
          </div>

          {/* Selected Tags Display */}
          {formData.tags.length > 0 && (
            <div className={styles.selectedTags}>
              <strong>Selected Tags ({formData.tags.length}/10):</strong>
              <div className={styles.tagList}>
                {formData.tags.map(tag => (
                  <span key={tag} className={styles.selectedTag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className={styles.removeTag}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {errors.tags && (
            <div className={styles.validationMessage}>
              ⚠️ {errors.tags}
            </div>
          )}
        </div>

        {/* Image Description */}
        <div className={styles.formGroup}>
          <label htmlFor="imageDescription">Image Description *</label>
          <input
            id="imageDescription"
            type="text"
            value={formData.imageDescription}
            onChange={(e) => handleInputChange('imageDescription', e.target.value)}
            placeholder="Describe the main image for accessibility"
            className={errors.imageDescription ? styles.inputError : ''}
          />
          {errors.imageDescription && (
            <div className={styles.validationMessage}>
              ⚠️ {errors.imageDescription}
            </div>
          )}
          <div className={styles.fieldHint}>
            This helps visually impaired readers understand your content
          </div>
        </div>

        {/* Featured Blog Option (for admins/premium users) */}
        {(isBlogger || formData.featuredBlog) && (
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.featuredBlog}
                onChange={(e) => handleInputChange('featuredBlog', e.target.checked)}
              />
              Featured Blog Post
              <div className={styles.fieldHint}>
                Featured posts get special highlighting and better visibility
              </div>
            </label>
          </div>
        )}

        {/* Adult Content Checkbox */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.hasAdultContent}
              onChange={(e) => handleInputChange('hasAdultContent', e.target.checked)}
            />
            This blog contains adult content (18+)
          </label>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            type="button"
            onClick={handleSaveDraft}
            className={styles.draftButton}
            disabled={isSubmitting}
          >
            Save Draft
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || progress < 100}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Submitting...' : isEdit ? 'Update Blog' : 'Submit Blog'}
          </button>
        </div>

        {/* Guidelines Link */}
        <div className={styles.guidelines}>
          <button
            type="button"
            onClick={() => setShowGuidelinesPopup(true)}
            className={styles.guidelinesLink}
          >
            📋 View Submission Guidelines
          </button>
        </div>
      </form>

      {/* Modals */}
      {showGuidelinesPopup && (
        <SubmissionGuidelinesPopup 
          onClose={() => setShowGuidelinesPopup(false)} 
        />
      )}
      
      {showDomainModal && (
        <DomainVerificationModal 
          onClose={() => setShowDomainModal(false)}
          blogUrl={formData.url}
        />
      )}
    </div>
  );
}