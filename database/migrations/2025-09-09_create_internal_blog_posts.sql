
-- Migration: Create secure and robust internal_blog_posts table

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'internal_blog_posts') THEN
    CREATE TABLE internal_blog_posts (
      id BIGSERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      author VARCHAR(255) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'draft',
      tags TEXT[],
      slug VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      published_at TIMESTAMPTZ,
      deleted_at TIMESTAMPTZ
    );
  END IF;
END $$;

-- Add constraints if not exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'internal_blog_posts' AND constraint_name = 'chk_title_length') THEN
    ALTER TABLE internal_blog_posts ADD CONSTRAINT chk_title_length CHECK (char_length(title) >= 5);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'internal_blog_posts' AND constraint_name = 'chk_slug_length') THEN
    ALTER TABLE internal_blog_posts ADD CONSTRAINT chk_slug_length CHECK (char_length(slug) >= 5);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_internal_blog_posts_status ON internal_blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_internal_blog_posts_created_at ON internal_blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_internal_blog_posts_slug ON internal_blog_posts(slug);


DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_description d
    JOIN pg_catalog.pg_class c ON c.oid = d.objoid
    WHERE c.relname = 'internal_blog_posts' AND d.description = 'Stores internal blog posts for BlogRolly, with security and audit features.'
  ) THEN
    COMMENT ON TABLE internal_blog_posts IS 'Stores internal blog posts for BlogRolly, with security and audit features.';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_description d
    JOIN pg_catalog.pg_class c ON c.oid = d.objoid
    JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
    WHERE c.relname = 'internal_blog_posts' AND a.attname = 'status' AND d.description = 'Post status: draft (not visible on site), published (visible), archived (hidden from all). Use draft to save unfinished posts.'
  ) THEN
    COMMENT ON COLUMN internal_blog_posts.status IS 'Post status: draft (not visible on site), published (visible), archived (hidden from all). Use draft to save unfinished posts.';
  END IF;

END $$;

-- Enable RLS and add policy so users can only see their own internal blog posts
ALTER TABLE internal_blog_posts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'internal_blog_posts' AND policyname = 'Users can view their own internal blog posts') THEN
    CREATE POLICY "Users can view their own internal blog posts" ON internal_blog_posts
      FOR SELECT USING (auth.email() = author);
  END IF;
END $$;