
-- Migration 012: Add blog domain verification system
-- This ensures blogger's main domain is verified before content can go live

-- Add domain verification columns to blogger_profiles
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS domain_verification_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS domain_verification_token VARCHAR(100);
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS domain_verification_method VARCHAR(20) DEFAULT 'txt_record';
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS domain_last_check TIMESTAMP WITH TIME ZONE;

-- Add constraint to ensure valid verification status
ALTER TABLE blogger_profiles ADD CONSTRAINT check_domain_verification_status 
CHECK (domain_verification_status IN ('pending', 'verified', 'failed', 'expired'));

-- Add constraint to ensure valid verification method
ALTER TABLE blogger_profiles ADD CONSTRAINT check_domain_verification_method 
CHECK (domain_verification_method IN ('txt_record', 'html_file', 'meta_tag'));

-- Create index for efficient domain verification queries
CREATE INDEX IF NOT EXISTS idx_blogger_profiles_domain_verification 
ON blogger_profiles(domain_verification_status, domain_verified_at);

-- Update blog_submissions to check for domain verification
-- Add domain verification requirement check
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS requires_domain_verification BOOLEAN DEFAULT TRUE;

-- Add comment explaining the verification requirement
COMMENT ON COLUMN blogger_profiles.domain_verification_status IS 'Domain verification status: pending, verified, failed, expired';
COMMENT ON COLUMN blogger_profiles.domain_verification_token IS 'Unique token for domain verification';
COMMENT ON COLUMN blogger_profiles.domain_verification_method IS 'Method used for verification: txt_record, html_file, meta_tag';
COMMENT ON COLUMN blogger_profiles.domain_verified_at IS 'Timestamp when domain was successfully verified';
COMMENT ON COLUMN blog_submissions.requires_domain_verification IS 'Whether this submission requires domain verification before going live';

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
