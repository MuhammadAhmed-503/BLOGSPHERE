/**
 * Rate Limiter Utility
 * In-memory rate limiting for API routes
 * For production, consider using Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup old entries every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60 * 60 * 1000);
}

interface RateLimitOptions {
  interval?: number; // in milliseconds
  maxRequests?: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param options - Rate limit configuration
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { interval = 60 * 1000, maxRequests = 10 } = options; // Default: 10 requests per minute

  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const resetTime = now + interval;
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      remaining: maxRequests - 1,
      reset: resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  return {
    success: true,
    remaining: maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  // Check various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  options: RateLimitOptions = {}
) {
  return async (request: Request): Promise<Response> => {
    const ip = getClientIp(request);
    const result = rateLimit(ip, options);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': options.maxRequests?.toString() || '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil(
              (result.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const response = await handler(request);

    // Add rate limit headers to successful responses
    response.headers.set(
      'X-RateLimit-Limit',
      options.maxRequests?.toString() || '10'
    );
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toString());

    return response;
  };
}
