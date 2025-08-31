
-- Migration 021: Add unique constraints to prevent duplicate URLs
-- Ensures no duplicate domain URLs in blogger_profiles and no duplicate blog post URLs in blog_submissions

-- Add unique constraint for blog domain URLs in blogger_profiles
-- This prevents multiple bloggers from using the same domain
ALTER TABLE blogger_profiles 
ADD CONSTRAINT unique_blog_url UNIQUE (blog_url);

-- Add unique constraint for blog post URLs in blog_submissions
-- This prevents duplicate blog post submissions with the same URL
ALTER TABLE blog_submissions 
ADD CONSTRAINT unique_blog_post_url UNIQUE (url);

-- Create indexes for better performance on URL lookups
CREATE INDEX IF NOT EXISTS idx_blogger_profiles_blog_url ON blogger_profiles(blog_url);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_url ON blog_submissions(url);

-- Add comments explaining the constraints
COMMENT ON CONSTRAINT unique_blog_url ON blogger_profiles IS 
'Ensures each blog domain URL can only be registered by one blogger';

COMMENT ON CONSTRAINT unique_blog_post_url ON blog_submissions IS 
'Prevents duplicate blog post submissions with the same URL across all users';
