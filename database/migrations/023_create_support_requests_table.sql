
-- Create support_requests table

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_requests') THEN
    CREATE TABLE support_requests (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
      message TEXT NOT NULL,
      email TEXT,
      user_email TEXT NOT NULL,
      status TEXT CHECK (status IN ('open', 'responded', 'closed')) DEFAULT 'open',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      admin_response TEXT,
      admin_responder TEXT,
      responded_at TIMESTAMP WITH TIME ZONE
    );
  END IF;

END $$;

-- Enable RLS and add policy so users can only see their own support requests
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'support_requests' AND policyname = 'Users can view their own support requests') THEN
    CREATE POLICY "Users can view their own support requests" ON support_requests
      FOR SELECT USING (auth.email() = user_email);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_priority ON support_requests(priority);
CREATE INDEX IF NOT EXISTS idx_support_requests_user_email ON support_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at);

CREATE OR REPLACE FUNCTION update_support_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'support_requests_updated_at') THEN
    CREATE TRIGGER support_requests_updated_at
      BEFORE UPDATE ON support_requests
      FOR EACH ROW
      EXECUTE FUNCTION update_support_requests_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION set_support_request_responded_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'responded' AND OLD.status != 'responded' THEN
    NEW.responded_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'support_requests_responded_at') THEN
    CREATE TRIGGER support_requests_responded_at
      BEFORE UPDATE ON support_requests
      FOR EACH ROW
      EXECUTE FUNCTION set_support_request_responded_at();
  END IF;
END $$;
