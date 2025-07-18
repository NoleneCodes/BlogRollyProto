
export interface InternalBlogPost {
  id: string;
  title: string;
  author: string;
  authorProfile?: string;
  bloggerId: string;
  bloggerDisplayName: string;
  description: string;
  category: string;
  tags: string[];
  slug: string; // For internal URL like /blog/post/slug
  imageUrl?: string;
  readTime?: string;
  publishDate: string;
  isPublished: boolean;
  content?: string; // Full blog content
}

// Sample internal blog posts
let internalBlogPosts: InternalBlogPost[] = [
  {
    id: '1',
    title: 'Welcome to BlogRolly',
    author: 'BlogRolly Team',
    authorProfile: '/about',
    bloggerId: 'admin',
    bloggerDisplayName: 'BlogRolly Team',
    description: 'Learn about our mission to support independent bloggers and create a thriving community of authentic voices.',
    category: 'Platform Updates',
    tags: ['announcement', 'community', 'blogging'],
    slug: 'welcome-to-blogrolly',
    imageUrl: '/replit.svg',
    readTime: '3 min read',
    publishDate: '2024-01-15',
    isPublished: true,
    content: 'Full blog content here...'
  },
  {
    id: '2',
    title: 'Building Authentic Communities',
    author: 'BlogRolly Team',
    authorProfile: '/about',
    bloggerId: 'admin',
    bloggerDisplayName: 'BlogRolly Team',
    description: 'Discover how we\'re fostering genuine connections between bloggers and readers in the digital age.',
    category: 'Community',
    tags: ['community', 'authentic', 'connection'],
    slug: 'building-authentic-communities',
    imageUrl: '/replit.svg',
    readTime: '5 min read',
    publishDate: '2024-01-12',
    isPublished: true,
    content: 'Full blog content here...'
  },
  {
    id: '3',
    title: 'The Future of Independent Blogging',
    author: 'BlogRolly Team',
    authorProfile: '/about',
    bloggerId: 'admin',
    bloggerDisplayName: 'BlogRolly Team',
    description: 'Exploring how technology and community can empower independent voices in the digital landscape.',
    category: 'Vision',
    tags: ['future', 'independent', 'technology'],
    slug: 'future-of-independent-blogging',
    imageUrl: '/replit.svg',
    readTime: '7 min read',
    publishDate: '2024-01-10',
    isPublished: true,
    content: 'Full blog content here...'
  }
];

export const getInternalBlogPosts = (): InternalBlogPost[] => {
  return internalBlogPosts.filter(post => post.isPublished);
};

export const getAllInternalBlogPosts = (): InternalBlogPost[] => {
  return internalBlogPosts;
};

export const getInternalBlogPostBySlug = (slug: string): InternalBlogPost | null => {
  return internalBlogPosts.find(post => post.slug === slug) || null;
};

export const addInternalBlogPost = (post: Omit<InternalBlogPost, 'id'>): InternalBlogPost => {
  const newPost: InternalBlogPost = {
    ...post,
    id: Date.now().toString(),
  };
  internalBlogPosts.push(newPost);
  return newPost;
};

export const updateInternalBlogPost = (id: string, updates: Partial<InternalBlogPost>): InternalBlogPost | null => {
  const index = internalBlogPosts.findIndex(post => post.id === id);
  if (index === -1) return null;
  
  internalBlogPosts[index] = { ...internalBlogPosts[index], ...updates };
  return internalBlogPosts[index];
};

export const deleteInternalBlogPost = (id: string): boolean => {
  const index = internalBlogPosts.findIndex(post => post.id === id);
  if (index === -1) return false;
  
  internalBlogPosts.splice(index, 1);
  return true;
};
