
-- Migration 016: Remove avg_time_on_page column from blog_submissions table
-- This field is no longer needed in the analytics system

-- Remove the avg_time_on_page column
ALTER TABLE blog_submissions DROP COLUMN IF EXISTS avg_time_on_page;

-- Update any views or functions that might reference this column
-- (The blog_live_status_summary view doesn't reference this field, so no changes needed)

COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow and analytics (views, clicks, ctr, bounce_rate)';
