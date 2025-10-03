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
  } | string;
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

    // Check author matches (enhanced to include blogger display name and topics)
    let authorMatches = 0;

    // Check author name (existing functionality)
    const authorNameMatches = searchTerms.filter(term => 
      blog.author.toLowerCase().includes(term)
    ).length;
    authorMatches += authorNameMatches;

    // Check blogger display name if available
    if (blog.bloggerDisplayName) {
      const displayNameMatches = searchTerms.filter(term => 
        blog.bloggerDisplayName.toLowerCase().includes(term)
      ).length;
      authorMatches += displayNameMatches;
    }

    // Check blogger topics/niches (for pro bloggers)
    if (blog.bloggerTopics && Array.isArray(blog.bloggerTopics)) {
      const topicMatches = searchTerms.filter(term => 
        blog.bloggerTopics.some((topic: string) => topic.toLowerCase().includes(term))
      ).length;
      authorMatches += topicMatches * 0.8; // Slightly lower weight than direct name matches
    }

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
      if (filters.author && !blog.author.toLowerCase().includes(filters.author.toLowerCase())) return;
      if (filters.tags && filters.tags.length > 0 && !filters.tags.some(tag => blog.tags.some((blogTag: string) => blogTag.toLowerCase().includes(tag.toLowerCase())))) return;
      if (filters.dateRange && typeof filters.dateRange === 'object') {
        const blogDate = new Date(blog.dateAdded);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (blogDate < startDate || blogDate > endDate) return;
      } else if (filters.dateRange && typeof filters.dateRange === 'string') {
        const blogDate = new Date(blog.dateAdded);
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
            cutoffDate = new Date(0); // Beginning of time
        }

        if (blogDate < cutoffDate) return;
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
    'personal finance',
    'apartment decorating',
    'art tutorials',
    'baking tips',
    'budget planning',
    'creative writing',
    'digital marketing',
    'exercise routines',
    'fashion trends',
    'gardening tips',
    'healthy eating',
    'investment advice',
    'javascript tutorials',
    'kitchen organization',
    'lifestyle changes',
    'meditation practices',
    'nutrition facts',
    'outdoor activities',
    'photography tips',
    'quick meals',
    'remote work',
    'self improvement',
    'time management',
    'urban gardening',
    'video editing',
    'work life balance',
    'yoga practices'
  ];

  if (!query.trim()) return suggestions.slice(0, 5);

  const searchTerm = query.toLowerCase().trim();

  // Filter suggestions that start with the search term first, then ones that contain it
  const startsWithMatches = suggestions.filter(suggestion => 
    suggestion.toLowerCase().startsWith(searchTerm)
  );

  const containsMatches = suggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(searchTerm) && 
    !suggestion.toLowerCase().startsWith(searchTerm)
  );

  // Combine and limit to 5 suggestions
  return [...startsWithMatches, ...containsMatches].slice(0, 5);
}

// Save search history for users
export function saveSearchToHistory(query: string, searchType: 'keyword' | 'ai'): void {
  // Always sync to Supabase
  fetch('/api/search-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, searchType })
  });
}

// Session ID logic now handled by backend (Supabase) or authenticated user


export async function getSearchHistory(): Promise<Array<{
  id: string;
  query: string;
  searchType: 'keyword' | 'ai';
  timestamp: string;
}>> {
  try {
    const res = await fetch('/api/search-history');
    if (!res.ok) return [];
    const history = await res.json();
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}