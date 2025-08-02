
-- Create support_requests table
CREATE TABLE IF NOT EXISTS support_requests (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  message TEXT NOT NULL,
  email TEXT,
  user_email TEXT NOT NULL, -- The user who submitted the request
  status TEXT CHECK (status IN ('open', 'responded', 'closed')) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Optional fields for admin responses
  admin_response TEXT,
  admin_responder TEXT, -- Admin who responded
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_priority ON support_requests(priority);
CREATE INDEX IF NOT EXISTS idx_support_requests_user_email ON support_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_requests_updated_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_support_requests_updated_at();

-- Create trigger to set responded_at when status changes to 'responded'
CREATE OR REPLACE FUNCTION set_support_request_responded_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'responded' AND OLD.status != 'responded' THEN
    NEW.responded_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_requests_responded_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_support_request_responded_at();
