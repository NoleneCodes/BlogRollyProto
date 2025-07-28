
// Supabase configuration and client setup
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types and Enums
export type UserRole = 'reader' | 'blogger' | 'admin' | 'moderator';
export type UserTier = 'free' | 'premium' | 'pro';
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
  max_live_posts: number; // 3 for free, unlimited for premium/pro
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
    console.log('TODO: Implement user insertion', userData);
    return { data: null, error: null };
  },
  
  insertUserProfile: async (profileData: UserProfile) => {
    console.log('TODO: Implement user profile insertion', profileData);
    return { data: null, error: null };
  },

  updateAgeVerification: async (userId: string, ageVerified: boolean, confirmed18Plus?: boolean) => {
    console.log('TODO: Update age verification', { userId, ageVerified, confirmed18Plus });
    return { data: null, error: null };
  },

  // Blog Submissions
  insertBlogSubmission: async (submissionData: BlogSubmission) => {
    console.log('TODO: Implement blog submission insertion', submissionData);
    return { data: null, error: null };
  },

  insertAdultBlogSubmission: async (adultContentData: AdultBlogSubmission) => {
    console.log('TODO: Implement adult blog submission insertion', adultContentData);
    return { data: null, error: null };
  },

  getUserSubmissions: async (userId: string) => {
    console.log('TODO: Implement get user submissions', userId);
    return { data: [], error: null };
  },

  getSubmissionsByStatus: async (status: BlogStatus) => {
    console.log('TODO: Get submissions by status', status);
    return { data: [], error: null };
  },

  getPendingSubmissionsForReview: async () => {
    console.log('TODO: Get pending submissions for admin review');
    return { data: [], error: null };
  },

  // Admin/Moderation Functions
  updateSubmissionStatus: async (submissionId: string, status: BlogStatus, reviewerId: string) => {
    console.log('TODO: Update submission status', { submissionId, status, reviewerId });
    return { data: null, error: null };
  },

  insertBlogReview: async (reviewData: BlogReview) => {
    console.log('TODO: Insert blog review', reviewData);
    return { data: null, error: null };
  },

  approveBlogSubmission: async (submissionId: string, reviewerId: string) => {
    console.log('TODO: Approve blog submission', { submissionId, reviewerId });
    // This would:
    // 1. Update status to 'approved'
    // 2. Insert review record
    // 3. Queue approval email
    // 4. Check if should auto-move to 'live' based on user tier
    return { data: null, error: null };
  },

  rejectBlogSubmission: async (submissionId: string, reviewerId: string, reason: RejectionReason, note?: string) => {
    console.log('TODO: Reject blog submission', { submissionId, reviewerId, reason, note });
    // This would:
    // 1. Update status to 'rejected'
    // 2. Insert review record with reason
    // 3. Queue rejection email with reason
    return { data: null, error: null };
  },

  // User Tier Management
  checkUserTierLimits: async (userId: string) => {
    console.log('TODO: Check user tier limits', userId);
    return { data: { canAddMore: true, currentLive: 0, maxLive: 3 }, error: null };
  },

  toggleBlogLiveStatus: async (submissionId: string, userId: string, isLive: boolean) => {
    console.log('TODO: Toggle blog live status', { submissionId, userId, isLive });
    // This would check tier limits before allowing activation
    return { data: null, error: null };
  },

  getUserApprovedSubmissions: async (userId: string) => {
    console.log('TODO: Get user approved submissions for live toggle', userId);
    return { data: [], error: null };
  },

  // Age-Gated Content
  getAge18PlusContent: async (userId: string) => {
    console.log('TODO: Get 18+ content with age verification check', userId);
    return { data: [], error: null };
  },

  // Email Queue Management
  queueEmail: async (emailData: EmailQueue) => {
    console.log('TODO: Queue email for sending', emailData);
    return { data: null, error: null };
  },

  getPendingEmails: async () => {
    console.log('TODO: Get pending emails to send');
    return { data: [], error: null };
  },

  // Blog URL Change Management
  canChangeBlogUrl: async (userId: string) => {
    console.log('TODO: Check if user can change blog URL', userId);
    // This would check:
    // 1. If user has made any URL changes
    // 2. If last change was more than 3 months ago
    // 3. Return boolean and next available change date
    return { 
      data: { 
        canChange: true, 
        nextChangeDate: null, 
        changesUsed: 0, 
        lastChangeDate: null 
      }, 
      error: null 
    };
  },

  updateBlogUrl: async (userId: string, oldUrl: string, newUrl: string, reason?: string) => {
    console.log('TODO: Update blog URL with change tracking', { userId, oldUrl, newUrl, reason });
    // This would:
    // 1. Update BloggerProfile.blog_url
    // 2. Update BloggerProfile.last_url_change
    // 3. Increment BloggerProfile.url_changes_count
    // 4. Insert record into BlogUrlChangeHistory
    // 5. Mark all approved blog submissions as inactive for re-review
    return { data: null, error: null };
  },

  getBlogUrlChangeHistory: async (userId: string) => {
    console.log('TODO: Get blog URL change history', userId);
    return { data: [], error: null };
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
