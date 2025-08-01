import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/SearchBar.module.css';
import { getSearchSuggestions, saveSearchToHistory, getSearchHistory } from '../lib/searchUtils';
import { MAIN_CATEGORIES, TAGS } from '../lib/categories-tags';

// Get popular tags from the centralized file - combine themes & topics and take the most relevant ones
const POPULAR_TAGS = [
  ...TAGS['Themes & Topics'].slice(0, 20),
  ...TAGS['Vibe / Tone'].slice(0, 8)
].filter(tag => tag !== 'Other');

interface SearchBarProps {
  onSearch?: (query: string, searchType: 'keyword' | 'ai') => void;
  placeholder?: string;
  showAdvancedFilters?: boolean;
  className?: string;
  showFilters?: boolean;
  onFiltersChange?: (filters: any) => void;
  blogs?: any[]; // Blog data to filter available tags
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search blogs, topics, or authors...",
  showAdvancedFilters = true,
  className = "",
  showFilters = false,
  onFiltersChange,
  blogs = []
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    dateRange: '',
    author: '',
    tags: [] as string[]
  });

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tagsInUse, setTagsInUse] = useState<Record<string, string[]>>({});
  const [loadingTags, setLoadingTags] = useState(false);

  // Fetch tags currently in use from database
  const fetchTagsInUse = async () => {
    try {
      setLoadingTags(true);
      const response = await fetch('/api/blogs/tags-in-use');
      if (response.ok) {
        const data = await response.json();
        setTagsInUse(data.tagCategories);
      }
    } catch (error) {
      console.error('Error fetching tags in use:', error);
      // Fallback to empty object
      setTagsInUse({});
    } finally {
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    if (showAdvancedFilters) {
      fetchTagsInUse();
    }
  }, [showAdvancedFilters]);

  const getFilteredTagCategories = () => {
    return tagsInUse;
  };

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      setSuggestions(getSearchSuggestions(value));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (searchType: 'keyword' | 'ai') => {
    if (!query.trim()) return;

    saveSearchToHistory(query, searchType);
    setSearchHistory(getSearchHistory());

    if (onSearch) {
      onSearch(query, searchType);
    } else {
      // Navigate to blogroll page with search parameters
      const searchParams = new URLSearchParams({
        q: query,
        type: searchType,
        category: filters.category,
        dateRange: filters.dateRange,
        author: filters.author,
        tags: filters.tags.join(',')
      });
      router.push(`/blogroll?${searchParams.toString()}`);
    }

    setShowSuggestions(false);
  };

  const handleTagAdd = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      const newFilters = {
        ...filters,
        tags: [...filters.tags, tag]
      };
      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    }
  };

  const handleTagRemove = (tag: string) => {
    const newFilters = {
      ...filters,
      tags: filters.tags.filter(t => t !== tag)
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch('keyword');
    }
  };

  return (
    <div className={`${styles.searchContainer} ${className}`} ref={searchRef}>
      <div className={styles.searchInputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(query.trim().length > 0 || searchHistory.length > 0)}
          placeholder={placeholder}
          className={styles.searchInput}
        />

        <div className={styles.searchButtons}>
          <button
            onClick={() => handleSearch('keyword')}
            className={styles.searchButton}
            disabled={!query.trim()}
          >
            Search
          </button>
          <button
            onClick={() => {
              // Disabled for now - will implement AI search logic later
              console.log('Ask Rolly feature coming soon!');
            }}
            className={styles.aiSearchButton}
            disabled={true}
            title="AI-powered search that understands your questions and provides relevant results (Coming Soon)"
          >
            Ask Rolly
          </button>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        (searchHistory.length > 0 && !query.trim()) || 
        (suggestions.length > 0 && query.trim())
      ) && (
        <div className={styles.suggestionsDropdown}>
          {/* Recent Searches */}
          {searchHistory.length > 0 && !query.trim() && (
            <div className={styles.suggestionSection}>
              <div className={styles.sectionHeader}>
                <h4>Recent Searches</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    localStorage.removeItem('blogrolly_search_history');
                    setSearchHistory([]);
                    setShowSuggestions(false);
                  }}
                  className={styles.clearButton}
                  title="Clear recent searches"
                >
                  Clear
                </button>
              </div>
              {searchHistory.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSuggestionClick(item.query)}
                  className={styles.suggestionItem}
                >
                  <span>{item.query}</span>
                  <span className={styles.searchType}>
                    {item.searchType === 'ai' ? 'AI' : 'Search'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className={styles.suggestionSection}>
              <h4>Suggestions</h4>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={styles.suggestionItem}
                >
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;