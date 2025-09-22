
-- Migration 012: Add blog domain verification system
-- This ensures blogger's main domain is verified before content can go live


ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS domain_verification_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS domain_verification_token VARCHAR(100);
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS domain_verification_method VARCHAR(20) DEFAULT 'txt_record';
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS domain_last_check TIMESTAMP WITH TIME ZONE;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'blogger_profiles' AND constraint_name = 'check_domain_verification_status') THEN
        ALTER TABLE blogger_profiles ADD CONSTRAINT check_domain_verification_status 
            CHECK (domain_verification_status IN ('pending', 'verified', 'failed', 'expired'));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'blogger_profiles' AND constraint_name = 'check_domain_verification_method') THEN
        ALTER TABLE blogger_profiles ADD CONSTRAINT check_domain_verification_method 
            CHECK (domain_verification_method IN ('txt_record', 'html_file', 'meta_tag'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_blogger_profiles_domain_verification 
    ON blogger_profiles(domain_verification_status, domain_verified_at);

ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS requires_domain_verification BOOLEAN DEFAULT TRUE;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
        WHERE c.relname = 'blogger_profiles' AND a.attname = 'domain_verification_status' AND d.description = 'Domain verification status: pending, verified, failed, expired'
    ) THEN
        COMMENT ON COLUMN blogger_profiles.domain_verification_status IS 'Domain verification status: pending, verified, failed, expired';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
        WHERE c.relname = 'blogger_profiles' AND a.attname = 'domain_verification_token' AND d.description = 'Unique token for domain verification'
    ) THEN
        COMMENT ON COLUMN blogger_profiles.domain_verification_token IS 'Unique token for domain verification';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
        WHERE c.relname = 'blogger_profiles' AND a.attname = 'domain_verification_method' AND d.description = 'Method used for verification: txt_record, html_file, meta_tag'
    ) THEN
        COMMENT ON COLUMN blogger_profiles.domain_verification_method IS 'Method used for verification: txt_record, html_file, meta_tag';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
        WHERE c.relname = 'blogger_profiles' AND a.attname = 'domain_verified_at' AND d.description = 'Timestamp when domain was successfully verified'
    ) THEN
        COMMENT ON COLUMN blogger_profiles.domain_verified_at IS 'Timestamp when domain was successfully verified';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_description d
        JOIN pg_catalog.pg_class c ON c.oid = d.objoid
        JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
        WHERE c.relname = 'blog_submissions' AND a.attname = 'requires_domain_verification' AND d.description = 'Whether this submission requires domain verification before going live'
    ) THEN
        COMMENT ON COLUMN blog_submissions.requires_domain_verification IS 'Whether this submission requires domain verification before going live';
    END IF;
END $$;

-- Create function to generate verification token
CREATE OR REPLACE FUNCTION generate_domain_verification_token()
RETURNS TEXT AS $$
BEGIN
    RETURN 'blogrolly-verify-' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create function to check if blogger can submit content
CREATE OR REPLACE FUNCTION can_blogger_submit_content(blogger_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    verification_status VARCHAR(20);
BEGIN
    SELECT domain_verification_status INTO verification_status
    FROM blogger_profiles
    WHERE user_id = blogger_user_id;
    
    RETURN verification_status = 'verified';
END;
$$ LANGUAGE plpgsql;

-- Update existing blogger profiles to generate verification tokens
UPDATE blogger_profiles 
SET domain_verification_token = generate_domain_verification_token()
WHERE domain_verification_token IS NULL;

-- Create trigger to generate token for new blogger profiles
CREATE OR REPLACE FUNCTION trigger_generate_verification_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.domain_verification_token IS NULL THEN
        NEW.domain_verification_token := generate_domain_verification_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_blogger_profiles_verification_token ON blogger_profiles;
CREATE TRIGGER trigger_blogger_profiles_verification_token
    BEFORE INSERT OR UPDATE ON blogger_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_verification_token();
