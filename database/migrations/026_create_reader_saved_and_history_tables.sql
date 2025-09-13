-- Migration: Create reader_saved_blogs table
CREATE TABLE IF NOT EXISTS reader_saved_blogs (
    id BIGSERIAL PRIMARY KEY,
    reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (reader_id, blog_id)
);

-- Migration: Create reader_reading_history table
CREATE TABLE IF NOT EXISTS reader_reading_history (
    id BIGSERIAL PRIMARY KEY,
    reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reader_saved_blogs_reader_id ON reader_saved_blogs(reader_id);
CREATE INDEX IF NOT EXISTS idx_reader_reading_history_reader_id ON reader_reading_history(reader_id);
