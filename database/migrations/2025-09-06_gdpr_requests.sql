-- Migration: Create GDPR requests tracking table for BlogRolly
CREATE TABLE gdpr_requests (
	id BIGSERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
	request_type VARCHAR(64) NOT NULL, -- e.g. data_access, data_deletion, rectification
	request_status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, completed, rejected
	request_details JSONB,
	requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	completed_at TIMESTAMPTZ,
	rejected_at TIMESTAMPTZ,
	admin_notes TEXT
);

CREATE INDEX idx_gdpr_requests_user_id ON gdpr_requests(user_id);
CREATE INDEX idx_gdpr_requests_status ON gdpr_requests(request_status);

COMMENT ON TABLE gdpr_requests IS 'Tracks GDPR-related user requests and their status.';
