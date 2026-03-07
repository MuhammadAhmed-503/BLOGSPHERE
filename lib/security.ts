/**
 * Security Utilities
 * Input sanitization and validation
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
      'code',
      'pre',
      'img',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
  });
}

/**
 * Sanitize plain text to prevent injection
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if string contains potential SQL/NoSQL injection patterns
 */
export function containsInjectionPattern(input: string): boolean {
  const injectionPatterns = [
    /(\$where|\$ne|\$gt|\$gte|\$lt|\$lte|\$in|\$nin)/i, // MongoDB operators
    /(union|select|insert|update|delete|drop|create|alter)/i, // SQL keywords
    /[';\"]/g, // Quotes
  ];

  return injectionPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize user input
 */
export function validateInput(input: string, maxLength: number = 1000): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      sanitized: '',
      error: 'Invalid input',
    };
  }

  if (input.length > maxLength) {
    return {
      isValid: false,
      sanitized: '',
      error: `Input exceeds maximum length of ${maxLength} characters`,
    };
  }

  if (containsInjectionPattern(input)) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Input contains invalid characters',
    };
  }

  return {
    isValid: true,
    sanitized: sanitizeText(input),
  };
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomValues = new Uint8Array(length);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      token += chars[randomValues[i] % chars.length];
    }
  } else {
    // Fallback for Node.js
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    const bytes = nodeCrypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      token += chars[bytes[i] % chars.length];
    }
  }

  return token;
}

/**
 * Hash sensitive data (for tokens, not passwords)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
