
-- Migration 008: Remove survey-only fields from blogger_profiles table
-- These fields (monetization_methods, audience_size) are only needed for survey data, not core profile info

-- Remove monetization_methods column
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS monetization_methods;

-- Remove audience_size column  
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS audience_size;

-- Add comment explaining the removal
COMMENT ON TABLE blogger_profiles IS 'Core blogger profile information - survey data stored separately';
