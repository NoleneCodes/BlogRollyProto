
-- Create function for anomaly detection
CREATE OR REPLACE FUNCTION detect_security_anomalies(
  lookback_hours INTEGER DEFAULT 24,
  anomaly_threshold FLOAT DEFAULT 2.0
) RETURNS TABLE (
  anomaly_type TEXT,
  description TEXT,
  confidence_score FLOAT,
  affected_ips TEXT[],
  event_count INTEGER,
  time_window TIMESTAMP WITH TIME ZONE[]
) AS $$
DECLARE
  avg_events_per_hour FLOAT;
  stddev_events FLOAT;
  current_hour_events INTEGER;
  threshold_events INTEGER;
BEGIN
  -- Calculate baseline statistics
  SELECT 
    AVG(hourly_count)::FLOAT,
    STDDEV(hourly_count)::FLOAT
  INTO avg_events_per_hour, stddev_events
  FROM (
    SELECT 
      DATE_TRUNC('hour', created_at) as hour,
      COUNT(*) as hourly_count
    FROM security_audit_logs
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE_TRUNC('hour', created_at)
  ) hourly_stats;

  -- Set default if no standard deviation
  IF stddev_events IS NULL OR stddev_events = 0 THEN
    stddev_events := avg_events_per_hour * 0.1;
  END IF;

  threshold_events := (avg_events_per_hour + (anomaly_threshold * stddev_events))::INTEGER;

  -- Detect volume anomalies
  FOR current_hour_events IN
    SELECT COUNT(*)
    FROM security_audit_logs
    WHERE created_at >= NOW() - INTERVAL '1 hour'
  LOOP
    IF current_hour_events > threshold_events THEN
      RETURN QUERY SELECT 
        'volume_spike'::TEXT,
        format('Unusual spike in security events: %s events (expected: %s)', 
               current_hour_events, threshold_events)::TEXT,
        LEAST(((current_hour_events::FLOAT - avg_events_per_hour) / stddev_events) / anomaly_threshold, 1.0)::FLOAT,
        ARRAY(
          SELECT DISTINCT host(ip_address)::TEXT
          FROM security_audit_logs
          WHERE created_at >= NOW() - INTERVAL '1 hour'
          LIMIT 10
        )::TEXT[],
        current_hour_events::INTEGER,
        ARRAY[NOW() - INTERVAL '1 hour', NOW()]::TIMESTAMP WITH TIME ZONE[];
    END IF;
  END LOOP;

  -- Detect IP concentration anomalies
  RETURN QUERY
  SELECT 
    'ip_concentration'::TEXT,
    format('High concentration of events from single IP: %s events from %s', 
           ip_stats.event_count, ip_stats.ip_address)::TEXT,
    LEAST(ip_stats.event_count::FLOAT / 100.0, 1.0)::FLOAT,
    ARRAY[ip_stats.ip_address]::TEXT[],
    ip_stats.event_count::INTEGER,
    ARRAY[NOW() - INTERVAL '1 hour', NOW()]::TIMESTAMP WITH TIME ZONE[]
  FROM (
    SELECT 
      host(ip_address) as ip_address,
      COUNT(*) as event_count
    FROM security_audit_logs
    WHERE created_at >= NOW() - (lookback_hours || ' hours')::INTERVAL
    GROUP BY host(ip_address)
    HAVING COUNT(*) > 50
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) ip_stats;

  -- Detect suspicious patterns
  RETURN QUERY
  SELECT 
    'suspicious_pattern'::TEXT,
    format('Multiple high-risk events detected: %s events with risk score > 80', pattern_stats.high_risk_count)::TEXT,
    LEAST(pattern_stats.high_risk_count::FLOAT / 20.0, 1.0)::FLOAT,
    ARRAY(
      SELECT DISTINCT host(ip_address)::TEXT
      FROM security_audit_logs
      WHERE created_at >= NOW() - (lookback_hours || ' hours')::INTERVAL
        AND risk_score > 80
      LIMIT 10
    )::TEXT[],
    pattern_stats.high_risk_count::INTEGER,
    ARRAY[NOW() - (lookback_hours || ' hours')::INTERVAL, NOW()]::TIMESTAMP WITH TIME ZONE[]
  FROM (
    SELECT COUNT(*) as high_risk_count
    FROM security_audit_logs
    WHERE created_at >= NOW() - (lookback_hours || ' hours')::INTERVAL
      AND risk_score > 80
  ) pattern_stats
  WHERE pattern_stats.high_risk_count > 10;

  -- Detect geographical anomalies (if geo data available)
  RETURN QUERY
  SELECT 
    'geo_anomaly'::TEXT,
    'Suspicious geographical distribution of requests'::TEXT,
    0.7::FLOAT,
    ARRAY[]::TEXT[],
    0::INTEGER,
    ARRAY[NOW() - INTERVAL '1 hour', NOW()]::TIMESTAMP WITH TIME ZONE[]
  WHERE EXISTS (
    SELECT 1
    FROM security_audit_logs
    WHERE created_at >= NOW() - (lookback_hours || ' hours')::INTERVAL
      AND geo_location IS NOT NULL
      AND geo_location->>'country' NOT IN ('US', 'CA', 'GB', 'AU')
    HAVING COUNT(DISTINCT geo_location->>'country') > 5
  );

END;
$$ LANGUAGE plpgsql;

-- Create function for threat correlation
CREATE OR REPLACE FUNCTION correlate_threats(
  correlation_window_hours INTEGER DEFAULT 1
) RETURNS TABLE (
  correlation_id UUID,
  threat_type TEXT,
  related_events INTEGER,
  confidence_score FLOAT,
  primary_indicators JSONB
) AS $$
BEGIN
  -- Correlate events by IP address patterns
  RETURN QUERY
  SELECT 
    gen_random_uuid() as correlation_id,
    'coordinated_attack'::TEXT as threat_type,
    correlation_data.event_count::INTEGER as related_events,
    LEAST(correlation_data.event_count::FLOAT / 20.0, 1.0)::FLOAT as confidence_score,
    jsonb_build_object(
      'primary_ip', correlation_data.ip_address,
      'event_types', correlation_data.event_types,
      'time_span', correlation_data.time_span
    ) as primary_indicators
  FROM (
    SELECT 
      host(ip_address) as ip_address,
      COUNT(*) as event_count,
      array_agg(DISTINCT event_type) as event_types,
      jsonb_build_object(
        'start', MIN(created_at),
        'end', MAX(created_at)
      ) as time_span
    FROM security_audit_logs
    WHERE created_at >= NOW() - (correlation_window_hours || ' hours')::INTERVAL
      AND risk_score > 60
    GROUP BY host(ip_address)
    HAVING COUNT(*) > 10 AND COUNT(DISTINCT event_type) > 2
  ) correlation_data;

  -- Correlate by user agent patterns
  RETURN QUERY
  SELECT 
    gen_random_uuid() as correlation_id,
    'bot_network'::TEXT as threat_type,
    ua_correlation.event_count::INTEGER as related_events,
    LEAST(ua_correlation.event_count::FLOAT / 15.0, 1.0)::FLOAT as confidence_score,
    jsonb_build_object(
      'user_agent_pattern', ua_correlation.user_agent_pattern,
      'unique_ips', ua_correlation.unique_ips,
      'event_distribution', ua_correlation.event_types
    ) as primary_indicators
  FROM (
    SELECT 
      substring(user_agent from 1 for 50) as user_agent_pattern,
      COUNT(*) as event_count,
      COUNT(DISTINCT ip_address) as unique_ips,
      array_agg(DISTINCT event_type) as event_types
    FROM security_audit_logs
    WHERE created_at >= NOW() - (correlation_window_hours || ' hours')::INTERVAL
      AND user_agent IS NOT NULL
      AND risk_score > 40
    GROUP BY substring(user_agent from 1 for 50)
    HAVING COUNT(*) > 8 AND COUNT(DISTINCT ip_address) > 3
  ) ua_correlation;

END;
$$ LANGUAGE plpgsql;

-- Create automated cleanup function for old security logs (compliance retention)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs(
  retention_days INTEGER DEFAULT 2555 -- 7 years default for compliance
) RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Archive old logs to a separate table first (optional)
  -- This example just deletes, but you might want to archive instead
  
  DELETE FROM security_audit_logs
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to update daily metrics automatically
CREATE OR REPLACE FUNCTION update_security_metrics_daily()
RETURNS VOID AS $$
BEGIN
  -- Call the aggregation function for yesterday
  PERFORM aggregate_daily_security_metrics(CURRENT_DATE - INTERVAL '1 day');
  
  -- Also update threat intelligence confidence scores based on recent activity
  UPDATE threat_intelligence
  SET confidence_score = LEAST(
    confidence_score + CASE 
      WHEN last_seen >= NOW() - INTERVAL '24 hours' THEN 5
      WHEN last_seen >= NOW() - INTERVAL '7 days' THEN 2
      ELSE -1
    END,
    100
  ),
  updated_at = NOW()
  WHERE is_active = true;
  
  -- Deactivate old threats with low confidence
  UPDATE threat_intelligence
  SET is_active = false,
      updated_at = NOW()
  WHERE confidence_score < 20 
    AND last_seen < NOW() - INTERVAL '30 days';
    
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION detect_security_anomalies IS 'ML-based anomaly detection for security events';
COMMENT ON FUNCTION correlate_threats IS 'Advanced threat correlation and pattern matching';
COMMENT ON FUNCTION cleanup_old_security_logs IS 'Automated cleanup with compliance retention periods';
COMMENT ON FUNCTION update_security_metrics_daily IS 'Daily maintenance for security metrics and threat intelligence';
