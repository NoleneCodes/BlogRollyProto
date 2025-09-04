import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MAIN_CATEGORIES, TAGS } from '../lib/categories-tags';
import { CustomCategoryInput } from './CustomCategoryInput';
import styles from '../styles/BlogSubmissionForm.module.css';
import SubmissionGuidelinesPopup from './SubmissionGuidelinesPopup';
import DomainVerificationModal from './DomainVerificationModal';

interface BlogSubmissionFormProps {
  onSubmit?: (formData: FormData) => void;
  onDraftSaved?: () => void;
  displayName?: string;
  bloggerId?: string;
  isBlogger?: boolean;
  hideGuidelines?: boolean;
  isSignupMode?: boolean;
}

interface FormData {
  image: File | null;
  imageDescription: string;
  title: string;
  author: string; // Will be set to blogger's display name
  bloggerId: string;
  bloggerDisplayName: string;
  description: string;
  category: string;
  tags: string[];
  postUrl: string;
  hasAdultContent: boolean;
}

const BlogSubmissionForm: React.FC<BlogSubmissionFormProps> = ({ 
  onSubmit, 
  onDraftSaved,
  displayName, 
  bloggerId, 
  isBlogger = false,
  hideGuidelines = false,
  isSignupMode = false
}) => {
  // All hooks at top level
  const [formData, setFormData] = useState<FormData>({
    image: null,
    imageDescription: '',
    title: '',
    author: displayName || '', // Blogger's display name
    bloggerId: bloggerId || '',
    bloggerDisplayName: displayName || '',
    description: '',
    category: '',
    tags: [],
    postUrl: '',
    hasAdultContent: false
  });
  const [domainVerificationStatus, setDomainVerificationStatus] = useState<'loading' | 'verified' | 'pending' | 'failed' | null>(null);
  const [showDomainVerification, setShowDomainVerification] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSubmissionGuidelinesPopup, setShowSubmissionGuidelinesPopup] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    if (isBlogger && !isSignupMode) {
      checkDomainVerification();
    }
  }, [isBlogger, isSignupMode]);

  const checkDomainVerification = async () => {
    try {
      const response = await fetch('/api/auth-check');
      const data = await response.json();
      if (data.bloggerProfile) {
        setDomainVerificationStatus(data.bloggerProfile.domain_verification_status || 'pending');
      }
    } catch (error) {
      console.error('Failed to check domain verification:', error);
      setDomainVerificationStatus('pending');
    }
  };

  useEffect(() => {
    const requiredFields = ['title', 'description', 'postUrl', 'category'];
    const filledFields = requiredFields.filter(field => {
      if (field === 'postUrl') return validateUrl(formData.postUrl);
      return formData[field as keyof FormData] !== '';
    });
    const imageProgress = formData.image ? 1 : 0;
    const imageDescriptionProgress = formData.image && formData.imageDescription.trim() ? 1 : 0;
    const tagsProgress = formData.tags.length > 0 ? 1 : 0;
    const totalProgress = (filledFields.length + imageProgress + imageDescriptionProgress + tagsProgress) / 7 * 100;
    setProgress(totalProgress);
  }, [formData]);

  useEffect(() => {
    const savedDraft = localStorage.getItem('blogSubmissionDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      const { savedAt, ...draftFormData } = draft;
      setFormData(prev => ({ ...prev, ...draftFormData }));
      if (savedAt) {
        setLastSavedAt(new Date(savedAt).toLocaleString());
      }
    }
  }, []);

  // No auto-save - only save when user clicks Save Draft button

  const saveDraft = () => {
    const draftData = {
      title: formData.title,
      imageDescription: formData.imageDescription,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      postUrl: formData.postUrl,
      hasAdultContent: formData.hasAdultContent,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('blogSubmissionDraft', JSON.stringify(draftData));
    setDraftSaved(true);
    setLastSavedAt(new Date().toLocaleTimeString());

    // Notify parent component that draft was saved
    onDraftSaved?.();

    // Clear the "saved" indicator after 3 seconds
    setTimeout(() => {
      setDraftSaved(false);
    }, 3000);
  };

  const clearDraft = () => {
    localStorage.removeItem('blogSubmissionDraft');
    setFormData({
      image: null,
      imageDescription: '',
      title: '',
      author: displayName || '',
      bloggerId: bloggerId || '',
      bloggerDisplayName: displayName || '',
      description: '',
      category: '',
      tags: [],
      postUrl: '',
      hasAdultContent: false
    });
    setLastSavedAt(null);
    setDraftSaved(false);
  };

  const validateUrl = (url: string): boolean => {
    const urlRegex = /^https:\/\/[^\/]+\/.+/;
    return urlRegex.test(url);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be less than 2MB' }));
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Only JPG, PNG, and WebP files are allowed' }));
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setErrors(prev => ({ ...prev, image: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      category
    }));

    setShowCustomCategory(category === 'Other');
  };

  const handleTagAdd = (tag: string) => {
    if (formData.tags.length < 4 && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, postUrl: url }));

    if (!url) {
      setErrors(prev => ({ ...prev, postUrl: '' }));
      return;
    }

    if (!validateUrl(url)) {
      setErrors(prev => ({ 
        ...prev, 
        postUrl: 'URL must start with https:// and contain a path (e.g., /blog/my-post)' 
      }));
      return;
    }

    // Validate domain matches blogger's verified domain
    try {
      const response = await fetch('/api/auth-check');
      const data = await response.json();
      
      if (data.bloggerProfile?.blog_url) {
        const { DomainVerificationService } = await import('../lib/domainVerification');
        const domainValidation = DomainVerificationService.validatePostUrlMatchesBlogDomain(
          url, 
          data.bloggerProfile.blog_url
        );
        
        if (!domainValidation.isValid) {
          setErrors(prev => ({ 
            ...prev, 
            postUrl: domainValidation.error || 'Blog post must be from your verified domain' 
          }));
          return;
        }
      }
      
      setErrors(prev => ({ ...prev, postUrl: '' }));
    } catch (error) {
      console.error('Domain validation error:', error);
      setErrors(prev => ({ 
        ...prev, 
        postUrl: 'Unable to validate domain. Please try again.' 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};

    if (!formData.image) newErrors.image = 'Blog image is required';
    if (formData.image && !formData.imageDescription.trim()) newErrors.imageDescription = 'Image description is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 120) newErrors.title = 'Title must be 120 characters or less';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.postUrl.trim()) newErrors.postUrl = 'Post URL is required';
    if (!validateUrl(formData.postUrl)) newErrors.postUrl = 'Invalid URL format';

    // Additional validation for adult content
    if (formData.hasAdultContent) {
      try {
        const authResponse = await fetch('/api/auth-check');
        const authData = await authResponse.json();
        
        if (!authData.userProfile?.age_verified) {
          newErrors.hasAdultContent = 'Age verification required to submit adult content. Please verify your age in profile settings.';
        }
      } catch (error) {
        newErrors.hasAdultContent = 'Unable to verify age status. Please try again.';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Upload image if it's a file
        let imageUrl = '';
        let imageType = 'url';
        let imageFilePath = '';

        if (formData.image) {
          const imageFormData = new FormData();
          imageFormData.append('image', formData.image);

          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: imageFormData
          });

          const uploadData = await uploadResponse.json();

          if (!uploadResponse.ok) {
            setErrors(prev => ({ 
              ...prev, 
              image: uploadData.error || 'Failed to upload image' 
            }));
            return;
          }

          imageUrl = uploadData.imageUrl;
          imageType = 'upload';
          imageFilePath = uploadData.filePath;
        }

        // Final server-side validation before submission
        const authResponse = await fetch('/api/auth-check');
        const authData = await authResponse.json();
        
        if (authData.session?.access_token) {
          const validationResponse = await fetch('/api/validate-blog-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authData.session.access_token}`
            },
            body: JSON.stringify({ postUrl: formData.postUrl })
          });

          const validationData = await validationResponse.json();

          if (!validationData.valid) {
            setErrors(prev => ({ 
              ...prev, 
              postUrl: validationData.error || 'Blog post URL validation failed' 
            }));
            return;
          }
        }

        // Add image data to form submission
        const submissionData = {
          ...formData,
          imageUrl,
          imageType,
          imageFilePath
        };

        onSubmit?.(submissionData);
        // Clear draft after successful submission
        localStorage.removeItem('blogSubmissionDraft');
      } catch (error) {
        console.error('Submission error:', error);
        setErrors(prev => ({ 
          ...prev, 
          image: 'Failed to process image upload. Please try again.' 
        }));
      }
    }
  };

  const isFormValid = () => {
    return formData.image &&
           formData.imageDescription.trim() &&
           formData.title.trim() && 
           formData.description.trim() && 
           formData.category &&
           validateUrl(formData.postUrl) &&
           Object.keys(errors).every(key => !errors[key]);
  };

  const getAllTags = () => {
    return Object.values(TAGS).flat();
  };

  const filteredTags = getAllTags().filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !formData.tags.includes(tag)
  );

  return (
    <div className={styles.formContainer}>
      {/* Blogger Account Required */}
      {!isBlogger && !isSignupMode && (
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
          <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Blogger Account Required
          </h3>
          <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>
            Only registered bloggers can submit blog posts. Please sign up as a blogger first.
            <Link href="/auth?tab=blogger" passHref legacyBehavior>
              <a style={{ background: '#c42142', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }}>
                Sign Up as Blogger
              </a>
            </Link>
          </p>
        </div>
      )}
      {/* Domain Verification Required */}
      {isBlogger && !isSignupMode && domainVerificationStatus !== 'verified' && (
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#fef3cd', borderRadius: '8px', border: '1px solid #fbbf24' }}>
          <h3 style={{ color: '#d97706', marginBottom: '1rem' }}>Domain Verification Required</h3>
          <p style={{ color: '#92400e', marginBottom: '1.5rem' }}>
            You must verify ownership of your blog domain before you can submit content for approval. 
            This ensures that only legitimate blog owners can submit posts to BlogRolly.
          </p>
          <button
            onClick={() => setShowDomainVerification(true)}
            style={{ background: '#c42142', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
          >
            Verify Your Domain
          </button>
          {domainVerificationStatus === 'failed' && (
            <p style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.875rem' }}>
              Previous verification attempt failed. Please try again.
            </p>
          )}
        </div>
      )}

      {/* Only render the form if blogger is authenticated and domain is verified or in signup mode */}
      {(isBlogger && (isSignupMode || domainVerificationStatus === 'verified')) && (
        <React.Fragment>
          {/* Submission Guidelines Section */}
          {!hideGuidelines && (
            <div className={styles.guidelinesSection}>
              <p>
                See{' '}
                <button 
                  type="button"
                  onClick={() => setShowSubmissionGuidelinesPopup(true)}
                  className={styles.guidelinesLink}
                >
                  submission guidelines
                </button>
              </p>
            </div>
          )}

          {/* Progress Bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className={styles.progressInfo}>
              <span className={styles.progressText}>{Math.round(progress)}% Complete</span>
              {lastSavedAt && (
                <span className={styles.draftStatus}>
                  Draft saved at {lastSavedAt}
                </span>
              )}
            </div>
          </div>

          {/* Draft Management */}
          <div className={styles.draftManagement}>
            <button 
              type="button"
              onClick={saveDraft}
              className={`${styles.draftButton} ${draftSaved ? styles.draftSaved : ''}`}
              disabled={!formData.title && !formData.description && !formData.postUrl}
            >
              {draftSaved ? '✓ Draft Saved' : 'Save Draft'}
            </button>

            {(formData.title || formData.description || formData.postUrl || lastSavedAt) && (
              <button 
                type="button"
                onClick={clearDraft}
                className={styles.clearDraftButton}
              >
                Clear Draft
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Step 1: Blog Image */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Blog Image *
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              {errors.image && <span className={styles.error}>{errors.image}</span>}
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
              <small className={styles.hint}>Max size: 2MB. Formats: JPG, PNG, WebP</small>

              {formData.image && (
                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label className={styles.label}>
                    Image Description *
                  </label>
                  <input
                    type="text"
                    value={formData.imageDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageDescription: e.target.value }))}
                    maxLength={200}
                    className={styles.textInput}
                    placeholder="Describe what's in the image for screen readers and SEO"
                    required
                  />
                  {errors.imageDescription && <span className={styles.error}>{errors.imageDescription}</span>}
                  <small className={styles.hint}>{formData.imageDescription.length}/200 characters</small>
                </div>
              )}
            </div>

            {/* Step 2: Blog Title */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Blog Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={120}
                className={styles.textInput}
                placeholder="Enter your blog post title"
              />
              {errors.title && <span className={styles.error}>{errors.title}</span>}
              <small className={styles.hint}>{formData.title.length}/120 characters</small>
            </div>

            {/* Step 3: Description */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Description / Excerpt *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                maxLength={500}
                rows={4}
                className={styles.textarea}
                placeholder="1-2 sentences that tease the post content"
              />
              {errors.description && <span className={styles.error}>{errors.description}</span>}
              <small className={styles.hint}>{formData.description.length}/500 characters</small>
            </div>

            {/* Step 4: Main Category */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Main Category *
              </label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className={styles.selectInput}
              >
                <option value="">Select a main category</option>
                {MAIN_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                 <option value="Other">Other</option>
              </select>
              {errors.category && <span className={styles.error}>{errors.category}</span>}
            </div>

             {/* Custom Category Input */}
             {showCustomCategory && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                  Custom Category *
                  </label>
                  <CustomCategoryInput
                  onCategoryChange={(categories: string[]) => setFormData(prev => ({ ...prev, category: categories.join(', ') }))} selectedCategories={[]}              />
                </div>
            )}

            {/* Step 5: Tags */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Tags
                <span className={styles.optional}>(Up to 4 tags)</span>
              </label>

              <div className={styles.tagsContainer}>
                {formData.tags.map(tag => (
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

              {formData.tags.length < 4 && (
                <div className={styles.tagInputContainer}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onFocus={() => setShowTagDropdown(true)}
                    placeholder="Type to search tags..."
                    className={styles.textInput}
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
                          disabled={formData.tags.includes(tag) || formData.tags.length >= 4}
                          className={`${styles.tagCategoryTag} ${formData.tags.includes(tag) ? styles.tagSelected : ''}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Step 6: Post URL */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Blog Post URL *
              </label>
              <input
                type="url"
                value={formData.postUrl}
                onChange={handleUrlChange}
                className={styles.textInput}
                placeholder="https://yourblog.com/your-post-title"
              />
              {errors.postUrl && <span className={styles.error}>{errors.postUrl}</span>}
              <small className={styles.hint}>
                Must start with https:// and include a path (e.g., /blog/my-post)
              </small>
            </div>

            {/* Step 7: Adult Content Verification */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.hasAdultContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasAdultContent: e.target.checked }))}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  This content includes adult themes or material (18+ only)
                </span>
              </label>
              {errors.hasAdultContent && <span className={styles.error}>{errors.hasAdultContent}</span>}
              <small className={styles.hint}>
                Adult content requires age verification for both submission and viewing. Only age-verified users (18+) can submit and view this content.
              </small>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={!isFormValid()}
              className={`${styles.submitButton} ${!isFormValid() ? styles.disabled : ''}`}
            >
              Publish to BlogRolly
            </button>
          </form>
        </React.Fragment>
      )}

      {/* Submission Guidelines Popup */}
      <SubmissionGuidelinesPopup
        isOpen={showSubmissionGuidelinesPopup}
        onClose={() => setShowSubmissionGuidelinesPopup(false)}
      />

      {/* Domain Verification Modal */}
      {showDomainVerification && (
        <DomainVerificationModal
          isOpen={showDomainVerification}
          onClose={() => setShowDomainVerification(false)}
          blogUrl={formData.postUrl || 'https://example.com'}
          verificationToken="blogrolly-verify-placeholder"
          onVerificationComplete={() => {
            setDomainVerificationStatus('verified');
            setShowDomainVerification(false);
          }}
        />
      )}
    </div>
  );
};

export default BlogSubmissionForm;