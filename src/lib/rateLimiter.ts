// Rate limiting implementation
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60 * 1000 // 1 minute
  ) {}

  check(key: string): { allowed: boolean; resetTime: number; remaining: number } {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return {
        allowed: true,
        resetTime: now + this.windowMs,
        remaining: this.maxRequests - 1
      };
    }

    if (record.count >= this.maxRequests) {
      return {
        allowed: false,
        resetTime: record.resetTime,
        remaining: 0
      };
    }

    record.count++;
    return {
      allowed: true,
      resetTime: record.resetTime,
      remaining: this.maxRequests - record.count
    };
  }

  reset(key?: string) {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}

// API rate limiter instances
export const apiRateLimiter = new RateLimiter(100, 60000);
export const authRateLimiter = new RateLimiter(5, 60000);
export const uploadRateLimiter = new RateLimiter(10, 60000);

// Rate limiting middleware
export const createRateLimitMiddleware = (limiter: RateLimiter) => {
  return async (key: string, fn: () => Promise<any>) => {
    const result = limiter.check(key);
    
    if (!result.allowed) {
      const error = new Error(`Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)}s`);
      (error as any).status = 429;
      (error as any).retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      throw error;
    }

    try {
      return await fn();
    } catch (error) {
      // Don't count failed requests against rate limit
      const record = limiter.check(key);
      if (record.allowed) {
        const current = limiter['requests'].get(key);
        if (current) current.count--;
      }
      throw error;
    }
  };
};

// React hook for rate limiting
export const useRateLimit = () => {
  const checkRateLimit = async (key: string, limiter: RateLimiter) => {
    const result = limiter.check(key);
    return result;
  };

  return { checkRateLimit };
};