/**
 * Error handling utilities
 *
 * Centralized error parsing and formatting for consistent error handling.
 */

export interface ApiError {
  status?: number;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Parses an error from various sources (axios, fetch, Error objects, etc.)
 * Returns a consistent ApiError interface.
 */
export function parseError(error: unknown): ApiError {
  // Axios error
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    return {
      status: axiosError.response?.status,
      message: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
      details: axiosError.response?.data,
    };
  }

  // Fetch error or generic Error
  if (error instanceof Error) {
    return {
      message: error.message || 'An error occurred',
    };
  }

  // String error
  if (typeof error === 'string') {
    return {
      message: error,
    };
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred',
  };
}

/**
 * User-friendly error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Maps HTTP status codes to user-friendly messages
 */
export function getErrorMessage(status?: number): string {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.VALIDATION;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 408:
      return ERROR_MESSAGES.TIMEOUT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.SERVER;
    default:
      return ERROR_MESSAGES.UNKNOWN;
  }
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    return (
      err.code === 'ECONNABORTED' ||
      err.code === 'ENOTFOUND' ||
      err.message?.includes('Network') ||
      err.message?.includes('network')
    );
  }
  return false;
}

/**
 * Checks if an error is a timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    return (
      err.code === 'ECONNABORTED' ||
      err.message?.includes('timeout') ||
      err.message?.includes('Timeout')
    );
  }
  return false;
}
