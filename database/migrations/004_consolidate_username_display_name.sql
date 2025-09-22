
-- BlogRolly Database Schema
-- Migration 004: Consolidate display_name and username columns


-- Ensure display_name column exists before referencing it
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);

-- Copy any existing display_name values to username where username is null
UPDATE user_profiles 
SET username = display_name 
WHERE username IS NULL AND display_name IS NOT NULL;

-- Copy any existing username values to display_name where display_name is null
UPDATE user_profiles 
SET display_name = username 
WHERE display_name IS NULL AND username IS NOT NULL;


-- Ensure both username and display_name columns exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);


COMMENT ON COLUMN user_profiles.username IS 'User login username (unique, required)';
COMMENT ON COLUMN user_profiles.display_name IS 'User display name (can be changed, not unique)';

-- Update any existing queries or views that might reference display_name
-- (Add here if there are any materialized views or stored procedures using display_name)
