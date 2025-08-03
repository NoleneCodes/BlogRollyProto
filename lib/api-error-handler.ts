
import { NextApiRequest, NextApiResponse } from 'next';
import { errorTracker } from './error-tracking';
import { logSecurityEvent } from './security-logger';

export interface APIError extends Error {
  statusCode?: number;
  code?: string;
  expose?: boolean;
}

export class APIErrorHandler {
  static createError(message: string, statusCode: number = 500, code?: string): APIError {
    const error = new Error(message) as APIError;
    error.statusCode = statusCode;
    error.code = code;
    error.expose = statusCode < 500; // Expose client errors, hide server errors
    return error;
  }

  static handle(error: Error | APIError, req: NextApiRequest, res: NextApiResponse, context?: any) {
    const apiError = error as APIError;
    const statusCode = apiError.statusCode || 500;
    const expose = apiError.expose !== false && statusCode < 500;

    // Log to security logger for suspicious activity
    if (statusCode === 401 || statusCode === 403) {
      logSecurityEvent('auth_attempt', req, {
        endpoint: req.url,
        method: req.method,
        error: error.message,
        statusCode,
      });
    }

    // Track error with Sentry
    errorTracker.captureAPIError(
      error,
      req.url || 'unknown',
      req.method || 'unknown',
      statusCode,
      context?.userId
    );

    // Determine response message
    let message = 'Internal Server Error';
    if (expose) {
      message = error.message;
    } else if (statusCode === 401) {
      message = 'Unauthorized';
    } else if (statusCode === 403) {
      message = 'Forbidden';
    } else if (statusCode === 404) {
      message = 'Not Found';
    } else if (statusCode === 429) {
      message = 'Too Many Requests';
    }

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error [${statusCode}] ${req.method} ${req.url}:`, error);
    }

    // Send response
    res.status(statusCode).json({
      error: {
        message,
        code: apiError.code,
        statusCode,
      },
    });
  }

  static async withErrorHandling<T>(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T>,
    req: NextApiRequest,
    res: NextApiResponse,
    context?: any
  ): Promise<T | void> {
    try {
      return await handler(req, res);
    } catch (error) {
      this.handle(error as Error, req, res, context);
    }
  }
}

// Utility functions for common HTTP errors
export const BadRequestError = (message = 'Bad Request') => 
  APIErrorHandler.createError(message, 400, 'BAD_REQUEST');

export const UnauthorizedError = (message = 'Unauthorized') => 
  APIErrorHandler.createError(message, 401, 'UNAUTHORIZED');

export const ForbiddenError = (message = 'Forbidden') => 
  APIErrorHandler.createError(message, 403, 'FORBIDDEN');

export const NotFoundError = (message = 'Not Found') => 
  APIErrorHandler.createError(message, 404, 'NOT_FOUND');

export const ConflictError = (message = 'Conflict') => 
  APIErrorHandler.createError(message, 409, 'CONFLICT');

export const TooManyRequestsError = (message = 'Too Many Requests') => 
  APIErrorHandler.createError(message, 429, 'TOO_MANY_REQUESTS');

export const InternalServerError = (message = 'Internal Server Error') => 
  APIErrorHandler.createError(message, 500, 'INTERNAL_SERVER_ERROR');
