
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
-- Migration: Auto-deactivate blog posts when URL changes and require re-approval
-- This ensures that when a blog post URL is changed, it goes through verification again

-- Function to handle URL changes
CREATE OR REPLACE FUNCTION handle_blog_url_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if URL has actually changed
  IF OLD.url IS DISTINCT FROM NEW.url THEN
    -- If the blog was previously approved or live, deactivate it and require re-approval
    IF OLD.status IN ('approved', 'live') OR OLD.is_live = true THEN
      NEW.status = 'submitted';  -- Reset to submitted for re-approval
      NEW.is_live = false;       -- Deactivate the blog
      NEW.live_at = NULL;        -- Clear live timestamp
      NEW.approved_at = NULL;    -- Clear approval timestamp
      NEW.reviewed_at = NULL;    -- Clear review timestamp
      
      -- Log the URL change in the tracking table
      INSERT INTO blog_post_url_changes (
        blog_submission_id,
        user_id,
        old_url,
        new_url,
        change_reason,
        changed_by,
        changed_at
      ) VALUES (
        NEW.id,
        NEW.user_id,
        OLD.url,
        NEW.url,
        COALESCE(NEW.url_change_reason, 'URL updated'),
        NEW.user_id,  -- Assuming user is changing their own URL
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for blog URL changes
DROP TRIGGER IF EXISTS trigger_blog_url_change ON blog_submissions;
CREATE TRIGGER trigger_blog_url_change
  BEFORE UPDATE ON blog_submissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_blog_url_change();

-- Add comment explaining the trigger
COMMENT ON TRIGGER trigger_blog_url_change ON blog_submissions IS 
'Automatically deactivates blog posts and requires re-approval when URL is changed';
