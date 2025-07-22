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
    imageUrl: undefined,
    readTime: '3 min read',
    publishDate: '2024-01-15',
    isPublished: true,
    content: `
      <h2>Welcome to BlogRolly - Where Independent Voices Thrive</h2>
      <p>We're excited to welcome you to BlogRolly, a revolutionary platform designed specifically for independent bloggers who are passionate about sharing their authentic voices with the world.</p>

      <h3>Our Mission</h3>
      <p>At BlogRolly, we believe that every independent blogger deserves to be seen, heard, and supported. Our mission is to create a thriving community where authentic voices can flourish without the noise and algorithms of traditional social media platforms.</p>

      <h3>What Makes BlogRolly Different</h3>
      <ul>
        <li><strong>Curated Quality:</strong> We focus on quality over quantity, featuring blogs that offer genuine value and authentic perspectives.</li>
        <li><strong>Community-First:</strong> Our platform is built around supporting bloggers and connecting them with readers who truly appreciate their work.</li>
        <li><strong>Independent Focused:</strong> We celebrate independent voices and provide tools specifically designed for solo creators and small teams.</li>
      </ul>

      <h3>Join Our Growing Community</h3>
      <p>Whether you're a seasoned blogger or just starting your journey, BlogRolly is here to support you. Join thousands of independent creators who are already part of our community and discover the difference that genuine support can make.</p>

      <p>Ready to get started? <a href="/auth">Sign up today</a> and become part of the BlogRolly family!</p>
    `
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
    imageUrl: undefined,
    readTime: '5 min read',
    publishDate: '2024-01-12',
    isPublished: true,
    content: `
      <h2>Building Authentic Communities in the Digital Age</h2>
      <p>In an era dominated by algorithm-driven feeds and fleeting content, building genuine communities has become both more challenging and more crucial than ever.</p>

      <h3>The Challenge of Digital Connection</h3>
      <p>Traditional social media platforms often prioritize engagement metrics over meaningful connections. This creates an environment where sensational content thrives while thoughtful, authentic voices struggle to be heard.</p>

      <h3>Our Approach to Community Building</h3>
      <p>At BlogRolly, we're taking a different approach:</p>
      <ul>
        <li><strong>Quality Curation:</strong> We carefully review and curate content to ensure it meets our standards for authenticity and value.</li>
        <li><strong>Meaningful Interactions:</strong> Our platform encourages thoughtful engagement rather than quick likes and shares.</li>
        <li><strong>Supporting Creators:</strong> We provide tools and resources that help bloggers grow their authentic audience.</li>
      </ul>

      <h3>The Power of Authentic Voices</h3>
      <p>When independent bloggers have the right platform and support, they can create profound impact. We've seen our community members build loyal readerships, launch successful projects, and even change lives through their authentic storytelling.</p>

      <h3>Join the Movement</h3>
      <p>Building authentic communities requires participation from both creators and readers. Whether you're sharing your story or supporting others, every interaction contributes to a more genuine digital ecosystem.</p>
    `
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
    imageUrl: undefined,
    readTime: '7 min read',
    publishDate: '2024-01-10',
    isPublished: true,
    content: `
      <h2>The Future of Independent Blogging: A New Era of Authentic Content</h2>
      <p>The landscape of digital content is rapidly evolving, and independent blogging is positioned to play a crucial role in shaping the future of online discourse.</p>

      <h3>Current State of Digital Content</h3>
      <p>Today's content ecosystem is dominated by:</p>
      <ul>
        <li>Algorithm-driven platforms that prioritize engagement over quality</li>
        <li>Corporate content that often lacks personal touch</li>
        <li>Information overload that makes discovery difficult</li>
      </ul>

      <h3>The Independent Advantage</h3>
      <p>Independent bloggers offer something unique:</p>
      <ul>
        <li><strong>Authenticity:</strong> Personal experiences and genuine perspectives</li>
        <li><strong>Niche Expertise:</strong> Deep knowledge in specific areas</li>
        <li><strong>Community Connection:</strong> Direct relationships with readers</li>
        <li><strong>Creative Freedom:</strong> Ability to explore topics without corporate constraints</li>
      </ul>

      <h3>Technology as an Enabler</h3>
      <p>Modern technology is making it easier than ever for independent creators to:</p>
      <ul>
        <li>Create professional-quality content</li>
        <li>Reach global audiences</li>
        <li>Monetize their expertise</li>
        <li>Build sustainable businesses</li>
      </ul>

      <h3>BlogRolly's Role in This Future</h3>
      <p>We're building tools and community features that will help independent bloggers thrive:</p>
      <ul>
        <li>Enhanced discovery mechanisms</li>
        <li>Community building tools</li>
        <li>Monetization support</li>
        <li>Analytics and growth insights</li>
      </ul>

      <h3>Looking Ahead</h3>
      <p>The future belongs to creators who can combine authentic storytelling with smart technology use. Independent bloggers who embrace this combination will find unprecedented opportunities to build meaningful audiences and sustainable businesses.</p>

      <p>Join us in shaping this future. The independent blogging revolution starts now.</p>
    `
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