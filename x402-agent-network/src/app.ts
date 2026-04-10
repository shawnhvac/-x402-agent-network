/**
 * app.ts - Main Express application
 * WEEK 1: Basic x402 flow + agent registry
 */

import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import { x402Middleware, paymentRequired, type PaymentRequiredOptions } from "./middleware/x402.js";
import { initializeDatabase, getQuota, decrementQuota, recordPayment } from "./db-sqlite.js";
import { loggingMiddleware, getRequestLogs, getMetrics } from "./middleware/logging.js";
import { errorHandler, handleUnhandledRejection, handleUncaughtException, timeoutMiddleware } from "./middleware/errorHandler.js";
import agentRoutes from "./routes/agents.js";
import demoAgentRoutes from "./routes/demo-agents.js";

// Extend Express Response type
declare global {
  namespace Express {
    interface Response {
      paymentRequired: (options: PaymentRequiredOptions) => Response;
    }
  }
}

dotenv.config();

const app = express();
app.use(express.json());
app.use(timeoutMiddleware(30000)); // 30 second timeout
app.use(loggingMiddleware); // Log all requests
app.use(x402Middleware);

// Serve static files (landing page)
app.use(express.static("public"));

// Marketplace and Dashboard routes
app.get("/marketplace", (req: Request, res: Response) => {
  res.sendFile("public/marketplace.html", { root: process.cwd() }, (err) => {
    if (err) {
      res.status(404).send("Marketplace page not found. Please check back soon.");
    }
  });
});

app.get("/agent-dashboard", (req: Request, res: Response) => {
  res.sendFile("public/agent-dashboard.html", { root: process.cwd() }, (err) => {
    if (err) {
      res.status(404).send("Dashboard page not found. Please check back soon.");
    }
  });
});

app.get("/docs", (req: Request, res: Response) => {
  res.sendFile("public/docs.html", { root: process.cwd() }, (err) => {
    if (err) {
      res.status(404).send("Documentation page not found. Please check back soon.");
    }
  });
});

// Initialize database on startup
let dbReady = false;
try {
  initializeDatabase();
  dbReady = true;
  console.log("✅ Database ready");
} catch (err) {
  console.error("❌ Failed to initialize database:", err);
  process.exit(1);
}

/**
 * DAYS 1-2: Basic x402 flow
 * DAYS 3-4: Using PostgreSQL quotas
 */
app.post("/api/agent/execute", async (req: Request, res: Response) => {
  const requester = req.headers["x-requester-wallet"] as string;
  const txHash = req.headers["x-payment-txhash"] as string | undefined;
  const agentId = req.body.agentId as string;

  if (!requester) {
    return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
  }

  if (!dbReady) {
    return res.status(503).json({ error: "Database not ready. Try again in a moment." });
  }

  // Get current quota from database
  const remaining = await getQuota(requester);

  if (remaining <= 0 && !txHash) {
    // Return HTTP 402 Payment Required
    return res.paymentRequired({
      price: "0.10",
      paymentAddress: process.env.TREASURY_WALLET!,
      merchantName: "MUSKOX Agent Network",
      reason: "quota_exceeded"
    });
  }

  // If payment provided, record it and execute
  if (txHash) {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await recordPayment({
      requestId,
      agentId,
      payer: requester,
      amount: "0.10",
      chainId: 1,
      txHash
    });
  }

  // Decrement quota and execute
  const newRemaining = await decrementQuota(requester);

  res.json({
    success: true,
    executionId: `exec-${Date.now()}`,
    outcome: "executed",
    remaining: newRemaining,
    timestamp: new Date().toISOString()
  });
});

/**
 * DAYS 3-4: Agent Registry Routes
 */
app.use("/agents", agentRoutes);

/**
 * DAYS 5-7: Demo Agent Endpoints (Grid Trader + Sniper Bot)
 */
app.use("/", demoAgentRoutes);

/**
 * Health check endpoint
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: dbReady ? "healthy" : "initializing",
    database: dbReady ? "ready" : "connecting",
    timestamp: new Date().toISOString()
  });
});

/**
 * Metrics endpoint - Performance monitoring
 */
app.get("/metrics", (req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    performance: getMetrics(),
    recentRequests: getRequestLogs(10),
  });
});

/**
 * Status endpoint - Full system status
 */
app.get("/status", (req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    system: {
      database: dbReady ? "ready" : "initializing",
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
    performance: getMetrics(),
  });
});

// Global error handler (MUST be last)
app.use(errorHandler);

// Unhandled rejection handler
process.on("unhandledRejection", handleUnhandledRejection);

// Uncaught exception handler
process.on("uncaughtException", handleUncaughtException);

/**
 * Start server
 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ MUSKOX x402 Agent Network running on port ${PORT}`);
  console.log(`📝 API: http://localhost:${PORT}/api/agent/execute`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`⚙️ Status: http://localhost:${PORT}/status`);
});

export default app;
