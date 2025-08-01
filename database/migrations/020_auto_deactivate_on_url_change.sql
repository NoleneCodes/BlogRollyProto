
-- Migration: Auto-deactivate blogs when URL is changed
-- This ensures changed URLs go through verification again

-- Add function to handle URL changes
CREATE OR REPLACE FUNCTION handle_blog_url_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if URL actually changed
  IF OLD.url IS DISTINCT FROM NEW.url THEN
    -- Deactivate the blog (set is_live to false)
    NEW.is_live := FALSE;
    NEW.live_at := NULL;
    
    -- Reset status to pending for re-approval
    NEW.status := 'pending';
    
    -- Update the submission timestamp to current time for re-processing
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    -- Log this change
    INSERT INTO blog_post_url_changes (
      blog_submission_id,
      old_url,
      new_url,
      change_reason,
      changed_by,
      changed_at
    ) VALUES (
      NEW.id,
      OLD.url,
      NEW.url,
      COALESCE(NEW.url_change_reason, 'URL updated - automatic deactivation'),
      NEW.user_id,
      CURRENT_TIMESTAMP
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for blog submissions
DROP TRIGGER IF EXISTS trigger_blog_url_change ON blog_submissions;
CREATE TRIGGER trigger_blog_url_change
  BEFORE UPDATE ON blog_submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_blog_url_change();

-- Add index for better performance on URL change queries
CREATE INDEX IF NOT EXISTS idx_blog_submissions_url_status 
ON blog_submissions(url, status, is_live);
