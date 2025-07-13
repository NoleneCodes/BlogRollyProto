
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
  category: string;
  subcategory: string;
  thematicTags: string[];
  postUrl: string;
  hasAdultContent: boolean;
}

const MAIN_CATEGORIES = {
  'Lifestyle': [
    'Minimalism', 'Productivity', 'Mindfulness', 'Slow Living', 'Digital Nomad Life',
    'Homemaking', 'Personal Development', 'Life Lessons', 'Home Organization'
  ],
  'Health & Wellness': [
    'Holistic Health', 'Mental Health', 'Nutrition', 'Fitness', 'Herbalism',
    'Women\'s Health', 'Gut Health', 'Sexual Wellness', 'Self-Care'
  ],
  'Culture & Society': [
    'Pop Culture Commentary', 'Race & Identity', 'Diaspora Diaries', 'Subcultures',
    'Feminism', 'Queer Life', 'Religion & Spirituality', 'Black British Voices', 'Activism & Justice'
  ],
  'Tech & Digital Life': [
    'Coding Diaries', 'UX/UI Design', 'AI & Ethics', 'Indie Hacking', 'Developer Logs',
    'Web3/Crypto', 'Cybersecurity', 'Tech for Good'
  ],
  'Creative Expression': [
    'Personal Essays', 'Poetry & Prose', 'Journaling', 'Short Fiction', 'Zine Culture',
    'Visual Storytelling', 'Photo Essays', 'Spoken Word', 'Creative Writing Prompts'
  ],
  'Work & Money': [
    'Freelancing Life', 'Solopreneurship', 'Side Hustles', 'Investing & Finance',
    'Career Stories', 'Remote Work', 'Ethical Business', 'Productivity Hacks', 'Burnout Recovery'
  ],
  'Education & Learning': [
    'Study Hacks', 'Self-Directed Learning', 'Course Reviews', 'Reading Lists',
    'Unschooling/Homeschool', 'Learning in Public', 'Student Life'
  ],
  'Relationships & Emotions': [
    'Dating Diaries', 'Family Dynamics', 'Friendships', 'Breakups & Healing',
    'Therapy Talks', 'Inner Child Work', 'Parenthood'
  ],
  'Art & Media': [
    'Film/TV Reviews', 'Book Blogs', 'Music Discovery', 'Game Culture',
    'Manga/Anime', 'Theater', 'Visual Arts', 'Cultural Criticism'
  ],
  'Home & Garden': [
    'DIY Projects', 'Homesteading', 'Houseplants', 'Sustainable Living',
    'Tiny Homes', 'Permaculture', 'Interior Styling', 'Gardening Logs'
  ],
  'Food & Drink': [
    'Afro-Caribbean Recipes', 'Vegan Diaries', 'Foraging', 'Fermentation',
    'Ancestral Foods', 'Street Food Culture', 'Intuitive Eating', 'Food Justice'
  ],
  'Travel & Places': [
    'Hidden Gems', 'Black Travel Blogs', 'City Guides', 'Cultural Exchange',
    'Travel & Identity', 'Digital Nomad Stories', 'Backpacking', 'Diaspora Travel'
  ]
};

const THEMATIC_TAGS = [
  // Personal Vibe
  'Vulnerable', 'Funny', 'Raw & Unfiltered', 'Healing Journey', 'Melancholic', 
  'Playful', 'Ranty', 'Soft Life', 'Hood Intellectual', 'Feminine Energy', 'Masculine Energy',
  
  // Ethos & Lens
  'Intersectional', 'Decolonial', 'Afrofuturist', 'Indigenous Wisdom', 'Queer Lens',
  'Feminist Thought', 'Working-Class Voice', 'Neurodivergent',
  
  // Structure & Form
  'Listicle', 'Open Letter', 'Manifesto', 'Photo Journal', 'Diary Entry',
  'Interview', 'Tutorial', 'Long-Form Deep Dive', 'Microblog', 'Resource Roundup',
  
  // Timeliness
  'Trending', 'Evergreen', 'Monthly Feature', 'Year in Review', 'Seasonal',
  'Hot Take', 'Response Piece', 'Throwback',
  
  // Use Case Tags
  'Beginner Friendly', 'For Creatives', 'For Developers', 'For Parents', 'For Students',
  'For Burnout', 'For Healing', 'For Deep Thinkers', 'For Introverts', 'For the Culture',
  
  // Mood/Intent
  'Reflective', 'Educational', 'Provocative', 'Comforting', 'Motivational',
  'Meditative', 'Angry', 'Inspiring', 'Chill Read', 'Philosophical', 'Spiritual'
];

const BlogSubmissionForm: React.FC<BlogSubmissionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    image: null,
    title: '',
    author: 'Your Name', // This would be prefilled from auth
    description: '',
    category: '',
    subcategory: '',
    thematicTags: [],
    postUrl: '',
    hasAdultContent: false
  });

  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate progress based on filled fields
  useEffect(() => {
    const requiredFields = ['title', 'description', 'postUrl', 'category'];
    const filledFields = requiredFields.filter(field => {
      if (field === 'postUrl') return validateUrl(formData.postUrl);
      return formData[field as keyof FormData] !== '';
    });
    
    const imageProgress = formData.image ? 1 : 0;
    const subcategoryProgress = formData.subcategory ? 1 : 0;
    
    const totalProgress = (filledFields.length + imageProgress + subcategoryProgress) / 6 * 100;
    setProgress(totalProgress);
  }, [formData]);

  // Auto-save to localStorage every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('blogSubmissionDraft', JSON.stringify({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        thematicTags: formData.thematicTags,
        postUrl: formData.postUrl,
        hasAdultContent: formData.hasAdultContent
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      category,
      subcategory: '' // Reset subcategory when main category changes
    }));
  };

  const handleThematicTagAdd = (tag: string) => {
    if (formData.thematicTags.length < 5 && !formData.thematicTags.includes(tag)) {
      setFormData(prev => ({ ...prev, thematicTags: [...prev.thematicTags, tag] }));
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const handleThematicTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      thematicTags: prev.thematicTags.filter(tag => tag !== tagToRemove)
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
    return formData.title.trim() && 
           formData.description.trim() && 
           formData.category &&
           validateUrl(formData.postUrl) &&
           Object.keys(errors).every(key => !errors[key]);
  };

  const filteredThematicTags = THEMATIC_TAGS.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !formData.thematicTags.includes(tag)
  );

  const availableSubcategories = formData.category ? MAIN_CATEGORIES[formData.category as keyof typeof MAIN_CATEGORIES] || [] : [];

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

        {/* Step 5: Main Category */}
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
            {Object.keys(MAIN_CATEGORIES).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <span className={styles.error}>{errors.category}</span>}
        </div>

        {/* Step 6: Subcategory */}
        {formData.category && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Specific Category
              <span className={styles.optional}>(Optional)</span>
            </label>
            <select
              value={formData.subcategory}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
              className={styles.selectInput}
            >
              <option value="">Select a specific category</option>
              {availableSubcategories.map(subcategory => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          </div>
        )}

        {/* Step 7: Thematic Tags */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Thematic Tags
            <span className={styles.optional}>(Up to 5 tags)</span>
          </label>
          
          <div className={styles.tagsContainer}>
            {formData.thematicTags.map(tag => (
              <span key={tag} className={styles.tag}>
                {tag}
                <button 
                  type="button" 
                  onClick={() => handleThematicTagRemove(tag)}
                  className={styles.tagRemove}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {formData.thematicTags.length < 5 && (
            <div className={styles.tagInputContainer}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onFocus={() => setShowTagDropdown(true)}
                placeholder="Type to search thematic tags..."
                className={styles.textInput}
              />
              
              {showTagDropdown && filteredThematicTags.length > 0 && (
                <div className={styles.tagDropdown}>
                  {filteredThematicTags.slice(0, 8).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleThematicTagAdd(tag)}
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

        {/* Step 8: Post URL */}
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

        {/* Step 9: Adult Content Verification */}
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
    </div>
  );
};

export default BlogSubmissionForm;
