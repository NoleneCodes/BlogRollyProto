
export const MAIN_CATEGORIES = [
  'Lifestyle',
  'Health & Wellness',
  'Culture & Society',
  'Tech & Digital Life',
  'Creative Expression',
  'Work & Money',
  'Education & Learning',
  'Relationships & Emotions',
  'Art & Media',
  'Home & Garden',
  'Food & Drink',
  'Travel & Places',
  'Identity & Intersectionality',
  'Spirituality & Inner Work',
  'Opinion & Commentary',
  'Other'
];

// Utility function to validate custom category/tag input (max 3 words)
export const validateCustomInput = (input: string): { isValid: boolean; error?: string } => {
  if (!input.trim()) {
    return { isValid: false, error: 'Please enter your custom category/tag' };
  }
  
  const words = input.trim().split(/\s+/);
  if (words.length > 3) {
    return { isValid: false, error: 'Maximum 3 words allowed' };
  }
  
  if (input.length > 50) {
    return { isValid: false, error: 'Maximum 50 characters allowed' };
  }
  
  return { isValid: true };
};

// Function to format custom input (capitalize first letter of each word)
export const formatCustomInput = (input: string): string => {
  return input.trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to extract custom categories from a list
export const getCustomCategories = (categories: string[]): string[] => {
  return categories.filter(cat => cat.startsWith('custom:'));
};

// Helper function to get display text for custom categories
export const getCustomCategoryDisplay = (customCategory: string): string => {
  return customCategory.replace('custom:', '');
};

// Helper function to create custom category string
export const createCustomCategory = (input: string): string => {
  return `custom:${formatCustomInput(input)}`;
};

export const TAGS = {
  'Themes & Topics': [
    'Mental Health', 'Self-Care', 'Productivity', 'Feminism', 'Queer Experience',
    'Black Joy', 'Ancestral Healing', 'Decolonization', 'Digital Minimalism',
    'Burnout Recovery', 'Entrepreneurship', 'Diaspora Life', 'Spiritual Practices',
    'Financial Literacy', 'Personal Growth', 'Tech for Good', 'Neurodivergence',
    'Motherhood', 'Body Image', 'Healing Justice', 'Climate & Ecology',
    'Herbalism', 'Relationships', 'Grief', 'Joy', 'Education Reform',
    'Activism', 'Sensuality', 'Conscious Living', 'Food Sovereignty',
    'Solo Travel', 'Ethical Consumption', 'Language & Identity', 'Book Reviews',
    'Film Criticism', 'Indie Publishing', 'Developer Life', 'Design Thinking',
    'Open Source', 'Minimalist Living', 'Mindful Parenting', 'Student Life',
    'Street Culture', 'AfroFuturism', 'Slow Fashion', 'Unschooling',
    'Sex Positivity', 'AI Reflections', 'Coding in Public', 'Personal Finance',
    'Freelance Tips', 'Sustainable Living', 'Home Projects', 'Permaculture',
    'Gardening', 'Beauty & Skincare', 'Journalism', 'Local Stories',
    'Tech Trends', 'Intimacy', 'Zine Culture', 'Religious Identity',
    'Addiction & Recovery', 'Chronic Illness', 'Other'
  ],
  'Structure / Format': [
    'Listicle', 'Longform Essay', 'Personal Diary', 'Photo Essay', 'Letter',
    'Manifesto', 'Interview', 'Tutorial', 'Poem', 'Short Story', 'Q&A',
    'Open Thread', 'Roundup', 'Resource Guide', 'Commentary', 'Thought Piece',
    'Audio Journal', 'Microblog', 'Illustrated Piece', 'Visual Essay',
    'Thread Dump', 'Journal Entry', 'Other'
  ],
  'Vibe / Tone': [
    'Vulnerable', 'Funny', 'Educational', 'Chill', 'Angry', 'Empowering',
    'Comforting', 'Provocative', 'Uplifting', 'Raw & Unfiltered', 'Philosophical',
    'Meditative', 'Sarcastic', 'Loving', 'Analytical', 'Dreamy', 'Manifesting',
    'Deep Dive', 'Reflective', 'Activist', 'Spiritual', 'Poetic', 'Other'
  ],
  'Intended Audience': [
    'For Creatives', 'For Founders', 'For Parents', 'For Coders', 'For Students',
    'For Readers', 'For Black Women', 'For the Diaspora', 'For Queer Folks',
    'For Neurodivergents', 'For Healers', 'For Side Hustlers', 'For Burnt-Out People',
    'For the Culture', 'For Survivors', 'For Book Lovers', 'For Poets',
    'For Makers', 'For Beginners', 'For the Overwhelmed', 'Other'
  ],
  'Content Filters': [
    'Evergreen', 'Trending', 'Monthly Highlight', 'Seasonal', 'Archive Gem',
    'Hot Take', 'Experimental', 'Series Part', 'Collaboration', 'Anonymous',
    'Sponsored', 'Debut Blog', 'Staff Pick', 'Reader Pick', 'Other'
  ]
};

// Reader topic options for AuthForm
export const READER_TOPIC_OPTIONS = [
  'Culture & Society', 'Travel', 'Health & Wellness', 'Feminism', 'Tech', 
  'Homesteading', 'Books & Media', 'Money & Work', 'Spirituality', 
  'Creativity', 'Relationships', 'Food', 'Learning', 'Society & Politics', 'Other'
];

// All topic tags for reader profile
export const TOPIC_TAGS = [
  'Mental Health', 'Self-Care', 'Productivity', 'Feminism', 'Queer Experience',
  'Black Joy', 'Ancestral Healing', 'Decolonization', 'Digital Minimalism',
  'Burnout Recovery', 'Entrepreneurship', 'Diaspora Life', 'Spiritual Practices',
  'Financial Literacy', 'Personal Growth', 'Tech for Good', 'Neurodivergence',
  'Motherhood', 'Body Image', 'Healing Justice', 'Climate & Ecology',
  'Herbalism', 'Relationships', 'Grief', 'Joy', 'Education Reform',
  'Activism', 'Sensuality', 'Conscious Living', 'Food Sovereignty',
  'Solo Travel', 'Ethical Consumption', 'Language & Identity', 'Book Reviews',
  'Film Criticism', 'Indie Publishing', 'Developer Life', 'Design Thinking',
  'Open Source', 'Minimalist Living', 'Mindful Parenting', 'Student Life',
  'Street Culture', 'AfroFuturism', 'Slow Fashion', 'Unschooling',
  'Sex Positivity', 'AI Reflections', 'Coding in Public', 'Personal Finance',
  'Freelance Tips', 'Sustainable Living', 'Home Projects', 'Permaculture',
  'Gardening', 'Beauty & Skincare', 'Journalism', 'Local Stories',
  'Tech Trends', 'Intimacy', 'Zine Culture', 'Religious Identity',
  'Addiction & Recovery', 'Chronic Illness'
];
