import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  const [filter, setFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'keyword' | 'ai'>('keyword');
  const [searchResults, setSearchResults] = useState<SearchResult[] | AISearchResult[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (q && typeof q === 'string') {
      setSearchQuery(q);
      setSearchType((type as 'keyword' | 'ai') || 'keyword');
      performSearch(q, (type as 'keyword' | 'ai') || 'keyword');
    } else {
      setIsSearchActive(false);
      setSearchResults([]);
    }

    // Handle tag filtering
    if (tag && typeof tag === 'string') {
      setTagFilter(tag);
      setFilter("all"); // Reset category filter when filtering by tag
    } else {
      setTagFilter("");
    }

    // Handle category filtering
    if (category && typeof category === 'string') {
      setFilter(category);
      setTagFilter(""); // Reset tag filter when filtering by category
    }
  }, [q, type, tag, category]);

  const performSearch = async (query: string, searchType: 'keyword' | 'ai') => {
    if (!query.trim()) return;

    setIsSearching(true);
    setIsSearchActive(true);

    try {
      let results: SearchResult[] | AISearchResult[];

      if (searchType === 'ai') {
        results = await performAISearch(query, mockBlogs);
      } else {
        results = performKeywordSearch(query, mockBlogs);
      }

      setSearchResults(results);

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNewSearch = (query: string, searchType: 'keyword' | 'ai') => {
    const searchParams = new URLSearchParams({ q: query, type: searchType });
    router.push(`/blogroll?${searchParams.toString()}`);
  };

  const clearSearch = () => {
    router.push('/blogroll');
  };

  const clearFilters = () => {
    router.push('/blogroll');
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

  let filteredBlogs = blogs;

  // Apply category filter
  if (filter !== "all") {
    filteredBlogs = filteredBlogs.filter(blog => blog.category === filter);
  }

  // Apply tag filter
  if (tagFilter) {
    filteredBlogs = filteredBlogs.filter(blog => 
      blog.tags.some(blogTag => blogTag.toLowerCase() === tagFilter.toLowerCase())
    );
  }

  const displayBlogs = isSearchActive ? searchResults : filteredBlogs;

  const CATEGORIES = MAIN_CATEGORIES.filter(category => category !== 'Other');

  return (
    <Layout title={searchQuery ? `Search: ${searchQuery} - The Blogroll - Blogrolly` : "The Blogroll - Blogrolly"}>
      <div className={styles.hero}>
        <h1 className={styles.title}>The Blogroll</h1>
        <p className={styles.description}>
          Discover amazing blogs curated by our community
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
        <SearchBar
          onSearch={handleNewSearch}
          placeholder="Search blogs, topics, or authors..."
          showAdvancedFilters={true}
        />
      </div>

      {/* Search Results Info */}
      {isSearchActive && (
        <div style={{ margin: '1rem 0', textAlign: 'center' }}>
          <div className={styles.searchInfo}>
            {isSearching ? (
              <p>Searching for "{searchQuery}"...</p>
            ) : (
              <>
                <p>
                  {searchResults.length > 0 
                    ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"` 
                    : `No results found for "${searchQuery}"`
                  }
                  {searchType === 'ai' && ' (AI Search)'}
                </p>
                <button 
                  onClick={clearSearch}
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
                  Clear Search
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

      {/* Filters - Only show when not searching */}
      {!isSearchActive && (
        <div className={blogCardStyles.filterSection}>
          <select 
            value={filter} 
            onChange={(e) => {
              setFilter(e.target.value);
              const newParams = new URLSearchParams();
              if (e.target.value !== "all") {
                newParams.set('category', e.target.value);
              }
              router.push(`/blogroll${newParams.toString() ? '?' + newParams.toString() : ''}`);
            }}
            className={blogCardStyles.filterSelect}
          >
            <option value="">All Categories</option>
              {MAIN_CATEGORIES.filter(category => category !== 'Other').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
          </select>
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