// Otimizações específicas para produção

// Rate limiting para funções críticas
export class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();

  canExecute(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  reset(key: string) {
    this.attempts.delete(key);
  }
}

// Cache em memória para dados críticos
export class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, data: any, ttlMs: number) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  get(key: string): any | null {
    const record = this.cache.get(key);
    
    if (!record) return null;
    
    if (Date.now() > record.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return record.data;
  }

  clear() {
    this.cache.clear();
  }
}

// Debounce para otimizar chamadas de API
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private marks = new Map<string, number>();

  start(name: string) {
    this.marks.set(name, performance.now());
  }

  end(name: string): number {
    const start = this.marks.get(name);
    if (!start) return 0;
    
    const duration = performance.now() - start;
    this.marks.delete(name);
    
    // Log apenas se duração for significativa (> 100ms)
    if (duration > 100) {
      console.warn(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
}

export const globalRateLimiter = new RateLimiter();
export const globalCache = new MemoryCache();
export const performanceMonitor = new PerformanceMonitor();