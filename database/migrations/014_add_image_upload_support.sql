-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```

```sql
-- Migration 014: Add image upload and description support to blog submissions table
-- This adds support for storing uploaded images and their descriptions

-- Add image description column for accessibility and SEO
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_description VARCHAR(200);

-- Add column to track if image is uploaded vs external URL
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'url' CHECK (image_type IN ('url', 'upload'));

-- Add column for uploaded image file path/reference
ALTER TABLE blog_submissions ADD COLUMN IF NOT EXISTS image_file_path TEXT;

-- Update existing records to have default image_type
UPDATE blog_submissions SET image_type = 'url' WHERE image_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_submissions_image_type ON blog_submissions(image_type);

-- Add comments for documentation
COMMENT ON COLUMN blog_submissions.image_description IS 'Alt text description for the blog image (accessibility and SEO)';
COMMENT ON COLUMN blog_submissions.image_type IS 'Type of image: url (external) or upload (file upload)';
COMMENT ON COLUMN blog_submissions.image_file_path IS 'File path or storage reference for uploaded images';

-- Update the table comment
COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow - supports both external image URLs and file uploads';
```