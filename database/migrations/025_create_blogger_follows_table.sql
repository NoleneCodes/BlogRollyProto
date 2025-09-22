-- Migration: Create blogger_follows table for reader following functionality

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blogger_follows') THEN
        CREATE TABLE blogger_follows (
            id BIGSERIAL PRIMARY KEY,
            reader_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
            blogger_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
            followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (reader_id, blogger_id)
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_blogger_follows_reader_id ON blogger_follows(reader_id);
CREATE INDEX IF NOT EXISTS idx_blogger_follows_blogger_id ON blogger_follows(blogger_id);
