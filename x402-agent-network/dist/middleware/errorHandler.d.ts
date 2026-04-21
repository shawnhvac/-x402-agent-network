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
export declare function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void;
/**
 * Handle unhandled promise rejections
 */
export declare function handleUnhandledRejection(reason: any, promise: Promise<any>): void;
/**
 * Handle uncaught exceptions
 */
export declare function handleUncaughtException(error: Error): void;
/**
 * Async error wrapper (use in route handlers)
 */
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Timeout middleware
 */
export declare function timeoutMiddleware(timeoutMs?: number): (req: Request, res: Response, next: NextFunction) => void;
