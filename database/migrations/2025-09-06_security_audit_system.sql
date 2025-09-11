-- Migration: Create security audit log tables for BlogRolly
CREATE TABLE security_audit_logs (
	id BIGSERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES user_profiles(id) ON DELETE SET NULL,
	action VARCHAR(128) NOT NULL,
	details JSONB,
	ip_address VARCHAR(45),
	user_agent TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE security_audit_actions (
	id BIGSERIAL PRIMARY KEY,
	log_id BIGINT REFERENCES security_audit_logs(id) ON DELETE CASCADE,
	action_type VARCHAR(64) NOT NULL,
	action_data JSONB,
	performed_by INTEGER REFERENCES user_profiles(id) ON DELETE SET NULL,
	performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_action ON security_audit_logs(action);

COMMENT ON TABLE security_audit_logs IS 'Stores security audit logs for user and system actions.';
COMMENT ON TABLE security_audit_actions IS 'Stores detailed actions related to audit logs.';
