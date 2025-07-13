
import React, { useState, useEffect } from 'react';
import styles from '../styles/BlogSubmissionForm.module.css';

interface BlogSubmissionFormProps {
  onSubmit?: (formData: FormData) => void;
}

interface FormData {
  image: File | null;
  title: string;
  author: string;
  description: string;
  tags: string[];
  postUrl: string;
}

const AVAILABLE_TAGS = [
  'Technology', 'Design', 'Business', 'Lifestyle', 'Travel', 
  'Food', 'Health', 'Education', 'Entertainment', 'Sports',
  'Politics', 'Science', 'Art', 'Music', 'Fashion'
];

const BlogSubmissionForm: React.FC<BlogSubmissionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    image: null,
    title: '',
    author: 'Your Name', // This would be prefilled from auth
    description: '',
    tags: [],
    postUrl: ''
  });

  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate progress based on filled fields
  useEffect(() => {
    const requiredFields = ['title', 'description', 'postUrl'];
    const filledFields = requiredFields.filter(field => {
      if (field === 'postUrl') return validateUrl(formData.postUrl);
      return formData[field as keyof FormData] !== '';
    });
    
    const imageProgress = formData.image ? 1 : 0;
    const tagsProgress = formData.tags.length > 0 ? 1 : 0;
    
    const totalProgress = (filledFields.length + imageProgress + tagsProgress) / 5 * 100;
    setProgress(totalProgress);
  }, [formData]);

  // Auto-save to localStorage every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('blogSubmissionDraft', JSON.stringify({
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        postUrl: formData.postUrl
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [formData]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('blogSubmissionDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setFormData(prev => ({ ...prev, ...draft }));
    }
  }, []);

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

  const handleTagAdd = (tag: string) => {
    if (formData.tags.length < 5 && !formData.tags.includes(tag)) {
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
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 120) newErrors.title = 'Title must be 120 characters or less';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
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
    return formData.title.trim() && 
           formData.description.trim() && 
           validateUrl(formData.postUrl) &&
           Object.keys(errors).every(key => !errors[key]);
  };

  const filteredTags = AVAILABLE_TAGS.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !formData.tags.includes(tag)
  );

  return (
    <div className={styles.formContainer}>
      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className={styles.progressText}>{Math.round(progress)}% Complete</span>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Step 1: Blog Image */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Blog Image
            <span className={styles.optional}>(Optional)</span>
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

        {/* Step 3: Author (Prefilled) */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Blogger / Author</label>
          <input
            type="text"
            value={formData.author}
            readOnly
            className={`${styles.textInput} ${styles.readonly}`}
          />
        </div>

        {/* Step 4: Description */}
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

        {/* Step 5: Tags */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Category / Tags
            <span className={styles.optional}>(1-5 tags)</span>
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

          {formData.tags.length < 5 && (
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
                  {filteredTags.slice(0, 5).map(tag => (
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

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={!isFormValid()}
          className={`${styles.submitButton} ${!isFormValid() ? styles.disabled : ''}`}
        >
          Publish to BlogRolly
        </button>
      </form>
    </div>
  );
};

export default BlogSubmissionForm;
