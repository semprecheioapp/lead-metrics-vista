import DOMPurify from 'dompurify';

// Input validation and sanitization utilities
export const InputValidator = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  // Phone validation (Brazilian format)
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  },

  // Company name validation
  isValidCompanyName: (name: string): boolean => {
    return name.length >= 2 && name.length <= 100 && /^[a-zA-ZÀ-ÿ0-9\s\-&\.]+$/.test(name);
  },

  // General text validation (prevents XSS)
  isValidText: (text: string, maxLength: number = 1000): boolean => {
    return text.length <= maxLength && !/[<>\"']/.test(text);
  },

  // Sanitize HTML content
  sanitizeHtml: (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  },

  // Sanitize form input
  sanitizeInput: (input: string): string => {
    return input
      .trim()
      .replace(/[<>\"']/g, '') // Remove potential XSS characters
      .substring(0, 1000); // Limit length
  },

  // CSV injection prevention
  preventCsvInjection: (value: string): string => {
    if (typeof value !== 'string') return value;
    
    // Remove leading dangerous characters that could cause CSV injection
    const dangerousChars = ['=', '+', '-', '@', '\t', '\r', '\n'];
    let sanitized = value;
    
    while (dangerousChars.some(char => sanitized.startsWith(char))) {
      sanitized = sanitized.substring(1);
    }
    
    return sanitized;
  },

  // Rate limiting helper (client-side)
  createRateLimiter: (maxAttempts: number, windowMs: number) => {
    const attempts = new Map<string, number[]>();
    
    return (identifier: string): boolean => {
      const now = Date.now();
      const userAttempts = attempts.get(identifier) || [];
      
      // Remove old attempts outside the window
      const validAttempts = userAttempts.filter(time => now - time < windowMs);
      
      if (validAttempts.length >= maxAttempts) {
        return false; // Rate limit exceeded
      }
      
      validAttempts.push(now);
      attempts.set(identifier, validAttempts);
      return true;
    };
  }
};

// Error messages for validation
export const ValidationMessages = {
  INVALID_EMAIL: 'E-mail inválido',
  INVALID_PHONE: 'Telefone inválido. Use o formato (11) 99999-9999',
  INVALID_COMPANY_NAME: 'Nome da empresa deve ter entre 2 e 100 caracteres',
  INVALID_TEXT: 'Texto contém caracteres inválidos',
  RATE_LIMIT_EXCEEDED: 'Muitas tentativas. Tente novamente em alguns minutos.',
  REQUIRED_FIELD: 'Este campo é obrigatório'
};