
import React, { useState } from 'react';
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
          <input
            type="text"
            value={editForm.category}
            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
            className={styles.editInput}
            placeholder="Enter the category..."
          />
        </div>
        <div className={styles.editField}>
          <label>Tags</label>
          <input
            type="text"
            value={editForm.tags.join(', ')}
            onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))}
            className={styles.editInput}
            placeholder="Enter tags separated by commas..."
          />
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
