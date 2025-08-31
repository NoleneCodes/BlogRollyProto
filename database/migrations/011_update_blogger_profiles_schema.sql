
-- Migration 011: Update blogger_profiles table schema to reflect current state
-- This migration ensures the table matches the current interface and removes any legacy fields

-- First, ensure the table has the correct structure by dropping columns that may exist from old migrations
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS last_url_change;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS url_changes_count;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS monetization_methods;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS audience_size;

-- Ensure all required columns exist with correct constraints
-- These statements will only add columns if they don't already exist
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS blog_url VARCHAR(500) NOT NULL;
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS blog_name VARCHAR(200) NOT NULL;
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS blog_description TEXT;
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100);
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20);
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update the table comment to reflect current purpose
COMMENT ON TABLE blogger_profiles IS 'Blogger profile information - main blog URL is not changeable after signup, survey data stored separately';

-- Add specific column comments for clarity
COMMENT ON COLUMN blogger_profiles.blog_url IS 'Main blog domain URL - set at signup and not changeable thereafter';
COMMENT ON COLUMN blogger_profiles.is_verified IS 'Blog ownership verification status';
COMMENT ON COLUMN blogger_profiles.stripe_customer_id IS 'Stripe customer ID for subscription management';
COMMENT ON COLUMN blogger_profiles.subscription_status IS 'Current subscription status (active, canceled, past_due)';
COMMENT ON COLUMN blogger_profiles.subscription_end_date IS 'When the current subscription period ends';

-- Ensure proper indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_blogger_profiles_user_id ON blogger_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_blogger_profiles_verified ON blogger_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_blogger_profiles_subscription_status ON blogger_profiles(subscription_status, subscription_end_date);

-- Ensure RLS is enabled
ALTER TABLE blogger_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate essential RLS policies if they don't exist
DO $$ 
BEGIN
    -- Policy for users to view their own blogger profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogger_profiles' 
        AND policyname = 'Users can view own blogger profile'
    ) THEN
        CREATE POLICY "Users can view own blogger profile" 
        ON blogger_profiles FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    -- Policy for users to update their own blogger profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogger_profiles' 
        AND policyname = 'Users can update own blogger profile'
    ) THEN
        CREATE POLICY "Users can update own blogger profile" 
        ON blogger_profiles FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    -- Policy for users to insert their own blogger profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogger_profiles' 
        AND policyname = 'Users can insert own blogger profile'
    ) THEN
        CREATE POLICY "Users can insert own blogger profile" 
        ON blogger_profiles FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
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

-- Ensure the updated_at trigger exists
DROP TRIGGER IF EXISTS update_blogger_profiles_updated_at ON blogger_profiles;
CREATE TRIGGER update_blogger_profiles_updated_at 
    BEFORE UPDATE ON blogger_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Final verification comment
COMMENT ON CONSTRAINT blogger_profiles_pkey ON blogger_profiles IS 'Primary key for blogger profiles - cleaned schema without URL change tracking';
