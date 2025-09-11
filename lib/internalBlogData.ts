export interface InternalBlogPost {
  id: string;
  title: string;
  author: string;
  authorProfile: string;
  bloggerId: string;
  bloggerDisplayName: string;
  description: string;
  category: string;
  tags: string[];
  slug: string;
  imageUrl: string;
  imageDescription?: string;
  readTime: string;
  publishDate: string;
  isPublished: boolean;
  content: string;
  contentImages?: ContentImage[];
}

export interface ContentImage {
  id: string;
  url: string;
  description: string;
  position: number;
}

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// One mock blog post for testing

export const getInternalBlogPosts = async (): Promise<InternalBlogPost[]> => {
  const { data, error } = await supabase
    .from('internal_blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('publish_date', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getAllInternalBlogPosts = async (): Promise<InternalBlogPost[]> => {
  const { data, error } = await supabase
    .from('internal_blog_posts')
    .select('*')
    .order('publish_date', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getInternalBlogPostBySlug = async (slug: string): Promise<InternalBlogPost | null> => {
  const { data, error } = await supabase
    .from('internal_blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data || null;
};

export const addInternalBlogPost = async (post: Omit<InternalBlogPost, 'id'>): Promise<InternalBlogPost | null> => {
  const id = uuidv4();
  const { data, error } = await supabase
    .from('internal_blog_posts')
    .insert([{ ...post, id }])
    .select()
    .single();
  if (error) throw error;
  return data || null;
};

export const updateInternalBlogPost = async (id: string, updates: Partial<InternalBlogPost>): Promise<InternalBlogPost | null> => {
  const { data, error } = await supabase
    .from('internal_blog_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data || null;
};

export const deleteInternalBlogPost = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('internal_blog_posts')
    .delete()
    .eq('id', id);
  if (error) return false;
  return true;
};