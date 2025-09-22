
-- Add LinkedIn verification fields to investor_users table

ALTER TABLE investor_users 
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS linkedin_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS linkedin_verification_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending_email' CHECK (verification_status IN ('pending_email', 'pending_linkedin', 'fully_verified', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_investor_users_linkedin_verified ON investor_users(linkedin_verified);
CREATE INDEX IF NOT EXISTS idx_investor_users_verification_status ON investor_users(verification_status);

UPDATE investor_users 
SET verification_status = CASE 
  WHEN is_verified = true THEN 'pending_linkedin'
  ELSE 'pending_email'
END;
