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
  blog_url: string; // Main blog domain URL - not changeable after signup
  blog_name: string;
  blog_description?: string;
  categories: string[];
  social_links: Record<string, string>;
  is_verified: boolean;
  stripe_customer_id?: string;
  subscription_status?: 'active' | 'canceled' | 'past_due';
  subscription_end_date?: string;
  domain_verification_status: 'pending' | 'verified' | 'failed' | 'expired';
  domain_verification_token?: string;
  domain_verification_method: 'txt_record' | 'html_file' | 'meta_tag';
  domain_verified_at?: string;
  domain_last_check?: string;
  created_at: string;
  updated_at: string;
}

// Blog Content Tables
export interface BlogSubmission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  url: string;
  image_url?: string;
  image_description?: string; // Alt text for accessibility and SEO
  image_type?: 'url' | 'upload'; // Whether image is external URL or uploaded file
  image_file_path?: string; // Path/reference for uploaded images
  category: string;
  tags: string[];
  status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'live' | 'inactive';
  has_adult_content: boolean;
  is_live: boolean;
  views?: number;
  clicks?: number;
  ctr?: number;
  bounce_rate: number;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  rejected_at?: string;
  live_at?: string;
  created_at: string;
  updated_at: string;
  url_change_reason?: string;
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

// Types for URL change tracking
export interface BlogPostUrlChange {
  id: string;
  blog_submission_id: string;
  user_id: string;
  old_url: string;
  new_url: string;
  change_reason: string;
  changed_by: string;
  changed_at: string;
  created_at: string;
}


// Survey Feedback Table
export interface SurveyFeedback {
  id: string;
  user_id: string; // FK to User
  blogger_experience: string;
  primary_goal: string;
  audience_size: string;
  content_frequency: string;
  discovery_methods: string[];
  challenges_faced: string;
  platforms_used: string[];
  current_monetization_methods: string[];
  community_interest: string;
  additional_features?: string;
  feedback?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
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
    // If this is adult content, validate blogger age verification first
    if (submissionData.has_adult_content) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('age_verified')
        .eq('user_id', submissionData.user_id)
        .single();

      if (profileError || !profile?.age_verified) {
        return { 
          data: null, 
          error: { 
            message: 'Age verification required to submit adult content. Please verify your age in profile settings.',
            code: 'AGE_VERIFICATION_REQUIRED'
          } 
        };
      }
    }

    // Check if URL is already taken
    const availability = await supabaseDB.checkBlogPostUrlAvailability(submissionData.url);
    if (!availability.isAvailable) {
      return { 
        data: null, 
        error: { 
          message: availability.error || 'This blog post URL is already submitted',
          code: 'DUPLICATE_URL'
        } 
      };
    }

    const { data, error } = await supabase
      .from('blog_submissions')
      .insert([submissionData])
      .select();

    // Handle duplicate key error gracefully
    if (error && error.code === '23505') {
      return { 
        data: null, 
        error: { 
          message: 'This blog post URL is already taken by another submission',
          code: 'DUPLICATE_URL'
        } 
      };
    }

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
    try {
      // The database triggers will handle all constraint checking
      const { data, error } = await supabase
        .from('blog_submissions')
        .update({ 
          is_live: isLive,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        // Check if it's a constraint violation
        if (error.message.includes('domain not verified') || 
            error.message.includes('not approved') || 
            error.message.includes('tier limit exceeded')) {
          return { data: null, error: { message: error.message } };
        }
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to update live status' } };
    }
  },

  // Check if a blog submission can go live
  checkBlogLiveEligibility: async (submissionId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('can_blog_submission_go_live', { submission_id: submissionId });

      if (error) throw error;

      return { data: { canGoLive: data }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to check live eligibility' } };
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
    // Check if user is both age verified AND has confirmed 18+ access
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('age_verified, has_confirmed_18_plus')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      return { data: [], error: { message: 'Unable to verify user age status' } };
    }

    if (!profile?.age_verified) {
      return { data: [], error: { message: 'Age verification required to view adult content' } };
    }

    if (!profile?.has_confirmed_18_plus) {
      return { data: [], error: { message: '18+ confirmation required to view adult content' } };
    }

    const { data, error } = await supabase
      .from('blog_submissions')
      .select(`
        *,
        adult_blog_submissions(*)
      `)
      .eq('has_adult_content', true)
      .eq('status', 'approved')
      .eq('is_live', true);

    return { data, error };
  },

  // Validate if blogger can submit adult content
  canBloggerSubmitAdultContent: async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('age_verified, role')
      .eq('user_id', userId)
      .single();

    if (error) {
      return { canSubmit: false, error: { message: 'Unable to verify blogger status' } };
    }

    const canSubmit = profile?.age_verified === true && profile?.role === 'blogger';

    return { 
      canSubmit, 
      error: canSubmit ? null : { 
        message: canSubmit ? null : 'Age verification required to submit adult content' 
      }
    };
  },

  // Validate if user can view adult content
  canUserViewAdultContent: async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('age_verified, has_confirmed_18_plus')
      .eq('user_id', userId)
      .single();

    if (error) {
      return { canView: false, error: { message: 'Unable to verify user age status' } };
    }

    const canView = profile?.age_verified === true && profile?.has_confirmed_18_plus === true;

    return { 
      canView, 
      needsAgeVerification: !profile?.age_verified,
      needs18PlusConfirmation: profile?.age_verified && !profile?.has_confirmed_18_plus,
      error: null
    };
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

  // Premium feature checks with Stripe verification
  isUserPremium: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        tier,
        blogger_profiles(
          stripe_customer_id,
          subscription_status,
          subscription_end_date
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) return { isPremium: false, error };

    // Check if user has pro tier AND active subscription
    const hasPro = data?.tier === 'pro';
    const bloggerProfile = data?.blogger_profiles?.[0];
    const hasActiveSubscription = bloggerProfile?.subscription_status === 'active';
    const hasValidEndDate = bloggerProfile?.subscription_end_date 
      ? new Date(bloggerProfile.subscription_end_date) > new Date() 
      : false;

    // User is premium only if they have pro tier AND active subscription
    const isPremium = hasPro && hasActiveSubscription && hasValidEndDate;

    return { 
      isPremium, 
      error: null,
      tier: data?.tier,
      subscriptionStatus: bloggerProfile?.subscription_status,
      subscriptionEndDate: bloggerProfile?.subscription_end_date
    };
  },

  // Verify and sync user tier with Stripe status
  verifyAndSyncUserTier: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        tier,
        blogger_profiles(
          stripe_customer_id,
          subscription_status,
          subscription_end_date
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) return { synced: false, error };

    const currentTier = data?.tier;
    const bloggerProfile = data?.blogger_profiles?.[0];
    const subscriptionStatus = bloggerProfile?.subscription_status;
    const subscriptionEndDate = bloggerProfile?.subscription_end_date;

    // Determine correct tier based on Stripe status
    let correctTier: UserTier = 'free';

    if (subscriptionStatus === 'active' && subscriptionEndDate) {
      const endDate = new Date(subscriptionEndDate);
      if (endDate > new Date()) {
        correctTier = 'pro';
      }
    }

    // If tier doesn't match Stripe status, update it
    if (currentTier !== correctTier) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ tier: correctTier })
        .eq('user_id', userId);

      if (updateError) return { synced: false, error: updateError };

      return { 
        synced: true, 
        error: null, 
        changed: true,
        oldTier: currentTier,
        newTier: correctTier
      };
    }

    return { synced: true, error: null, changed: false, tier: currentTier };
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
  },

  // Survey Feedback Functions
  insertSurveyFeedback: async (surveyData: Omit<SurveyFeedback, 'id' | 'created_at' | 'updated_at' | 'submitted_at'>) => {
    const { data, error } = await supabase
      .from('survey_feedback')
      .insert([surveyData])
      .select();
    return { data, error };
  },

  getUserSurveyFeedback: async (userId: string) => {
    const { data, error } = await supabase
      .from('survey_feedback')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  getAllSurveyFeedback: async () => {
    const { data, error } = await supabase
      .from('survey_feedback')
      .select(`
        *,
        user_profiles!inner(first_name, surname, username)
      `)
      .order('submitted_at', { ascending: false });
    return { data, error };
  },

  getSurveyAnalytics: async () => {
    const { data, error } = await supabase
      .from('survey_feedback')
      .select('blogger_experience, audience_size, content_frequency, community_interest, current_monetization_methods, platforms_used, discovery_methods');
    return { data, error };
  },

  // Tier Limits Stripe Consistency Functions
  checkTierLimitsStripeConsistency: async () => {
    const { data, error } = await supabase
      .rpc('check_tier_limits_stripe_consistency');
    return { data, error };
  },

  fixTierLimitsStripeInconsistencies: async () => {
    const { data, error } = await supabase
      .rpc('fix_tier_limits_stripe_inconsistencies');
    return { data, error };
  },

  getTierLimitsStripeStatus: async (userId?: string) => {
    let query = supabase
      .from('user_tier_limits_stripe_status')
      .select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Validate tier limits against Stripe status
  validateUserTierLimits: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_tier_limits_stripe_status')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) return { isValid: false, error };

      return { 
        isValid: data.tier_stripe_consistent,
        tierLimitsTier: data.tier_limits_tier,
        profileTier: data.profile_tier,
        hasActiveSubscription: data.has_active_subscription,
        stripeCustomerId: data.stripe_customer_id,
        subscriptionStatus: data.subscription_status,
        error: null
      };
    } catch (error: any) {
      return { isValid: false, error: { message: error.message || 'Failed to validate tier limits' } };
    }
  },

  // Get URL change history for a blog post
  getBlogPostUrlChanges: async (blogSubmissionId: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_post_url_changes')
        .select(`
        *,
        changed_by_user:users!changed_by(email)
      `)
        .eq('blog_submission_id', blogSubmissionId)
        .order('changed_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching URL change history:', error);
      return { data: null, error: error.message };
    }
  },

  // Update blog post URL with reason
  updateBlogPostUrl: async (blogSubmissionId: string, newUrl: string, reason: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_submissions')
        .update({ 
          url: newUrl,
          url_change_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', blogSubmissionId)
        .select()
        .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating blog post URL:', error);
    return { data: null, error: error.message };
  }
  },

  // Update a blog submission
  updateBlogSubmission: async (
    submissionId: string, 
    userId: string, 
    updates: Partial<BlogSubmission>
  ) => {
    const { data, error } = await supabase
      .from('blog_submissions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .eq('user_id', userId)
      .select('*')
      .single();

    return { data, error };
  },

  // Check if a blog domain URL is already taken
  checkBlogDomainAvailability: async (blogUrl: string) => {
    try {
      const { data, error } = await supabase
        .from('blogger_profiles')
        .select('id, user_id')
        .eq('blog_url', blogUrl)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows found - URL is available
        return { isAvailable: true, error: null };
      }

      if (error) {
        return { isAvailable: false, error: error.message };
      }

      // URL is taken
      return { isAvailable: false, error: 'This blog domain is already registered by another blogger' };
    } catch (error: any) {
      return { isAvailable: false, error: error.message };
    }
  },

  // Check if a blog post URL is already taken
  checkBlogPostUrlAvailability: async (postUrl: string, excludeSubmissionId?: string) => {
    try {
      let query = supabase
        .from('blog_submissions')
        .select('id, user_id, title')
        .eq('url', postUrl);

      if (excludeSubmissionId) {
        query = query.neq('id', excludeSubmissionId);
      }

      const { data, error } = await query.single();

      if (error && error.code === 'PGRST116') {
        // No rows found - URL is available
        return { isAvailable: true, error: null };
      }

      if (error) {
        return { isAvailable: false, error: error.message };
      }

      // URL is taken
      return { 
        isAvailable: false, 
        error: 'This blog post URL is already submitted by another user',
        existingSubmission: data
      };
    } catch (error: any) {
      return { isAvailable: false, error: error.message };
    }
  },

  // Update blog URL with automatic deactivation and re-approval
  updateBlogUrl: async (
    submissionId: string,
    userId: string,
    newUrl: string,
    changeReason: string
  ) => {
    // First get the current submission to check if URL is actually changing
    const { data: currentSubmission, error: fetchError } = await supabase
      .from('blog_submissions')
      .select('url, status, is_live')
      .eq('id', submissionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentSubmission) {
      return { data: null, error: fetchError || 'Submission not found', requiresReapproval: false };
    }

    const urlChanged = currentSubmission.url !== newUrl;

    // If URL is changing, check if the new URL is available
    if (urlChanged) {
      const availability = await supabaseDB.checkBlogPostUrlAvailability(newUrl, submissionId);
      if (!availability.isAvailable) {
        return { 
          data: null, 
          error: availability.error || 'URL not available', 
          requiresReapproval: false 
        };
      }
    }

    // Update the submission (trigger will handle deactivation if URL changed)
    const { data, error } = await supabase
      .from('blog_submissions')
      .update({
        url: newUrl,
        url_change_reason: changeReason,
        updated_at: new Date().toISOString(),
        // The database trigger will handle setting status and is_live if URL changed
      })
      .eq('id', submissionId)
      .eq('user_id', userId)
      .select('*')
      .single();

    // Handle duplicate key error gracefully
    if (error && error.code === '23505') {
      return { 
        data: null, 
        error: 'This blog post URL is already taken by another submission', 
        requiresReapproval: false 
      };
    }

    return { 
      data, 
      error, 
      requiresReapproval: urlChanged && (currentSubmission.status === 'approved' || currentSubmission.is_live)
    };
  },

  // Bug Reports Functions
  createBugReport: async (bugData: {
    title: string;
    description: string;
    stepsToReproduce?: string;
    expectedBehavior?: string;
    actualBehavior?: string;
    browser?: string;
    operatingSystem?: string;
    additionalInfo?: string;
    images?: string[];
    priority?: 'high' | 'medium' | 'low';
    reporter: string;
  }) => {
    try {
      // Generate ID in format #BUG-001
      const { data: countData } = await supabase
        .from('bug_reports')
        .select('id', { count: 'exact' });

      const count = countData?.length || 0;
      const id = `#BUG-${String(count + 1).padStart(3, '0')}`;

      // Determine priority based on title/description keywords if not provided
      let priority = bugData.priority || 'medium';
      if (!bugData.priority) {
        const priorityKeywords = {
          high: ['crash', 'error', 'broken', 'not working', 'fails', 'login', 'payment'],
          medium: ['display', 'layout', 'search', 'upload', 'slow'],
          low: ['typo', 'suggestion', 'improvement', 'minor']
        };

        const text = (bugData.title + ' ' + bugData.description).toLowerCase();

        if (priorityKeywords.high.some(keyword => text.includes(keyword))) {
          priority = 'high';
        } else if (priorityKeywords.low.some(keyword => text.includes(keyword))) {
          priority = 'low';
        }
      }

      const { data, error } = await supabase
        .from('bug_reports')
        .insert({
          id,
          title: bugData.title,
          description: bugData.description,
          steps_to_reproduce: bugData.stepsToReproduce,
          expected_behavior: bugData.expectedBehavior,
          actual_behavior: bugData.actualBehavior,
          browser: bugData.browser,
          operating_system: bugData.operatingSystem,
          additional_info: bugData.additionalInfo,
          images: bugData.images || [],
          priority,
          reporter: bugData.reporter
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating bug report:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in createBugReport:', error);
      return { success: false, error: 'Failed to create bug report' };
    }
  },

  getAllBugReports: async () => {
    try {
      const { data, error } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bug reports:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getAllBugReports:', error);
      return { success: false, error: 'Failed to fetch bug reports' };
    }
  },

  getBugReportById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('bug_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching bug report:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getBugReportById:', error);
      return { success: false, error: 'Failed to fetch bug report' };
    }
  },

  updateBugReportStatus: async (id: string, status: 'open' | 'in-progress' | 'resolved') => {
    try {
      const { data, error } = await supabase
        .from('bug_reports')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating bug report status:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in updateBugReportStatus:', error);
      return { success: false, error: 'Failed to update bug report status' };
    }
  },

  // Support Requests Functions
  createSupportRequest: async (requestData: {
    subject: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    email?: string;
    userEmail: string;
  }) => {
    try {
      // Generate ID in format SUP-001
      const { data: countData } = await supabase
        .from('support_requests')
        .select('id', { count: 'exact' });

      const count = countData?.length || 0;
      const id = `SUP-${String(count + 1).padStart(3, '0')}`;

      const { data, error } = await supabase
        .from('support_requests')
        .insert({
          id,
          subject: requestData.subject,
          priority: requestData.priority,
          message: requestData.message,
          email: requestData.email,
          user_email: requestData.userEmail
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating support request:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in createSupportRequest:', error);
      return { success: false, error: 'Failed to create support request' };
    }
  },

  getAllSupportRequests: async () => {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching support requests:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getAllSupportRequests:', error);
      return { success: false, error: 'Failed to fetch support requests' };
    }
  },

  getSupportRequestById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching support request:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getSupportRequestById:', error);
      return { success: false, error: 'Failed to fetch support request' };
    }
  },

  updateSupportRequestStatus: async (id: string, status: 'open' | 'responded' | 'closed', adminResponse?: string, adminResponder?: string) => {
    try {
      const updateData: any = { status };

      if (adminResponse) {
        updateData.admin_response = adminResponse;
      }

      if (adminResponder) {
        updateData.admin_responder = adminResponder;
      }

      const { data, error } = await supabase
        .from('support_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating support request:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in updateSupportRequestStatus:', error);
      return { success: false, error: 'Failed to update support request' };
    }
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
  },

  // Get blog review details for email notifications
  getBlogReviewDetails: async (blogSubmissionId: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_reviews')
        .select(`
          *,
          blog_submissions!inner(
            title,
            blogger_id,
            blogger_profiles!inner(
              user_id,
              users!inner(
                email,
                user_profiles!inner(
                  first_name
                )
              )
            )
          )
        `)
        .eq('blog_submission_id', blogSubmissionId)
        .order('created_at', { ascending: false })        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching blog review details:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getBlogReviewDetails:', error);
      return { success: false, error: 'Failed to fetch blog review details' };
    }
  },

  // Send rejection email using blog review data
  sendRejectionEmailFromReview: async (blogSubmissionId: string) => {
    try {
      const reviewResult = await supabaseHelpers.getBlogReviewDetails(blogSubmissionId);

      if (!reviewResult.success || !reviewResult.data) {
        throw new Error('Failed to get blog review details');
      }

      const review = reviewResult.data;
      const submission = review.blog_submissions;
      const blogger = submission.blogger_profiles;
      const user = blogger.users;
      const profile = user.user_profiles;

      if (review.action !== 'rejected') {
        throw new Error('Blog review is not a rejection');
      }

      // Import email service
      const { emailService } = await import('./email-templates');

      // Get human-readable rejection reason
      const rejectionReasonLabel = supabaseHelpers.getRejectionReasonLabel(review.rejection_reason!);

      // Send email with review data
      await emailService.sendBlogStatusEmail(
        user.email,
        profile.first_name,
        submission.title,
        '', // blog URL not needed for rejection
        'rejected',
        rejectionReasonLabel,
        review.rejection_note || undefined
      );

      return { success: true };
    } catch (error) {
      console.error('Error sending rejection email from review:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
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

export interface InvestorUser {
  id: string;
  email: string;
  name: string;
  company?: string;
  investment_range: string;
  investor_type: string;
  interests?: string;
  message?: string;
  password_hash: string;
  is_verified: boolean;
  verification_token?: string;
  linkedin_url?: string;
  linkedin_verified: boolean;
  linkedin_verification_token?: string;
  verification_status: 'pending_email' | 'pending_linkedin' | 'fully_verified' | 'rejected';
  created_at: string;
  updated_at: string;
  last_login?: string;
}