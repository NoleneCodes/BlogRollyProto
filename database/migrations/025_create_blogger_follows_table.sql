-- Migration: Create blogger_follows table for reader following functionality
CREATE TABLE IF NOT EXISTS blogger_follows (
    id BIGSERIAL PRIMARY KEY,
    reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
    blogger_id UUID NOT NULL REFERENCES bloggers(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (reader_id, blogger_id)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_blogger_follows_reader_id ON blogger_follows(reader_id);
CREATE INDEX IF NOT EXISTS idx_blogger_follows_blogger_id ON blogger_follows(blogger_id);
