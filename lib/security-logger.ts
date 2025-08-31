
import { NextApiRequest } from 'next';

interface SecurityEvent {
  type: 'rate_limit' | 'auth_attempt' | 'suspicious_request' | 'error';
  ip: string;
  userAgent?: string;
  timestamp: Date;
  details: any;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  log(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    this.events.push(securityEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // In production, you would send this to a proper logging service
    console.log('[SECURITY]', securityEvent);
  }

  getRecentEvents(type?: SecurityEvent['type'], limit = 50): SecurityEvent[] {
    let filtered = this.events;
    
    if (type) {
      filtered = this.events.filter(event => event.type === type);
    }

    return filtered.slice(-limit);
  }

  getSuspiciousIPs(): string[] {
    const ipCounts: { [ip: string]: number } = {};
    
    this.events.forEach(event => {
      if (event.type === 'rate_limit' || event.type === 'suspicious_request') {
        ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
      }
    });

    return Object.entries(ipCounts)
      .filter(([, count]) => count > 10)
      .map(([ip]) => ip);
  }
}

export const securityLogger = new SecurityLogger();

export const logSecurityEvent = (
  type: SecurityEvent['type'],
  req: NextApiRequest,
  details: any
) => {
  securityLogger.log({
    type,
    ip: req.headers['x-forwarded-for'] as string || req.connection?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'],
    details
  });
};
