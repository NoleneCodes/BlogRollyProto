-- Migration 008: Create ranked search RPC for blog submissions
-- This function performs full-text search with weighted ranking

CREATE OR REPLACE FUNCTION ranked_blog_search(
    search_query TEXT,
    category_filter TEXT DEFAULT NULL,
    tags_filter TEXT[] DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    url TEXT,
    image_url TEXT,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP,
    views INTEGER,
    clicks INTEGER,
    user_id UUID,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id,
        title,
        description,
        url,
        image_url,
        category,
        tags,
        created_at,
        views,
        clicks,
        user_id,
        ts_rank_cd(search_vector, plainto_tsquery('english', search_query)) AS rank
    FROM blog_submissions
    WHERE status = 'live'
      AND is_live = true
      AND (
        search_query IS NULL OR search_vector @@ plainto_tsquery('english', search_query)
      )
      AND (
        category_filter IS NULL OR category = category_filter
      )
      AND (
        tags_filter IS NULL OR tags && tags_filter
      )
    ORDER BY rank DESC, created_at DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION ranked_blog_search(TEXT, TEXT, TEXT[], INTEGER, INTEGER) TO anon, authenticated;
