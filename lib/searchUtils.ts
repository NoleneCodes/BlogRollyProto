
// Search utilities for BlogRolly
export interface SearchResult {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
  postUrl: string;
  dateAdded: string;
  relevanceScore: number;
  matchType: 'title' | 'description' | 'tags' | 'author' | 'category';
}

export interface AISearchResult extends SearchResult {
  aiRelevanceReason: string;
  aiConfidenceScore: number;
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  author?: string;
}

// Regular keyword search function
export function performKeywordSearch(
  query: string, 
  blogs: any[], 
  filters?: SearchFilters
): SearchResult[] {
  if (!query.trim()) return [];

  const searchTerms = query.toLowerCase().split(' ');
  const results: SearchResult[] = [];

  blogs.forEach(blog => {
    let relevanceScore = 0;
    let matchTypes: Array<'title' | 'description' | 'tags' | 'author' | 'category'> = [];

    // Check title matches (highest weight)
    const titleMatches = searchTerms.filter(term => 
      blog.title.toLowerCase().includes(term)
    ).length;
    if (titleMatches > 0) {
      relevanceScore += titleMatches * 10;
      matchTypes.push('title');
    }

    // Check description matches
    const descMatches = searchTerms.filter(term => 
      blog.description.toLowerCase().includes(term)
    ).length;
    if (descMatches > 0) {
      relevanceScore += descMatches * 5;
      matchTypes.push('description');
    }

    // Check tag matches
    const tagMatches = searchTerms.filter(term => 
      blog.tags.some((tag: string) => tag.toLowerCase().includes(term))
    ).length;
    if (tagMatches > 0) {
      relevanceScore += tagMatches * 7;
      matchTypes.push('tags');
    }

    // Check author matches
    const authorMatches = searchTerms.filter(term => 
      blog.author.toLowerCase().includes(term)
    ).length;
    if (authorMatches > 0) {
      relevanceScore += authorMatches * 6;
      matchTypes.push('author');
    }

    // Check category matches
    const categoryMatches = searchTerms.filter(term => 
      blog.category.toLowerCase().includes(term)
    ).length;
    if (categoryMatches > 0) {
      relevanceScore += categoryMatches * 4;
      matchTypes.push('category');
    }

    // Apply filters
    if (filters) {
      if (filters.category && blog.category !== filters.category) return;
      if (filters.author && blog.author !== filters.author) return;
      if (filters.tags && !filters.tags.some(tag => blog.tags.includes(tag))) return;
      if (filters.dateRange) {
        const blogDate = new Date(blog.dateAdded);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (blogDate < startDate || blogDate > endDate) return;
      }
    }

    if (relevanceScore > 0) {
      results.push({
        ...blog,
        relevanceScore,
        matchType: matchTypes[0] // Primary match type
      });
    }
  });

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// AI-powered search function (placeholder for future implementation)
export async function performAISearch(
  query: string, 
  blogs: any[], 
  filters?: SearchFilters
): Promise<AISearchResult[]> {
  // TODO: Implement AI search using OpenAI/Anthropic API
  // This will analyze the user's question and match it with blog content
  
  console.log('AI Search Query:', query);
  console.log('Available blogs:', blogs.length);
  
  // For now, return keyword search results with AI relevance simulation
  const keywordResults = performKeywordSearch(query, blogs, filters);
  
  return keywordResults.map(result => ({
    ...result,
    aiRelevanceReason: `This blog matches your search because it discusses topics related to "${query}".`,
    aiConfidenceScore: Math.random() * 0.3 + 0.7 // Simulated confidence score
  }));
}

// Search suggestions based on popular queries
export function getSearchSuggestions(query: string): string[] {
  const suggestions = [
    'morning routines',
    'productivity tips',
    'mental health',
    'cooking recipes',
    'travel guides',
    'tech reviews',
    'fitness routines',
    'book recommendations',
    'career advice',
    'personal finance'
  ];

  if (!query.trim()) return suggestions.slice(0, 5);

  return suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);
}

// Save search history for users
export function saveSearchToHistory(query: string, searchType: 'keyword' | 'ai'): void {
  // TODO: Implement with Supabase
  const history = getSearchHistory();
  const newEntry = {
    query,
    searchType,
    timestamp: new Date().toISOString(),
    id: Date.now().toString()
  };
  
  const updatedHistory = [newEntry, ...history.slice(0, 9)]; // Keep last 10 searches
  localStorage.setItem('blogrolly_search_history', JSON.stringify(updatedHistory));
}

export function getSearchHistory(): Array<{
  id: string;
  query: string;
  searchType: 'keyword' | 'ai';
  timestamp: string;
}> {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = localStorage.getItem('blogrolly_search_history');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}
