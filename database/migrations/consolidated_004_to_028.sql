
-- BlogRolly Database Schema
-- Consolidated Migration: 004-028
-- This file consolidates all migrations from 004 to 028

-- =====================================
-- Migration 004: Consolidate username and display_name columns
-- =====================================

-- Copy any existing display_name values to username where username is null
UPDATE user_profiles 
SET username = display_name 
WHERE username IS NULL AND display_name IS NOT NULL;

-- Copy any existing username values to display_name where display_name is null
UPDATE user_profiles 
SET display_name = username 
WHERE display_name IS NULL AND username IS NOT NULL;

-- Drop the display_name column since we're consolidating to username
ALTER TABLE user_profiles DROP COLUMN IF EXISTS display_name;

-- Add a comment to document the change
COMMENT ON COLUMN user_profiles.username IS 'User display name/username (consolidated from previous display_name column)';

-- =====================================
-- Migration 005: Remove premium tier
-- =====================================

-- Update any existing premium tier users to pro tier
UPDATE user_profiles SET tier = 'pro' WHERE tier = 'premium';
UPDATE user_tier_limits SET tier = 'pro' WHERE tier = 'premium';

-- Remove premium from the enum type
ALTER TYPE user_tier RENAME TO user_tier_old;
CREATE TYPE user_tier AS ENUM ('free', 'pro');
ALTER TABLE user_profiles ALTER COLUMN tier TYPE user_tier USING tier::text::user_tier;
ALTER TABLE user_tier_limits ALTER COLUMN tier TYPE user_tier USING tier::text::user_tier;
DROP TYPE user_tier_old;

-- =====================================
-- Migration 006: Link user tier with Stripe
-- =====================================

-- Add Stripe customer ID to user profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;

-- Add subscription information
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMP WITH TIME ZONE;

-- Create subscription history table
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  stripe_price_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_stripe_subscription_id ON subscription_history(stripe_subscription_id);

-- =====================================
-- Migration 007: Add search tables
-- =====================================

-- Create search logs table
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  search_query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  search_query TEXT NOT NULL,
  search_count INTEGER DEFAULT 1,
  avg_results_count DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, search_query)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_search_analytics_date ON search_analytics(date);

-- =====================================
-- Migration 008: Remove survey fields from blogger_profiles
-- =====================================

-- Remove survey-related columns from blogger_profiles
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS blogger_experience;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS audience_size;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS income_range;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS marketing_help_interest;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS feature_requests;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS how_found_us;

-- =====================================
-- Migration 009: Create survey feedback table
-- =====================================

-- Create survey feedback table
CREATE TABLE IF NOT EXISTS survey_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blogger_experience VARCHAR(50),
  audience_size VARCHAR(50),
  income_range VARCHAR(50),
  marketing_help_interest BOOLEAN DEFAULT FALSE,
  feature_requests TEXT,
  how_found_us VARCHAR(100),
  overall_satisfaction INTEGER CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
  likelihood_to_recommend INTEGER CHECK (likelihood_to_recommend >= 1 AND likelihood_to_recommend <= 10),
  additional_feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_survey_feedback_user_id ON survey_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_feedback_submitted_at ON survey_feedback(submitted_at);
CREATE INDEX IF NOT EXISTS idx_survey_feedback_blogger_experience ON survey_feedback(blogger_experience);
CREATE INDEX IF NOT EXISTS idx_survey_feedback_audience_size ON survey_feedback(audience_size);

-- Add RLS policies
ALTER TABLE survey_feedback ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own survey responses
CREATE POLICY "Users can insert their own survey feedback" ON survey_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own survey responses
CREATE POLICY "Users can view their own survey feedback" ON survey_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all survey responses
CREATE POLICY "Admins can view all survey feedback" ON survey_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_survey_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_survey_feedback_updated_at
  BEFORE UPDATE ON survey_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_survey_feedback_updated_at();

-- =====================================
-- Migration 010: Remove blog URL change tracking
-- =====================================

-- Drop the blog_url_changes table and related objects
DROP TABLE IF EXISTS blog_url_changes CASCADE;
DROP FUNCTION IF EXISTS log_blog_url_change() CASCADE;
DROP TRIGGER IF EXISTS blog_url_change_trigger ON blog_submissions;

-- =====================================
-- Migration 011: Update blogger profiles schema
-- =====================================

-- Remove URL change tracking from blogger_profiles
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS url_change_history;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS last_url_change;

-- Add new columns for better blog management
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS primary_blog_categories TEXT[] DEFAULT '{}';
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS secondary_blog_categories TEXT[] DEFAULT '{}';
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS blog_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS content_rating VARCHAR(20) DEFAULT 'general' CHECK (content_rating IN ('general', '18+'));

-- Update RLS policies
DO $$ 
BEGIN
    -- Policy for users to view their own profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogger_profiles' 
        AND policyname = 'Users can view their own blogger profile'
    ) THEN
        CREATE POLICY "Users can view their own blogger profile" 
        ON blogger_profiles FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    -- Policy for users to update their own profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogger_profiles' 
        AND policyname = 'Users can update their own blogger profile'
    ) THEN
        CREATE POLICY "Users can update their own blogger profile" 
        ON blogger_profiles FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    -- Policy for admins to view all blogger profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogger_profiles' 
        AND policyname = 'Admins can view all blogger profiles'
    ) THEN
        CREATE POLICY "Admins can view all blogger profiles" 
        ON blogger_profiles FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'moderator')
            )
        );
    END IF;
END $$;

-- =====================================
-- Migration 012: Add blog domain verification
-- =====================================

-- Add domain verification fields to blog_submissions
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS verification_method VARCHAR(50) DEFAULT 'meta_tag' CHECK (verification_method IN ('meta_tag', 'html_file', 'dns_record'));
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create domain verification attempts table
CREATE TABLE IF NOT EXISTS domain_verification_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_submission_id UUID REFERENCES blog_submissions(id) ON DELETE CASCADE,
  verification_token VARCHAR(255) NOT NULL,
  verification_method VARCHAR(50) NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_domain_verification_attempts_blog_submission_id ON domain_verification_attempts(blog_submission_id);
CREATE INDEX IF NOT EXISTS idx_domain_verification_attempts_token ON domain_verification_attempts(verification_token);

-- =====================================
-- Migration 013: Add domain validation constraints
-- =====================================

-- Add function to validate URLs
CREATE OR REPLACE FUNCTION is_valid_blog_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if URL is not null and not empty
  IF url IS NULL OR LENGTH(TRIM(url)) = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Check if URL starts with http:// or https://
  IF NOT (url ILIKE 'http://%' OR url ILIKE 'https://%') THEN
    RETURN FALSE;
  END IF;
  
  -- Check if URL contains a valid domain
  IF NOT (url ~ '^https?://[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*(/.*)?$') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to blog_submissions
ALTER TABLE blog_submissions ADD CONSTRAINT IF NOT EXISTS valid_blog_url CHECK (is_valid_blog_url(blog_url));

-- =====================================
-- Migration 014: Add image upload support
-- =====================================

-- Add image fields to blog submissions
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS featured_image_alt TEXT;
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_upload_date TIMESTAMP WITH TIME ZONE;

-- Create images table for tracking uploaded images
CREATE TABLE IF NOT EXISTS uploaded_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blog_submission_id UUID REFERENCES blog_submissions(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  alt_text TEXT,
  upload_path TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_uploaded_images_user_id ON uploaded_images(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_blog_submission_id ON uploaded_images(blog_submission_id);

-- =====================================
-- Migration 015: Add live status constraints
-- =====================================

-- Add is_live column to track live posts
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;

-- Update is_live based on current status
UPDATE blog_submissions SET is_live = TRUE WHERE status = 'live';

-- Create function to enforce tier limits
CREATE OR REPLACE FUNCTION check_live_post_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier_val user_tier;
  current_live_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get user's tier
  SELECT tier INTO user_tier_val 
  FROM user_profiles 
  WHERE user_id = NEW.user_id;
  
  -- Count current live posts
  SELECT COUNT(*) INTO current_live_count
  FROM blog_submissions
  WHERE user_id = NEW.user_id AND is_live = TRUE AND id != NEW.id;
  
  -- Set max allowed based on tier
  IF user_tier_val = 'pro' THEN
    max_allowed := 999999; -- Unlimited for pro
  ELSE
    max_allowed := 3; -- Free tier limit
  END IF;
  
  -- Check if making this post live would exceed limit
  IF NEW.is_live = TRUE AND current_live_count >= max_allowed THEN
    RAISE EXCEPTION 'Live post limit exceeded for % tier: % posts allowed, % currently live', 
      user_tier_val, max_allowed, current_live_count;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER enforce_live_post_limit
  BEFORE INSERT OR UPDATE ON blog_submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_live_post_limit();

-- =====================================
-- Migration 016: Remove avg_time_on_page
-- =====================================

-- Remove average time on page column
ALTER TABLE blog_submissions DROP COLUMN IF EXISTS avg_time_on_page;

-- =====================================
-- Migration 017: Add adult content and age verification
-- =====================================

-- Add adult content flag to blog submissions
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS has_adult_content BOOLEAN DEFAULT FALSE;

-- Add age verification fields to user profiles (if not exists)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_confirmed_18_plus BOOLEAN DEFAULT FALSE;

-- Create age verification logs table
CREATE TABLE IF NOT EXISTS age_verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('signup', 'content_access', 'periodic_check')),
  ip_address INET,
  user_agent TEXT,
  verification_result BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_age_verification_logs_user_id ON age_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_age_verification_logs_created_at ON age_verification_logs(created_at);

-- =====================================
-- Migration 018: Enforce tier limits and Stripe consistency
-- =====================================

-- Create function to check tier limits and Stripe consistency
CREATE OR REPLACE FUNCTION check_tier_limits_stripe_consistency()
RETURNS TABLE (
  user_id UUID,
  username VARCHAR,
  current_tier user_tier,
  stripe_status VARCHAR,
  subscription_end TIMESTAMP WITH TIME ZONE,
  should_be_tier user_tier,
  live_posts_count BIGINT,
  max_allowed INTEGER,
  inconsistent BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.user_id,
    up.username,
    up.tier as current_tier,
    up.subscription_status as stripe_status,
    up.subscription_period_end as subscription_end,
    CASE 
      WHEN up.subscription_status = 'active' AND up.subscription_period_end > NOW() THEN 'pro'::user_tier
      ELSE 'free'::user_tier
    END as should_be_tier,
    COALESCE(bs_count.live_count, 0) as live_posts_count,
    utl.max_live_posts as max_allowed,
    (
      up.tier != CASE 
        WHEN up.subscription_status = 'active' AND up.subscription_period_end > NOW() THEN 'pro'::user_tier
        ELSE 'free'::user_tier
      END
      OR 
      utl.tier != up.tier
      OR
      (up.tier = 'free' AND utl.max_live_posts != 3)
      OR
      (up.tier = 'pro' AND utl.max_live_posts != 999999)
    ) as inconsistent
  FROM user_profiles up
    LEFT JOIN user_tier_limits utl ON up.user_id = utl.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as live_count
      FROM blog_submissions 
      WHERE is_live = TRUE
      GROUP BY user_id
    ) bs_count ON up.user_id = bs_count.user_id
    LEFT JOIN blogger_profiles bp ON up.user_id = bp.user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to fix inconsistencies
CREATE OR REPLACE FUNCTION fix_tier_limits_stripe_inconsistencies()
RETURNS INTEGER AS $$
DECLARE
    fixed_count INTEGER := 0;
    inconsistent_record RECORD;
BEGIN
    FOR inconsistent_record IN 
        SELECT * FROM check_tier_limits_stripe_consistency()
        WHERE inconsistent = TRUE
    LOOP
        -- Update user_tier_limits
        UPDATE user_tier_limits 
        SET 
            tier = inconsistent_record.should_be_tier,
            max_live_posts = CASE 
                WHEN inconsistent_record.should_be_tier = 'pro' THEN 999999
                ELSE 3
            END,
            updated_at = NOW()
        WHERE user_id = inconsistent_record.user_id;
        
        -- Update user_profiles
        UPDATE user_profiles 
        SET tier = inconsistent_record.should_be_tier
        WHERE user_id = inconsistent_record.user_id;
        
        fixed_count := fixed_count + 1;
    END LOOP;
    
    RETURN fixed_count;
END;
$$ LANGUAGE plpgsql;

-- Add foreign key constraint
ALTER TABLE user_tier_limits 
ADD CONSTRAINT IF NOT EXISTS fk_user_tier_limits_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- =====================================
-- Migration 019: Add blog post URL change tracking
-- =====================================

-- Create table for tracking blog post URL changes
CREATE TABLE IF NOT EXISTS blog_post_url_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_submission_id UUID REFERENCES blog_submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  old_url VARCHAR(500) NOT NULL,
  new_url VARCHAR(500) NOT NULL,
  change_reason TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_post_url_changes_submission_id ON blog_post_url_changes(blog_submission_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_url_changes_user_id ON blog_post_url_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_url_changes_changed_at ON blog_post_url_changes(changed_at);

-- Enable RLS
ALTER TABLE blog_post_url_changes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own URL changes" ON blog_post_url_changes 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own URL changes" ON blog_post_url_changes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all URL changes" ON blog_post_url_changes 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- =====================================
-- Migration 020: Auto deactivate on URL change
-- =====================================

-- Create function to auto-deactivate blog when URL changes
CREATE OR REPLACE FUNCTION auto_deactivate_on_url_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If blog_url has changed and the blog was live
  IF OLD.blog_url != NEW.blog_url AND OLD.status = 'live' THEN
    -- Set status to inactive and log the change
    NEW.status = 'inactive';
    NEW.is_live = FALSE;
    NEW.updated_at = NOW();
    
    -- Insert URL change record
    INSERT INTO blog_post_url_changes (
      blog_submission_id,
      user_id,
      old_url,
      new_url,
      change_reason,
      changed_by
    ) VALUES (
      NEW.id,
      NEW.user_id,
      OLD.blog_url,
      NEW.blog_url,
      'URL changed - auto-deactivated for review',
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER auto_deactivate_on_url_change_trigger
  BEFORE UPDATE ON blog_submissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_deactivate_on_url_change();

-- =====================================
-- Migration 021: Add unique constraints for URLs
-- =====================================

-- Add unique constraint for blog URLs (only for live/approved posts)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_live_blog_urls 
ON blog_submissions (blog_url) 
WHERE status IN ('live', 'approved') AND is_live = TRUE;

-- =====================================
-- Migration 022: Create bug reports table
-- =====================================

-- Create bug reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  bug_type VARCHAR(100) NOT NULL,
  page_url VARCHAR(500),
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  browser_info JSONB,
  device_info VARCHAR(255),
  screenshot_url TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'duplicate')),
  assigned_to UUID REFERENCES users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_priority ON bug_reports(priority);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at);

-- Enable RLS
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own bug reports" ON bug_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert bug reports" ON bug_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can manage all bug reports" ON bug_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_bug_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bug_reports_updated_at
  BEFORE UPDATE ON bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_bug_reports_updated_at();

-- =====================================
-- Migration 023: Create support requests table
-- =====================================

-- Create support requests table
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_response', 'resolved', 'closed')),
  assigned_to UUID REFERENCES users(id),
  ticket_id VARCHAR(50) UNIQUE NOT NULL DEFAULT ('TICKET-' || EXTRACT(EPOCH FROM NOW())::TEXT),
  browser_info JSONB,
  page_url VARCHAR(500),
  user_agent TEXT,
  ip_address INET,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  last_response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support responses table
CREATE TABLE IF NOT EXISTS support_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  support_request_id UUID REFERENCES support_requests(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES users(id) ON DELETE SET NULL,
  responder_type VARCHAR(20) DEFAULT 'staff' CHECK (responder_type IN ('user', 'staff', 'system')),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_ticket_id ON support_requests(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_support_responses_request_id ON support_responses(support_request_id);

-- Enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_requests
CREATE POLICY "Users can view their own support requests" ON support_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert support requests" ON support_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can manage all support requests" ON support_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- RLS policies for support_responses
CREATE POLICY "Users can view responses to their requests" ON support_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_requests 
      WHERE id = support_request_id 
      AND user_id = auth.uid()
    ) AND is_internal = FALSE
  );

CREATE POLICY "Admins can manage all support responses" ON support_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_support_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_support_requests_updated_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_support_requests_updated_at();

-- =====================================
-- Migration 024: Create investor users table
-- =====================================

-- Create investor users table
CREATE TABLE IF NOT EXISTS investor_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  company_name VARCHAR(255),
  position VARCHAR(255),
  linkedin_url VARCHAR(500),
  linkedin_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(10),
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  investment_interest TEXT,
  investment_range VARCHAR(100),
  accredited_investor BOOLEAN DEFAULT FALSE,
  terms_agreed BOOLEAN DEFAULT FALSE,
  privacy_agreed BOOLEAN DEFAULT FALSE,
  email_updates_consent BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'approved', 'rejected', 'inactive')),
  notes TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_investor_users_email ON investor_users(email);
CREATE INDEX IF NOT EXISTS idx_investor_users_status ON investor_users(status);
CREATE INDEX IF NOT EXISTS idx_investor_users_linkedin_verified ON investor_users(linkedin_verified);
CREATE INDEX IF NOT EXISTS idx_investor_users_created_at ON investor_users(created_at);

-- Enable RLS
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Investors can view their own profile" ON investor_users
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Investors can update their own profile" ON investor_users
  FOR UPDATE USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Admins can manage all investor profiles" ON investor_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_investor_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investor_users_updated_at
  BEFORE UPDATE ON investor_users
  FOR EACH ROW
  EXECUTE FUNCTION update_investor_users_updated_at();

-- =====================================
-- Migration 025: Add LinkedIn verification
-- =====================================

-- Add LinkedIn verification tracking
CREATE TABLE IF NOT EXISTS linkedin_verification_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID REFERENCES investor_users(id) ON DELETE CASCADE,
  linkedin_url VARCHAR(500) NOT NULL,
  verification_code VARCHAR(10) NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_linkedin_verification_attempts_investor_id ON linkedin_verification_attempts(investor_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_verification_attempts_code ON linkedin_verification_attempts(verification_code);

-- =====================================
-- Migration 026: Create security audit table
-- =====================================

-- Create security audit logs table
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  endpoint VARCHAR(255),
  method VARCHAR(10),
  status_code INTEGER,
  response_time_ms INTEGER,
  details JSONB,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  threat_indicators TEXT[],
  server_instance VARCHAR(100) DEFAULT 'replit-main',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security metrics daily aggregation table
CREATE TABLE IF NOT EXISTS security_metrics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  server_instance VARCHAR(100) DEFAULT 'replit-main',
  total_events INTEGER DEFAULT 0,
  high_risk_events INTEGER DEFAULT 0,
  critical_events INTEGER DEFAULT 0,
  unique_ips INTEGER DEFAULT 0,
  suspicious_ips INTEGER DEFAULT 0,
  blocked_requests INTEGER DEFAULT 0,
  auth_failures INTEGER DEFAULT 0,
  auth_successes INTEGER DEFAULT 0,
  top_threat_indicators JSONB,
  compliance_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, server_instance)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_severity ON security_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_ip_address ON security_audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_risk_score ON security_audit_logs(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_metrics_daily_date ON security_metrics_daily(date);

-- Enable RLS
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_metrics_daily ENABLE ROW LEVEL SECURITY;

-- RLS policies (admin only access)
CREATE POLICY "Admins can view security audit logs" ON security_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view security metrics" ON security_metrics_daily
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create function for daily metrics aggregation
CREATE OR REPLACE FUNCTION aggregate_daily_security_metrics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS VOID AS $$
BEGIN
  INSERT INTO security_metrics_daily (
    date,
    server_instance,
    total_events,
    high_risk_events,
    critical_events,
    unique_ips,
    suspicious_ips,
    blocked_requests,
    auth_failures,
    auth_successes,
    top_threat_indicators,
    compliance_summary
  )
  SELECT 
    target_date,
    COALESCE(server_instance, 'replit-main'),
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE risk_score >= 70) as high_risk_events,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_events,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT ip_address) FILTER (WHERE risk_score >= 50) as suspicious_ips,
    COUNT(*) FILTER (WHERE event_type = 'rate_limit') as blocked_requests,
    COUNT(*) FILTER (WHERE event_type = 'auth_attempt' AND details->>'success' = 'false') as auth_failures,
    COUNT(*) FILTER (WHERE event_type = 'login_success') as auth_successes,
    jsonb_build_object(
      'top_suspicious_ips', (
        SELECT jsonb_agg(ip_data)
        FROM (
          SELECT jsonb_build_object('ip', host(ip_address), 'count', COUNT(*), 'max_risk', MAX(risk_score))::jsonb as ip_data
          FROM security_audit_logs 
          WHERE DATE(created_at) = target_date AND risk_score >= 50
          GROUP BY ip_address
          ORDER BY MAX(risk_score) DESC, COUNT(*) DESC
          LIMIT 10
        ) top_ips
      ),
      'top_threat_types', (
        SELECT jsonb_agg(threat_data)
        FROM (
          SELECT jsonb_build_object('type', event_type, 'count', COUNT(*))::jsonb as threat_data
          FROM security_audit_logs 
          WHERE DATE(created_at) = target_date AND risk_score >= 50
          GROUP BY event_type
          ORDER BY COUNT(*) DESC
          LIMIT 5
        ) top_threats
      )
    ),
    jsonb_build_object(
      'gdpr_compliance', jsonb_build_object(
        'data_requests', 0,
        'data_exports', 0,
        'data_deletions', 0
      ),
      'security_compliance', jsonb_build_object(
        'failed_auth_attempts', COUNT(*) FILTER (WHERE event_type = 'auth_attempt' AND details->>'success' = 'false'),
        'rate_limit_hits', COUNT(*) FILTER (WHERE event_type = 'rate_limit'),
        'suspicious_activity', COUNT(*) FILTER (WHERE risk_score >= 70)
      )
    )
  FROM security_audit_logs 
  WHERE DATE(created_at) = target_date
  GROUP BY server_instance
  ON CONFLICT (date, server_instance) 
  DO UPDATE SET
    total_events = EXCLUDED.total_events,
    high_risk_events = EXCLUDED.high_risk_events,
    critical_events = EXCLUDED.critical_events,
    unique_ips = EXCLUDED.unique_ips,
    suspicious_ips = EXCLUDED.suspicious_ips,
    blocked_requests = EXCLUDED.blocked_requests,
    auth_failures = EXCLUDED.auth_failures,
    auth_successes = EXCLUDED.auth_successes,
    top_threat_indicators = EXCLUDED.top_threat_indicators,
    compliance_summary = EXCLUDED.compliance_summary;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- Migration 027: Add ML detection functions
-- =====================================

-- Create ML content analysis table
CREATE TABLE IF NOT EXISTS ml_content_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_submission_id UUID REFERENCES blog_submissions(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('spam_detection', 'content_quality', 'sentiment_analysis', 'topic_classification')),
  model_version VARCHAR(20) DEFAULT 'v1.0',
  confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  prediction_result JSONB NOT NULL,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ml_content_analysis_blog_submission_id ON ml_content_analysis(blog_submission_id);
CREATE INDEX IF NOT EXISTS idx_ml_content_analysis_type ON ml_content_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ml_content_analysis_created_at ON ml_content_analysis(created_at);

-- Create ML model performance tracking
CREATE TABLE IF NOT EXISTS ml_model_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name VARCHAR(100) NOT NULL,
  model_version VARCHAR(20) NOT NULL,
  analysis_type VARCHAR(50) NOT NULL,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  false_positives INTEGER DEFAULT 0,
  false_negatives INTEGER DEFAULT 0,
  accuracy_score DECIMAL(5,4),
  precision_score DECIMAL(5,4),
  recall_score DECIMAL(5,4),
  f1_score DECIMAL(5,4),
  last_evaluation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(model_name, model_version, analysis_type)
);

-- Create function for spam detection
CREATE OR REPLACE FUNCTION detect_spam_content(content_text TEXT, blog_url TEXT)
RETURNS JSONB AS $$
DECLARE
  spam_indicators TEXT[];
  spam_score INTEGER := 0;
  result JSONB;
BEGIN
  spam_indicators := ARRAY[]::TEXT[];
  
  -- Check for excessive capitalization
  IF (LENGTH(REGEXP_REPLACE(content_text, '[^A-Z]', '', 'g')) / LENGTH(content_text)::FLOAT) > 0.3 THEN
    spam_indicators := array_append(spam_indicators, 'excessive_caps');
    spam_score := spam_score + 20;
  END IF;
  
  -- Check for excessive exclamation marks
  IF (LENGTH(content_text) - LENGTH(REPLACE(content_text, '!', ''))) > 10 THEN
    spam_indicators := array_append(spam_indicators, 'excessive_exclamation');
    spam_score := spam_score + 15;
  END IF;
  
  -- Check for suspicious URLs
  IF blog_url ILIKE '%bit.ly%' OR blog_url ILIKE '%tinyurl%' OR blog_url ILIKE '%t.co%' THEN
    spam_indicators := array_append(spam_indicators, 'suspicious_url_shortener');
    spam_score := spam_score + 30;
  END IF;
  
  -- Check for common spam phrases
  IF content_text ILIKE '%make money fast%' 
     OR content_text ILIKE '%click here now%' 
     OR content_text ILIKE '%guaranteed income%' 
     OR content_text ILIKE '%work from home%' THEN
    spam_indicators := array_append(spam_indicators, 'spam_phrases');
    spam_score := spam_score + 25;
  END IF;
  
  -- Limit score to 100
  spam_score := LEAST(spam_score, 100);
  
  result := jsonb_build_object(
    'spam_score', spam_score,
    'is_likely_spam', spam_score > 50,
    'indicators', to_jsonb(spam_indicators),
    'confidence', CASE 
      WHEN spam_score > 80 THEN 0.95
      WHEN spam_score > 60 THEN 0.80
      WHEN spam_score > 40 THEN 0.65
      WHEN spam_score > 20 THEN 0.45
      ELSE 0.25
    END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- Migration 028: Create GDPR requests table
-- =====================================

-- Create GDPR requests table for data subject rights
CREATE TABLE IF NOT EXISTS gdpr_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection')),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  response_data JSONB,
  ip_address INET,
  user_agent TEXT,
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_email ON gdpr_requests(email);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_created_at ON gdpr_requests(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_gdpr_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gdpr_requests_updated_at
  BEFORE UPDATE ON gdpr_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_gdpr_requests_updated_at();

-- Add RLS policies
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage GDPR requests
CREATE POLICY "Admins can manage GDPR requests" ON gdpr_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = users.id 
        AND user_profiles.role = 'admin'
      )
    )
  );

-- =====================================
-- Final Comments and Documentation
-- =====================================

COMMENT ON TABLE survey_feedback IS 'Stores user survey responses separated from blogger profiles';
COMMENT ON TABLE bug_reports IS 'Tracks user-reported bugs and issues';
COMMENT ON TABLE support_requests IS 'Customer support ticket system';
COMMENT ON TABLE support_responses IS 'Responses to support tickets';
COMMENT ON TABLE investor_users IS 'Investor user profiles and verification';
COMMENT ON TABLE linkedin_verification_attempts IS 'LinkedIn verification tracking for investors';
COMMENT ON TABLE security_audit_logs IS 'Security event logging and monitoring';
COMMENT ON TABLE security_metrics_daily IS 'Daily security metrics aggregation';
COMMENT ON TABLE ml_content_analysis IS 'ML-based content analysis results';
COMMENT ON TABLE ml_model_performance IS 'ML model performance tracking';
COMMENT ON TABLE gdpr_requests IS 'GDPR data subject rights requests';
COMMENT ON TABLE blog_post_url_changes IS 'Tracks URL changes for blog posts';
COMMENT ON TABLE domain_verification_attempts IS 'Domain ownership verification attempts';
COMMENT ON TABLE uploaded_images IS 'Tracks uploaded images for blog posts';
COMMENT ON TABLE subscription_history IS 'Stripe subscription change history';
COMMENT ON TABLE search_logs IS 'User search activity logs';
COMMENT ON TABLE search_analytics IS 'Aggregated search analytics';
COMMENT ON TABLE age_verification_logs IS 'Age verification attempt logs';

-- Migration completed successfully
SELECT 'Consolidated migration 004-028 completed successfully' as status;
