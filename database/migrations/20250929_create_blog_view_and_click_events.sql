-- Migration: Create blog_view_events and blog_click_events tables

CREATE TABLE IF NOT EXISTS blog_view_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_submission_id UUID REFERENCES blog_submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    referrer TEXT,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_blog_view_events_blog_submission_id ON blog_view_events(blog_submission_id);
CREATE INDEX IF NOT EXISTS idx_blog_view_events_created_at ON blog_view_events(created_at);

CREATE TABLE IF NOT EXISTS blog_click_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_submission_id UUID REFERENCES blog_submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    referrer TEXT,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_blog_click_events_blog_submission_id ON blog_click_events(blog_submission_id);
CREATE INDEX IF NOT EXISTS idx_blog_click_events_created_at ON blog_click_events(created_at);
