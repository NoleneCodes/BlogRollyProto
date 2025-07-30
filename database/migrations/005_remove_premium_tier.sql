
-- BlogRolly Database Schema
-- Migration 005: Remove premium tier, consolidate to free and pro only

-- First, update any existing 'premium' users to 'pro'
UPDATE user_profiles 
SET tier = 'pro' 
WHERE tier = 'premium';

UPDATE blogger_profiles 
SET subscription_status = 'active'
WHERE EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_profiles.user_id = blogger_profiles.user_id 
  AND user_profiles.tier = 'pro'
);

-- Update user_tier_limits for any premium users that became pro
UPDATE user_tier_limits 
SET tier = 'pro', 
    max_live_posts = 999999
WHERE tier = 'premium';

-- Create new enum without premium
CREATE TYPE user_tier_new AS ENUM ('free', 'pro');

-- Update the user_profiles table to use the new enum
ALTER TABLE user_profiles 
  ALTER COLUMN tier TYPE user_tier_new 
  USING tier::text::user_tier_new;

-- Update the user_tier_limits table to use the new enum
ALTER TABLE user_tier_limits 
  ALTER COLUMN tier TYPE user_tier_new 
  USING tier::text::user_tier_new;

-- Drop the old enum and rename the new one
DROP TYPE user_tier;
ALTER TYPE user_tier_new RENAME TO user_tier;

-- Update the function that initializes user tier limits
CREATE OR REPLACE FUNCTION initialize_user_tier_limits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_tier_limits (user_id, tier, max_live_posts, current_live_posts, total_approved_posts)
    VALUES (
        NEW.user_id, 
        NEW.tier, 
        CASE 
            WHEN NEW.tier = 'free' THEN 3
            WHEN NEW.tier = 'pro' THEN 999999
            ELSE 3
        END,
        0,
        0
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add comment to document the change
COMMENT ON TYPE user_tier IS 'User subscription tiers: free (3 posts max) or pro (unlimited posts)';
