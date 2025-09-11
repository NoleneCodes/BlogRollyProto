-- Migration: Create security automation tables for BlogRolly
CREATE TABLE security_automation_events (
	id BIGSERIAL PRIMARY KEY,
	event_type VARCHAR(64) NOT NULL,
	event_data JSONB NOT NULL,
	triggered_by INTEGER REFERENCES user_profiles(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE security_automation_rules (
	id BIGSERIAL PRIMARY KEY,
	rule_name VARCHAR(128) NOT NULL UNIQUE,
	rule_definition JSONB NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_automation_events_type ON security_automation_events(event_type);
CREATE INDEX idx_security_automation_rules_active ON security_automation_rules(is_active);

COMMENT ON TABLE security_automation_events IS 'Stores security automation events (e.g. suspicious activity, automated actions).';
COMMENT ON TABLE security_automation_rules IS 'Stores rules for security automation and monitoring.';
