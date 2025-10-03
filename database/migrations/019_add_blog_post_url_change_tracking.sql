
-- Migration 019: Add blog post URL change tracking
-- Track when blog post URLs are changed and capture the reason

-- Create table for tracking blog post URL changes

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_post_url_changes') THEN
    CREATE TABLE blog_post_url_changes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      blog_submission_id UUID REFERENCES blog_submissions(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      old_url VARCHAR(500) NOT NULL,
      new_url VARCHAR(500) NOT NULL,
      change_reason TEXT NOT NULL,
      changed_by UUID REFERENCES users(id),
      changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_blog_post_url_changes_submission_id ON blog_post_url_changes(blog_submission_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_url_changes_user_id ON blog_post_url_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_url_changes_changed_at ON blog_post_url_changes(changed_at);

-- Enable RLS
ALTER TABLE blog_post_url_changes ENABLE ROW LEVEL SECURITY;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'blog_post_url_changes' AND policyname = 'Users can view their own URL changes') THEN
    CREATE POLICY "Users can view their own URL changes" ON blog_post_url_changes 
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'blog_post_url_changes' AND policyname = 'Users can insert their own URL changes') THEN
    CREATE POLICY "Users can insert their own URL changes" ON blog_post_url_changes 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'blog_post_url_changes' AND policyname = 'Admins can view all URL changes') THEN
    CREATE POLICY "Admins can view all URL changes" ON blog_post_url_changes 
      FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');
  END IF;
END $$;

-- Function to automatically log URL changes
CREATE OR REPLACE FUNCTION log_blog_post_url_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if URL actually changed
    IF OLD.url IS DISTINCT FROM NEW.url THEN
        INSERT INTO blog_post_url_changes (
            blog_submission_id,
            user_id,
            old_url,
            new_url,
            change_reason,
            changed_by
        ) VALUES (
            NEW.id,
            NEW.user_id,
            OLD.url,
            NEW.url,
            COALESCE(NEW.url_change_reason, 'No reason provided'),
            NEW.user_id
        );
        
        -- Clear the reason field after logging
        NEW.url_change_reason := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add temporary column to blog_submissions for change reason
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS url_change_reason TEXT;

-- Create trigger to log URL changes
DROP TRIGGER IF EXISTS log_blog_post_url_change_trigger ON blog_submissions;
CREATE TRIGGER log_blog_post_url_change_trigger
    BEFORE UPDATE OF url ON blog_submissions
    FOR EACH ROW
    EXECUTE FUNCTION log_blog_post_url_change();

-- Comments
COMMENT ON TABLE blog_post_url_changes IS 'Tracks blog post URL changes with reasons';
COMMENT ON COLUMN blog_post_url_changes.change_reason IS 'User-provided reason for changing the URL';
COMMENT ON COLUMN blog_submissions.url_change_reason IS 'Temporary field to capture reason before logging change';
