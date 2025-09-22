

ALTER TABLE blog_submissions DROP COLUMN IF EXISTS avg_time_on_page;


COMMENT ON TABLE blog_submissions IS 'Blog post submissions with approval workflow and analytics (views, clicks, ctr, bounce_rate)';
