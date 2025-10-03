
-- Migration 021: Add unique constraints to prevent duplicate URLs
-- Ensures no duplicate domain URLs in blogger_profiles and no duplicate blog post URLs in blog_submissions

ALTER TABLE blogger_profiles 
ADD CONSTRAINT unique_blog_url UNIQUE (blog_url);

ALTER TABLE blog_submissions 
ADD CONSTRAINT unique_blog_post_url UNIQUE (url);
CREATE INDEX IF NOT EXISTS idx_blogger_profiles_blog_url ON blogger_profiles(blog_url);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_url ON blog_submissions(url);
COMMENT ON CONSTRAINT unique_blog_url ON blogger_profiles IS 
'Ensures each blog domain URL can only be registered by one blogger';

COMMENT ON CONSTRAINT unique_blog_post_url ON blog_submissions IS 
'Prevents duplicate blog post submissions with the same URL across all users';

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'blogger_profiles' AND constraint_name = 'unique_blog_url') THEN
		ALTER TABLE blogger_profiles ADD CONSTRAINT unique_blog_url UNIQUE (blog_url);
	END IF;
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'blog_submissions' AND constraint_name = 'unique_blog_post_url') THEN
		ALTER TABLE blog_submissions ADD CONSTRAINT unique_blog_post_url UNIQUE (url);
	END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_blogger_profiles_blog_url ON blogger_profiles(blog_url);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_url ON blog_submissions(url);

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_catalog.pg_description d
		JOIN pg_catalog.pg_class c ON c.oid = d.objoid
		JOIN pg_catalog.pg_constraint co ON co.conrelid = c.oid AND co.conname = 'unique_blog_url'
		WHERE c.relname = 'blogger_profiles' AND d.description = 'Ensures each blog domain URL can only be registered by one blogger'
	) THEN
		COMMENT ON CONSTRAINT unique_blog_url ON blogger_profiles IS 'Ensures each blog domain URL can only be registered by one blogger';
	END IF;
	IF NOT EXISTS (
		SELECT 1 FROM pg_catalog.pg_description d
		JOIN pg_catalog.pg_class c ON c.oid = d.objoid
		JOIN pg_catalog.pg_constraint co ON co.conrelid = c.oid AND co.conname = 'unique_blog_post_url'
		WHERE c.relname = 'blog_submissions' AND d.description = 'Prevents duplicate blog post submissions with the same URL across all users'
	) THEN
		COMMENT ON CONSTRAINT unique_blog_post_url ON blog_submissions IS 'Prevents duplicate blog post submissions with the same URL across all users';
	END IF;
END $$;
