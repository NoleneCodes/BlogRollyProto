export interface InternalBlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  publishDate: string;
  lastModified: string;
  isPublished: boolean;
  category: string;
  tags: string[];
  imageUrl?: string;
  readTimeMinutes: number;
}

export interface ContentImage {
  id: string;
  url: string;
  description: string;
  position: number;
}

// Mock data for internal blog posts
// This would typically come from your database

const mockInternalBlogPosts: InternalBlogPost[] = [
  {
    id: '1',
    title: 'Welcome to BlogRolly',
    slug: 'welcome-to-blogrolly',
    description: 'Learn about our mission to make quality content discovery easier.',
    content: `
# Welcome to BlogRolly

BlogRolly is revolutionizing how people discover quality independent content online. Our platform connects readers with authentic voices and helps bloggers reach engaged audiences.

## Our Mission

We believe that the best content often comes from independent creators who are passionate about their subjects. Our goal is to make it easier for readers to find this content while helping bloggers grow their audience.

## How It Works

1. **Quality Control**: Every blog submission is reviewed by our team
2. **Categorization**: Content is organized into relevant categories
3. **Discovery**: Readers can easily find content that matches their interests
4. **Community**: We foster connections between readers and creators

Join us in building a better content discovery experience!
    `,
    author: 'BlogRolly Team',
    publishDate: '2025-01-25T00:00:00Z',
    lastModified: '2025-01-25T00:00:00Z',
    isPublished: true,
    category: 'Platform Updates',
    tags: ['welcome', 'platform', 'mission'],
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
    readTimeMinutes: 3
  }
];

export function getAllInternalBlogPosts(): InternalBlogPost[] {
  return mockInternalBlogPosts;
}

export function getInternalBlogPostById(id: string): InternalBlogPost | null {
  return mockInternalBlogPosts.find(post => post.id === id) || null;
}

export function getInternalBlogPostBySlug(slug: string): InternalBlogPost | null {
  return mockInternalBlogPosts.find(post => post.slug === slug) || null;
}

export function createInternalBlogPost(post: Omit<InternalBlogPost, 'id' | 'lastModified'>): boolean {
  const newPost: InternalBlogPost = {
    ...post,
    id: Math.random().toString(36).substr(2, 9),
    lastModified: new Date().toISOString()
  };
  mockInternalBlogPosts.push(newPost);
  return true;
}

export function updateInternalBlogPost(id: string, updates: Partial<InternalBlogPost>): boolean {
  const index = mockInternalBlogPosts.findIndex(post => post.id === id);
  if (index === -1) return false;

  mockInternalBlogPosts[index] = {
    ...mockInternalBlogPosts[index],
    ...updates,
    lastModified: new Date().toISOString()
  };
  return true;
}

export function deleteInternalBlogPost(id: string): boolean {
  const index = mockInternalBlogPosts.findIndex(post => post.id === id);
  if (index === -1) return false;

  mockInternalBlogPosts.splice(index, 1);
  return true;
}