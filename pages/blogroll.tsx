import type { NextPage } from "next";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { IoSettingsOutline } from "react-icons/io5";
import Layout from "../components/Layout";
import BlogCard from "../components/BlogCard";
import SearchBar from "../components/SearchBar";
import styles from "../styles/Home.module.css";
import blogCardStyles from "../styles/BlogCard.module.css";
import { performKeywordSearch, performAISearch, SearchResult, AISearchResult } from "../lib/searchUtils";
import { MAIN_CATEGORIES, TAGS } from '../lib/categories-tags';

interface BlogPost {
  id: string;
  image?: string;
  imageDescription?: string;
  title: string;
  author: string;
  authorProfile: string;
  bloggerId: string;
  bloggerDisplayName: string;
  bloggerTopics?: string[];
  description: string;
  category: string;
  tags: string[];
  postUrl: string;
  dateAdded: string;
  readTime?: string;
  publishDate?: string;
  isRead?: boolean;
  isSaved?: boolean;
}

// Mock data - replace with actual API call
const mockBlogs: BlogPost[] = [
  {
    id: '1',
    image: "https://picsum.photos/300/200?random=1",
    imageDescription: "A peaceful morning scene with a cup of coffee and journal on a wooden table near a window",
    title: "The Complete Guide to Building a Sustainable Morning Routine That Actually Works",
    author: "Sarah Johnson",
    authorProfile: "/blogger/sarah-johnson",
    bloggerId: "sarah-johnson",
    bloggerDisplayName: "Sarah Johnson",
    bloggerTopics: ["Productivity", "Self-Care", "Wellness", "Lifestyle"],
    description: "Discover the science-backed strategies for creating a morning routine that sticks. From optimizing your sleep schedule to choosing the right activities, this comprehensive guide covers everything you need to know about starting your day right and maintaining consistency over time.",
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
    title: "Mental Health in Tech",
    author: "Alex Chen",
    authorProfile: "/blogger/alex-chen",
    bloggerId: "alex-chen",
    bloggerDisplayName: "Alex Chen",
    bloggerTopics: ["Mental Health", "Tech Industry", "Developer Life", "Burnout Prevention"],
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
    title: "Cooking Adventures: Simple Recipes for Busy Lives",
    author: "Maria Rodriguez",
    authorProfile: "/blogger/maria-rodriguez",
    bloggerId: "maria-rodriguez",
    bloggerDisplayName: "Maria Rodriguez",
    bloggerTopics: ["Cooking", "Healthy Living", "Time Management", "Family Meals"],
    description: "Quick and delicious meals that don't compromise on flavor or nutrition.",
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

// Get popular tags from centralized file
const POPULAR_TAGS = [
  ...TAGS['Themes & Topics'].slice(0, 20),
  ...TAGS['Vibe / Tone'].slice(0, 8)
].filter(tag => tag !== 'Other');

const Blogroll: NextPage = () => {
  const router = useRouter();
  const { q, type, tag, category } = router.query;

  const [blogs, setBlogs] = useState<BlogPost[]>(mockBlogs);
  // filter and tagFilter now derive from query string
  const filter = typeof category === 'string' && category !== '' ? category : "all";
  const tagFilter = typeof tag === 'string' && tag !== '' ? tag : "";
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'keyword' | 'ai'>('keyword');
  const [searchResults, setSearchResults] = useState<SearchResult[] | AISearchResult[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    dateRange: '',
    author: '',
    tags: [] as string[]
  });
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string, searchType: 'keyword' | 'ai') => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('type', searchType);

      // Add filters to search
      if (searchFilters.category) {
        params.append('category', searchFilters.category);
      }
      if (searchFilters.author) {
        params.append('author', searchFilters.author);
      }
      if (searchFilters.dateRange) {
        params.append('dateRange', searchFilters.dateRange);
      }
      if (searchFilters.tags.length > 0) {
        params.append('tags', searchFilters.tags.join(','));
      }

      const response = await fetch(`/api/blogs/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      // Handle API errors gracefully
      if (data.error) {
        console.warn('Search API returned error:', data.error);
        setSearchResults([]);
      } else {
        setSearchResults(data.results || []);
      }
      setIsSearchActive(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchFilters]);

  const handleNewSearch = (query: string, searchType: 'keyword' | 'ai') => {
    const searchParams = new URLSearchParams({ q: query, type: searchType });
    router.push(`/blogroll?${searchParams.toString()}`);
  };

  const handleFiltersChange = (filters: any) => {
    setSearchFilters(filters);
    // Apply filters immediately
    applyAdvancedFilters(filters);
  };

  const applyAdvancedFilters = (filters: any) => {
    let filteredResults = mockBlogs;

    // Apply category filter
    if (filters.category) {
      filteredResults = filteredResults.filter(blog => blog.category === filters.category);
    }

    // Apply author filter (search by name, display name, or topics)
    if (filters.author && filters.author.trim()) {
      const authorQuery = filters.author.toLowerCase().trim();
      filteredResults = filteredResults.filter(blog => {
        const authorMatch = blog.author.toLowerCase().includes(authorQuery);
        const displayNameMatch = blog.bloggerDisplayName?.toLowerCase().includes(authorQuery);
        const topicsMatch = blog.bloggerTopics?.some((topic: string) => 
          topic.toLowerCase().includes(authorQuery)
        );
        return authorMatch || displayNameMatch || topicsMatch;
      });
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filteredResults = filteredResults.filter(blog =>
        filters.tags.some((filterTag: string) =>
          blog.tags.some((blogTag: string) => 
            blogTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
      );
    }

    // Apply date range filter
    if (filters.dateRange) {
      const now = new Date();
      let cutoffDate = new Date();

      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filteredResults = filteredResults.filter(blog => {
        const blogDate = new Date(blog.dateAdded);
        return blogDate >= cutoffDate;
      });
    }

    setBlogs(filteredResults);

    // If there are active filters, show as search active
    const hasActiveFilters = filters.category || filters.author || filters.tags?.length > 0 || filters.dateRange;
    setIsSearchActive(hasActiveFilters);

    if (hasActiveFilters) {
      setSearchResults(filteredResults.map(blog => ({ ...blog, relevanceScore: 1, matchType: 'tags' as const })));
    } else {
      setIsSearchActive(false);
      setSearchResults([]);
      setBlogs(mockBlogs); // Reset to original blogs
    }
  };

  const clearSearch = () => {
    router.push('/blogroll');
  };

  const clearFilters = () => {
    router.push('/blogroll');
  };

  const clearAdvancedFilters = () => {
    const emptyFilters = {
      category: '',
      dateRange: '',
      author: '',
      tags: [] as string[]
    };
    setSearchFilters(emptyFilters);
    setIsSearchActive(false);
    setSearchResults([]);
    setBlogs(mockBlogs);
    setShowAdvancedFilters(false);
  };

  const toggleSave = (blogId: string) => {
    if (isSearchActive) {
      setSearchResults(prev => prev.map(blog => 
        blog.id === blogId ? { ...blog, isSaved: !blog.isSaved } : blog
      ));
    } else {
      setBlogs(prev => prev.map(blog => 
        blog.id === blogId ? { ...blog, isSaved: !blog.isSaved } : blog
      ));
    }
  };

  const markAsRead = (blogId: string) => {
    if (isSearchActive) {
      setSearchResults(prev => prev.map(blog => 
        blog.id === blogId ? { ...blog, isRead: true } : blog
      ));
    } else {
      setBlogs(prev => prev.map(blog => 
        blog.id === blogId ? { ...blog, isRead: true } : blog
      ));
    }
  };

    const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with actual API endpoint to fetch blogs from database
      const response = await fetch('/api/blogs');
      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }
      const data = await response.json();
      setBlogs(data); // Assuming API returns an array of blog posts
    } catch (err: any) {
      console.error("Failed to fetch blogs", err);
      setError(err.message || "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };
  let filteredBlogs = blogs;

  // Always filter by category/tag from query string
  if (filter !== "all") {
    filteredBlogs = filteredBlogs.filter(blog => blog.category === filter);
  }
  if (tagFilter) {
    filteredBlogs = filteredBlogs.filter(blog => 
      blog.tags.some(blogTag => blogTag.toLowerCase() === tagFilter.toLowerCase())
    );
  }

  const displayBlogs = isSearchActive ? searchResults : filteredBlogs;

  const CATEGORIES = MAIN_CATEGORIES.filter(category => category !== 'Other');

  return (
    <Layout 
      title={searchQuery ? `Search: ${searchQuery} - The Blogroll - Blogrolly` : "The Blogroll - Blogrolly"}
      description={searchQuery ? `Search results for “${searchQuery}” in the BlogRolly blogroll. Discover blogs by category, topic, or niche.` : "Browse the BlogRolly blogroll to explore trending blogs, new voices, and independent bloggers across every category."}
      canonical="https://blogrolly.com/blogroll"
    >
      <div className={styles.hero}>
        <h1 className={styles.title}>The Blogroll</h1>
        <p className={styles.description}>
          Discover amazing blogs curated by our community
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
        <SearchBar
          onSearch={handleNewSearch}
          placeholder="Search blogs, topics, or authors..."
          showAdvancedFilters={showAdvancedFilters}
          showFilters={showAdvancedFilters}
          onFiltersChange={handleFiltersChange}
          blogs={blogs}
        />
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={{
            background: showAdvancedFilters ? '#c42142' : '#f8fafc',
            color: showAdvancedFilters ? 'white' : '#64748b',
            border: `2px solid ${showAdvancedFilters ? '#c42142' : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: '0.75rem',
            cursor: 'pointer',
            fontSize: '1.2rem',
            transition: 'all 0.2s ease',
            minWidth: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Advanced filters"
        >
          <IoSettingsOutline size={20} />
        </button>
      </div>

      {/* Search Results Info */}
      {isSearchActive && (
        <div style={{ margin: '1rem 0', textAlign: 'center' }}>
          <div className={styles.searchInfo}>
            {isSearching ? (
                <p>Searching for &quot;{searchQuery}&quot;...</p>
            ) : (
              <>
                <p>
                  {searchQuery ? (
                    searchResults.length > 0 
                      ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"` 
                      : `No results found for "${searchQuery}"`
                  ) : (
                    searchResults.length > 0
                      ? `Showing ${searchResults.length} filtered result${searchResults.length !== 1 ? 's' : ''}`
                      : 'No results match your filters'
                  )}
                  {searchType === 'ai' && ' (AI Search)'}
                </p>
                <button 
                  onClick={searchQuery ? clearSearch : clearAdvancedFilters}
                  style={{
                    background: 'transparent',
                    color: '#c42142',
                    border: '1px solid #c42142',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  {searchQuery ? 'Clear Search' : 'Clear Filters'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filter Results Info */}
      {!isSearchActive && (tagFilter || filter !== "all") && (
        <div style={{ margin: '1rem 0', textAlign: 'center' }}>
          <div className={styles.searchInfo}>
            <p>
              {tagFilter 
                ? `Showing blogs tagged with "${tagFilter}" (${filteredBlogs.length} result${filteredBlogs.length !== 1 ? 's' : ''})`
                : `Showing blogs in "${filter}" (${filteredBlogs.length} result${filteredBlogs.length !== 1 ? 's' : ''})`
              }
            </p>
            <button 
              onClick={clearFilters}
              style={{
                background: 'transparent',
                color: '#c42142',
                border: '1px solid #c42142',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}



      {/* Blog Grid */}
      <div className={blogCardStyles.blogGrid}>
        {displayBlogs.map((blog) => (
          <div key={blog.id}>
            <BlogCard
              blog={blog}
              onToggleSave={toggleSave}
              onMarkAsRead={markAsRead}
              showAuthor={true}
              showSaveButton={true}
            />

            {/* AI Search Additional Info */}
            {isSearchActive && searchType === 'ai' && 'aiRelevanceReason' in blog && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ marginRight: '5px', fontSize: '14px' }}>🤖</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Why Rolly recommends this</span>
                </div>
                <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                  {blog.aiRelevanceReason}
                </p>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                  Relevance: {Math.round(blog.aiConfidenceScore * 100)}%
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No results message */}
      {isSearchActive && !isSearching && searchResults.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>No blogs found matching your search. Try different keywords or browse all blogs below.</p>
        </div>
      )}
    </Layout>
  );
};

export default Blogroll;