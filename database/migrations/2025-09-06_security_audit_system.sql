-- Migration: Create security audit log tables for BlogRolly

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_audit_logs') THEN
		CREATE TABLE security_audit_logs (
			id BIGSERIAL PRIMARY KEY,
			user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
			action VARCHAR(128) NOT NULL,
			details JSONB,
			ip_address VARCHAR(45),
			user_agent TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	END IF;
END $$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_audit_actions') THEN
		CREATE TABLE security_audit_actions (
			id BIGSERIAL PRIMARY KEY,
			log_id BIGINT REFERENCES security_audit_logs(id) ON DELETE CASCADE,
			action_type VARCHAR(64) NOT NULL,
			action_data JSONB,
			performed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
			performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action ON security_audit_logs(action);

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_catalog.pg_description d
		JOIN pg_catalog.pg_class c ON c.oid = d.objoid
		WHERE c.relname = 'security_audit_logs' AND d.description = 'Stores security audit logs for user and system actions.'
	) THEN
		COMMENT ON TABLE security_audit_logs IS 'Stores security audit logs for user and system actions.';
	END IF;
END $$;
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_catalog.pg_description d
		JOIN pg_catalog.pg_class c ON c.oid = d.objoid
		WHERE c.relname = 'security_audit_actions' AND d.description = 'Stores detailed actions related to audit logs.'
	) THEN
		COMMENT ON TABLE security_audit_actions IS 'Stores detailed actions related to audit logs.';
	END IF;
END $$;
