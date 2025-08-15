
import { securityLogger } from './security-logger';
import { supabase } from './supabase';

export interface ComplianceReport {
  reportType: 'gdpr' | 'sox' | 'general';
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalEvents: number;
    dataAccessEvents: number;
    authenticationEvents: number;
    highRiskEvents: number;
    criticalEvents: number;
    uniqueUsers: number;
    uniqueIPs: number;
  };
  violations: Array<{
    type: string;
    severity: string;
    description: string;
    timestamp: Date;
    userId?: string;
    ipAddress: string;
    riskScore: number;
  }>;
  recommendations: string[];
  threatIntelligence: Array<{
    indicator: string;
    type: string;
    threatLevel: string;
    occurrences: number;
  }>;
}

export class ComplianceReporter {
  async generateGDPRReport(startDate: Date, endDate: Date): Promise<ComplianceReport> {
    const events = await this.getComplianceEvents(startDate, endDate, 'gdpr');
    
    return {
      reportType: 'gdpr',
      period: { startDate, endDate },
      summary: this.generateSummary(events),
      violations: this.identifyGDPRViolations(events),
      recommendations: this.generateGDPRRecommendations(events),
      threatIntelligence: await this.getThreatIntelligenceForPeriod(startDate, endDate)
    };
  }

  async generateSOXReport(startDate: Date, endDate: Date): Promise<ComplianceReport> {
    const events = await this.getComplianceEvents(startDate, endDate, 'sox');
    
    return {
      reportType: 'sox',
      period: { startDate, endDate },
      summary: this.generateSummary(events),
      violations: this.identifySOXViolations(events),
      recommendations: this.generateSOXRecommendations(events),
      threatIntelligence: await this.getThreatIntelligenceForPeriod(startDate, endDate)
    };
  }

  private async getComplianceEvents(startDate: Date, endDate: Date, type: 'gdpr' | 'sox') {
    const { data, error } = await supabase
      .from('security_audit_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .contains('compliance_flags', [type])
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Failed to get ${type.toUpperCase()} events:`, error);
      return [];
    }

    return data || [];
  }

  private generateSummary(events: any[]) {
    return {
      totalEvents: events.length,
      dataAccessEvents: events.filter(e => e.event_type === 'data_access').length,
      authenticationEvents: events.filter(e => e.event_type === 'auth_attempt').length,
      highRiskEvents: events.filter(e => e.risk_score >= 70).length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      uniqueUsers: new Set(events.filter(e => e.user_id).map(e => e.user_id)).size,
      uniqueIPs: new Set(events.filter(e => e.ip_address).map(e => e.ip_address)).size
    };
  }

  private identifyGDPRViolations(events: any[]) {
    const violations = [];

    // Check for unauthorized data access
    const unauthorizedAccess = events.filter(e => 
      e.event_type === 'data_access' && e.risk_score > 50
    );

    violations.push(...unauthorizedAccess.map(event => ({
      type: 'Potential Unauthorized Data Access',
      severity: event.severity,
      description: `Data access attempt with high risk score from IP ${event.ip_address}`,
      timestamp: new Date(event.created_at),
      userId: event.user_id,
      ipAddress: event.ip_address,
      riskScore: event.risk_score
    })));

    // Check for data export activities
    const dataExports = events.filter(e => e.event_type === 'data_export');
    violations.push(...dataExports.map(event => ({
      type: 'Data Export Activity',
      severity: 'medium',
      description: `Data export detected: ${JSON.stringify(event.details)}`,
      timestamp: new Date(event.created_at),
      userId: event.user_id,
      ipAddress: event.ip_address,
      riskScore: event.risk_score
    })));

    return violations;
  }

  private identifySOXViolations(events: any[]) {
    const violations = [];

    // Check for financial transaction anomalies
    const paymentAnomalies = events.filter(e => 
      e.event_type === 'payment_attempt' && e.risk_score > 80
    );

    violations.push(...paymentAnomalies.map(event => ({
      type: 'Suspicious Payment Activity',
      severity: event.severity,
      description: `High-risk payment attempt detected: ${JSON.stringify(event.details)}`,
      timestamp: new Date(event.created_at),
      userId: event.user_id,
      ipAddress: event.ip_address,
      riskScore: event.risk_score
    })));

    // Check for admin actions without proper audit trail
    const adminActions = events.filter(e => 
      e.event_type === 'admin_action' && !e.user_id
    );

    violations.push(...adminActions.map(event => ({
      type: 'Admin Action Without User Context',
      severity: 'high',
      description: `Admin action performed without proper user identification`,
      timestamp: new Date(event.created_at),
      userId: event.user_id,
      ipAddress: event.ip_address,
      riskScore: event.risk_score
    })));

    return violations;
  }

  private generateGDPRRecommendations(events: any[]): string[] {
    const recommendations = [];

    if (events.filter(e => e.event_type === 'data_access' && e.risk_score > 70).length > 0) {
      recommendations.push('Implement additional access controls for sensitive data');
      recommendations.push('Review and strengthen user authentication mechanisms');
    }

    if (events.filter(e => e.event_type === 'data_export').length > 10) {
      recommendations.push('Monitor and audit data export activities more closely');
      recommendations.push('Consider implementing data loss prevention (DLP) measures');
    }

    recommendations.push('Regularly review and update privacy policies');
    recommendations.push('Conduct periodic GDPR compliance assessments');

    return recommendations;
  }

  private generateSOXRecommendations(events: any[]): string[] {
    const recommendations = [];

    if (events.filter(e => e.event_type === 'payment_attempt' && e.risk_score > 80).length > 0) {
      recommendations.push('Enhance fraud detection mechanisms for payment processing');
      recommendations.push('Implement additional verification steps for high-risk transactions');
    }

    if (events.filter(e => e.event_type === 'admin_action').length > 5) {
      recommendations.push('Ensure all administrative actions are properly logged with user context');
      recommendations.push('Implement segregation of duties for financial controls');
    }

    recommendations.push('Regular review of financial access controls');
    recommendations.push('Maintain comprehensive audit trails for all financial transactions');

    return recommendations;
  }

  private async getThreatIntelligenceForPeriod(startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('threat_intelligence')
      .select('*')
      .gte('last_seen', startDate.toISOString())
      .lte('last_seen', endDate.toISOString())
      .eq('is_active', true)
      .order('threat_level', { ascending: false });

    if (error) {
      console.error('Failed to get threat intelligence:', error);
      return [];
    }

    return (data || []).map(threat => ({
      indicator: threat.indicator_value,
      type: threat.indicator_type,
      threatLevel: threat.threat_level,
      occurrences: threat.occurrence_count
    }));
  }

  async exportReport(report: ComplianceReport, format: 'json' | 'csv' = 'json'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }

    // CSV export (simplified)
    const csvRows = [
      'Timestamp,Event Type,Severity,IP Address,User ID,Risk Score,Description',
      ...report.violations.map(v => 
        `${v.timestamp.toISOString()},${v.type},${v.severity},${v.ipAddress},${v.userId || ''},${v.riskScore},"${v.description}"`
      )
    ];

    return csvRows.join('\n');
  }
}

export const complianceReporter = new ComplianceReporter();
