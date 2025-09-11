import type { NextApiRequest, NextApiResponse } from 'next';

const mockBlogSubmissions = [
  {
    id: 'BLOG-001',
    title: 'How to Grow Your Blog Audience',
    author: 'Jane Doe',
    status: 'pending',
    submittedAt: '2025-09-01',
    url: 'https://blogrolly.com/blog/how-to-grow-your-audience'
  },
  {
    id: 'BLOG-002',
    title: '10 Tips for Better Content',
    author: 'John Smith',
    status: 'approved',
    submittedAt: '2025-08-28',
    url: 'https://blogrolly.com/blog/10-tips-better-content'
  },
  {
    id: 'BLOG-003',
    title: 'SEO Basics for Bloggers',
    author: 'Emily Chen',
    status: 'rejected',
    submittedAt: '2025-08-15',
    url: 'https://blogrolly.com/blog/seo-basics'
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(mockBlogSubmissions);
}
