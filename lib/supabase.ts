// Supabase configuration and client setup
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types and Enums
export type UserRole = 'reader' | 'blogger' | 'admin' | 'moderator';
export type UserTier = 'free' | 'pro';
export type BlogStatus = 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'live' | 'inactive';
export type RejectionReason = 
  | 'inappropriate_content'
  | 'broken_link' 
  | 'spam'
  | 'teaser_paywall'
  | 'malicious_site'
  | 'not_a_blog'
  | 'duplicate'
  | 'ai_generated_low_quality'
  | 'copyright_violation';

// User Management Tables
export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  is_active: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string; // FK to User
  first_name: string;
  surname: string;
  display_name?: string;
  username?: string;
  date_of_birth: string;
  age_verified: boolean; // Primary age verification at signup
  has_confirmed_18_plus?: boolean; // Secondary age-gate for 18+ content access
  role: UserRole;
  tier: UserTier;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface ReaderProfile {
  id: string;
  user_id: string; // FK to User
  topics: string[];
  other_topic?: string;
  subscribe_to_updates: boolean;
  created_at: string;
  updated_at: string;
}

export interface BloggerProfile {
  id: string;
  user_id: string; // FK to User
  blog_url: string;
  blog_name: string;
  blog_description?: string;
  categories: string[];
  social_links?: Record<string, string>;
  monetization_methods?: string[];
  audience_size?: string;
  is_verified: boolean; // Blog ownership verification
  stripe_customer_id?: string;
  subscription_status?: 'active' | 'canceled' | 'past_due';
  subscription_end_date?: string;
  last_url_change?: string; // Date of last URL change
  url_changes_count: number; // Total number of URL changes
  created_at: string;
  updated_at: string;
}

// Blog Content Tables
export interface BlogSubmission {
  id: string;
  user_id: string; // FK to User (blogger)
  title: string;
  description: string;
  url: string;
  image_url?: string;
  category: string;
  tags: string[];
  status: BlogStatus;
  has_adult_content: boolean; // 18+ flag
  is_live: boolean; // Whether the post is currently live (for tier limits)

  // Analytics
  views: number;
  clicks: number;
  ctr?: number;
  avg_time_on_page?: number;
  bounce_rate?: number;

  // Timestamps
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  rejected_at?: string;
  live_at?: string;
  created_at: string;
  updated_at: string;
}

// Adult Content Separate Table (for 18+ posts)
export interface AdultBlogSubmission {
  id: string;
  blog_submission_id: string; // FK to BlogSubmission
  content_warnings: string[];
  age_verification_required: boolean;
  created_at: string;
}

// Admin/Moderation Tables
export interface BlogReview {
  id: string;
  blog_submission_id: string; // FK to BlogSubmission
  reviewer_id: string; // FK to User (admin/moderator)
  action: 'approved' | 'rejected';
  rejection_reason?: RejectionReason;
  rejection_note?: string; // Optional custom note
  internal_notes?: string; // Private admin notes
  created_at: string;
}

// User Tier Limits & Tracking
export interface UserTierLimits {
  id: string;
  user_id: string; // FK to User
  tier: UserTier;
  max_live_posts: number; // 3 for free, unlimited for pro
  current_live_posts: number;
  total_approved_posts: number;
  updated_at: string;
}

// Blog URL Change History
export interface BlogUrlChangeHistory {
  id: string;
  user_id: string; // FK to User
  old_url: string;
  new_url: string;
  change_reason?: string;
  changed_at: string;
  created_at: string;
}

// Email Notifications Queue
export interface EmailQueue {
  id: string;
  user_id: string; // FK to User
  email_type: 'blog_approved' | 'blog_rejected' | 'blog_submitted' | 'tier_upgrade';
  template_data: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

// Real Supabase authentication functions
export const supabaseAuth = {
  signUp: async (email: string, password: string, metadata: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return { data };
  }
};

export const supabaseDB = {
  // User Management
  insertUser: async (userData: any) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();
    return { data, error };
  },

  insertUserProfile: async (profileData: UserProfile) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select();
    return { data, error };
  },

  updateAgeVerification: async (userId: string, ageVerified: boolean, confirmed18Plus?: boolean) => {
    const updateData: any = { age_verified: ageVerified };
    if (confirmed18Plus !== undefined) {
      updateData.has_confirmed_18_plus = confirmed18Plus;
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select();
    return { data, error };
  },

  // Blog Submissions
  insertBlogSubmission: async (submissionData: BlogSubmission) => {
    const { data, error } = await supabase
      .from('blog_submissions')
      .insert([submissionData])
      .select();
    return { data, error };
  },

  insertAdultBlogSubmission: async (adultContentData: AdultBlogSubmission) => {
    const { data, error } = await supabase
      .from('adult_blog_submissions')
      .insert([adultContentData])
      .select();
    return { data, error };
  },

  getUserSubmissions: async (userId: string) => {
    const { data, error } = await supabase
      .from('blog_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  getSubmissionsByStatus: async (status: BlogStatus) => {
    const { data, error } = await supabase
      .from('blog_submissions')
      .select(`
        *,
        user_profiles!inner(first_name, surname, tier)
      `)
      .eq('status', status)
      .order('submitted_at', { ascending: false });
    return { data, error };
  },

  getPendingSubmissionsForReview: async () => {
    const { data, error } = await supabase
      .from('blog_submissions')
      .select(`
        *,
        user_profiles!inner(first_name, surname, tier),
        blog_reviews(*)
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });
    return { data, error };
  },

  // Admin/Moderation Functions
  updateSubmissionStatus: async (submissionId: string, status: BlogStatus, reviewerId: string) => {
    const updateData: any = { status };
    
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
      updateData.reviewed_at = new Date().toISOString();
    } else if (status === 'rejected') {
      updateData.rejected_at = new Date().toISOString();
      updateData.reviewed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('blog_submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select();
    return { data, error };
  },

  insertBlogReview: async (reviewData: BlogReview) => {
    const { data, error } = await supabase
      .from('blog_reviews')
      .insert([reviewData])
      .select();
    return { data, error };
  },

  approveBlogSubmission: async (submissionId: string, reviewerId: string) => {
    try {
      // Update submission status
      const { error: updateError } = await supabase
        .from('blog_submissions')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      // Insert review record
      const { error: reviewError } = await supabase
        .from('blog_reviews')
        .insert([{
          blog_submission_id: submissionId,
          reviewer_id: reviewerId,
          action: 'approved'
        }]);

      if (reviewError) throw reviewError;

      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  rejectBlogSubmission: async (submissionId: string, reviewerId: string, reason: RejectionReason, note?: string) => {
    try {
      // Update submission status
      const { error: updateError } = await supabase
        .from('blog_submissions')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      // Insert review record
      const { error: reviewError } = await supabase
        .from('blog_reviews')
        .insert([{
          blog_submission_id: submissionId,
          reviewer_id: reviewerId,
          action: 'rejected',
          rejection_reason: reason,
          rejection_note: note
        }]);

      if (reviewError) throw reviewError;

      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // User Tier Management
  checkUserTierLimits: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_tier_limits')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return { data: null, error };
    
    return { 
      data: { 
        canAddMore: data.current_live_posts < data.max_live_posts,
        currentLive: data.current_live_posts,
        maxLive: data.max_live_posts
      }, 
      error: null 
    };
  },

  toggleBlogLiveStatus: async (submissionId: string, userId: string, isLive: boolean) => {
    // Check tier limits first if trying to make live
    if (isLive) {
      const limitsCheck = await supabaseDB.checkUserTierLimits(userId);
      if (limitsCheck.error || !limitsCheck.data?.canAddMore) {
        return { data: null, error: { message: 'User has reached their live post limit' } };
      }
    }

    const { data, error } = await supabase
      .from('blog_submissions')
      .update({ 
        is_live: isLive,
        live_at: isLive ? new Date().toISOString() : null
      })
      .eq('id', submissionId)
      .eq('user_id', userId)
      .select();
    
    return { data, error };
  },

  getUserApprovedSubmissions: async (userId: string) => {
    const { data, error } = await supabase
      .from('blog_submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .order('approved_at', { ascending: false });
    return { data, error };
  },

  // Age-Gated Content
  getAge18PlusContent: async (userId: string) => {
    // First check if user has confirmed 18+
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('has_confirmed_18_plus')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile?.has_confirmed_18_plus) {
      return { data: [], error: { message: 'Age verification required for 18+ content' } };
    }

    const { data, error } = await supabase
      .from('blog_submissions')
      .select('*')
      .eq('has_adult_content', true)
      .eq('status', 'live')
      .eq('is_live', true);
    
    return { data, error };
  },

  // Email Queue Management
  queueEmail: async (emailData: EmailQueue) => {
    const { data, error } = await supabase
      .from('email_queue')
      .insert([emailData])
      .select();
    return { data, error };
  },

  getPendingEmails: async () => {
    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    return { data, error };
  },

  // Blog URL Change Management
  canChangeBlogUrl: async (userId: string) => {
    const { data, error } = await supabase
      .from('blogger_profiles')
      .select('last_url_change, url_changes_count')
      .eq('user_id', userId)
      .single();

    if (error) return { data: null, error };

    const lastChange = data.last_url_change ? new Date(data.last_url_change) : null;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const canChange = !lastChange || lastChange < threeMonthsAgo;
    const nextChangeDate = lastChange ? new Date(lastChange.getTime() + (90 * 24 * 60 * 60 * 1000)) : null;

    return {
      data: {
        canChange,
        nextChangeDate: nextChangeDate?.toISOString() || null,
        changesUsed: data.url_changes_count || 0,
        lastChangeDate: data.last_url_change
      },
      error: null
    };
  },

  updateBlogUrl: async (userId: string, oldUrl: string, newUrl: string, reason?: string) => {
    try {
      // Update blogger profile
      const { error: profileError } = await supabase
        .from('blogger_profiles')
        .update({
          blog_url: newUrl,
          last_url_change: new Date().toISOString(),
          url_changes_count: supabase.raw('url_changes_count + 1')
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Insert change history
      const { error: historyError } = await supabase
        .from('blog_url_change_history')
        .insert([{
          user_id: userId,
          old_url: oldUrl,
          new_url: newUrl,
          change_reason: reason,
          changed_at: new Date().toISOString()
        }]);

      if (historyError) throw historyError;

      // Mark approved submissions as inactive for re-review
      const { error: submissionError } = await supabase
        .from('blog_submissions')
        .update({ is_live: false, status: 'pending' })
        .eq('user_id', userId)
        .eq('status', 'approved');

      if (submissionError) throw submissionError;

      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getBlogUrlChangeHistory: async (userId: string) => {
    const { data, error } = await supabase
      .from('blog_url_change_history')
      .select('*')
      .eq('user_id', userId)
      .order('changed_at', { ascending: false });
    return { data, error };
  },

  // User management for webhooks
  getUserByEmail: async (email: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  },

  updateUserTier: async (userId: string, tier: UserTier) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ tier })
      .eq('user_id', userId)
      .select();
    return { data, error };
  },

  updateBloggerStripeInfo: async (userId: string, stripeInfo: {
    stripe_customer_id?: string;
    subscription_status?: 'active' | 'canceled' | 'past_due';
    subscription_id?: string;
    subscription_end_date?: string;
  }) => {
    const { data, error } = await supabase
      .from('blogger_profiles')
      .update(stripeInfo)
      .eq('user_id', userId)
      .select();
    return { data, error };
  },

  // Premium feature checks
  isUserPremium: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('user_id', userId)
      .single();
    
    if (error) return { isPremium: false, error };
    
    return { isPremium: data?.tier === 'pro', error: null };
  },

  getUserWithBloggerProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        blogger_profiles(*)
      `)
      .eq('user_id', userId)
      .single();
    return { data, error };
  }
};

// Helper Functions for Blog Status Management
export const BlogStatusHelpers = {
  canTransitionTo: (currentStatus: BlogStatus, newStatus: BlogStatus): boolean => {
    const allowedTransitions: Record<BlogStatus, BlogStatus[]> = {
      'draft': ['submitted'],
      'submitted': ['pending'],
      'pending': ['approved', 'rejected'],
      'approved': ['live', 'inactive'],
      'rejected': ['submitted'], // Allow resubmission after fixes
      'live': ['inactive'],
      'inactive': ['live']
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  },

  getStatusLabel: (status: BlogStatus): string => {
    const labels: Record<BlogStatus, string> = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'pending': 'Under Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'live': 'Live',
      'inactive': 'Inactive'
    };

    return labels[status];
  },

  getRejectionReasonLabel: (reason: RejectionReason): string => {
    const labels: Record<RejectionReason, string> = {
      'inappropriate_content': 'Inappropriate Content',
      'broken_link': 'Broken Link',
      'spam': 'Spam',
      'teaser_paywall': 'Teaser / Paywall Site',
      'malicious_site': 'Malicious Site',
      'not_a_blog': 'Not a Blog',
      'duplicate': 'Duplicate',
      'ai_generated_low_quality': 'AI-Generated / Low Quality',
      'copyright_violation': 'Copyright Violation'
    };

    return labels[reason];
  }
};

// Email Template Data Interfaces
export interface EmailTemplateData {
  blogApproved: {
    userName: string;
    blogTitle: string;
    blogUrl: string;
    dateApproved: string;
  };

  blogRejected: {
    userName: string;
    blogTitle: string;
    blogUrl: string;
    rejectionReason: string;
    rejectionNote?: string;
    dateRejected: string;
    resubmissionUrl: string;
  };
}