// src/lib/api-errors.ts

/**
 * Standardized error response format for all API routes
 */
export interface ApiError {
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
}

export class ApiErrorResponse extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiErrorResponse';
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SNIPE_IT_ERROR: 'SNIPE_IT_ERROR',
  BLOCK_LIMIT_EXCEEDED: 'BLOCK_LIMIT_EXCEEDED',
  ASSET_UNAVAILABLE: 'ASSET_UNAVAILABLE',
  RESERVATION_EXPIRED: 'RESERVATION_EXPIRED',
} as const;

export function createErrorResponse(error: ApiErrorResponse | Error | unknown): ApiError {
  if (error instanceof ApiErrorResponse) {
    return {
      error: error.errorCode,
      message: error.message,
      code: error.errorCode,
      details: error.details,
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    return {
      error: 'INTERNAL_ERROR',
      message: error.message,
      code: ErrorCodes.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    error: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    code: ErrorCodes.INTERNAL_ERROR,
    timestamp: new Date().toISOString(),
  };
}

export function createSuccessResponse<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}
