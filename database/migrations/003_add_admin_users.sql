
-- Migration 003: Add Admin Users Table

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- RLS Policy
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at (use existing function from migration 001)
CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin (you should change this password after first login)
-- Password is 'admin123' - CHANGE THIS IMMEDIATELY
INSERT INTO admin_users (email, password_hash, name, role) 
VALUES ('admin@blogrolly.com', '$2b$10$K9J9J9J9J9J9J9J9J9J9JuOzJ9J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'System Admin', 'super_admin');

-- Comment
COMMENT ON TABLE admin_users IS 'Admin users for dashboard access separate from regular users';
