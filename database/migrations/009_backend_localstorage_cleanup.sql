-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  search_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Blog drafts table
CREATE TABLE IF NOT EXISTS blog_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  tags TEXT[],
  image_description TEXT,
  category TEXT,
  post_url TEXT,
  has_adult_content BOOLEAN,
  saved_at TIMESTAMPTZ DEFAULT now()
);

