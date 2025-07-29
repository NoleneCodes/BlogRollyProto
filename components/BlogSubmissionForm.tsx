import React, { useState, useEffect } from 'react';
import styles from '../styles/BlogSubmissionForm.module.css';
import SubmissionGuidelinesPopup from './SubmissionGuidelinesPopup';

interface BlogSubmissionFormProps {
  onSubmit?: (formData: FormData) => void;
  displayName?: string;
  bloggerId?: string;
  isBlogger?: boolean;
  hideGuidelines?: boolean;
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

const MAIN_CATEGORIES = [
  'Lifestyle',
  'Health & Wellness',
  'Culture & Society',
  'Tech & Digital Life',
  'Creative Expression',
  'Work & Money',
  'Education & Learning',
  'Relationships & Emotions',
  'Art & Media',
  'Home & Garden',
  'Food & Drink',
  'Travel & Places',
  'Identity & Intersectionality',
  'Spirituality & Inner Work',
  'Opinion & Commentary',
  'Other'
];

const TAGS = {
  'Themes & Topics': [
    'Mental Health', 'Self-Care', 'Productivity', 'Feminism', 'Queer Experience',
    'Black Joy', 'Ancestral Healing', 'Decolonization', 'Digital Minimalism',
    'Burnout Recovery', 'Entrepreneurship', 'Diaspora Life', 'Spiritual Practices',
    'Financial Literacy', 'Personal Growth', 'Tech for Good', 'Neurodivergence',
    'Motherhood', 'Body Image', 'Healing Justice', 'Climate & Ecology',
    'Herbalism', 'Relationships', 'Grief', 'Joy', 'Education Reform',
    'Activism', 'Sensuality', 'Conscious Living', 'Food Sovereignty',
    'Solo Travel', 'Ethical Consumption', 'Language & Identity', 'Book Reviews',
    'Film Criticism', 'Indie Publishing', 'Developer Life', 'Design Thinking',
    'Open Source', 'Minimalist Living', 'Mindful Parenting', 'Student Life',
    'Street Culture', 'AfroFuturism', 'Slow Fashion', 'Unschooling',
    'Sex Positivity', 'AI Reflections', 'Coding in Public', 'Personal Finance',
    'Freelance Tips', 'Sustainable Living', 'Home Projects', 'Permaculture',
    'Gardening', 'Beauty & Skincare', 'Journalism', 'Local Stories',
    'Tech Trends', 'Intimacy', 'Zine Culture', 'Religious Identity',
    'Addiction & Recovery', 'Chronic Illness', 'Other'
  ],
  'Structure / Format': [
    'Listicle', 'Longform Essay', 'Personal Diary', 'Photo Essay', 'Letter',
    'Manifesto', 'Interview', 'Tutorial', 'Poem', 'Short Story', 'Q&A',
    'Open Thread', 'Roundup', 'Resource Guide', 'Commentary', 'Thought Piece',
    'Audio Journal', 'Microblog', 'Illustrated Piece', 'Visual Essay',
    'Thread Dump', 'Journal Entry', 'Other'
  ],
  'Vibe / Tone': [
    'Vulnerable', 'Funny', 'Educational', 'Chill', 'Angry', 'Empowering',
    'Comforting', 'Provocative', 'Uplifting', 'Raw & Unfiltered', 'Philosophical',
    'Meditative', 'Sarcastic', 'Loving', 'Analytical', 'Dreamy', 'Manifesting',
    'Deep Dive', 'Reflective', 'Activist', 'Spiritual', 'Poetic', 'Other'
  ],
  'Intended Audience': [
    'For Creatives', 'For Founders', 'For Parents', 'For Coders', 'For Students',
    'For Readers', 'For Black Women', 'For the Diaspora', 'For Queer Folks',
    'For Neurodivergents', 'For Healers', 'For Side Hustlers', 'For Burnt-Out People',
    'For the Culture', 'For Survivors', 'For Book Lovers', 'For Poets',
    'For Makers', 'For Beginners', 'For the Overwhelmed', 'Other'
  ],
  'Content Filters': [
    'Evergreen', 'Trending', 'Monthly Highlight', 'Seasonal', 'Archive Gem',
    'Hot Take', 'Experimental', 'Series Part', 'Collaboration', 'Anonymous',
    'Sponsored', 'Debut Blog', 'Staff Pick', 'Reader Pick', 'Other'
  ]
};

const BlogSubmissionForm: React.FC<BlogSubmissionFormProps> = ({ 
  onSubmit, 
  displayName, 
  bloggerId, 
  isBlogger = false,
  hideGuidelines = false
}) => {
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

  // Check if user is authenticated as a blogger
  if (!isBlogger) {
    return (
      <div className={styles.formContainer}>
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Blogger Account Required
          </h3>
          <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>
            Only registered bloggers can submit blog posts. Please sign up as a blogger first.
          </p>
          <a 
            href="/auth?tab=blogger"
            style={{
              background: '#c42142',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Sign Up as Blogger
          </a>
        </div>
      </div>
    );
  }

  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSubmissionGuidelinesPopup, setShowSubmissionGuidelinesPopup] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Calculate progress based on filled fields
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

  // Auto-save to localStorage every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.title || formData.description || formData.postUrl) {
        saveDraft();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [formData]);

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
    
    // Clear the "saved" indicator after 3 seconds
    setTimeout(() => {
      setDraftSaved(false);
    }, 3000);
  };

  // Load draft on component mount
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
  };

  const handleTagAdd = (tag: string) => {
    if (formData.tags.length < 10 && !formData.tags.includes(tag)) {
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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, postUrl: url }));

    if (url && !validateUrl(url)) {
      setErrors(prev => ({ 
        ...prev, 
        postUrl: 'URL must start with https:// and contain a path (e.g., /blog/my-post)' 
      }));
    } else {
      setErrors(prev => ({ ...prev, postUrl: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit?.(formData);
      // Clear draft after successful submission
      localStorage.removeItem('blogSubmissionDraft');
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
          </select>
          {errors.category && <span className={styles.error}>{errors.category}</span>}
        </div>

        {/* Step 5: Tags */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Tags
            <span className={styles.optional}>(Up to 10 tags)</span>
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

          {formData.tags.length < 10 && (
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
                      disabled={formData.tags.includes(tag) || formData.tags.length >= 10}
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
          <small className={styles.hint}>
            Adult content will be filtered out for users under 18
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

      {/* Submission Guidelines Popup */}
      <SubmissionGuidelinesPopup
        isOpen={showSubmissionGuidelinesPopup}
        onClose={() => setShowSubmissionGuidelinesPopup(false)}
      />
    </div>
  );
};

export default BlogSubmissionForm;