
-- Migration: Create secure and robust internal_blog_posts table
CREATE TABLE internal_blog_posts (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'draft', -- draft: not visible on site, published: visible, archived: hidden
  tags TEXT[],
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT chk_title_length CHECK (char_length(title) >= 5),
  CONSTRAINT chk_slug_length CHECK (char_length(slug) >= 5)
);

-- Indexes for performance and security
-- Removed author_id index as author_id column is no longer present
CREATE INDEX idx_internal_blog_posts_status ON internal_blog_posts(status);
CREATE INDEX idx_internal_blog_posts_created_at ON internal_blog_posts(created_at);
CREATE INDEX idx_internal_blog_posts_slug ON internal_blog_posts(slug);

-- Audit triggers (optional, if you use audit tables)
-- You can add triggers here for logging changes, e.g. with supabase extensions

-- Comments for documentation
COMMENT ON TABLE internal_blog_posts IS 'Stores internal blog posts for BlogRolly, with security and audit features.';
-- Removed is_private column; all posts are public
COMMENT ON COLUMN internal_blog_posts.status IS 'Post status: draft (not visible on site), published (visible), archived (hidden from all). Use draft to save unfinished posts.';