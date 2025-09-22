
-- BlogRolly Database Schema
-- Migration 006: Link user-profile tier column with Stripe status information

-- Add function to validate tier against Stripe status
CREATE OR REPLACE FUNCTION validate_tier_with_stripe()
RETURNS TRIGGER AS $$
DECLARE
    blogger_record RECORD;
    has_active_subscription BOOLEAN := FALSE;
BEGIN
    -- Only validate for users with blogger profiles (who can have subscriptions)
    SELECT * INTO blogger_record 
    FROM blogger_profiles 
    WHERE user_id = NEW.user_id;
    
    -- If user has a blogger profile, validate tier against Stripe status
    IF FOUND THEN
        -- Check if user has active subscription
        IF blogger_record.subscription_status = 'active' 
           AND blogger_record.subscription_end_date IS NOT NULL 
           AND blogger_record.subscription_end_date > NOW() THEN
            has_active_subscription := TRUE;
        END IF;
        
        -- Validate tier consistency
        IF NEW.tier = 'pro' AND NOT has_active_subscription THEN
            RAISE EXCEPTION 'Cannot set tier to pro without active Stripe subscription';
        END IF;
        
        -- Auto-correct tier if subscription is active but tier is free
        IF has_active_subscription AND NEW.tier = 'free' THEN
            NEW.tier := 'pro';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'validate_tier_stripe_trigger') THEN
        CREATE TRIGGER validate_tier_stripe_trigger
            BEFORE INSERT OR UPDATE OF tier ON user_profiles
            FOR EACH ROW
            EXECUTE FUNCTION validate_tier_with_stripe();
    END IF;
END $$;

CREATE OR REPLACE FUNCTION sync_tier_on_subscription_change()
RETURNS TRIGGER AS $$
DECLARE
    current_tier user_tier;
    should_be_pro BOOLEAN := FALSE;
BEGIN
    -- Determine if user should have pro tier based on subscription
    IF NEW.subscription_status = 'active' 
       AND NEW.subscription_end_date IS NOT NULL 
       AND NEW.subscription_end_date > NOW() THEN
        should_be_pro := TRUE;
    END IF;
    
    -- Get current tier
    SELECT tier INTO current_tier 
    FROM user_profiles 
    WHERE user_id = NEW.user_id;
    
    -- Update tier if it doesn't match subscription status
    IF should_be_pro AND current_tier != 'pro' THEN
        UPDATE user_profiles 
        SET tier = 'pro' 
        WHERE user_id = NEW.user_id;
    ELSIF NOT should_be_pro AND current_tier != 'free' THEN
        UPDATE user_profiles 
        SET tier = 'free' 
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for syncing tier on subscription change (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'sync_tier_on_subscription_change_trigger') THEN
    CREATE TRIGGER sync_tier_on_subscription_change_trigger
      AFTER UPDATE OF subscription_status, subscription_end_date ON blogger_profiles
      FOR EACH ROW
      EXECUTE FUNCTION sync_tier_on_subscription_change();
  END IF;
END $$;

-- Add trigger to sync tier when subscription status changes
DROP TRIGGER IF EXISTS sync_tier_subscription_trigger ON blogger_profiles;
CREATE TRIGGER sync_tier_subscription_trigger
    AFTER INSERT OR UPDATE OF subscription_status, subscription_end_date ON blogger_profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_tier_on_subscription_change();

-- Add function to check tier consistency (for periodic cleanup)
CREATE OR REPLACE FUNCTION check_tier_stripe_consistency()
RETURNS TABLE(
    user_id UUID,
    current_tier user_tier,
    should_be_tier user_tier,
    subscription_status VARCHAR(20),
    subscription_end_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.user_id,
        up.tier as current_tier,
        CASE 
            WHEN bp.subscription_status = 'active' 
                 AND bp.subscription_end_date > NOW() 
            THEN 'pro'::user_tier
            ELSE 'free'::user_tier
        END as should_be_tier,
        bp.subscription_status,
        bp.subscription_end_date
    FROM user_profiles up
    LEFT JOIN blogger_profiles bp ON up.user_id = bp.user_id
    WHERE 
        -- Find mismatches
        (bp.subscription_status = 'active' 
         AND bp.subscription_end_date > NOW() 
         AND up.tier != 'pro')
        OR 
        ((bp.subscription_status != 'active' 
          OR bp.subscription_end_date <= NOW() 
          OR bp.subscription_status IS NULL)
         AND up.tier != 'free');
END;
$$ LANGUAGE plpgsql;

-- Add function to fix tier inconsistencies
CREATE OR REPLACE FUNCTION fix_tier_stripe_inconsistencies()
RETURNS INTEGER AS $$
DECLARE
    fixed_count INTEGER := 0;
    inconsistent_record RECORD;
BEGIN
    -- Fix all inconsistencies
    FOR inconsistent_record IN 
        SELECT * FROM check_tier_stripe_consistency()
    LOOP
        UPDATE user_profiles 
        SET tier = inconsistent_record.should_be_tier
        WHERE user_id = inconsistent_record.user_id;
        
        fixed_count := fixed_count + 1;
    END LOOP;
    
    RETURN fixed_count;
END;
$$ LANGUAGE plpgsql;

-- Run initial cleanup to fix any existing inconsistencies
SELECT fix_tier_stripe_inconsistencies();

-- Add indexes for better performance on tier-related queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier_user_id 
ON user_profiles(tier, user_id);

CREATE INDEX IF NOT EXISTS idx_blogger_profiles_subscription_status 
ON blogger_profiles(subscription_status, subscription_end_date);

-- Add comments to document the changes
COMMENT ON FUNCTION validate_tier_with_stripe() IS 'Validates user tier against Stripe subscription status before updates';
COMMENT ON FUNCTION sync_tier_on_subscription_change() IS 'Automatically syncs user tier when Stripe subscription status changes';
COMMENT ON FUNCTION check_tier_stripe_consistency() IS 'Returns users with tier/subscription mismatches for monitoring';
COMMENT ON FUNCTION fix_tier_stripe_inconsistencies() IS 'Fixes all tier/subscription inconsistencies in the database';

COMMENT ON TRIGGER validate_tier_stripe_trigger ON user_profiles IS 'Ensures tier changes are consistent with Stripe subscription status';
COMMENT ON TRIGGER sync_tier_subscription_trigger ON blogger_profiles IS 'Automatically updates user tier when subscription status changes';

-- Add view for easy monitoring of subscription/tier status
CREATE OR REPLACE VIEW user_subscription_status AS
SELECT 
    up.user_id,
    up.first_name,
    up.surname,
    up.username,
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
LEFT JOIN blogger_profiles bp ON up.user_id = bp.user_id;

COMMENT ON VIEW user_subscription_status IS 'Provides easy monitoring of user tier and Stripe subscription consistency';
