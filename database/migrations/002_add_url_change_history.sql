
-- Migration 002: Add Blog URL Change History Table
-- Run this after the initial schema

CREATE TABLE blog_url_change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  old_url VARCHAR(500) NOT NULL,
  new_url VARCHAR(500) NOT NULL,
  change_reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to blogger_profiles
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS last_url_change TIMESTAMP WITH TIME ZONE;
ALTER TABLE blogger_profiles ADD COLUMN IF NOT EXISTS url_changes_count INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX idx_blog_url_change_history_user_id ON blog_url_change_history(user_id);
CREATE INDEX idx_blog_url_change_history_changed_at ON blog_url_change_history(changed_at);

-- RLS Policy
ALTER TABLE blog_url_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own URL change history" ON blog_url_change_history FOR SELECT USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE blog_url_change_history IS 'Tracks blog URL changes with 3-month cooldown period';
