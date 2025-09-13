// Sistema de logging para produção
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private maxLogs = 100; // Máximo de logs armazenados

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Em desenvolvimento, sempre mostrar no console
    if (this.isDevelopment) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      console[consoleMethod](`[${level.toUpperCase()}]`, message, data || '');
    }

    // Em produção, apenas erros críticos no console
    if (!this.isDevelopment && level === 'error') {
      console.error('Critical Error:', message, data);
    }

    // Armazenar logs localmente (limitado)
    this.storeLog(entry);

    // Para erros críticos, considerar envio para serviço de monitoramento
    if (level === 'error' && !this.isDevelopment) {
      this.reportError(entry);
    }
  }

  private storeLog(entry: LogEntry) {
    try {
      const stored = localStorage.getItem('app_logs');
      const logs: LogEntry[] = stored ? JSON.parse(stored) : [];
      
      logs.push(entry);
      
      // Manter apenas os últimos logs
      if (logs.length > this.maxLogs) {
        logs.splice(0, logs.length - this.maxLogs);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch {
      // Falha silenciosa se localStorage não disponível
    }
  }

  private reportError(entry: LogEntry) {
    // Aqui pode implementar envio para Sentry, LogRocket, etc.
    // Por enquanto, apenas armazenar localmente
    try {
      const errors = localStorage.getItem('app_errors');
      const errorLogs: LogEntry[] = errors ? JSON.parse(errors) : [];
      errorLogs.push(entry);
      
      if (errorLogs.length > 50) {
        errorLogs.splice(0, errorLogs.length - 50);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errorLogs));
    } catch {
      // Falha silenciosa
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // Métodos utilitários
  getLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem('app_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getErrors(): LogEntry[] {
    try {
      const stored = localStorage.getItem('app_errors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  clearLogs() {
    localStorage.removeItem('app_logs');
    localStorage.removeItem('app_errors');
  }
}

export const logger = new Logger();

// Capturar erros globais não tratados
window.addEventListener('error', (event) => {
  logger.error('Uncaught Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', {
    reason: event.reason,
    stack: event.reason?.stack
  });
});