/**
 * API Response Utilities
 * Standardized API response helpers
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...(message && { message }),
    } as ApiResponse<T>),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Error response
 */
export function errorResponse(
  error: string,
  status: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error,
    } as ApiResponse),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Paginated response
 */
export function paginatedResponse<T>(
  data: T,
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  status: number = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    } as PaginatedResponse<T>),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Not found response
 */
export function notFoundResponse(message: string = 'Resource not found'): Response {
  return errorResponse(message, 404);
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): Response {
  return errorResponse(message, 401);
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden'): Response {
  return errorResponse(message, 403);
}

/**
 * Validation error response
 */
export function validationErrorResponse(errors: Record<string, string>): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Validation failed',
      errors,
    }),
    {
      status: 422,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
