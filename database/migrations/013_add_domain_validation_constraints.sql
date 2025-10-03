
-- Migration 013: Add domain validation constraints for blog submissions

-- Create a function to validate blog post URL matches blogger's domain
CREATE OR REPLACE FUNCTION validate_blog_post_domain()
RETURNS TRIGGER AS $$
DECLARE
    blogger_domain TEXT;
    post_domain TEXT;
    blogger_verification_status TEXT;
BEGIN
    -- Get the blogger's verified domain and verification status
    SELECT 
        blog_url,
        domain_verification_status
    INTO 
        blogger_domain,
        blogger_verification_status
    FROM blogger_profiles 
    WHERE user_id = NEW.user_id;
    
    -- Check if blogger profile exists
    IF blogger_domain IS NULL THEN
        RAISE EXCEPTION 'Blogger profile not found for user_id: %', NEW.user_id;
    END IF;
    
    -- Check if domain is verified
    IF blogger_verification_status != 'verified' THEN
        RAISE EXCEPTION 'Domain must be verified before submitting blog posts. Current status: %', blogger_verification_status;
    END IF;
    
    -- Extract domain from post URL and blogger's blog URL
    post_domain := regexp_replace(NEW.url, '^https?://(www\.)?([^/]+).*', '\2');
    blogger_domain := regexp_replace(blogger_domain, '^https?://(www\.)?([^/]+).*', '\2');
    
    -- Compare domains (case insensitive)
    IF LOWER(post_domain) != LOWER(blogger_domain) THEN
        RAISE EXCEPTION 'Blog post URL domain (%) does not match verified blog domain (%)', post_domain, blogger_domain;
    END IF;
    
    -- Ensure post URL has a path (not just the domain)
    IF NEW.url ~ '^https?://[^/]+/?$' THEN
        RAISE EXCEPTION 'Blog post URL must include a specific path to the post (e.g., /blog/my-post-title)';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'validate_blog_domain_trigger') THEN
        CREATE TRIGGER validate_blog_domain_trigger
            BEFORE INSERT OR UPDATE OF url ON blog_submissions
            FOR EACH ROW
            EXECUTE FUNCTION validate_blog_post_domain();
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_blog_submissions_user_url ON blog_submissions(user_id, url);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'blog_submissions' AND constraint_name = 'check_url_format') THEN
        ALTER TABLE blog_submissions ADD CONSTRAINT check_url_format 
            CHECK (url ~ '^https://[^/]+/.+');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        JOIN pg_catalog.pg_constraint co ON co.conrelid = c.oid AND co.conname = 'check_url_format'
        WHERE c.relname = 'blog_submissions' AND d.description = 'Ensures blog post URLs are HTTPS and include a path beyond the domain'
    ) THEN
        COMMENT ON CONSTRAINT check_url_format ON blog_submissions IS 'Ensures blog post URLs are HTTPS and include a path beyond the domain';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_proc p ON p.oid = d.objoid
        WHERE p.proname = 'validate_blog_post_domain' AND d.description = 'Validates that blog post URLs match the bloggers verified domain'
    ) THEN
        COMMENT ON FUNCTION validate_blog_post_domain() IS 'Validates that blog post URLs match the bloggers verified domain';
    END IF;
END $$;
