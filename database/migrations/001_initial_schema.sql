
-- BlogRolly Database Schema
-- Migration 001: Initial Schema Setup

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('reader', 'blogger', 'admin', 'moderator');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add separate readers and bloggers tables for foreign key support
CREATE TABLE IF NOT EXISTS readers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bloggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
DO $$ BEGIN
  CREATE TYPE user_tier AS ENUM ('free', 'pro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE blog_status AS ENUM ('draft', 'submitted', 'pending', 'approved', 'rejected', 'live', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE rejection_reason AS ENUM (
    'inappropriate_content',
    'broken_link',
    'spam', 
    'teaser_paywall',
    'malicious_site',
    'not_a_blog',
    'duplicate',
    'ai_generated_low_quality',
    'copyright_violation'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  username VARCHAR(50) UNIQUE,
  date_of_birth DATE NOT NULL,
  age_verified BOOLEAN DEFAULT FALSE,
  has_confirmed_18_plus BOOLEAN DEFAULT FALSE,
  role user_role DEFAULT 'reader',
  tier user_tier DEFAULT 'free',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reader_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topics TEXT[] DEFAULT '{}',
  other_topic TEXT,
  subscribe_to_updates BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blogger_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blog_url VARCHAR(500) NOT NULL,
  blog_name VARCHAR(200) NOT NULL,
  blog_description TEXT,
  categories TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  monetization_methods TEXT[] DEFAULT '{}',
  audience_size VARCHAR(50),
  is_verified BOOLEAN DEFAULT FALSE,
  stripe_customer_id VARCHAR(100),
  subscription_status VARCHAR(20),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  url VARCHAR(1000) NOT NULL,
  image_url TEXT,
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status blog_status DEFAULT 'draft',
  has_adult_content BOOLEAN DEFAULT FALSE,
  is_live BOOLEAN DEFAULT FALSE,
  
  -- Analytics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,4) DEFAULT 0,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  live_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adult_blog_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_submission_id UUID REFERENCES blog_submissions(id) ON DELETE CASCADE,
  content_warnings TEXT[] DEFAULT '{}',
  age_verification_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_submission_id UUID REFERENCES blog_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected')),
  rejection_reason rejection_reason,
  rejection_note TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_tier_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier user_tier NOT NULL,
  max_live_posts INTEGER NOT NULL,
  current_live_posts INTEGER DEFAULT 0,
  total_approved_posts INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  template_data JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_age_verified ON user_profiles(age_verified);
CREATE INDEX IF NOT EXISTS idx_reader_profiles_user_id ON reader_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_blogger_profiles_user_id ON blogger_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_blogger_profiles_verified ON blogger_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_user_id ON blog_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_status ON blog_submissions(status);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_adult_content ON blog_submissions(has_adult_content);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_is_live ON blog_submissions(is_live);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_category ON blog_submissions(category);
CREATE INDEX IF NOT EXISTS idx_blog_reviews_submission_id ON blog_reviews(blog_submission_id);
CREATE INDEX IF NOT EXISTS idx_blog_reviews_reviewer_id ON blog_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_tier_limits_user_id ON user_tier_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON email_queue(user_id);

-- Functions to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reader_profiles_updated_at BEFORE UPDATE ON reader_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blogger_profiles_updated_at BEFORE UPDATE ON blogger_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_submissions_updated_at BEFORE UPDATE ON blog_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_tier_limits_updated_at BEFORE UPDATE ON user_tier_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user tier limits
CREATE OR REPLACE FUNCTION initialize_user_tier_limits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_tier_limits (user_id, tier, max_live_posts, current_live_posts, total_approved_posts)
    VALUES (
        NEW.user_id, 
        NEW.tier, 
        CASE 
            WHEN NEW.tier = 'free' THEN 3
            WHEN NEW.tier = 'pro' THEN 999999
            ELSE 3
        END,
        0,
        0
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-create tier limits when user profile is created
CREATE TRIGGER create_user_tier_limits_on_profile_insert 
  AFTER INSERT ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION initialize_user_tier_limits();

-- Function to update live post counts
CREATE OR REPLACE FUNCTION update_live_post_count()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to live, increment count
    IF NEW.is_live = TRUE AND (OLD.is_live = FALSE OR OLD.is_live IS NULL) THEN
        UPDATE user_tier_limits 
        SET current_live_posts = current_live_posts + 1
        WHERE user_id = NEW.user_id;
    END IF;
    
    -- If status changed from live, decrement count
    IF NEW.is_live = FALSE AND OLD.is_live = TRUE THEN
        UPDATE user_tier_limits 
        SET current_live_posts = current_live_posts - 1
        WHERE user_id = NEW.user_id;
    END IF;
    
    -- If status changed to approved, increment total approved
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE user_tier_limits 
        SET total_approved_posts = total_approved_posts + 1
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update live post counts
CREATE TRIGGER update_live_post_count_trigger 
  AFTER UPDATE ON blog_submissions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_live_post_count();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reader_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogger_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adult_blog_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tier_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can expand these based on your needs)
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON blog_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON blog_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own submissions" ON blog_submissions FOR UPDATE USING (auth.uid() = user_id);

-- Public can view live, approved blogs (non-adult content by default)
CREATE POLICY "Public can view live blogs" ON blog_submissions FOR SELECT USING (
  status = 'live' AND is_live = true AND 
  (has_adult_content = false OR 
   EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND has_confirmed_18_plus = true))
);

-- Admins and moderators can view all submissions
CREATE POLICY "Admins can view all submissions" ON blog_submissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- Comments for documentation
COMMENT ON TABLE users IS 'Core user authentication data';
COMMENT ON TABLE user_profiles IS 'Extended user profile information with age verification';
COMMENT ON TABLE reader_profiles IS 'Reader-specific preferences and topics';
COMMENT ON TABLE blogger_profiles IS 'Blogger-specific information and verification status';
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow';
COMMENT ON TABLE adult_blog_submissions IS 'Separate table for 18+ content with additional warnings';
COMMENT ON TABLE blog_reviews IS 'Admin review actions and rejection reasons';
COMMENT ON TABLE user_tier_limits IS 'User tier limits and current usage tracking';
COMMENT ON TABLE email_queue IS 'Queue for outbound email notifications';

COMMENT ON COLUMN user_profiles.age_verified IS 'Primary age verification at signup (18+)';
COMMENT ON COLUMN user_profiles.has_confirmed_18_plus IS 'Secondary confirmation for accessing 18+ content';
COMMENT ON COLUMN blog_submissions.has_adult_content IS 'Flags content as 18+ requiring age verification';
COMMENT ON COLUMN blog_submissions.is_live IS 'Whether post is currently live (affects tier limits)';
COMMENT ON COLUMN user_tier_limits.max_live_posts IS '3 for free tier, unlimited for pro';
