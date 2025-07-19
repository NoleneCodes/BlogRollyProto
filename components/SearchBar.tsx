
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/SearchBar.module.css';
import { getSearchSuggestions, saveSearchToHistory, getSearchHistory } from '../lib/searchUtils';

interface SearchBarProps {
  onSearch?: (query: string, searchType: 'keyword' | 'ai') => void;
  placeholder?: string;
  showAdvancedFilters?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search blogs, topics, or authors...",
  showAdvancedFilters = true,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    dateRange: '',
    author: ''
  });
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        ...filters
      });
      router.push(`/blogroll?${searchParams.toString()}`);
    }
    
    setShowSuggestions(false);
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
            onClick={() => handleSearch('ai')}
            className={styles.aiSearchButton}
            disabled={!query.trim()}
            title="AI-powered search that understands your questions"
          >
            Ask Rolly
          </button>
        </div>
        
        {showAdvancedFilters && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filtersToggle}
            title="Advanced filters"
          >
            ⚙️
          </button>
        )}
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

      {/* Advanced Filters */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterRow}>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className={styles.filterSelect}
            >
              <option value="">All Categories</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="Food & Drink">Food & Drink</option>
              <option value="Tech & Digital Life">Tech & Digital Life</option>
              <option value="Creative Expression">Creative Expression</option>
            </select>
            
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className={styles.filterSelect}
            >
              <option value="">Any time</option>
              <option value="week">Past week</option>
              <option value="month">Past month</option>
              <option value="year">Past year</option>
            </select>
            
            <input
              type="text"
              placeholder="Author name..."
              value={filters.author}
              onChange={(e) => setFilters({...filters, author: e.target.value})}
              className={styles.filterInput}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
