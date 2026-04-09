/**
 * middleware/logging.ts - Comprehensive Request/Response Logging
 * Logs all requests, responses, performance metrics, and transactions
 */
import { Request, Response, NextFunction } from "express";
interface RequestLog {
    timestamp: string;
    requestId: string;
    method: string;
    path: string;
    wallet: string | null;
    ipAddress: string;
    userAgent: string;
    duration?: number;
    statusCode?: number;
    success?: boolean;
    error?: string;
    agentId?: string;
    cost?: number;
}
/**
 * Logging middleware - track all requests
 */
export declare function loggingMiddleware(req: Request, res: Response, next: NextFunction): void;
/**
 * Get request logs
 */
export declare function getRequestLogs(limit?: number): RequestLog[];
/**
 * Get performance metrics
 */
export declare function getMetrics(): {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    errorCount: number;
    uptime: string;
    successCount?: undefined;
    p95ResponseTime?: undefined;
    p99ResponseTime?: undefined;
} | {
    totalRequests: number;
    successRate: string;
    avgResponseTime: string;
    errorCount: number;
    successCount: number;
    p95ResponseTime: string;
    p99ResponseTime: string;
    uptime?: undefined;
};
/**
 * Payment logging
 */
export declare function logPayment(paymentData: {
    requestId: string;
    agentId: string;
    payer: string;
    amount: string;
    chainId: number;
    txHash: string;
    timestamp: string;
}): void;
/**
 * Agent execution logging
 */
export declare function logAgentExecution(executionData: {
    executionId: string;
    agentId: string;
    wallet: string;
    cost: number;
    duration: number;
    success: boolean;
    error?: string;
}): void;
export {};
