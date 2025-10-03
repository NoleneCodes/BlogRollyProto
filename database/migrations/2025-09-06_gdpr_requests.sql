-- Migration: Create GDPR requests tracking table for BlogRolly

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gdpr_requests') THEN
		CREATE TABLE gdpr_requests (
			id BIGSERIAL PRIMARY KEY,
			user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
			request_type VARCHAR(64) NOT NULL,
			request_status VARCHAR(32) NOT NULL DEFAULT 'pending',
			request_details JSONB,
			requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			completed_at TIMESTAMPTZ,
			rejected_at TIMESTAMPTZ,
			admin_notes TEXT
		);

	END IF;
	END $$;

	-- Enable RLS and add policy so users can only see their own GDPR requests
	ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;
	DO $$
	BEGIN
		IF NOT EXISTS (
			SELECT 1 FROM pg_policies WHERE tablename = 'gdpr_requests' AND policyname = 'Users can view their own GDPR requests') THEN
			CREATE POLICY "Users can view their own GDPR requests" ON gdpr_requests
				FOR SELECT USING (auth.uid() = user_id);
		END IF;
	END $$;

CREATE INDEX IF NOT EXISTS idx_gdpr_requests_user_id ON gdpr_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status ON gdpr_requests(request_status);

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_catalog.pg_description d
		JOIN pg_catalog.pg_class c ON c.oid = d.objoid
		WHERE c.relname = 'gdpr_requests' AND d.description = 'Tracks GDPR-related user requests and their status.'
	) THEN
		COMMENT ON TABLE gdpr_requests IS 'Tracks GDPR-related user requests and their status.';
	END IF;
END $$;
