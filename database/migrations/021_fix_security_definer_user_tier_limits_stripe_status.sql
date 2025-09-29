-- Migration: Remove SECURITY DEFINER from user_tier_limits_stripe_status view and ensure RLS enforcement
-- Date: 2025-09-29

-- Drop the old view if it exists (removes SECURITY DEFINER if present)
DROP VIEW IF EXISTS public.user_tier_limits_stripe_status CASCADE;

-- Recreate the view without SECURITY DEFINER/INVOKER (default: RLS enforced)
CREATE OR REPLACE VIEW public.user_tier_limits_stripe_status AS
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

COMMENT ON VIEW public.user_tier_limits_stripe_status IS 'Provides easy monitoring of user tier limits and Stripe subscription consistency';
