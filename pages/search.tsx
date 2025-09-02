import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import BlogCard from "../components/BlogCard";
import SearchBar from "../components/SearchBar";
import { performKeywordSearch, performAISearch, SearchResult, AISearchResult } from "../lib/searchUtils";
import styles from "../styles/Home.module.css";
import searchStyles from "../styles/Search.module.css";
import blogCardStyles from "../styles/BlogCard.module.css";

// Mock blog data - replace with actual API call
const mockBlogs = [
  {
    id: '1',
    image: "https://picsum.photos/300/200?random=1",
    imageDescription: "A peaceful morning scene with a cup of coffee and journal on a wooden table near a window",
    title: "The Complete Guide to Building a Sustainable Morning Routine That Actually Works",
    author: "Sarah Johnson",
    authorProfile: "/blogger/sarah-johnson",
    bloggerId: "sarah-johnson",
    bloggerDisplayName: "Sarah Johnson",
    description: "Discover the science-backed strategies for creating a morning routine that sticks. From optimizing your sleep schedule to choosing the right activities.",
    category: "Lifestyle",
    tags: ["Morning Routine", "Productivity", "Self-Care"],
    postUrl: "https://example.com/morning-routine-guide",
    dateAdded: "2024-01-15",
    readTime: "8 min read",
    publishDate: "2024-01-15",
    isRead: false,
    isSaved: false
  },
  {
    id: '2',
    image: "https://picsum.photos/300/200?random=2",
    imageDescription: "A person working at a computer with stress-relief items like plants and calming lighting around their workspace",
    title: "Mental Health in Tech: Managing Burnout and Finding Balance",
    author: "Alex Chen",
    authorProfile: "/blogger/alex-chen",
    bloggerId: "alex-chen",
    bloggerDisplayName: "Alex Chen",
    description: "An honest look at burnout, stress, and finding balance in the fast-paced world of technology.",
    category: "Health & Wellness",
    tags: ["Mental Health", "Tech", "Burnout Recovery"],
    postUrl: "https://example.com/mental-health-tech",
    dateAdded: "2024-01-14",
    readTime: "6 min read",
    publishDate: "2024-01-14",
    isRead: true,
    isSaved: true
  },
  {
    id: '3',
    image: "https://picsum.photos/300/200?random=3",
    imageDescription: "A colorful plate of fresh, healthy meal ingredients arranged artistically on a kitchen counter",
    title: "Quick and Healthy Cooking for Busy Professionals",
    author: "Maria Rodriguez",
    authorProfile: "/blogger/maria-rodriguez",
    bloggerId: "maria-rodriguez",
    bloggerDisplayName: "Maria Rodriguez",
    description: "Quick and delicious meals that don't compromise on flavor or nutrition, perfect for busy schedules.",
    category: "Food & Drink",
    tags: ["Cooking", "Quick Meals", "Healthy Eating"],
    postUrl: "https://example.com/cooking-adventures",
    dateAdded: "2024-01-13",
    readTime: "5 min read",
    publishDate: "2024-01-13",
    isRead: false,
    isSaved: false
  }
];

const SearchPage: NextPage = () => {
  const router = useRouter();
  const { q, type } = router.query;
  
  const [searchResults, setSearchResults] = useState<SearchResult[] | AISearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'keyword' | 'ai'>('keyword');
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    if (q && typeof q === 'string') {
      setSearchQuery(q);
      setSearchType((type as 'keyword' | 'ai') || 'keyword');
      performSearch(q, (type as 'keyword' | 'ai') || 'keyword');
    }
  }, [q, type]);

  const performSearch = async (query: string, searchType: 'keyword' | 'ai') => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setNoResults(false);
    
    try {
      let results: SearchResult[] | AISearchResult[];
      
      if (searchType === 'ai') {
        results = await performAISearch(query, mockBlogs);
      } else {
        results = performKeywordSearch(query, mockBlogs);
      }
      
      setSearchResults(results);
      setNoResults(results.length === 0);
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = (query: string, type: 'keyword' | 'ai') => {
    const searchParams = new URLSearchParams({ q: query, type });
    router.push(`/search?${searchParams.toString()}`);
  };

  const toggleSave = (blogId: string) => {
    setSearchResults(prev => prev.map(blog => 
      blog.id === blogId ? { ...blog, isSaved: !blog.isSaved } : blog
    ));
  };

  const markAsRead = (blogId: string) => {
    setSearchResults(prev => prev.map(blog => 
      blog.id === blogId ? { ...blog, isRead: true } : blog
    ));
  };

  return (
    <Layout title={searchQuery ? `Search: ${searchQuery} - BlogRolly` : "Search - BlogRolly"}>
      <div className={styles.container}>
        {/* Search Bar */}
        <div className={searchStyles.searchSection}>
          <SearchBar
            onSearch={handleNewSearch}
            placeholder="Search blogs, topics, or authors..."
            showAdvancedFilters={true}
          />
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className={searchStyles.resultsSection}>
            <div className={searchStyles.resultsHeader}>
              <h2>
                {searchType === 'ai' ? '🤖 AI Search Results' : '🔍 Search Results'} 
                for "{searchQuery}"
              </h2>
              {!isLoading && searchResults.length > 0 && (
                <p className={searchStyles.resultsCount}>
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className={searchStyles.loadingState}>
                <div className={searchStyles.loadingSpinner}></div>
                <p>
                  {searchType === 'ai' 
                    ? 'Rolly is analyzing your question...' 
                    : 'Searching blogs...'
                  }
                </p>
              </div>
            )}

            {/* No Results */}
            {noResults && !isLoading && (
              <div className={searchStyles.noResults}>
                <h3>No results found</h3>
                <p>
                  {searchType === 'ai' 
                    ? "Rolly couldn&apos;t find blogs that directly answer your question. Try rephrasing or using the regular search."
                    : "No blogs match your search terms. Try different keywords or check your spelling."
                  }
                </p>
                <div className={searchStyles.suggestions}>
                  <h4>Try searching for:</h4>
                  <div className={searchStyles.suggestionTags}>
                    <span>morning routines</span>
                    <span>productivity tips</span>
                    <span>mental health</span>
                    <span>cooking recipes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results Grid */}
            {searchResults.length > 0 && !isLoading && (
              <div className={blogCardStyles.blogGrid}>
                {searchResults.map((blog) => (
                  <div key={blog.id} className={searchStyles.resultItem}>
                    <BlogCard
                      blog={blog}
                      onToggleSave={toggleSave}
                      onMarkAsRead={markAsRead}
                      showAuthor={true}
                      showSaveButton={true}
                    />
                    
                    {/* AI Search Additional Info */}
                    {searchType === 'ai' && 'aiRelevanceReason' in blog && (
                      <div className={searchStyles.aiInsight}>
                        <div className={searchStyles.aiInsightHeader}>
                          <span className={searchStyles.aiIcon}>🤖</span>
                          <span>Why Rolly recommends this</span>
                        </div>
                        <p className={searchStyles.aiReason}>
                          {blog.aiRelevanceReason}
                        </p>
                        <div className={searchStyles.confidenceScore}>
                          Relevance: {Math.round(blog.aiConfidenceScore * 100)}%
                        </div>
                      </div>
                    )}
                    
                    {/* Keyword Search Match Info */}
                    {searchType === 'keyword' && (
                      <div className={searchStyles.matchInfo}>
                        <span className={searchStyles.matchType}>
                          Matched in: {blog.matchType}
                        </span>
                        <span className={searchStyles.relevanceScore}>
                          Relevance: {blog.relevanceScore}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
