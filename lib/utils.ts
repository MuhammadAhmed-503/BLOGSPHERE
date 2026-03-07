/**
 * Utility Functions
 * Helper functions for common operations
 */

import slugify from 'slugify';
import readingTime from 'reading-time';

/**
 * Generate a unique slug from title
 */
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

/**
 * Calculate reading time from markdown content
 */
export function calculateReadingTime(content: string): number {
  const stats = readingTime(content);
  return Math.ceil(stats.minutes);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Extract excerpt from markdown content
 */
export function extractExcerpt(content: string, maxLength: number = 200): string {
  // Remove markdown syntax
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/`(.+?)`/g, '$1') // Remove code
    .replace(/\n/g, ' ') // Remove line breaks
    .trim();

  return truncateText(plainText, maxLength);
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page?: string | null, limit?: string | null): {
  page: number;
  limit: number;
  skip: number;
} {
  const pageNum = Math.max(1, parseInt(page || '1', 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit || '10', 10)));
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
}

/**
 * Create URL-safe base64 string
 */
export function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decode URL-safe base64 string
 */
export function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString();
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
