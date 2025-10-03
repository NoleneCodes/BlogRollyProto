
-- Migration 010: Remove blog URL change tracking
-- Remove URL change tracking since main blog domain URLs should not be changeable


DROP TABLE IF EXISTS blog_url_change_history CASCADE;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS last_url_change;
ALTER TABLE blogger_profiles DROP COLUMN IF EXISTS url_changes_count;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_catalog.pg_description d
		JOIN pg_catalog.pg_class c ON c.oid = d.objoid
		WHERE c.relname = 'blogger_profiles' AND d.description = 'Blogger profile information - main blog URL is not changeable after signup'
	) THEN
		COMMENT ON TABLE blogger_profiles IS 'Blogger profile information - main blog URL is not changeable after signup';
	END IF;
END $$;
