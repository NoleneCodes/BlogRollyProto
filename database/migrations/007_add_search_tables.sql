
-- Migration 007: Add search functionality tables
-- This adds tables to support the search capabilities


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_submissions' AND column_name = 'search_vector') THEN
        ALTER TABLE blog_submissions ADD COLUMN search_vector tsvector;
    END IF;
END $$;

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS idx_blog_submissions_search_vector ON blog_submissions USING gin(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_blog_search_vector() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'blog_search_vector_update') THEN
        CREATE TRIGGER blog_search_vector_update
            BEFORE INSERT OR UPDATE ON blog_submissions
            FOR EACH ROW
            EXECUTE FUNCTION update_blog_search_vector();
    END IF;
END $$;

-- Update existing records
UPDATE blog_submissions SET search_vector = to_tsvector('english', 
    COALESCE(title, '') || ' ' ||
    COALESCE(description, '') || ' ' ||
    COALESCE(array_to_string(tags, ' '), '')
);

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_category_live ON blog_submissions(category) WHERE is_live = true AND status = 'live';
CREATE INDEX IF NOT EXISTS idx_blog_submissions_tags_gin ON blog_submissions USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_blog_submissions_status_live ON blog_submissions(status, is_live);

-- Add search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_query TEXT NOT NULL,
    search_type VARCHAR(20) NOT NULL CHECK (search_type IN ('keyword', 'ai')),
    results_count INTEGER DEFAULT 0,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    filters_used JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(search_query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_type ON search_analytics(search_type);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at);

-- Enable RLS and add policy so users can only see their own search analytics
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'search_analytics' AND policyname = 'Users can view their own search analytics') THEN
        CREATE POLICY "Users can view their own search analytics" ON search_analytics
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

COMMENT ON TABLE search_analytics IS 'Tracks search queries for analytics and improving search functionality';
