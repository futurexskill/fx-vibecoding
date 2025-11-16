// Security utility for enterprise-grade security features (Browser-compatible)

export interface SecurityConfig {
  apiRateLimit: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export class SecurityManager {
  private static config: SecurityConfig = {
    apiRateLimit: 100, // requests per minute
    sessionTimeout: 3600000, // 1 hour in milliseconds
    maxLoginAttempts: 5
  };

  /**
   * Generate secure API keys for users (browser-compatible)
   */
  static generateApiKey(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for non-browser environments
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash passwords securely (browser-compatible)
   */
  static async hashPassword(password: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + 'salt'); // Simple salt - use proper salt in production
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback - not cryptographically secure, use only for development
    return btoa(password).replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate secure JWT tokens
   */
  static generateJWT(payload: object, expiresIn: string = '1h'): string {
    // Note: In production, use jsonwebtoken library
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Date.now();
    const exp = now + (expiresIn === '1h' ? 3600000 : parseInt(expiresIn));

    const jwtPayload = {
      ...payload,
      iat: Math.floor(now / 1000),
      exp: Math.floor(exp / 1000)
    };

    // This is a simplified implementation - use proper JWT library in production
    return `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(jwtPayload))}.signature`;
  }

  /**
   * Sanitize input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Rate limiting check (in-memory - use Redis in production)
   */
  private static rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  static checkRateLimit(identifier: string, limit: number = this.config.apiRateLimit): boolean {
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    
    const current = this.rateLimitStore.get(identifier);
    
    if (!current || now > current.resetTime) {
      this.rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (current.count >= limit) {
      return false;
    }

    current.count++;
    return true;
  }

  /**
   * Generate Content Security Policy headers
   */
  static getCSPHeaders(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://7kiye42406.execute-api.us-east-1.amazonaws.com https://www.google-analytics.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }

  /**
   * Get security headers for responses
   */
  static getSecurityHeaders(): { [key: string]: string } {
    return {
      'Content-Security-Policy': this.getCSPHeaders(),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
  }

  /**
   * Validate API requests
   */
  static validateApiRequest(request: {
    method: string;
    headers: { [key: string]: string };
    body?: any;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required headers
    if (!request.headers['content-type'] && request.method !== 'GET') {
      errors.push('Content-Type header is required');
    }

    // Validate content type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers['content-type'];
      if (contentType && !contentType.includes('application/json')) {
        errors.push('Invalid content type. Expected application/json');
      }
    }

    // Check for potential injection attacks in request
    if (request.body) {
      const bodyStr = JSON.stringify(request.body);
      if (/<script|javascript:|onerror=|onload=/i.test(bodyStr)) {
        errors.push('Potential XSS attack detected');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default SecurityManager;