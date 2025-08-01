
-- Migration 018: Enforce tier limits consistency with Stripe subscription status
-- Ensures the tier column in user_tier_limits table is always linked with actual Stripe status

-- Create function to validate tier limits against Stripe status
CREATE OR REPLACE FUNCTION validate_tier_limits_with_stripe()
RETURNS TRIGGER AS $$
DECLARE
    user_profile_record RECORD;
    blogger_record RECORD;
    has_active_subscription BOOLEAN := FALSE;
    correct_tier user_tier;
BEGIN
    -- Get user profile and blogger profile data
    SELECT * INTO user_profile_record 
    FROM user_profiles 
    WHERE user_id = NEW.user_id;
    
    SELECT * INTO blogger_record 
    FROM blogger_profiles 
    WHERE user_id = NEW.user_id;
    
    -- Determine correct tier based on Stripe status
    IF blogger_record.stripe_customer_id IS NOT NULL 
       AND blogger_record.subscription_status = 'active' 
       AND blogger_record.subscription_end_date IS NOT NULL 
       AND blogger_record.subscription_end_date > NOW() THEN
        has_active_subscription := TRUE;
        correct_tier := 'pro';
    ELSE
        correct_tier := 'free';
    END IF;
    
    -- Validate that tier in user_tier_limits matches Stripe status
    IF NEW.tier != correct_tier THEN
        RAISE EXCEPTION 'Tier in user_tier_limits (%) does not match Stripe subscription status (should be %)', 
            NEW.tier, correct_tier;
    END IF;
    
    -- Also validate that user_profiles tier matches
    IF user_profile_record.tier != correct_tier THEN
        RAISE EXCEPTION 'User profile tier (%) does not match Stripe subscription status (should be %)', 
            user_profile_record.tier, correct_tier;
    END IF;
    
    -- Set correct max_live_posts based on tier
    IF NEW.tier = 'pro' THEN
        NEW.max_live_posts := 999999;
    ELSE
        NEW.max_live_posts := 3;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate tier limits on insert/update
DROP TRIGGER IF EXISTS validate_tier_limits_stripe_trigger ON user_tier_limits;
CREATE TRIGGER validate_tier_limits_stripe_trigger
    BEFORE INSERT OR UPDATE OF tier ON user_tier_limits
    FOR EACH ROW
    EXECUTE FUNCTION validate_tier_limits_with_stripe();

-- Create function to sync tier limits when Stripe status changes
CREATE OR REPLACE FUNCTION sync_tier_limits_on_stripe_change()
RETURNS TRIGGER AS $$
DECLARE
    should_be_pro BOOLEAN := FALSE;
    correct_tier user_tier;
    current_tier_limits RECORD;
BEGIN
    -- Determine correct tier based on new Stripe status
    IF NEW.stripe_customer_id IS NOT NULL 
       AND NEW.subscription_status = 'active' 
       AND NEW.subscription_end_date IS NOT NULL 
       AND NEW.subscription_end_date > NOW() THEN
        should_be_pro := TRUE;
        correct_tier := 'pro';
    ELSE
        correct_tier := 'free';
    END IF;
    
    -- Get current tier limits
    SELECT * INTO current_tier_limits 
    FROM user_tier_limits 
    WHERE user_id = NEW.user_id;
    
    -- Update tier limits if they don't match Stripe status
    IF current_tier_limits.tier != correct_tier THEN
        UPDATE user_tier_limits 
        SET 
            tier = correct_tier,
            max_live_posts = CASE 
                WHEN correct_tier = 'pro' THEN 999999
                ELSE 3
            END,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        -- Also sync user_profiles tier
        UPDATE user_profiles 
        SET tier = correct_tier 
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to sync tier limits when blogger Stripe status changes
DROP TRIGGER IF EXISTS sync_tier_limits_stripe_trigger ON blogger_profiles;
CREATE TRIGGER sync_tier_limits_stripe_trigger
    AFTER UPDATE OF stripe_customer_id, subscription_status, subscription_end_date ON blogger_profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_tier_limits_on_stripe_change();

-- Create function to check and fix tier limits inconsistencies
CREATE OR REPLACE FUNCTION check_tier_limits_stripe_consistency()
RETURNS TABLE(
    user_id UUID,
    current_tier_limits user_tier,
    current_user_tier user_tier,
    should_be_tier user_tier,
    stripe_customer_id TEXT,
    subscription_status TEXT,
    subscription_end_date TIMESTAMPTZ,
    inconsistent BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        utl.user_id,
        utl.tier as current_tier_limits,
        up.tier as current_user_tier,
        CASE 
            WHEN bp.stripe_customer_id IS NOT NULL
                 AND bp.subscription_status = 'active' 
                 AND bp.subscription_end_date > NOW() 
            THEN 'pro'::user_tier
            ELSE 'free'::user_tier
        END as should_be_tier,
        bp.stripe_customer_id,
        bp.subscription_status,
        bp.subscription_end_date,
        CASE 
            WHEN bp.stripe_customer_id IS NOT NULL
                 AND bp.subscription_status = 'active' 
                 AND bp.subscription_end_date > NOW() 
                 AND (utl.tier != 'pro' OR up.tier != 'pro')
            THEN TRUE
            WHEN (bp.stripe_customer_id IS NULL
                  OR bp.subscription_status != 'active' 
                  OR bp.subscription_end_date <= NOW())
                 AND (utl.tier != 'free' OR up.tier != 'free')
            THEN TRUE
            ELSE FALSE
        END as inconsistent
    FROM user_tier_limits utl
    JOIN user_profiles up ON utl.user_id = up.user_id
    LEFT JOIN blogger_profiles bp ON utl.user_id = bp.user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to fix all tier limits inconsistencies
CREATE OR REPLACE FUNCTION fix_tier_limits_stripe_inconsistencies()
RETURNS INTEGER AS $$
DECLARE
    fixed_count INTEGER := 0;
    inconsistent_record RECORD;
BEGIN
    -- Fix all inconsistencies
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

-- Add foreign key constraint to ensure user_tier_limits references valid users
ALTER TABLE user_tier_limits 
ADD CONSTRAINT IF NOT EXISTS fk_user_tier_limits_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- Add constraint to ensure tier limits are consistent with user profile tier
ALTER TABLE user_tier_limits 
ADD CONSTRAINT IF NOT EXISTS check_tier_consistent_with_profile 
CHECK (
    tier = (SELECT tier FROM user_profiles WHERE user_profiles.user_id = user_tier_limits.user_id)
);

-- Add index for better performance on Stripe-related queries
CREATE INDEX IF NOT EXISTS idx_blogger_profiles_stripe_subscription 
ON blogger_profiles(user_id, stripe_customer_id, subscription_status, subscription_end_date);

CREATE INDEX IF NOT EXISTS idx_user_tier_limits_tier_user 
ON user_tier_limits(user_id, tier);

-- Run initial cleanup to fix any existing inconsistencies
SELECT fix_tier_limits_stripe_inconsistencies();

-- Add view for easy monitoring of tier limits and Stripe consistency
CREATE OR REPLACE VIEW user_tier_limits_stripe_status AS
SELECT 
    utl.user_id,
    up.first_name,
    up.surname,
    up.username,
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
LEFT JOIN blogger_profiles bp ON utl.user_id = bp.user_id;

-- Add comments to document the changes
COMMENT ON FUNCTION validate_tier_limits_with_stripe() IS 'Validates user tier limits against Stripe subscription status before updates';
COMMENT ON FUNCTION sync_tier_limits_on_stripe_change() IS 'Automatically syncs user tier limits when Stripe subscription status changes';
COMMENT ON FUNCTION check_tier_limits_stripe_consistency() IS 'Returns users with tier limits/Stripe subscription mismatches for monitoring';
COMMENT ON FUNCTION fix_tier_limits_stripe_inconsistencies() IS 'Fixes all tier limits/Stripe subscription inconsistencies in the database';

COMMENT ON TRIGGER validate_tier_limits_stripe_trigger ON user_tier_limits IS 'Ensures tier limits changes are consistent with Stripe subscription status';
COMMENT ON TRIGGER sync_tier_limits_stripe_trigger ON blogger_profiles IS 'Automatically updates tier limits when Stripe subscription status changes';

COMMENT ON VIEW user_tier_limits_stripe_status IS 'Provides easy monitoring of user tier limits and Stripe subscription consistency';

-- Add constraint to ensure max_live_posts matches tier
ALTER TABLE user_tier_limits 
ADD CONSTRAINT IF NOT EXISTS check_max_live_posts_matches_tier 
CHECK (
    (tier = 'free' AND max_live_posts = 3) OR 
    (tier = 'pro' AND max_live_posts = 999999)
);
