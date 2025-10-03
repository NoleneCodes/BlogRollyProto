
-- Migration 011: Update blogger_profiles table schema to reflect current state
-- This migration ensures the table matches the current interface and removes any legacy fields

-- First, ensure the table has the correct structure by dropping columns that may exist from old migrations
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS last_url_change;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS url_changes_count;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS monetization_methods;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS audience_size;

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

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        WHERE c.relname = 'blogger_profiles' AND d.description = 'Blogger profile information - main blog URL is not changeable after signup, survey data stored separately'
    ) THEN
        COMMENT ON TABLE blogger_profiles IS 'Blogger profile information - main blog URL is not changeable after signup, survey data stored separately';
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
        WHERE c.relname = 'blogger_profiles' AND a.attname = 'blog_url' AND d.description = 'Main blog domain URL - set at signup and not changeable thereafter'
    ) THEN
        COMMENT ON COLUMN blogger_profiles.blog_url IS 'Main blog domain URL - set at signup and not changeable thereafter';
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
        WHERE c.relname = 'blogger_profiles' AND a.attname = 'is_verified' AND d.description = 'Blog ownership verification status'
    ) THEN
        COMMENT ON COLUMN blogger_profiles.is_verified IS 'Blog ownership verification status';
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
        WHERE c.relname = 'blogger_profiles' AND a.attname = 'stripe_customer_id' AND d.description = 'Stripe customer ID for subscription management'
    ) THEN
        COMMENT ON COLUMN blogger_profiles.stripe_customer_id IS 'Stripe customer ID for subscription management';
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
        WHERE c.relname = 'blogger_profiles' AND a.attname = 'subscription_status' AND d.description = 'Current subscription status (active, canceled, past_due)'
    ) THEN
        COMMENT ON COLUMN blogger_profiles.subscription_status IS 'Current subscription status (active, canceled, past_due)';
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
        WHERE c.relname = 'blogger_profiles' AND a.attname = 'subscription_end_date' AND d.description = 'When the current subscription period ends'
    ) THEN
        COMMENT ON COLUMN blogger_profiles.subscription_end_date IS 'When the current subscription period ends';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_blogger_profiles_user_id ON blogger_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_blogger_profiles_verified ON blogger_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_blogger_profiles_subscription_status ON blogger_profiles(subscription_status, subscription_end_date);

ALTER TABLE blogger_profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
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
