
-- Migration 010: Remove blog URL change tracking
-- Remove URL change tracking since main blog domain URLs should not be changeable

-- Drop the blog URL change history table
DROP TABLE IF EXISTS blog_url_change_history CASCADE;

-- Remove URL change tracking columns from blogger_profiles
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS last_url_change;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS url_changes_count;

-- Add comment explaining the change
COMMENT ON TABLE blogger_profiles IS 'Blogger profile information - main blog URL is not changeable after signup';
