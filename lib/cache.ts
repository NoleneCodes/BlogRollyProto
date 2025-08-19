
// Client-side caching utilities for improved performance

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class ClientCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Maximum number of items to cache

  set<T>(key: string, data: T, ttlMinutes = 5): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + (ttlMinutes * 60 * 1000)
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
export const clientCache = new ClientCache();

// Cache keys
export const CACHE_KEYS = {
  BLOGS: 'blogs',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  USER_PROFILE: 'user_profile',
  SEARCH_RESULTS: 'search_results',
  BLOG_STATS: 'blog_stats'
};

// Cached fetch wrapper
export const cachedFetch = async <T>(
  url: string, 
  options?: RequestInit,
  cacheKey?: string,
  ttlMinutes = 5
): Promise<T> => {
  const key = cacheKey || url;
  
  // Try to get from cache first
  const cached = clientCache.get<T>(key);
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Cache the result
  clientCache.set(key, data, ttlMinutes);
  
  return data;
};

// Preload critical data
export const preloadCriticalData = async () => {
  try {
    // Preload categories and tags
    await Promise.all([
      cachedFetch('/api/blogs/categories-in-use', {}, CACHE_KEYS.CATEGORIES, 30),
      cachedFetch('/api/blogs/tags-in-use', {}, CACHE_KEYS.TAGS, 30)
    ]);
  } catch (error) {
    console.warn('Failed to preload critical data:', error);
  }
};
