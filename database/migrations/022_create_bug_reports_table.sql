
-- Create bug_reports table

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bug_reports') THEN
    CREATE TABLE bug_reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      steps_to_reproduce TEXT,
      expected_behavior TEXT,
      actual_behavior TEXT,
      browser TEXT,
      operating_system TEXT,
      additional_info TEXT,
      images TEXT[],
      priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
      reporter TEXT NOT NULL,
      status TEXT CHECK (status IN ('open', 'in-progress', 'resolved')) DEFAULT 'open',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

END $$;

-- Enable RLS and add policy so users can only see their own bug reports
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bug_reports' AND policyname = 'Users can view their own bug reports') THEN
    CREATE POLICY "Users can view their own bug reports" ON bug_reports
      FOR SELECT USING (auth.email() = reporter);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_priority ON bug_reports(priority);
CREATE INDEX IF NOT EXISTS idx_bug_reports_reporter ON bug_reports(reporter);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at);

CREATE OR REPLACE FUNCTION update_bug_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'bug_reports_updated_at') THEN
    CREATE TRIGGER bug_reports_updated_at
      BEFORE UPDATE ON bug_reports
      FOR EACH ROW
      EXECUTE FUNCTION update_bug_reports_updated_at();
  END IF;
END $$;
