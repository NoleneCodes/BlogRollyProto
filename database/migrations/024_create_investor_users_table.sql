
-- Create investor users table for exclusive dashboard access
CREATE TABLE IF NOT EXISTS investor_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  investment_range VARCHAR(100) NOT NULL,
  investor_type VARCHAR(100) NOT NULL,
  interests TEXT,
  message TEXT,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_investor_users_email ON investor_users(email);

-- Create index on verification status
CREATE INDEX IF NOT EXISTS idx_investor_users_verified ON investor_users(is_verified);
