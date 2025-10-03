
-- SECURITY AUTOMATION EVENTS TABLE
-- This table logs all security-related events (e.g., suspicious activity, automated actions) for auditing and monitoring.
-- Best practices:
--   - Users can only view their own events (privacy, transparency)
--   - Admins/system roles can view all events (monitoring, security)
--   - Only backend/system roles can insert events (prevent log flooding/faking)
--   - No one can update or delete events except for admin/retention jobs
--   - All changes/deletions should be audited elsewhere
--   - Document retention policy (e.g., logs kept for 2 years)


DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_automation_events') THEN
		CREATE TABLE security_automation_events (
			id BIGSERIAL PRIMARY KEY,
			event_type VARCHAR(64) NOT NULL,
			event_data JSONB NOT NULL,
			triggered_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	END IF;
END $$;

-- Enable RLS and add policy so users can only see their own triggered events

-- Enable RLS
ALTER TABLE security_automation_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own events
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE tablename = 'security_automation_events' AND policyname = 'Users can view their own triggered events') THEN
		CREATE POLICY "Users can view their own triggered events" ON security_automation_events
			FOR SELECT USING (auth.uid() = triggered_by);
	END IF;
END $$;

-- Policy: Admins/system roles can view all events (adjust role check as needed for your setup)
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE tablename = 'security_automation_events' AND policyname = 'Admins can view all events') THEN
		CREATE POLICY "Admins can view all events" ON security_automation_events
			FOR SELECT TO authenticated USING (auth.role() = 'service_role');
	END IF;
END $$;

-- Policy: Only backend/system roles can insert events
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE tablename = 'security_automation_events' AND policyname = 'System can insert events') THEN
		CREATE POLICY "System can insert events" ON security_automation_events
			FOR INSERT TO authenticated WITH CHECK (auth.role() = 'service_role');
	END IF;
END $$;

-- Policy: Deny all UPDATEs (no one can edit events)
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE tablename = 'security_automation_events' AND policyname = 'Deny all updates') THEN
		CREATE POLICY "Deny all updates" ON security_automation_events
			FOR UPDATE TO public USING (false);
	END IF;
END $$;

-- Policy: Deny all DELETEs (no one can delete events except for admin/retention jobs)
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE tablename = 'security_automation_events' AND policyname = 'Deny all deletes') THEN
		CREATE POLICY "Deny all deletes" ON security_automation_events
			FOR DELETE TO public USING (false);
	END IF;
END $$;

-- TODO: Add triggers to audit UPDATE/DELETE actions if needed
-- TODO: Document and enforce log retention policy (e.g., delete logs older than 2 years via scheduled job)


-- SECURITY AUTOMATION RULES TABLE
-- Stores rules for security automation and monitoring. Lock down access:
--   - Only system/admin roles should insert/update/delete rules
--   - Users should only see rules relevant to them (if any)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_automation_rules') THEN
    CREATE TABLE security_automation_rules (
      id BIGSERIAL PRIMARY KEY,
      rule_name VARCHAR(128) NOT NULL UNIQUE,
      rule_definition JSONB NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;


-- Enable RLS on security_automation_rules (required for public tables)
ALTER TABLE security_automation_rules ENABLE ROW LEVEL SECURITY;


-- Policy: Only admins/system roles can insert rules
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE tablename = 'security_automation_rules' AND policyname = 'Admins can insert rules') THEN
		CREATE POLICY "Admins can insert rules" ON security_automation_rules
			FOR INSERT TO authenticated WITH CHECK (auth.role() = 'service_role');
	END IF;
END $$;

-- Policy: Only admins/system roles can update rules
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE tablename = 'security_automation_rules' AND policyname = 'Admins can update rules') THEN
		CREATE POLICY "Admins can update rules" ON security_automation_rules
			FOR UPDATE TO authenticated USING (auth.role() = 'service_role');
	END IF;
END $$;

-- Policy: Only admins/system roles can delete rules
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE tablename = 'security_automation_rules' AND policyname = 'Admins can delete rules') THEN
		CREATE POLICY "Admins can delete rules" ON security_automation_rules
			FOR DELETE TO authenticated USING (auth.role() = 'service_role');
	END IF;
END $$;

-- Policy: (Optional) Users can select rules relevant to them (customize as needed)
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_policies WHERE tablename = 'security_automation_rules' AND policyname = 'Users can view rules') THEN
--     CREATE POLICY "Users can view rules" ON security_automation_rules
--       FOR SELECT USING (/* your condition here */);
--   END IF;
-- END $$;

-- Policy: Deny all by default (if no other policy matches)

CREATE INDEX IF NOT EXISTS idx_security_automation_events_type ON security_automation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_automation_rules_active ON security_automation_rules(is_active);

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_catalog.pg_description d
		JOIN pg_catalog.pg_class c ON c.oid = d.objoid
		WHERE c.relname = 'security_automation_events' AND d.description = 'Stores security automation events (e.g. suspicious activity, automated actions).'
	) THEN
		COMMENT ON TABLE security_automation_events IS 'Stores security automation events (e.g. suspicious activity, automated actions).';
	END IF;
END $$;
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_catalog.pg_description d
		JOIN pg_catalog.pg_class c ON c.oid = d.objoid
		WHERE c.relname = 'security_automation_rules' AND d.description = 'Stores rules for security automation and monitoring.'
	) THEN
		COMMENT ON TABLE security_automation_rules IS 'Stores rules for security automation and monitoring.';
	END IF;
END $$;
