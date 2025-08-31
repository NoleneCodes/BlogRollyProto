
-- Migration 015: Add comprehensive live status constraints
-- Ensures is_live column responds to domain verification, tier limits, and approval status

-- Create function to check if a blog submission can go live
CREATE OR REPLACE FUNCTION can_blog_submission_go_live(submission_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    submission_record RECORD;
    blogger_profile RECORD;
    tier_limits RECORD;
    current_live_count INTEGER;
BEGIN
    -- Get submission details
    SELECT * INTO submission_record 
    FROM blog_submissions 
    WHERE id = submission_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if blog is approved
    IF submission_record.status != 'approved' THEN
        RETURN FALSE;
    END IF;
    
    -- Get blogger profile and domain verification status
    SELECT * INTO blogger_profile 
    FROM blogger_profiles 
    WHERE user_id = submission_record.user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check domain verification
    IF blogger_profile.domain_verification_status != 'verified' THEN
        RETURN FALSE;
    END IF;
    
    -- Get tier limits
    SELECT * INTO tier_limits 
    FROM user_tier_limits 
    WHERE user_id = submission_record.user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Count current live posts (excluding this one if it's already live)
    SELECT COUNT(*) INTO current_live_count
    FROM blog_submissions 
    WHERE user_id = submission_record.user_id 
    AND is_live = TRUE 
    AND id != submission_id;
    
    -- Check tier limits
    IF current_live_count >= tier_limits.max_live_posts THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to enforce live status constraints
CREATE OR REPLACE FUNCTION enforce_live_status_constraints()
RETURNS TRIGGER AS $$
BEGIN
    -- If trying to set is_live to TRUE, check all constraints
    IF NEW.is_live = TRUE AND (OLD.is_live = FALSE OR OLD.is_live IS NULL) THEN
        IF NOT can_blog_submission_go_live(NEW.id) THEN
            RAISE EXCEPTION 'Blog submission cannot go live: domain not verified, not approved, or tier limit exceeded';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce constraints on blog_submissions
DROP TRIGGER IF EXISTS enforce_live_status_trigger ON blog_submissions;
CREATE TRIGGER enforce_live_status_trigger
    BEFORE INSERT OR UPDATE OF is_live ON blog_submissions
    FOR EACH ROW
    EXECUTE FUNCTION enforce_live_status_constraints();

-- Create function to auto-update live status when conditions change
CREATE OR REPLACE FUNCTION auto_update_live_status_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to approved, check if it can go live automatically
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        IF can_blog_submission_go_live(NEW.id) THEN
            NEW.is_live := TRUE;
        END IF;
    END IF;
    
    -- If status changed from approved, automatically set to not live
    IF NEW.status != 'approved' AND OLD.status = 'approved' THEN
        NEW.is_live := FALSE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating live status on approval changes
DROP TRIGGER IF EXISTS auto_live_status_on_approval_trigger ON blog_submissions;
CREATE TRIGGER auto_live_status_on_approval_trigger
    BEFORE UPDATE OF status ON blog_submissions
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_live_status_on_approval();

-- Create function to handle domain verification status changes
CREATE OR REPLACE FUNCTION handle_domain_verification_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If domain verification status changed from verified to something else
    IF OLD.domain_verification_status = 'verified' AND NEW.domain_verification_status != 'verified' THEN
        -- Set all live blog submissions for this user to not live
        UPDATE blog_submissions 
        SET is_live = FALSE 
        WHERE user_id = NEW.user_id AND is_live = TRUE;
    END IF;
    
    -- If domain verification status changed to verified
    IF NEW.domain_verification_status = 'verified' AND OLD.domain_verification_status != 'verified' THEN
        -- Check if any approved submissions can now go live
        UPDATE blog_submissions 
        SET is_live = TRUE 
        WHERE user_id = NEW.user_id 
        AND status = 'approved' 
        AND is_live = FALSE
        AND can_blog_submission_go_live(id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for domain verification changes
DROP TRIGGER IF EXISTS handle_domain_verification_trigger ON blogger_profiles;
CREATE TRIGGER handle_domain_verification_trigger
    AFTER UPDATE OF domain_verification_status ON blogger_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_domain_verification_change();

-- Create function to handle tier limit changes
CREATE OR REPLACE FUNCTION handle_tier_limit_change()
RETURNS TRIGGER AS $$
DECLARE
    current_live_count INTEGER;
    excess_submissions CURSOR FOR
        SELECT id FROM blog_submissions 
        WHERE user_id = NEW.user_id 
        AND is_live = TRUE 
        ORDER BY updated_at DESC 
        OFFSET NEW.max_live_posts;
BEGIN
    -- If max_live_posts decreased, we may need to deactivate some posts
    IF NEW.max_live_posts < OLD.max_live_posts THEN
        -- Count current live posts
        SELECT COUNT(*) INTO current_live_count
        FROM blog_submissions 
        WHERE user_id = NEW.user_id AND is_live = TRUE;
        
        -- If user exceeds new limit, deactivate excess posts (oldest first)
        IF current_live_count > NEW.max_live_posts THEN
            FOR submission IN excess_submissions LOOP
                UPDATE blog_submissions 
                SET is_live = FALSE 
                WHERE id = submission.id;
            END LOOP;
        END IF;
    END IF;
    
    -- If max_live_posts increased, check if any approved submissions can now go live
    IF NEW.max_live_posts > OLD.max_live_posts THEN
        UPDATE blog_submissions 
        SET is_live = TRUE 
        WHERE user_id = NEW.user_id 
        AND status = 'approved' 
        AND is_live = FALSE
        AND can_blog_submission_go_live(id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tier limit changes
DROP TRIGGER IF EXISTS handle_tier_limit_trigger ON user_tier_limits;
CREATE TRIGGER handle_tier_limit_trigger
    AFTER UPDATE OF max_live_posts ON user_tier_limits
    FOR EACH ROW
    EXECUTE FUNCTION handle_tier_limit_change();

-- Add constraint to ensure is_live can only be true for approved submissions
ALTER TABLE blog_submissions ADD CONSTRAINT IF NOT EXISTS check_live_only_approved 
CHECK (
    (is_live = FALSE) OR 
    (is_live = TRUE AND status = 'approved')
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_live_status_user 
ON blog_submissions(user_id, is_live, status);

CREATE INDEX IF NOT EXISTS idx_blogger_profiles_domain_verification_user 
ON blogger_profiles(user_id, domain_verification_status);

-- Add comments for documentation
COMMENT ON FUNCTION can_blog_submission_go_live(UUID) IS 'Checks if a blog submission meets all criteria to go live: approved, domain verified, within tier limits';
COMMENT ON FUNCTION enforce_live_status_constraints() IS 'Prevents setting is_live=true unless all conditions are met';
COMMENT ON FUNCTION auto_update_live_status_on_approval() IS 'Automatically manages live status when approval status changes';
COMMENT ON FUNCTION handle_domain_verification_change() IS 'Manages live status when domain verification status changes';
COMMENT ON FUNCTION handle_tier_limit_change() IS 'Manages live status when tier limits change';
COMMENT ON CONSTRAINT check_live_only_approved ON blog_submissions IS 'Ensures only approved submissions can be live';

-- Create view for easy monitoring of live status eligibility
CREATE OR REPLACE VIEW blog_live_status_summary AS
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

COMMENT ON VIEW blog_live_status_summary IS 'Provides overview of blog submission live status eligibility and reasons';
