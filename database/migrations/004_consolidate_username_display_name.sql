
-- BlogRolly Database Schema
-- Migration 004: Consolidate display_name and username columns

-- Copy any existing display_name values to username where username is null
UPDATE user_profiles 
SET username = display_name 
WHERE username IS NULL AND display_name IS NOT NULL;

-- Copy any existing username values to display_name where display_name is null
UPDATE user_profiles 
SET display_name = username 
WHERE display_name IS NULL AND username IS NOT NULL;

-- Drop the display_name column since we're consolidating to username
ALTER TABLE user_profiles DROP COLUMN display_name;

-- Add a comment to document the change
COMMENT ON COLUMN user_profiles.username IS 'User display name/username (consolidated from previous display_name column)';

-- Update any existing queries or views that might reference display_name
-- (Add here if there are any materialized views or stored procedures using display_name)
