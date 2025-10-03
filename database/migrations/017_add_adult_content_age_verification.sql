
-- Migration 017: Add age verification requirements for adult content
-- Ensures both bloggers and readers are age verified for 18+ content


-- Add trigger to validate blogger age before inserting/updating adult content
CREATE OR REPLACE FUNCTION validate_adult_content_blogger_age()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is adult content
  IF NEW.has_adult_content = TRUE THEN
    -- Verify blogger is age verified
    IF NOT EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = NEW.user_id AND age_verified = TRUE
    ) THEN
      RAISE EXCEPTION 'Blogger must be age verified to submit adult content. Please verify your age in profile settings.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_validate_adult_content_blogger_age') THEN
    CREATE TRIGGER trigger_validate_adult_content_blogger_age
      BEFORE INSERT OR UPDATE ON blog_submissions
      FOR EACH ROW
      EXECUTE FUNCTION validate_adult_content_blogger_age();
  END IF;
END $$;

-- Add function to check if user can view adult content
CREATE OR REPLACE FUNCTION user_can_view_adult_content(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is age verified AND has confirmed 18+ access
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = check_user_id 
    AND age_verified = TRUE 
    AND has_confirmed_18_plus = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Add RLS policy for adult content viewing
DROP POLICY IF EXISTS "Users can view adult content if age verified" ON blog_submissions;
CREATE POLICY "Users can view adult content if age verified" ON blog_submissions
FOR SELECT USING (
  has_adult_content = FALSE OR 
  (has_adult_content = TRUE AND user_can_view_adult_content(auth.uid()))
);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'blog_submissions' AND policyname = 'Users can view adult content if age verified') THEN
    CREATE POLICY "Users can view adult content if age verified" ON blog_submissions
      FOR SELECT USING (
        has_adult_content = FALSE OR 
        (has_adult_content = TRUE AND user_can_view_adult_content(auth.uid()))
      );
  END IF;
END $$;

-- Update adult_blog_submissions table to include age verification tracking
ALTER TABLE adult_blog_submissions ADD COLUMN IF NOT EXISTS blogger_age_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE adult_blog_submissions ADD COLUMN IF NOT EXISTS requires_18_plus_confirmation BOOLEAN DEFAULT TRUE;

-- Add trigger to populate age verification timestamp in adult_blog_submissions
CREATE OR REPLACE FUNCTION populate_adult_content_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- When adult content is created, record the blogger's age verification timestamp
  NEW.blogger_age_verified_at := (
    SELECT created_at FROM user_profiles 
    WHERE user_id = (
      SELECT user_id FROM blog_submissions WHERE id = NEW.blog_submission_id
    ) AND age_verified = TRUE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_populate_adult_content_verification
  BEFORE INSERT ON adult_blog_submissions
  FOR EACH ROW
  EXECUTE FUNCTION populate_adult_content_verification();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_age_verified ON user_profiles(user_id, age_verified, has_confirmed_18_plus);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_adult_content ON blog_submissions(has_adult_content, status, is_live);

-- Add comments for documentation
COMMENT ON FUNCTION validate_adult_content_blogger_age() IS 'Validates that blogger is age verified before allowing adult content submission';
COMMENT ON FUNCTION user_can_view_adult_content(UUID) IS 'Checks if user is age verified and has confirmed 18+ access for viewing adult content';
COMMENT ON COLUMN adult_blog_submissions.blogger_age_verified_at IS 'Timestamp when the blogger was age verified (for audit trail)';
COMMENT ON COLUMN adult_blog_submissions.requires_18_plus_confirmation IS 'Whether viewing this content requires explicit 18+ confirmation';
