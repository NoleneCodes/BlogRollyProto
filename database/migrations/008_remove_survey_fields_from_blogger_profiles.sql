
-- Migration 008: Remove survey-only fields from blogger_profiles table
-- These fields (monetization_methods, audience_size) are only needed for survey data, not core profile info


ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS monetization_methods;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS audience_size;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_catalog.pg_description d
		JOIN pg_catalog.pg_class c ON c.oid = d.objoid
		WHERE c.relname = 'blogger_profiles' AND d.description = 'Core blogger profile information - survey data stored separately'
	) THEN
		COMMENT ON TABLE blogger_profiles IS 'Core blogger profile information - survey data stored separately';
	END IF;
END $$;
