
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

-- Create trigger to validate domain on insert and update
DROP TRIGGER IF EXISTS validate_blog_domain_trigger ON blog_submissions;
CREATE TRIGGER validate_blog_domain_trigger
    BEFORE INSERT OR UPDATE OF url ON blog_submissions
    FOR EACH ROW
    EXECUTE FUNCTION validate_blog_post_domain();

-- Add index for better performance on domain checks
CREATE INDEX IF NOT EXISTS idx_blog_submissions_user_url ON blog_submissions(user_id, url);

-- Add constraint to ensure URLs are HTTPS and have paths
ALTER TABLE blog_submissions ADD CONSTRAINT IF NOT EXISTS check_url_format 
    CHECK (url ~ '^https://[^/]+/.+');

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT check_url_format ON blog_submissions IS 'Ensures blog post URLs are HTTPS and include a path beyond the domain';
COMMENT ON FUNCTION validate_blog_post_domain() IS 'Validates that blog post URLs match the bloggers verified domain';
