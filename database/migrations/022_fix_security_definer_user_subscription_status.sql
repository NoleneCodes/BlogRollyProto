-- Migration: Remove SECURITY DEFINER from user_subscription_status view and ensure RLS enforcement
-- Date: 2025-09-29

-- Drop the old view if it exists (removes SECURITY DEFINER if present)
DROP VIEW IF EXISTS public.user_subscription_status CASCADE;

-- Recreate the view without SECURITY DEFINER/INVOKER (default: RLS enforced)
CREATE OR REPLACE VIEW public.user_subscription_status AS
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

COMMENT ON VIEW public.user_subscription_status IS 'Provides easy monitoring of user tier and Stripe subscription consistency';
