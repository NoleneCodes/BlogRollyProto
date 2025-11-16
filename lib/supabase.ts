import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required');
}

if (!supabaseAnonKey) {
  throw new Error('supabaseAnonKey is required');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types and Enums (Enhanced)
export type UserRole = 'reader' | 'blogger' | 'admin' | 'super_admin' | 'investor';
export type UserTier = 'free' | 'basic' | 'premium' | 'enterprise';
export type BlogStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'live' | 'archived';
export type RejectionReason = 'inappropriate_content' | 'spam' | 'low_quality' | 'copyright_violation' | 'terms_violation' | 'adult_content_unmarked' | 'broken_link' | 'duplicate_content' | 'other';

// Enhanced Interfaces
export interface BlogSubmission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  url: string;
  image_url?: string;
  image_description?: string;
  category: string;
  tags: string[];
  status: BlogStatus;
  has_adult_content: boolean;
  is_live: boolean;
  views: number;
  clicks: number;
  ctr: number;
  bounce_rate?: number;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  rejected_at?: string;
  live_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  last_accessed_at?: string;
  slug?: string;
  featured?: boolean;
  reading_time?: number;
  social_shares?: number;
  search_vector?: string;
  requires_domain_verification?: boolean;
  url_change_reason?: string;
  image_type?: 'url' | 'upload';
  image_file_path?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  date_of_birth: string;
  age_verified: boolean;
  has_confirmed_18_plus: boolean;
  role: UserRole;
  tier: UserTier;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  email_notifications?: boolean;
  privacy_settings?: {
    profile_public: boolean;
    show_reading_history: boolean;
  };
  last_activity_at?: string;
  categories?: string[];
  tags?: string[];
  engagement_history?: {
    tagClicks: Record<string, number>;
    categoryClicks: Record<string, number>;
  };
}

export interface BloggerProfile {
  id: string;
  user_id: string;
  blog_url: string;
  blog_name: string;
  blog_description?: string;
  categories?: string[];
  social_links?: Record<string, string>;
  is_verified: boolean;
  stripe_customer_id?: string;
  subscription_status?: string;
  subscription_end_date?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  domain_verification_status?: 'pending' | 'verified' | 'failed' | 'expired';
  domain_verification_token?: string;
  domain_verification_method?: 'txt_record' | 'html_file' | 'meta_tag';
  domain_verified_at?: string;
  domain_last_check?: string;
  subscription_plan?: string;
  stripe_subscription_id?: string;
}

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  last_activity_at?: string;
  email_verified: boolean;
  is_active: boolean;
  first_name?: string;
  surname?: string;
  display_name?: string;
  username?: string;
}

// Enhanced Query Functions
export const optimizedQueries = {
  // Get active blogs with enhanced performance
  async getActiveBlogs(options: {
    limit?: number;
    offset?: number;
    category?: string;
    featured?: boolean;
    tags?: string[];
  } = {}) {
    const { limit = 20, offset = 0, category, featured, tags } = options;
    
    let query = supabase
      .from('blog_submissions')
      .select(`
        id, title, description, url, image_url, image_description, category, tags,
        views, clicks, ctr, created_at, live_at, slug, reading_time, featured, social_shares,
        users:user_id (username, display_name, first_name, surname),
        user_profiles:user_id (avatar_url),
        blogger_profiles:user_id (blog_name, blog_url, is_verified)
      `)
      .eq('is_live', true)
      .eq('status', 'live')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (featured !== undefined) {
      query = query.eq('featured', featured);
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  // Get blog analytics with performance optimization
  async getBlogAnalytics(blogId?: string) {
    let query = supabase
      .from('blog_submissions')
      .select('id, title, user_id, category, views, clicks, ctr, social_shares, created_at, live_at, featured')
      .is('deleted_at', null);

    if (blogId) {
      query = query.eq('id', blogId);
      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get user blog summary with enhanced metrics
  async getUserBlogSummary(userId: string) {
    const { data, error } = await supabase
      .from('blog_submissions')
      .select('id, status, is_live, featured, views, clicks, ctr, social_shares')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) throw error;

    const summary = {
      totalBlogs: data.length,
      liveBlogs: data.filter(b => b.is_live).length,
      featuredBlogs: data.filter(b => b.featured).length,
      draftBlogs: data.filter(b => b.status === 'draft').length,
      totalViews: data.reduce((sum, b) => sum + (b.views || 0), 0),
      totalClicks: data.reduce((sum, b) => sum + (b.clicks || 0), 0),
      totalShares: data.reduce((sum, b) => sum + (b.social_shares || 0), 0),
      avgCtr: data.length > 0 ? data.reduce((sum, b) => sum + (b.ctr || 0), 0) / data.length : 0
    };

    return summary;
  },

  // Get trending blogs based on engagement
  async getTrendingBlogs(daysBack = 7, limit = 20) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    const { data, error } = await supabase
      .from('blog_submissions')
      .select(`
        id, title, views, clicks, social_shares, created_at, live_at,
        users:user_id (username, display_name),
        user_profiles:user_id (avatar_url),
        blogger_profiles:user_id (is_verified)
      `)
      .eq('is_live', true)
      .eq('status', 'live')
      .is('deleted_at', null)
      .gte('live_at', dateThreshold.toISOString())
      .order('views', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Calculate engagement score
    return data.map(blog => ({
      ...blog,
      engagementScore: (blog.views || 0) * 0.6 + (blog.clicks || 0) * 2.0 + (blog.social_shares || 0) * 3.0
    })).sort((a, b) => b.engagementScore - a.engagementScore);
  }
};

// Analytics Helper Functions
export const analytics = {
  // Track blog view
  async trackBlogView(blogId: string, userId?: string) {
    try {
      // Insert view event
      if (userId) {
        await supabase.from('blog_view_events').insert({
          blog_submission_id: blogId,
          user_id: userId
        });
      }

      // Increment view count
      const { error } = await supabase.rpc('increment_blog_views', { blog_id: blogId });
      if (error) throw error;
    } catch (error) {
      console.error('Error tracking blog view:', error);
    }
  },

  // Track blog click
  async trackBlogClick(blogId: string, userId?: string) {
    try {
      // Insert click event
      if (userId) {
        await supabase.from('blog_click_events').insert({
          blog_submission_id: blogId,
          user_id: userId
        });
      }

      // Increment click count and update CTR
      const { error } = await supabase.rpc('increment_blog_clicks', { blog_id: blogId });
      if (error) throw error;
    } catch (error) {
      console.error('Error tracking blog click:', error);
    }
  },

  // Track social share
  async trackSocialShare(blogId: string, platform: string) {
    try {
      const { error } = await supabase
        .from('blog_submissions')
        .update({ 
          social_shares: supabase.sql`COALESCE(social_shares, 0) + 1`,
          updated_at: new Date().toISOString()
        })
        .eq('id', blogId);

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking social share:', error);
    }
  }
};

// Search Functions
export const search = {
  // Enhanced blog search with full-text capabilities
  async searchBlogs(query: string, options: {
    category?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  } = {}) {
    const { category, tags, limit = 20, offset = 0 } = options;

    let dbQuery = supabase
      .from('blog_submissions')
      .select(`
        id, title, description, url, image_url, category, tags, views, clicks,
        created_at, live_at, slug, reading_time, featured, social_shares,
        users:user_id (username, display_name),
        user_profiles:user_id (avatar_url),
        blogger_profiles:user_id (blog_name, is_verified)
      `)
      .eq('is_live', true)
      .eq('status', 'live')
      .is('deleted_at', null)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('views', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    if (tags && tags.length > 0) {
      dbQuery = dbQuery.overlaps('tags', tags);
    }

    const { data, error } = await dbQuery;
    if (error) throw error;
    return data;
  },

  // Search with analytics tracking
  async searchWithTracking(query: string, userId?: string, options = {}) {
    // Track search
    if (userId) {
      try {
        await supabase.from('search_analytics').insert({
          search_query: query,
          search_type: 'keyword',
          user_id: userId
        });
      } catch (error) {
        console.error('Error tracking search:', error);
      }
    }

    return this.searchBlogs(query, options);
  }
};

// User Management Functions
export const userManagement = {
  // Get complete user profile
  async getCompleteUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles (*),
        blogger_profiles (*),
        reader_profiles (*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user activity timestamp
  async updateUserActivity(userId: string) {
    try {
      await supabase
        .from('user_profiles')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }
};

// Export default client
export default supabase;
