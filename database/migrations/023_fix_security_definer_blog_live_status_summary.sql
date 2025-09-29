-- Migration: Remove SECURITY DEFINER from blog_live_status_summary view and ensure RLS enforcement
-- Date: 2025-09-29

-- Drop the old view if it exists (removes SECURITY DEFINER if present)
DROP VIEW IF EXISTS public.blog_live_status_summary CASCADE;

-- Recreate the view without SECURITY DEFINER/INVOKER (default: RLS enforced)
CREATE OR REPLACE VIEW public.blog_live_status_summary AS
SELECT 
    bs.id as submission_id,
    bs.title,
    bs.user_id,
    bs.status,
    bs.is_live,
    bp.domain_verification_status,
    utl.current_live_posts,
    utl.max_live_posts,
    can_blog_submission_go_live(bs.id) as can_go_live,
    CASE 
        WHEN bs.status != 'approved' THEN 'Not approved'
        WHEN bp.domain_verification_status != 'verified' THEN 'Domain not verified'
        WHEN utl.current_live_posts >= utl.max_live_posts THEN 'Tier limit exceeded'
        ELSE 'Eligible for live'
    END as live_status_reason
FROM blog_submissions bs
LEFT JOIN blogger_profiles bp ON bs.user_id = bp.user_id
LEFT JOIN user_tier_limits utl ON bs.user_id = utl.user_id
ORDER BY bs.created_at DESC;

COMMENT ON VIEW public.blog_live_status_summary IS 'Provides overview of blog submission live status eligibility and reasons';
