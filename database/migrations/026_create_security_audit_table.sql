
-- Create security_audit_logs table for long-term storage
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('rate_limit', 'auth_attempt', 'suspicious_request', 'error', 'admin_action', 'data_access', 'login_success', 'login_failure', 'password_change', 'account_creation', 'payment_attempt', 'api_access', 'file_upload', 'data_export', 'suspicious_pattern')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  ip_address INET,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  request_path TEXT,
  request_method TEXT,
  response_status INTEGER,
  details JSONB,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  threat_indicators TEXT[],
  geo_location JSONB,
  correlation_id UUID,
  server_instance TEXT DEFAULT 'replit-main',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  compliance_flags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_severity ON security_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_ip_address ON security_audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_risk_score ON security_audit_logs(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_correlation_id ON security_audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_server_instance ON security_audit_logs(server_instance);

-- Create GIN index for JSONB fields
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_details ON security_audit_logs USING GIN (details);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_geo_location ON security_audit_logs USING GIN (geo_location);

-- Create partial indexes for high-priority events
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_high_risk ON security_audit_logs(created_at, risk_score) WHERE risk_score >= 70;
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_critical ON security_audit_logs(created_at) WHERE severity = 'critical';

-- Create threat intelligence correlation table
CREATE TABLE IF NOT EXISTS threat_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('ip', 'user_agent', 'pattern', 'fingerprint')),
  indicator_value TEXT NOT NULL,
  threat_level TEXT NOT NULL CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  source TEXT NOT NULL,
  confidence_score INTEGER DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  occurrence_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for threat intelligence
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_indicator_type ON threat_intelligence(indicator_type);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_indicator_value ON threat_intelligence(indicator_value);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_threat_level ON threat_intelligence(threat_level);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_is_active ON threat_intelligence(is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_threat_intelligence_unique ON threat_intelligence(indicator_type, indicator_value);

-- Create security metrics aggregation table
CREATE TABLE IF NOT EXISTS security_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  server_instance TEXT DEFAULT 'replit-main',
  total_events INTEGER DEFAULT 0,
  high_risk_events INTEGER DEFAULT 0,
  critical_events INTEGER DEFAULT 0,
  unique_ips INTEGER DEFAULT 0,
  suspicious_ips INTEGER DEFAULT 0,
  blocked_requests INTEGER DEFAULT 0,
  auth_failures INTEGER DEFAULT 0,
  auth_successes INTEGER DEFAULT 0,
  top_threat_indicators JSONB,
  compliance_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, server_instance)
);

-- Create index for daily metrics
CREATE INDEX IF NOT EXISTS idx_security_metrics_daily_date ON security_metrics_daily(date);
CREATE INDEX IF NOT EXISTS idx_security_metrics_daily_server ON security_metrics_daily(server_instance);

-- Create function to calculate risk score
CREATE OR REPLACE FUNCTION calculate_risk_score(
  event_type TEXT,
  ip_address INET,
  user_agent TEXT,
  details JSONB
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  threat_record RECORD;
BEGIN
  -- Base score by event type
  CASE event_type
    WHEN 'suspicious_request' THEN score := score + 40;
    WHEN 'auth_attempt' THEN score := score + 20;
    WHEN 'rate_limit' THEN score := score + 30;
    WHEN 'error' THEN score := score + 10;
    WHEN 'admin_action' THEN score := score + 5;
    ELSE score := score + 5;
  END CASE;

  -- Check against threat intelligence
  SELECT * INTO threat_record 
  FROM threat_intelligence 
  WHERE indicator_type = 'ip' 
    AND indicator_value = host(ip_address)::TEXT 
    AND is_active = true
  LIMIT 1;

  IF FOUND THEN
    CASE threat_record.threat_level
      WHEN 'critical' THEN score := score + 50;
      WHEN 'high' THEN score := score + 30;
      WHEN 'medium' THEN score := score + 20;
      WHEN 'low' THEN score := score + 10;
    END CASE;
  END IF;

  -- Check user agent patterns
  IF user_agent IS NOT NULL THEN
    IF user_agent ILIKE '%bot%' OR user_agent ILIKE '%crawler%' THEN
      score := score + 15;
    END IF;
    
    IF length(user_agent) < 20 OR length(user_agent) > 500 THEN
      score := score + 10;
    END IF;
  END IF;

  -- Additional scoring based on details
  IF details IS NOT NULL THEN
    IF details->>'multiple_failures' = 'true' THEN
      score := score + 25;
    END IF;
    
    IF details->>'rapid_requests' = 'true' THEN
      score := score + 20;
    END IF;
  END IF;

  -- Cap the score at 100
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Create function to update threat intelligence
CREATE OR REPLACE FUNCTION update_threat_intelligence(
  p_indicator_type TEXT,
  p_indicator_value TEXT,
  p_threat_level TEXT,
  p_source TEXT DEFAULT 'system'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO threat_intelligence (
    indicator_type, indicator_value, threat_level, source, last_seen, occurrence_count
  ) VALUES (
    p_indicator_type, p_indicator_value, p_threat_level, p_source, NOW(), 1
  )
  ON CONFLICT (indicator_type, indicator_value)
  DO UPDATE SET
    last_seen = NOW(),
    occurrence_count = threat_intelligence.occurrence_count + 1,
    threat_level = CASE 
      WHEN p_threat_level > threat_intelligence.threat_level THEN p_threat_level
      ELSE threat_intelligence.threat_level
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate risk scores
CREATE OR REPLACE FUNCTION auto_calculate_risk_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.risk_score = 0 THEN
    NEW.risk_score := calculate_risk_score(
      NEW.event_type,
      NEW.ip_address,
      NEW.user_agent,
      NEW.details
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER security_audit_risk_score_trigger
  BEFORE INSERT ON security_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_risk_score();

-- Create function for daily metrics aggregation
CREATE OR REPLACE FUNCTION aggregate_daily_security_metrics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS VOID AS $$
BEGIN
  INSERT INTO security_metrics_daily (
    date,
    server_instance,
    total_events,
    high_risk_events,
    critical_events,
    unique_ips,
    suspicious_ips,
    blocked_requests,
    auth_failures,
    auth_successes,
    top_threat_indicators,
    compliance_summary
  )
  SELECT 
    target_date,
    COALESCE(server_instance, 'replit-main'),
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE risk_score >= 70) as high_risk_events,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_events,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT ip_address) FILTER (WHERE risk_score >= 50) as suspicious_ips,
    COUNT(*) FILTER (WHERE event_type = 'rate_limit') as blocked_requests,
    COUNT(*) FILTER (WHERE event_type = 'auth_attempt' AND details->>'success' = 'false') as auth_failures,
    COUNT(*) FILTER (WHERE event_type = 'login_success') as auth_successes,
    jsonb_build_object(
      'top_suspicious_ips', (
        SELECT jsonb_agg(ip_data)
        FROM (
          SELECT jsonb_build_object('ip', host(ip_address), 'count', COUNT(*), 'max_risk', MAX(risk_score))::jsonb as ip_data
          FROM security_audit_logs 
          WHERE DATE(created_at) = target_date AND risk_score >= 50
          GROUP BY ip_address
          ORDER BY MAX(risk_score) DESC, COUNT(*) DESC
          LIMIT 10
        ) top_ips
      )
    ) as top_threat_indicators,
    jsonb_build_object(
      'gdpr_events', COUNT(*) FILTER (WHERE 'gdpr' = ANY(compliance_flags)),
      'sox_events', COUNT(*) FILTER (WHERE 'sox' = ANY(compliance_flags)),
      'data_access_events', COUNT(*) FILTER (WHERE event_type = 'data_access')
    ) as compliance_summary
  FROM security_audit_logs
  WHERE DATE(created_at) = target_date
  GROUP BY COALESCE(server_instance, 'replit-main')
  ON CONFLICT (date, server_instance)
  DO UPDATE SET
    total_events = EXCLUDED.total_events,
    high_risk_events = EXCLUDED.high_risk_events,
    critical_events = EXCLUDED.critical_events,
    unique_ips = EXCLUDED.unique_ips,
    suspicious_ips = EXCLUDED.suspicious_ips,
    blocked_requests = EXCLUDED.blocked_requests,
    auth_failures = EXCLUDED.auth_failures,
    auth_successes = EXCLUDED.auth_successes,
    top_threat_indicators = EXCLUDED.top_threat_indicators,
    compliance_summary = EXCLUDED.compliance_summary;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_metrics_daily ENABLE ROW LEVEL SECURITY;

-- Create policies (admin-only access)
CREATE POLICY "Admin only access to security logs" ON security_audit_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin only access to threat intelligence" ON threat_intelligence
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin only access to security metrics" ON security_metrics_daily
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Comments
COMMENT ON TABLE security_audit_logs IS 'Long-term security audit trail with compliance features';
COMMENT ON TABLE threat_intelligence IS 'ML-based threat intelligence and pattern detection';
COMMENT ON TABLE security_metrics_daily IS 'Daily aggregated security metrics for reporting';
COMMENT ON FUNCTION calculate_risk_score IS 'AI-enhanced risk scoring for security events';
