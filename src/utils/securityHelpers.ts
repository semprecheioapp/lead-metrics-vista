// Security utility functions for the application

export const SecurityHelpers = {
  // Webhook signature verification (client-side preparation)
  generateWebhookSignature: (payload: string, secret: string): string => {
    // Note: In production, this should be done server-side
    // This is just for demonstration and client-side validation preparation
    return btoa(`${payload}-${secret}-${Date.now()}`);
  },

  // Content Security Policy helpers
  createCSPNonce: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },

  // Log security events (client-side)
  logSecurityEvent: (event: string, details: Record<string, any> = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent.substring(0, 100),
      url: window.location.href
    };
    
    // In production, this should be sent to a secure logging service
    console.warn('SECURITY EVENT:', logEntry);
    
    // Store in sessionStorage for debugging (limit size)
    try {
      const existingLogs = JSON.parse(sessionStorage.getItem('security_logs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 10 entries
      const recentLogs = existingLogs.slice(-10);
      sessionStorage.setItem('security_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to store security log:', error);
    }
  },

  // Detect suspicious activity patterns
  detectSuspiciousActivity: (): boolean => {
    try {
      const logs = JSON.parse(sessionStorage.getItem('security_logs') || '[]');
      const recentLogs = logs.filter((log: any) => {
        const logTime = new Date(log.timestamp).getTime();
        const now = Date.now();
        return now - logTime < 60000; // Last minute
      });

      // Check for rapid successive requests
      if (recentLogs.length > 5) {
        SecurityHelpers.logSecurityEvent('SUSPICIOUS_RAPID_REQUESTS', {
          count: recentLogs.length,
          timeframe: '1_minute'
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return false;
    }
  },

  // Validate referrer for additional security
  validateReferrer: (allowedDomains: string[] = []): boolean => {
    const referrer = document.referrer;
    
    if (!referrer) {
      // Direct access or no referrer - could be legitimate
      return true;
    }

    try {
      const referrerUrl = new URL(referrer);
      const currentUrl = new URL(window.location.href);
      
      // Same origin is always allowed
      if (referrerUrl.origin === currentUrl.origin) {
        return true;
      }

      // Check against allowed domains
      return allowedDomains.some(domain => referrerUrl.hostname.endsWith(domain));
    } catch (error) {
      SecurityHelpers.logSecurityEvent('INVALID_REFERRER', { referrer });
      return false;
    }
  },

  // Prevent clickjacking
  preventClickjacking: (): void => {
    try {
      if (window.top !== window.self) {
        // Try to access top window origin safely
        let topOrigin = 'unknown';
        try {
          topOrigin = window.top?.location?.origin || 'unknown';
        } catch (crossOriginError) {
          // Cross-origin access blocked - this is expected in iframe environments
          topOrigin = 'cross-origin-blocked';
        }

        SecurityHelpers.logSecurityEvent('CLICKJACKING_ATTEMPT', {
          topOrigin,
          selfOrigin: window.self.location.origin
        });
        
        // Only break out of frame if we're not in a development/preview environment
        const isDevelopment = window.location.hostname.includes('lovableproject.com') || 
                             window.location.hostname === 'localhost' ||
                             window.location.hostname.includes('preview');
        
        if (!isDevelopment) {
          // Break out of frame in production
          window.top!.location.href = window.self.location.href;
        }
      }
    } catch (error) {
      // Silently handle any security errors
      console.debug('Clickjacking prevention blocked by browser security:', error);
    }
  },

  // Monitor for DOM tampering
  monitorDOMTampering: (): void => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for suspicious script tags
              if (element.tagName === 'SCRIPT' && !element.hasAttribute('data-verified')) {
                SecurityHelpers.logSecurityEvent('SUSPICIOUS_SCRIPT_INJECTION', {
                  content: element.textContent?.substring(0, 100) || '',
                  src: element.getAttribute('src') || ''
                });
              }
              
              // Check for suspicious iframe tags
              if (element.tagName === 'IFRAME') {
                SecurityHelpers.logSecurityEvent('IFRAME_INJECTION', {
                  src: element.getAttribute('src') || ''
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },

  // Initialize security monitoring
  initializeSecurity: (): void => {
    try {
      SecurityHelpers.preventClickjacking();
      SecurityHelpers.monitorDOMTampering();
      
      // Validate referrer on page load
      if (!SecurityHelpers.validateReferrer(['semprecheioapp.com.br', 'lovable.dev', 'lovableproject.com'])) {
        SecurityHelpers.logSecurityEvent('INVALID_REFERRER_ON_LOAD');
      }
    } catch (error) {
      // Handle any initialization errors gracefully
      console.debug('Security initialization encountered an error:', error);
    }
  }
};
