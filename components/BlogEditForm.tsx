
import React, { useState, useRef, useEffect } from 'react';
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

const BlogEditForm: React.FC<BlogEditFormProps> = ({ blog, onSave, onCancel, isVisible }) => {
  const [editForm, setEditForm] = useState<BlogData>({
    title: blog.title,
    description: blog.description || '',
    url: blog.url,
    category: blog.category,
    tags: blog.tags || [],
    image: null,
    imagePreview: blog.image || null
  });

  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      setEditForm(prev => ({ ...prev, image: file }));

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

  const filteredTags = getAllTags().filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !editForm.tags.includes(tag)
  );

  const handleSave = () => {
    onSave(blog.id, editForm);
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
          <label>URL</label>
          <input
            type="url"
            value={editForm.url}
            onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
            className={styles.editInput}
            placeholder="https://yourblog.com/post-url"
          />
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
