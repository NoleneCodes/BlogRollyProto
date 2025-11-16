import React, { useState, useEffect } from 'react';
import { TAGS } from '../lib/categories-tags';

// Get popular tags from the enhanced TAGS array
const POPULAR_TAGS = TAGS.slice(0, 25).filter(tag => tag !== 'Other');

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
}

interface SearchFilters {
  category?: string;
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'popularity';
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search blogs, topics, or authors", 
  showFilters = false // Changed to false for clean design
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'popularity'>('relevance');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Handle search submission
  const handleSearch = () => {
    const filters: SearchFilters = {
      ...(selectedCategory && { category: selectedCategory }),
      ...(selectedTags.length > 0 && { tags: selectedTags }),
      sortBy
    };
    
    onSearch(query, filters);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Auto-search when filters change
  useEffect(() => {
    if (query || selectedTags.length > 0 || selectedCategory) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [query, selectedTags, selectedCategory, sortBy]);

  return (
    <div className="search-bar-container">
      {/* Main Search Input - Clean Original Design */}
      <div className="search-input-group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="search-input"
        />
        <button 
          onClick={handleSearch}
          className="search-button"
        >
          Search
        </button>
        <button 
          onClick={handleSearch}
          className="ask-rolly-button"
        >
          Ask Rolly
        </button>
      </div>

      {/* Filters (if enabled) */}
      {showFilters && (
        <div className="filters-container">
          {/* Category Filter */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
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
          </select>

          {/* Tag Filter */}
          <div className="tag-filter-container">
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="tag-filter-button"
            >
              Tags {selectedTags.length > 0 && `(${selectedTags.length})`} ▼
            </button>
            
            {showTagDropdown && (
              <div className="tag-dropdown">
                {POPULAR_TAGS.map(tag => (
                  <label key={tag} className="tag-option">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                    />
                    <span className="tag-label">{tag}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sort By */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="relevance">Most Relevant</option>
            <option value="date">Newest First</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      )}

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="selected-tags">
          {selectedTags.map(tag => (
            <span key={tag} className="selected-tag">
              {tag}
              <button 
                onClick={() => handleTagToggle(tag)}
                className="remove-tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <style jsx>{`
        .search-bar-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-input-group {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
        }

        .search-input {
          flex: 1;
          padding: 16px 20px;
          font-size: 16px;
          border: none;
          border-radius: 12px;
          outline: none;
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.2s ease;
        }

        .search-input:focus {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .search-input::placeholder {
          color: #9ca3af;
          font-size: 16px;
        }

        .search-button {
          padding: 16px 24px;
          background: white;
          color: #c42142;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .search-button:hover {
          background: #f8f9fa;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .ask-rolly-button {
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          backdrop-filter: blur(10px);
        }

        .ask-rolly-button:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-1px);
        }

        .filters-container {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .category-select,
        .sort-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
        }

        .tag-filter-container {
          position: relative;
        }

        .tag-filter-button {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tag-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-height: 200px;
          overflow-y: auto;
          z-index: 100;
          min-width: 200px;
        }

        .tag-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .tag-option:hover {
          background: #f3f4f6;
        }

        .tag-label {
          font-size: 14px;
        }

        .selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .selected-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #3b82f6;
          color: white;
          border-radius: 16px;
          font-size: 12px;
        }

        .remove-tag {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          padding: 0;
          margin-left: 4px;
        }

        @media (max-width: 768px) {
          .search-input-group {
            flex-direction: column;
            gap: 16px;
          }
          
          .search-input {
            width: 100%;
          }
          
          .search-button,
          .ask-rolly-button {
            width: 100%;
            justify-content: center;
          }
          
          .filters-container {
            flex-direction: column;
            align-items: stretch;
          }
          
          .category-select,
          .sort-select,
          .tag-filter-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}