
import React, { useState } from 'react';
import { validateCustomInput } from '../lib/categories-tags';
import styles from '../styles/CustomCategoryInput.module.css';

interface CustomCategoryInputProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  maxWords?: number;
  label?: string;
}

export const CustomCategoryInput: React.FC<CustomCategoryInputProps> = ({
  selectedCategories,
  onCategoryChange,
  maxWords = 3,
  label = "Add your custom topic (one word at a time, max 3 words)"
}) => {
  const [customInput, setCustomInput] = useState('');

  const customCategories = selectedCategories.filter(cat => cat.startsWith('custom:'));
  const isOtherSelected = selectedCategories.includes('Other');

  const handleAddCustomWord = () => {
    if (!customInput.trim()) return;

    const validation = validateCustomInput(customInput);
    if (!validation.isValid) return;

    const newCustomCategory = `custom:${customInput.trim()}`;
    const updatedCategories = [...selectedCategories, newCustomCategory];
    onCategoryChange(updatedCategories);
    setCustomInput('');
  };

  const handleRemoveCustomCategory = (categoryToRemove: string) => {
    const updatedCategories = selectedCategories.filter(cat => cat !== categoryToRemove);
    onCategoryChange(updatedCategories);
  };

  const handleInputChange = (value: string) => {
    // Only allow single words (no spaces)
    if (!value.includes(' ')) {
      setCustomInput(value);
    }
  };

  if (!isOtherSelected) return null;

  return (
    <div className={styles.customCategoryContainer}>
      <label className={styles.customCategoryLabel}>
        {label}
      </label>
      
      <div className={styles.customCategoryInputContainer}>
        <input
          type="text"
          value={customInput}
          onChange={(e) => handleInputChange(e.target.value)}
          className={styles.customCategoryInput}
          placeholder="Enter one word"
          disabled={customCategories.length >= maxWords}
          maxLength={20}
        />
        <button
          type="button"
          onClick={handleAddCustomWord}
          className={styles.addWordButton}
          disabled={!customInput.trim() || customCategories.length >= maxWords}
        >
          Add Word
        </button>
      </div>
      
      {customCategories.length > 0 && (
        <div className={styles.customCategoryTags}>
          {customCategories.map((category, index) => (
            <span key={index} className={styles.customCategoryTag}>
              {category.replace('custom:', '')}
              <button
                type="button"
                onClick={() => handleRemoveCustomCategory(category)}
                className={styles.removeTagButton}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      
      <small className={styles.customCategoryHint}>
        {customCategories.length}/{maxWords} words added
      </small>
    </div>
  );
};
