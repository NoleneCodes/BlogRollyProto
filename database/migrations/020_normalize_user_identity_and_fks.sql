-- Migration: Normalize user identity fields and clean up foreign keys
-- Date: 2025-09-29

-- 1. Move identity fields to users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS surname VARCHAR(100),
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- 2. Migrate data from user_profiles to users
UPDATE users u
SET
    first_name = up.first_name,
    surname = up.surname,
    display_name = up.display_name,
    username = up.username
FROM user_profiles up
WHERE up.user_id = u.id;

-- 2a. Drop and recreate dependent views to use users for identity fields
DROP VIEW IF EXISTS user_tier_limits_stripe_status CASCADE;
CREATE OR REPLACE VIEW user_tier_limits_stripe_status AS
SELECT 
    utl.user_id,
    u.first_name,
    u.surname,
    u.username,
    utl.tier as tier_limits_tier,
    up.tier as profile_tier,
    utl.max_live_posts,
    utl.current_live_posts,
    bp.stripe_customer_id,
    bp.subscription_status,
    bp.subscription_end_date,
    CASE 
        WHEN bp.stripe_customer_id IS NOT NULL
             AND bp.subscription_status = 'active' 
             AND bp.subscription_end_date > NOW() 
        THEN TRUE
        ELSE FALSE
    END as has_active_subscription,
    CASE 
        WHEN bp.stripe_customer_id IS NOT NULL
             AND bp.subscription_status = 'active' 
             AND bp.subscription_end_date > NOW() 
             AND utl.tier = 'pro'
             AND up.tier = 'pro'
        THEN TRUE
        WHEN (bp.stripe_customer_id IS NULL
              OR bp.subscription_status != 'active' 
              OR bp.subscription_end_date <= NOW())
             AND utl.tier = 'free'
             AND up.tier = 'free'
        THEN TRUE
        ELSE FALSE
    END as tier_stripe_consistent
FROM user_tier_limits utl
JOIN user_profiles up ON utl.user_id = up.user_id
JOIN users u ON up.user_id = u.id
LEFT JOIN blogger_profiles bp ON utl.user_id = bp.user_id;

DROP VIEW IF EXISTS user_subscription_status CASCADE;
CREATE VIEW user_subscription_status AS
SELECT 
    up.user_id,
    u.first_name,
    u.surname,
    u.username,
    up.tier,
    bp.stripe_customer_id,
    bp.subscription_status,
    bp.subscription_end_date,
    CASE 
        WHEN bp.subscription_status = 'active' 
             AND bp.subscription_end_date > NOW() 
        THEN TRUE
        ELSE FALSE
    END as has_active_subscription,
    CASE 
        WHEN bp.subscription_status = 'active' 
             AND bp.subscription_end_date > NOW() 
             AND up.tier = 'pro'
        THEN TRUE
        WHEN (bp.subscription_status != 'active' 
              OR bp.subscription_end_date <= NOW() 
              OR bp.subscription_status IS NULL)
             AND up.tier = 'free'
        THEN TRUE
        ELSE FALSE
    END as tier_subscription_consistent
FROM user_profiles up
JOIN users u ON up.user_id = u.id
LEFT JOIN blogger_profiles bp ON up.user_id = bp.user_id;

-- 3. Remove identity columns from user_profiles
ALTER TABLE user_profiles
    DROP COLUMN IF EXISTS first_name,
    DROP COLUMN IF EXISTS surname,
    DROP COLUMN IF EXISTS display_name,
    DROP COLUMN IF EXISTS username;

-- 4. Ensure all profile tables reference users(id) directly
ALTER TABLE user_profiles
    DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey,
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE blogger_profiles
    DROP CONSTRAINT IF EXISTS blogger_profiles_user_id_fkey,
    ADD CONSTRAINT blogger_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE reader_profiles
    DROP CONSTRAINT IF EXISTS reader_profiles_user_id_fkey,
    ADD CONSTRAINT reader_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 5. Update any other FKs in related tables to reference users(id) if needed
-- (Add more ALTER TABLE statements here as required by your schema)

-- 6. Enable Row Level Security on subscription_history
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- End of migration
