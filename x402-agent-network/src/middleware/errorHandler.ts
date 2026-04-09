/**
 * middleware/errorHandler.ts - Global Error Handling
 * Graceful error handling with detailed logging
 */

import { Request, Response, NextFunction } from "express";

export interface ErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
  requestId?: string;
  timestamp: string;
}

/**
 * Global error handler middleware
 * Must be registered LAST in middleware chain
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = (req as any).requestId || "unknown";
  const wallet = (req as any).wallet || "unknown";
  const timestamp = new Date().toISOString();

  // Log full error server-side
  console.error(`[ERROR] ${timestamp} | Request: ${requestId} | Wallet: ${wallet}`);
  console.error(`[ERROR] ${err.message}`);
  console.error(`[ERROR] Stack:`, err.stack);

  // Determine response status code
  let statusCode = 500;
  let errorMessage = "Internal server error";
  let errorCode = "INTERNAL_ERROR";

  // Specific error handling
  if (err.message.includes("Invalid")) {
    statusCode = 400;
    errorMessage = "Invalid request parameters";
    errorCode = "INVALID_INPUT";
  } else if (err.message.includes("Not found")) {
    statusCode = 404;
    errorMessage = "Resource not found";
    errorCode = "NOT_FOUND";
  } else if (err.message.includes("Unauthorized")) {
    statusCode = 401;
    errorMessage = "Unauthorized";
    errorCode = "UNAUTHORIZED";
  } else if (err.message.includes("Timeout")) {
    statusCode = 408;
    errorMessage = "Request timeout";
    errorCode = "TIMEOUT";
  } else if (err.message.includes("Database")) {
    statusCode = 503;
    errorMessage = "Database unavailable";
    errorCode = "DATABASE_ERROR";
  }

  // Return generic error to user, detailed error in logs
  const errorResponse: ErrorResponse = {
    success: false,
    error: errorMessage,
    errorCode,
    requestId,
    timestamp,
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Handle unhandled promise rejections
 */
export function handleUnhandledRejection(reason: any, promise: Promise<any>) {
  console.error("[UNHANDLED REJECTION]", reason);
}

/**
 * Handle uncaught exceptions
 */
export function handleUncaughtException(error: Error) {
  console.error("[UNCAUGHT EXCEPTION]", error);
  // In production, restart the process or alert
}

/**
 * Async error wrapper (use in route handlers)
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Timeout middleware
 */
export function timeoutMiddleware(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeoutId = setTimeout(() => {
      const err = new Error("Request timeout");
      next(err);
    }, timeoutMs);

    res.on("finish", () => clearTimeout(timeoutId));
    next();
  };
}
