
-- Create investor users table for exclusive dashboard access

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investor_users') THEN
    CREATE TABLE investor_users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
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
  END IF;

END $$;

-- Enable RLS and add policy so users can only see their own investor profile
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'investor_users' AND policyname = 'Users can view their own investor profile') THEN
    CREATE POLICY "Users can view their own investor profile" ON investor_users
      FOR SELECT USING (auth.email() = email);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_investor_users_email ON investor_users(email);
CREATE INDEX IF NOT EXISTS idx_investor_users_verified ON investor_users(is_verified);
