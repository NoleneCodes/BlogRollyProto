// Security Monitoring API stubs
export async function fetchSecurityMetrics() {
  // Aggregate metrics from security_audit_logs and GDPR requests
  try {
    const { data: events, error: eventsError } = await supabase
      .from('security_audit_logs')
      .select('*');
    if (eventsError) throw eventsError;
    const totalEvents = events.length;
    const anomaliesDetected = events.filter(e => e.action === 'anomaly_detected').length;
    const threatsBlocked = events.filter(e => e.action === 'threat_blocked').length;

    // GDPR requests table (if exists)
    let gdprRequests = 0;
    try {
      const { data: gdprData } = await supabase
        .from('gdpr_requests')
        .select('*');
      gdprRequests = gdprData ? gdprData.length : 0;
    } catch {}

    return { totalEvents, anomaliesDetected, threatsBlocked, gdprRequests };
  } catch (err) {
    console.error('Failed to fetch security metrics:', err);
    return null;
  }
}

export async function fetchRecentSecurityEvents() {
  try {
    const { data, error } = await supabase
      .from('security_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to fetch recent security events:', err);
    return [];
  }
}

export async function fetchComplianceStatus() {
  // Example: Fetch latest compliance audit from a compliance table
  try {
    const { data, error } = await supabase
      .from('compliance_audit')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    if (!data || data.length === 0) return null;
    const audit = data[0];
    return {
      gdpr: audit.gdpr_status,
      sox: audit.sox_status,
      pci: audit.pci_status,
      lastAudit: audit.created_at,
      violations: audit.violations,
      recommendations: audit.recommendations
    };
  } catch (err) {
    console.error('Failed to fetch compliance status:', err);
    return null;
  }
}
import { supabase } from './supabase';

interface SecurityEvent {
  event_type: 'rate_limit' | 'auth_attempt' | 'suspicious_request' | 'error' | 'admin_action' | 'data_access' | 'login_success' | 'login_failure' | 'password_change' | 'account_creation' | 'payment_attempt' | 'api_access' | 'file_upload' | 'data_export' | 'suspicious_pattern';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ip_address?: string;
  user_agent?: string;
  user_id?: string;
  session_id?: string;
  request_path?: string;
  request_method?: string;
  response_status?: number;
  details?: any;
  threat_indicators?: string[];
  geo_location?: any;
  correlation_id?: string;
  compliance_flags?: string[];
}

export async function logSecurityEvent(event: SecurityEvent) {
  try {
    const { error } = await supabase
      .from('security_audit_logs')
      .insert({
        event_type: event.event_type,
        severity: event.severity || 'medium',
        ip_address: event.ip_address,
        user_agent: event.user_agent,
        user_id: event.user_id,
        session_id: event.session_id,
        request_path: event.request_path,
        request_method: event.request_method,
        response_status: event.response_status,
        details: event.details,
        threat_indicators: event.threat_indicators,
        geo_location: event.geo_location,
        correlation_id: event.correlation_id,
        compliance_flags: event.compliance_flags
      });

    if (error) {
      console.error('Security logging error:', error);
    }
  } catch (err) {
    console.error('Security logging failed:', err);
  }
}

export async function detectAnomalies() {
  try {
    const { data, error } = await supabase
      .rpc('detect_security_anomalies', {
        lookback_hours: 24,
        anomaly_threshold: 2.0
      });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Anomaly detection failed:', err);
    return [];
  }
}

export async function correlateThreats() {
  try {
    const { data, error } = await supabase
      .rpc('correlate_threats', {
        correlation_window_hours: 1
      });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Threat correlation failed:', err);
    return [];
  }
}
