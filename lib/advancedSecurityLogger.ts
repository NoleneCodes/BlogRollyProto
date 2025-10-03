import { NextApiRequest } from 'next';
import { supabase } from './supabase';

interface SecurityEvent {
  type: 'rate_limit' | 'auth_attempt' | 'suspicious_request' | 'error' | 'admin_action' | 'data_access' | 'login_success' | 'login_failure' | 'password_change' | 'account_creation' | 'payment_attempt' | 'api_access' | 'file_upload' | 'data_export' | 'suspicious_pattern';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  requestPath?: string;
  requestMethod?: string;
  responseStatus?: number;
  details: any;
  riskScore?: number;
  threatIndicators?: string[];
  correlationId?: string;
  complianceFlags?: string[];
}

interface ThreatIntelligence {
  indicatorType: 'ip' | 'user_agent' | 'pattern' | 'fingerprint';
  indicatorValue: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  confidenceScore?: number;
  metadata?: any;
}

interface SecurityMetrics {
  totalEvents: number;
  highRiskEvents: number;
  criticalEvents: number;
  uniqueIPs: number;
  suspiciousIPs: number;
  topThreats: Array<{
    ip: string;
    count: number;
    maxRisk: number;
  }>;
  complianceSummary: {
    gdprEvents: number;
    soxEvents: number;
    dataAccessEvents: number;
  };
}

class AdvancedSecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 100; // Keep recent events in memory for fast access
  private serverInstance = process.env.REPLIT_SLUG || 'replit-main';

  async log(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      severity: event.severity || 'medium',
    };

    // Add to in-memory cache for immediate access
    this.events.push(securityEvent);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Store in database for long-term audit trail
    try {
      await this.logToDatabase(securityEvent);
      
      // Update threat intelligence if this is a suspicious event
      if (securityEvent.type === 'suspicious_request' || securityEvent.riskScore && securityEvent.riskScore > 70) {
        await this.updateThreatIntelligence(securityEvent);
      }

      // Check for patterns and correlations
      await this.analyzePatterns(securityEvent);
      
    } catch (error) {
      console.error('[SECURITY] Failed to log to database:', error);
      // Continue with in-memory logging even if database fails
    }

    // Console logging for immediate visibility
    console.log('[SECURITY]', {
      ...securityEvent,
      timestamp: new Date().toISOString(),
      serverInstance: this.serverInstance
    });
  }

  private async logToDatabase(event: SecurityEvent) {
    const { error } = await supabase
      .from('security_audit_logs')
      .insert({
        event_type: event.type,
        severity: event.severity,
        ip_address: event.ip,
        user_agent: event.userAgent,
        user_id: event.userId,
        session_id: event.sessionId,
        request_path: event.requestPath,
        request_method: event.requestMethod,
        response_status: event.responseStatus,
        details: event.details,
        risk_score: event.riskScore || 0,
        threat_indicators: event.threatIndicators || [],
        correlation_id: event.correlationId,
        server_instance: this.serverInstance,
        compliance_flags: event.complianceFlags || []
      });

    if (error) {
      throw error;
    }
  }

  private async updateThreatIntelligence(event: SecurityEvent) {
    try {
      // Update IP-based threat intelligence
      if (event.ip && event.riskScore && event.riskScore > 50) {
        const threatLevel = event.riskScore > 90 ? 'critical' : 
                          event.riskScore > 70 ? 'high' : 
                          event.riskScore > 50 ? 'medium' : 'low';

        await supabase.rpc('update_threat_intelligence', {
          p_indicator_type: 'ip',
          p_indicator_value: event.ip,
          p_threat_level: threatLevel,
          p_source: 'automated-analysis'
        });
      }

      // Update user agent patterns
      if (event.userAgent && (event.type === 'suspicious_request' || event.riskScore && event.riskScore > 80)) {
        await supabase.rpc('update_threat_intelligence', {
          p_indicator_type: 'user_agent',
          p_indicator_value: event.userAgent,
          p_threat_level: 'medium',
          p_source: 'pattern-detection'
        });
      }
    } catch (error) {
      console.error('[SECURITY] Failed to update threat intelligence:', error);
    }
  }

  private async analyzePatterns(event: SecurityEvent) {
    try {
      // Look for rapid successive events from same IP
      const recentEvents = await this.getRecentEventsByIP(event.ip, 5); // Last 5 minutes
      
      if (recentEvents.length > 10) {
        await this.log({
          type: 'suspicious_pattern',
          severity: 'high',
          ip: event.ip,
          userAgent: event.userAgent,
          details: {
            pattern: 'rapid_requests',
            eventCount: recentEvents.length,
            timeWindow: '5min'
          },
          riskScore: 85,
          threatIndicators: ['rapid_requests', 'potential_bot'],
          complianceFlags: ['sox'] // Financial compliance flag
        });
      }

      // Cross-server correlation (if multiple instances)
      await this.correlateCrossServer(event);
      
    } catch (error) {
      console.error('[SECURITY] Pattern analysis failed:', error);
    }
  }

  private async getRecentEventsByIP(ip: string, minutesBack: number = 5) {
    const { data, error } = await supabase
      .from('security_audit_logs')
      .select('*')
      .eq('ip_address', ip)
      .gte('created_at', new Date(Date.now() - minutesBack * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SECURITY] Failed to get recent events:', error);
      return [];
    }

    return data || [];
  }

  private async correlateCrossServer(event: SecurityEvent) {
    try {
      // Generate correlation ID for cross-server tracking
      if (!event.correlationId && event.userId) {
        event.correlationId = `${event.userId}-${Date.now()}`;
      }

      // Check for same event patterns across different server instances
      const { data: crossServerEvents } = await supabase
        .from('security_audit_logs')
        .select('server_instance, count(*)')
        .eq('ip_address', event.ip)
        .eq('event_type', event.type)
        .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
        .neq('server_instance', this.serverInstance);

      if (crossServerEvents && crossServerEvents.length > 0) {
        await this.log({
          type: 'suspicious_pattern',
          severity: 'high',
          ip: event.ip,
          userAgent: event.userAgent,
          details: {
            pattern: 'cross_server_activity',
            serverInstances: Array.isArray(crossServerEvents)
              ? crossServerEvents.map((e: any) => e.server_instance)
              : [],
            originalEvent: event.type
          },
          riskScore: 90,
          threatIndicators: ['cross_server', 'coordinated_attack'],
          correlationId: event.correlationId
        });
      }
    } catch (error) {
      console.error('[SECURITY] Cross-server correlation failed:', error);
    }
  }

  // Compliance-specific logging methods
  async logGDPREvent(event: Omit<SecurityEvent, 'complianceFlags'>) {
    await this.log({
      ...event,
      complianceFlags: ['gdpr']
    });
  }

  async logSOXEvent(event: Omit<SecurityEvent, 'complianceFlags'>) {
    await this.log({
      ...event,
      complianceFlags: ['sox']
    });
  }

  async logDataAccess(userId: string, dataType: string, ip: string, userAgent?: string) {
    await this.log({
      type: 'data_access',
      severity: 'medium',
      ip,
      userAgent,
      userId,
      details: {
        dataType,
        accessTime: new Date().toISOString()
      },
      complianceFlags: ['gdpr', 'sox']
    });
  }

  // Enhanced querying methods
  async getRecentEvents(type?: SecurityEvent['type'], limit: number = 50): Promise<any[]> {
    try {
      let query = supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('event_type', type);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('[SECURITY] Failed to get recent events from database:', error);
        // Fallback to in-memory events
        return this.events.filter(event => !type || event.type === type).slice(-limit);
      }

      return data || [];
    } catch (error) {
      console.error('[SECURITY] Database query failed:', error);
      return this.events.filter(event => !type || event.type === type).slice(-limit);
    }
  }

  async getSuspiciousIPs(riskThreshold: number = 70): Promise<string[]> {
    try {
      // Use a Supabase RPC call to a custom SQL function for grouping/filtering
      const { data, error } = await supabase.rpc('get_suspicious_ips', {
        p_risk_threshold: riskThreshold,
        p_since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      });

      if (error) {
        console.error('[SECURITY] Failed to get suspicious IPs:', error);
        return [];
      }

      return data?.map((row: any) => row.ip_address) || [];
    } catch (error) {
      console.error('[SECURITY] Failed to get suspicious IPs:', error);
      return [];
    }
  }

  async getSecurityMetrics(days: number = 7): Promise<SecurityMetrics> {
    try {
      const { data, error } = await supabase
        .from('security_metrics_daily')
        .select('*')
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      // Aggregate metrics
      const totalEvents = data?.reduce((sum, day) => sum + (day.total_events || 0), 0) || 0;
      const highRiskEvents = data?.reduce((sum, day) => sum + (day.high_risk_events || 0), 0) || 0;
      const criticalEvents = data?.reduce((sum, day) => sum + (day.critical_events || 0), 0) || 0;

      return {
        totalEvents,
        highRiskEvents,
        criticalEvents,
        uniqueIPs: data?.[0]?.unique_ips || 0,
        suspiciousIPs: data?.[0]?.suspicious_ips || 0,
        topThreats: data?.[0]?.top_threat_indicators?.top_suspicious_ips || [],
        complianceSummary: data?.[0]?.compliance_summary || {
          gdprEvents: 0,
          soxEvents: 0,
          dataAccessEvents: 0
        }
      };
    } catch (error) {
      console.error('[SECURITY] Failed to get security metrics:', error);
      return {
        totalEvents: 0,
        highRiskEvents: 0,
        criticalEvents: 0,
        uniqueIPs: 0,
        suspiciousIPs: 0,
        topThreats: [],
        complianceSummary: {
          gdprEvents: 0,
          soxEvents: 0,
          dataAccessEvents: 0
        }
      };
    }
  }

  async getThreatIntelligence(limit: number = 100): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('threat_intelligence')
        .select('*')
        .eq('is_active', true)
        .order('threat_level', { ascending: false })
        .order('confidence_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[SECURITY] Failed to get threat intelligence:', error);
      return [];
    }
  }

  // ML-based pattern detection
  async detectAnomalies(): Promise<any[]> {
    try {
      // Simple anomaly detection based on statistical analysis
      const { data, error } = await supabase.rpc('detect_security_anomalies');
      
      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[SECURITY] Anomaly detection failed:', error);
      return [];
    }
  }

  // Generate compliance reports
  async generateComplianceReport(startDate: Date, endDate: Date, complianceType: 'gdpr' | 'sox' | 'all' = 'all') {
    try {
      let query = supabase
        .from('security_audit_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (complianceType !== 'all') {
        query = query.contains('compliance_flags', [complianceType]);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        reportPeriod: { startDate, endDate },
        complianceType,
        totalEvents: data?.length || 0,
        events: data || [],
        summary: {
          dataAccessEvents: data?.filter(e => e.event_type === 'data_access').length || 0,
          authEvents: data?.filter(e => e.event_type === 'auth_attempt').length || 0,
          suspiciousActivities: data?.filter(e => e.risk_score > 70).length || 0,
        }
      };
    } catch (error) {
      console.error('[SECURITY] Compliance report generation failed:', error);
      return null;
    }
  }
}

export const securityLogger = new AdvancedSecurityLogger();

export const logSecurityEvent = async (
  type: SecurityEvent['type'],
  req: NextApiRequest,
  details: any,
  options: {
    severity?: SecurityEvent['severity'];
    userId?: string;
    complianceFlags?: string[];
    riskScore?: number;
  } = {}
) => {
  await securityLogger.log({
    type,
    severity: options.severity || 'medium',
    ip: (req.headers['x-forwarded-for'] as string) || req.connection?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'],
    userId: options.userId,
    requestPath: req.url,
    requestMethod: req.method,
    details,
    riskScore: options.riskScore,
    complianceFlags: options.complianceFlags
  });
};

// GDPR-specific logging helper
export const logGDPREvent = async (
  type: SecurityEvent['type'],
  req: NextApiRequest,
  details: any,
  options: { userId?: string; severity?: SecurityEvent['severity'] } = {}
) => {
  await securityLogger.logGDPREvent({
    type,
    severity: options.severity || 'medium',
    ip: (req.headers['x-forwarded-for'] as string) || req.connection?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'],
    userId: options.userId,
    requestPath: req.url,
    requestMethod: req.method,
    details
  });
};

// SOX-specific logging helper
export const logSOXEvent = async (
  type: SecurityEvent['type'],
  req: NextApiRequest,
  details: any,
  options: { userId?: string; severity?: SecurityEvent['severity'] } = {}
) => {
  await securityLogger.logSOXEvent({
    type,
    severity: options.severity || 'medium',
    ip: (req.headers['x-forwarded-for'] as string) || req.connection?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'],
    userId: options.userId,
    requestPath: req.url,
    requestMethod: req.method,
    details
  });
};
