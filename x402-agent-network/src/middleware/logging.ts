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

// In-memory request logs (in production, use external logging service)
const requestLogs: RequestLog[] = [];

/**
 * Logging middleware - track all requests
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const wallet = (req.headers["x-requester-wallet"] as string) || "unknown";

  // Attach to request for later use
  (req as any).requestId = requestId;
  (req as any).startTime = startTime;
  (req as any).wallet = wallet;

  // Log request
  const reqLog: RequestLog = {
    timestamp: new Date().toISOString(),
    requestId,
    method: req.method,
    path: req.path,
    wallet,
    ipAddress: req.ip || "unknown",
    userAgent: req.get("user-agent") || "unknown",
  };

  // Override response.json to capture response
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    const duration = Date.now() - startTime;
    
    // Update log with response info
    reqLog.duration = duration;
    reqLog.statusCode = res.statusCode;
    reqLog.success = res.statusCode < 400;
    reqLog.error = data.error || null;
    reqLog.agentId = data.agentId || null;
    reqLog.cost = data.cost || null;

    // Store log
    requestLogs.push(reqLog);

    // Keep only last 10,000 logs in memory
    if (requestLogs.length > 10000) {
      requestLogs.splice(0, requestLogs.length - 10000);
    }

    // Log to console (production: send to external service)
    console.log(
      `[${reqLog.timestamp}] ${reqLog.method} ${reqLog.path} | ${reqLog.statusCode} | ${duration}ms | ${wallet}`
    );

    return originalJson(data);
  };

  next();
}

/**
 * Get request logs
 */
export function getRequestLogs(limit: number = 100): RequestLog[] {
  return requestLogs.slice(-limit).reverse();
}

/**
 * Get performance metrics
 */
export function getMetrics() {
  if (requestLogs.length === 0) {
    return {
      totalRequests: 0,
      successRate: 0,
      avgResponseTime: 0,
      errorCount: 0,
      uptime: "calculating",
    };
  }

  const successCount = requestLogs.filter((log) => log.success).length;
  const errorCount = requestLogs.filter((log) => !log.success).length;
  const avgDuration =
    requestLogs.reduce((sum, log) => sum + (log.duration || 0), 0) /
    requestLogs.length;

  return {
    totalRequests: requestLogs.length,
    successRate: ((successCount / requestLogs.length) * 100).toFixed(2) + "%",
    avgResponseTime: avgDuration.toFixed(2) + "ms",
    errorCount,
    successCount,
    p95ResponseTime: calculatePercentile(
      requestLogs.map((log) => log.duration || 0),
      0.95
    ),
    p99ResponseTime: calculatePercentile(
      requestLogs.map((log) => log.duration || 0),
      0.99
    ),
  };
}

/**
 * Calculate percentile
 */
function calculatePercentile(values: number[], percentile: number): string {
  const sorted = values.sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * percentile) - 1;
  return sorted[index].toFixed(2) + "ms";
}

/**
 * Payment logging
 */
export function logPayment(paymentData: {
  requestId: string;
  agentId: string;
  payer: string;
  amount: string;
  chainId: number;
  txHash: string;
  timestamp: string;
}) {
  console.log(
    `[PAYMENT] ${paymentData.timestamp} | ${paymentData.agentId} | ${paymentData.payer} | ${paymentData.amount} USDC | TX: ${paymentData.txHash.substring(0, 10)}...`
  );
}

/**
 * Agent execution logging
 */
export function logAgentExecution(executionData: {
  executionId: string;
  agentId: string;
  wallet: string;
  cost: number;
  duration: number;
  success: boolean;
  error?: string;
}) {
  console.log(
    `[AGENT] ${executionData.agentId} | Exec: ${executionData.executionId} | Cost: ${executionData.cost} USDC | Duration: ${executionData.duration}ms | Success: ${executionData.success}`
  );
}
