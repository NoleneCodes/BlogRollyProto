
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class InMemoryRateLimit {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;

    // Clean up expired entries
    if (this.store[key] && now > this.store[key].resetTime) {
      delete this.store[key];
    }

    // Initialize or get current entry
    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs
      };
    }

    const entry = this.store[key];
    
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    entry.count++;
    
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }
}

// Rate limiters for different endpoints
export const authRateLimit = new InMemoryRateLimit(900000, 5); // 5 attempts per 15 minutes
export const apiRateLimit = new InMemoryRateLimit(60000, 60); // 60 requests per minute
export const submitRateLimit = new InMemoryRateLimit(3600000, 3); // 3 submissions per hour

export const getRateLimitMiddleware = (limiter: InMemoryRateLimit) => {
  return (req: any) => {
    const identifier = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    return limiter.check(identifier);
  };
};
