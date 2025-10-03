-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='blog_submissions' AND column_name='image_description') THEN
    ALTER TABLE blog_submissions ADD COLUMN image_description VARCHAR(200);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='blog_submissions' AND column_name='image_type') THEN
    ALTER TABLE blog_submissions ADD COLUMN image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='blog_submissions' AND column_name='image_file_path') THEN
    ALTER TABLE blog_submissions ADD COLUMN image_file_path TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='blog_submissions' AND column_name='image_type') THEN
    UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_description d
    JOIN pg_catalog.pg_class c ON c.oid = d.objoid
    JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
    WHERE c.relname = 'blog_submissions' AND a.attname = 'image_description' AND d.description = 'Alt text description for the blog image (accessibility and SEO)'
  ) THEN
    COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_description d
    JOIN pg_catalog.pg_class c ON c.oid = d.objoid
    JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
    WHERE c.relname = 'blog_submissions' AND a.attname = 'image_type' AND d.description = 'Type of image: url (external) or upload (file upload)'
  ) THEN
    COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_description d
    JOIN pg_catalog.pg_class c ON c.oid = d.objoid
    JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
    WHERE c.relname = 'blog_submissions' AND a.attname = 'image_file_path' AND d.description = 'File path or storage reference for uploaded images'
  ) THEN
    COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';
  END IF;
END $$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'enforce_age_verification_for_adult_content') THEN
    EXECUTE '
      DROP FUNCTION IF EXISTS enforce_age_verification_for_adult_content();
      CREATE FUNCTION enforce_age_verification_for_adult_content() RETURNS trigger AS ''
      BEGIN
        IF NEW.has_adult_content = TRUE THEN
          IF NOT EXISTS (
            SELECT 1 FROM user_profiles WHERE user_id = NEW.user_id AND age_verified = TRUE
          ) THEN
            RAISE EXCEPTION ''''User must be age verified to submit adult content.'''';
          END IF;
        END IF;
        RETURN NEW;
      END;
      '' LANGUAGE plpgsql
      SET search_path = ''public'';
    ';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_enforce_age_verification_for_adult_content') THEN
    CREATE TRIGGER trg_enforce_age_verification_for_adult_content
      BEFORE INSERT OR UPDATE ON blog_submissions
      FOR EACH ROW
      EXECUTE FUNCTION enforce_age_verification_for_adult_content();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_description d
    JOIN pg_catalog.pg_class c ON c.oid = d.objoid
    WHERE c.relname = 'blog_submissions' AND d.description = 'Blog post submissions with approval workflow - supports both external image URLs and file uploads. Adult content requires age verification.'
  ) THEN
    COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads. Adult content requires age verification.';
  END IF;
END $$;