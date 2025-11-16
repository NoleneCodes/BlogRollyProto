export const MAIN_CATEGORIES = [
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    description: 'Personal stories, daily life, and lifestyle content',
    color: '#FF6B9D',
    icon: '🌟',
    subcategories: ['Personal Development', 'Relationships', 'Home & Garden']
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Health tips, wellness advice, and medical insights',
    color: '#4ECDC4',
    icon: '🏥',
    subcategories: ['Mental Health', 'Fitness', 'Nutrition']
  },
  {
    id: 'business',
    name: 'Business & Finance',
    description: 'Business insights, financial advice, and entrepreneurship',
    color: '#45B7D1',
    icon: '💼',
    subcategories: ['Entrepreneurship', 'Investing', 'Career Advice']
  },
  {
    id: 'tech',
    name: 'Tech & Digital Life',
    description: 'Technology news, digital trends, and tech reviews',
    color: '#96CEB4',
    icon: '💻',
    subcategories: ['AI & Machine Learning', 'Web Development', 'Gadgets']
  },
  {
    id: 'creative',
    name: 'Creative & Arts',
    description: 'Art, design, creativity, and artistic expression',
    color: '#FFEAA7',
    icon: '🎨',
    subcategories: ['Design', 'Photography', 'Writing']
  },
  {
    id: 'education',
    name: 'Education & Learning',
    description: 'Educational content, tutorials, and learning resources',
    color: '#DDA0DD',
    icon: '📚',
    subcategories: ['Online Learning', 'Skills Development', 'Academic']
  },
  {
    id: 'travel',
    name: 'Travel & Adventure',
    description: 'Travel guides, adventure stories, and destination reviews',
    color: '#FFB6C1',
    icon: '✈️',
    subcategories: ['Travel Guides', 'Adventure Sports', 'Cultural Experiences']
  },
  {
    id: 'food',
    name: 'Food & Cooking',
    description: 'Recipes, cooking tips, and food experiences',
    color: '#F0E68C',
    icon: '🍳',
    subcategories: ['Recipes', 'Restaurant Reviews', 'Cooking Tips']
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Movies, TV, games, and entertainment content',
    color: '#FFB347',
    icon: '🎬',
    subcategories: ['Movies & TV', 'Gaming', 'Music']
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Miscellaneous content that doesn\'t fit other categories',
    color: '#D3D3D3',
    icon: '📝',
    subcategories: []
  }
];

// Enhanced Tags (Grouped by category for better organization)
export const TAG_GROUPS = {
  lifestyle: [
    'personal-development', 'relationships', 'family', 'parenting', 'home-decor',
    'organization', 'minimalism', 'self-care', 'hobbies', 'pets'
  ],
  health: [
    'fitness', 'nutrition', 'mental-health', 'wellness', 'medicine',
    'yoga', 'meditation', 'diet', 'exercise', 'healthcare'
  ],
  business: [
    'entrepreneurship', 'startups', 'marketing', 'finance', 'investing',
    'leadership', 'productivity', 'career', 'economics', 'strategy'
  ],
  tech: [
    'artificial-intelligence', 'machine-learning', 'web-development', 'mobile-apps',
    'cybersecurity', 'blockchain', 'data-science', 'programming', 'software', 'hardware'
  ],
  creative: [
    'design', 'photography', 'art', 'writing', 'music', 'creativity',
    'illustration', 'crafts', 'diy', 'fashion'
  ],
  education: [
    'learning', 'tutorials', 'online-courses', 'skills', 'training',
    'academic', 'research', 'teaching', 'knowledge', 'study-tips'
  ],
  travel: [
    'travel-guides', 'destinations', 'adventure', 'backpacking', 'luxury-travel',
    'budget-travel', 'culture', 'wanderlust', 'exploration', 'tourism'
  ],
  food: [
    'recipes', 'cooking', 'baking', 'restaurants', 'food-reviews',
    'healthy-eating', 'vegan', 'vegetarian', 'cuisine', 'beverages'
  ],
  entertainment: [
    'movies', 'tv-shows', 'gaming', 'music', 'books', 'sports',
    'celebrities', 'streaming', 'podcasts', 'reviews'
  ]
};

// Flatten all tags for backward compatibility
export const TAGS = [
  ...Object.values(TAG_GROUPS).flat(),
  // Additional general tags
  'trending', 'popular', 'featured', 'beginner-friendly', 'advanced',
  'tips', 'guide', 'tutorial', 'review', 'opinion', 'news', 'update'
];

// Enhanced Category Functions
export const getCategoryById = (id: string) => {
  return MAIN_CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryByName = (name: string) => {
  return MAIN_CATEGORIES.find(cat => cat.name === name);
};

export const getTagsByCategory = (categoryId: string): string[] => {
  return TAG_GROUPS[categoryId as keyof typeof TAG_GROUPS] || [];
};

// Validation Functions
export const validateCategory = (category: string): boolean => {
  return MAIN_CATEGORIES.some(cat => cat.name === category || cat.id === category);
};

export const validateTags = (tags: string[]): { valid: string[]; invalid: string[] } => {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  tags.forEach(tag => {
    if (TAGS.includes(tag)) {
      valid.push(tag);
    } else {
      invalid.push(tag);
    }
  });
  
  return { valid, invalid };
};

export const validateCustomInput = (input: string): {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
} => {
  if (!input || input.trim().length === 0) {
    return { isValid: false, error: 'Input cannot be empty' };
  }
  
  if (input.length > 50) {
    return { isValid: false, error: 'Input must be less than 50 characters' };
  }
  
  // Check for inappropriate content (basic check)
  const inappropriateWords = ['spam', 'adult', 'explicit'];
  if (inappropriateWords.some(word => input.toLowerCase().includes(word))) {
    return { isValid: false, error: 'Input contains inappropriate content' };
  }
  
  return { isValid: true };
};

// Enhanced Suggestion Functions
export const suggestTags = (title: string, description: string, category?: string): string[] => {
  const content = `${title} ${description}`.toLowerCase();
  const suggestions: string[] = [];
  
  // Get category-specific tags if category is provided
  if (category) {
    const categoryObj = getCategoryByName(category) || getCategoryById(category);
    if (categoryObj) {
      const categoryTags = getTagsByCategory(categoryObj.id);
      categoryTags.forEach(tag => {
        if (content.includes(tag.replace('-', ' ')) || content.includes(tag)) {
          suggestions.push(tag);
        }
      });
    }
  }
  
  // General tag suggestions
  const tagMappings: { [key: string]: string[] } = {
    'tips': ['tips', 'guide', 'tutorial'],
    'review': ['review', 'opinion'],
    'beginner': ['beginner-friendly'],
    'advanced': ['advanced'],
    'how to': ['tutorial', 'guide', 'tips'],
    'diy': ['diy', 'crafts'],
    'recipe': ['recipes', 'cooking'],
    'workout': ['fitness', 'exercise'],
    'money': ['finance', 'investing'],
    'startup': ['startups', 'entrepreneurship'],
    'ai': ['artificial-intelligence', 'machine-learning'],
    'travel': ['travel-guides', 'destinations'],
    'photo': ['photography'],
    'design': ['design', 'art']
  };
  
  Object.entries(tagMappings).forEach(([keyword, tags]) => {
    if (content.includes(keyword)) {
      tags.forEach(tag => {
        if (!suggestions.includes(tag) && TAGS.includes(tag)) {
          suggestions.push(tag);
        }
      });
    }
  });
  
  return suggestions.slice(0, 8); // Limit to 8 suggestions
};

export const suggestCategories = (title: string, description: string): string[] => {
  const content = `${title} ${description}`.toLowerCase();
  const suggestions: string[] = [];
  
  const categoryKeywords: { [key: string]: string[] } = {
    'Tech & Digital Life': ['tech', 'technology', 'software', 'app', 'digital', 'ai', 'programming', 'code'],
    'Health & Wellness': ['health', 'fitness', 'wellness', 'exercise', 'diet', 'medical', 'doctor'],
    'Business & Finance': ['business', 'money', 'finance', 'startup', 'entrepreneur', 'investment', 'career'],
    'Food & Cooking': ['food', 'recipe', 'cooking', 'restaurant', 'meal', 'kitchen', 'chef'],
    'Travel & Adventure': ['travel', 'trip', 'vacation', 'adventure', 'destination', 'journey'],
    'Creative & Arts': ['art', 'design', 'creative', 'photography', 'music', 'painting', 'craft'],
    'Education & Learning': ['education', 'learning', 'tutorial', 'course', 'study', 'teach', 'school'],
    'Lifestyle': ['lifestyle', 'personal', 'life', 'daily', 'home', 'family', 'relationship'],
    'Entertainment': ['movie', 'game', 'entertainment', 'fun', 'show', 'music', 'book', 'review']
  };
  
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    if (keywords.some(keyword => content.includes(keyword))) {
      suggestions.push(category);
    }
  });
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
};

// Custom Category Creation (for future expansion)
export const createCustomCategory = (name: string, description: string, color?: string) => {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    description,
    color: color || '#D3D3D3',
    icon: '📝',
    subcategories: []
  };
};

// Analytics Helpers
export const getCategoryStats = (blogs: any[]) => {
  const stats: { [key: string]: number } = {};
  
  MAIN_CATEGORIES.forEach(category => {
    stats[category.name] = blogs.filter(blog => blog.category === category.name).length;
  });
  
  return stats;
};

export const getTagStats = (blogs: any[]) => {
  const stats: { [key: string]: number } = {};
  
  blogs.forEach(blog => {
    if (blog.tags && Array.isArray(blog.tags)) {
      blog.tags.forEach((tag: string) => {
        stats[tag] = (stats[tag] || 0) + 1;
      });
    }
  });
  
  return Object.entries(stats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20) // Top 20 tags
    .reduce((obj, [tag, count]) => {
      obj[tag] = count;
      return obj;
    }, {} as { [key: string]: number });
};

// Search and Filter Helpers
export const filterBlogsByCategory = (blogs: any[], category: string) => {
  return blogs.filter(blog => blog.category === category);
};

export const filterBlogsByTags = (blogs: any[], tags: string[]) => {
  return blogs.filter(blog => 
    blog.tags && Array.isArray(blog.tags) && 
    tags.some(tag => blog.tags.includes(tag))
  );
};

export const searchBlogsInCategory = (blogs: any[], query: string, category?: string) => {
  let filteredBlogs = category ? filterBlogsByCategory(blogs, category) : blogs;
  
  return filteredBlogs.filter(blog =>
    blog.title.toLowerCase().includes(query.toLowerCase()) ||
    blog.description.toLowerCase().includes(query.toLowerCase()) ||
    (blog.tags && blog.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase())))
  );
};
