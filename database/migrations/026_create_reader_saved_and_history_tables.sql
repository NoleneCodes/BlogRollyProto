-- Migration: Create reader_saved_blogs table


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reader_saved_blogs') THEN
        CREATE TABLE reader_saved_blogs (
            id BIGSERIAL PRIMARY KEY,
            reader_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
            blog_id UUID NOT NULL REFERENCES blog_submissions(id) ON DELETE CASCADE,
            saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (reader_id, blog_id)
        );
    END IF;
END $$;

-- Enable RLS and add policy so users can only see their own saved blogs
ALTER TABLE reader_saved_blogs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reader_saved_blogs' AND policyname = 'Users can view their own saved blogs') THEN
    CREATE POLICY "Users can view their own saved blogs" ON reader_saved_blogs
      FOR SELECT USING (auth.uid() = reader_id);
  END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reader_reading_history') THEN
        CREATE TABLE reader_reading_history (
            id BIGSERIAL PRIMARY KEY,
            reader_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
            blog_id UUID NOT NULL REFERENCES blog_submissions(id) ON DELETE CASCADE,
            read_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reader_saved_blogs_reader_id ON reader_saved_blogs(reader_id);
CREATE INDEX IF NOT EXISTS idx_reader_reading_history_reader_id ON reader_reading_history(reader_id);
