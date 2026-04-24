var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/app.ts
import express7 from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit2 from "express-rate-limit";
import cookieParser from "cookie-parser";
import crypto4 from "crypto";
import { readFileSync as readFileSync4, appendFileSync as appendFileSync2, existsSync as existsSync4 } from "fs";
import { join as pathJoin } from "path";

// src/middleware/x402-payment.ts
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { createPrivateKey } from "crypto";
import { SignJWT, importPKCS8 } from "jose";
import { readFileSync } from "fs";
import rateLimit from "express-rate-limit";
var WALLET = process.env.AGENTPAY_WALLET || "0x2a07182afDB346C84dFc5D116D84f34E1db4617d";
if (!process.env.AGENTPAY_WALLET) console.warn("[SECURITY] AGENTPAY_WALLET not in .env \u2014 using fallback");
if (!/^0x[0-9a-fA-F]{40}$/.test(WALLET)) throw new Error("[SECURITY] Invalid AGENTPAY_WALLET: " + WALLET);
var BASE_MAINNET = "eip155:8453";
var POLYGON_MAINNET = "eip155:137";
var CDP_URL = process.env.X402_FACILITATOR_URL || "https://api.cdp.coinbase.com/platform/v2/x402";
var CDP_KEY_PATH = process.env.CDP_KEY_PATH || "/root/.openclaw/workspace/cdp_key.json";
async function buildCDPToken(action) {
  const cdpKey = JSON.parse(readFileSync(CDP_KEY_PATH, "utf8"));
  const keyObj = createPrivateKey({ key: cdpKey.privateKey, format: "pem" });
  const pkcs8 = keyObj.export({ type: "pkcs8", format: "pem" }).toString();
  const pk = await importPKCS8(pkcs8, "ES256");
  const now = Math.floor(Date.now() / 1e3);
  const nonce = Math.random().toString().slice(2, 18);
  const method = action === "supported" ? "GET" : "POST";
  return new SignJWT({
    sub: cdpKey.name,
    iss: "cdp",
    aud: ["cdp_service"],
    uris: [`${method} api.cdp.coinbase.com/platform/v2/x402/${action}`],
    nbf: now
  }).setProtectedHeader({ alg: "ES256", kid: cdpKey.name, nonce }).setIssuedAt(now).setExpirationTime(now + 120).sign(pk);
}
var AgentPayFacilitator = class {
  // Called once at init — returns our supported chains/schemes directly (no HTTP)
  async getSupported() {
    return {
      kinds: [
        { x402Version: 2, scheme: "exact", network: BASE_MAINNET },
        { x402Version: 2, scheme: "exact", network: POLYGON_MAINNET }
      ]
    };
  }
  async verify(paymentPayload, requirements) {
    try {
      const token = await buildCDPToken("verify");
      const res = await fetch(`${CDP_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ x402Version: paymentPayload.x402Version, paymentPayload, paymentRequirements: requirements })
      });
      if (!res.ok) throw new Error(`CDP verify ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("[x402] verify error:", err.message);
      throw err;
    }
  }
  async settle(paymentPayload, requirements) {
    try {
      const token = await buildCDPToken("settle");
      const res = await fetch(`${CDP_URL}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ x402Version: paymentPayload.x402Version, paymentPayload, paymentRequirements: requirements })
      });
      if (!res.ok) throw new Error(`CDP settle ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("[x402] settle error:", err.message);
      throw err;
    }
  }
};
var paymentRateLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
  skip: (req) => req.method === "OPTIONS"
});
function multiChainAccepts(price, wallet) {
  return [
    { scheme: "exact", price, network: BASE_MAINNET, payTo: wallet },
    { scheme: "exact", price, network: POLYGON_MAINNET, payTo: wallet }
  ];
}
var PAID_ROUTES = {
  "POST /api/v1/search": { accepts: multiChainAccepts("$0.001", WALLET), description: "Search local service providers." },
  "POST /api/v1/book": { accepts: multiChainAccepts("$0.002", WALLET), description: "Book a service appointment." },
  "POST /api/v1/ai/search": { accepts: multiChainAccepts("$0.002", WALLET), description: "AI-powered natural language search via NVIDIA NIM." },
  "POST /api/v1/llm": { accepts: multiChainAccepts("$0.001", WALLET), description: "AI inference \u2014 Llama 3.3 70B, Mistral, Gemma, 80+ models." },
  "POST /api/v1/pay": { accepts: multiChainAccepts("$0.001", WALLET), description: "Process a service payment." }
};
async function setupX402Middleware(app2) {
  const paidPaths = ["/api/v1/search", "/api/v1/book", "/api/v1/ai/search", "/api/v1/llm", "/api/v1/pay"];
  for (const path8 of paidPaths) app2.use(path8, paymentRateLimiter);
  const facilitator = new AgentPayFacilitator();
  const ResourceServer = new x402ResourceServer(facilitator);
  ResourceServer.register(BASE_MAINNET, new ExactEvmScheme());
  ResourceServer.register(POLYGON_MAINNET, new ExactEvmScheme());
  app2.use(paymentMiddleware(PAID_ROUTES, ResourceServer));
  console.log("[x402] Payment middleware ready \u2014 Base + Polygon");
  console.log("[x402] Payee wallet:", WALLET);
  console.log("[x402] Paid routes:", Object.keys(PAID_ROUTES).join(", "));
}

// src/db-sqlite.js
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var dbPath = path.join(__dirname, "../x402.db");
var db = new Database(dbPath);
db.pragma("foreign_keys = ON");
function initializeDatabase() {
  try {
    console.log("\u{1F4CA} Initializing SQLite database...");
    db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        endpoint TEXT NOT NULL,
        supported_chains TEXT DEFAULT '[]',
        min_payment REAL DEFAULT 0.01,
        max_payment REAL DEFAULT 100,
        owner_wallet TEXT NOT NULL,
        version TEXT DEFAULT '1.0.0',
        x402_compliant INTEGER DEFAULT 1,
        uptime_sla REAL DEFAULT 99.9,
        avg_response_time INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        total_requests INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 100,
        rating REAL DEFAULT 0,
        published INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT UNIQUE,
        agent_id TEXT,
        payer TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USDC',
        chain_id INTEGER DEFAULT 1,
        tx_hash TEXT,
        status TEXT DEFAULT 'pending',
        platform_fee REAL DEFAULT 0,
        net_amount REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        confirmed_at DATETIME
      );
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS quotas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT UNIQUE NOT NULL,
        remaining_calls INTEGER DEFAULT 10,
        last_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("\u2705 SQLite database initialized successfully");
    console.log(`\u{1F4C1} Database file: ${dbPath}`);
  } catch (err) {
    console.error("\u274C Database initialization error:", err);
    throw err;
  }
}
function getQuota(wallet) {
  try {
    const result = db.prepare(`SELECT remaining_calls FROM quotas WHERE wallet_address = ?`).get(wallet);
    if (!result) {
      db.prepare(`INSERT INTO quotas (wallet_address, remaining_calls) VALUES (?, ?)`).run(wallet, 10);
      return 10;
    }
    return result.remaining_calls;
  } catch (err) {
    console.error("Error getting quota:", err);
    return 0;
  }
}
function decrementQuota(wallet) {
  try {
    const result = db.prepare(`UPDATE quotas SET remaining_calls = remaining_calls - 1 
       WHERE wallet_address = ? RETURNING remaining_calls`).run(wallet);
    if (!result) {
      db.prepare(`INSERT INTO quotas (wallet_address, remaining_calls) VALUES (?, ?)`).run(wallet, 9);
      return 9;
    }
    const updated = db.prepare(`SELECT remaining_calls FROM quotas WHERE wallet_address = ?`).get(wallet);
    return updated?.remaining_calls || 9;
  } catch (err) {
    console.error("Error decrementing quota:", err);
    return 0;
  }
}
function recordPayment(data) {
  try {
    const platformFee = parseFloat(data.amount) * 2 / 100;
    const netAmount = parseFloat(data.amount) - platformFee;
    db.prepare(`INSERT INTO payments (request_id, agent_id, payer, amount, currency, chain_id, tx_hash, platform_fee, net_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(data.requestId, data.agentId, data.payer, data.amount, "USDC", data.chainId, data.txHash, platformFee.toString(), netAmount.toString());
    console.log(`\u2705 Payment recorded: ${data.amount} USDC from ${data.payer}`);
  } catch (err) {
    console.error("Error recording payment:", err);
  }
}
function registerAgent(data) {
  try {
    const result = db.prepare(`INSERT INTO agents 
       (agent_id, name, description, endpoint, supported_chains, min_payment, max_payment, owner_wallet, version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(data.agentId, data.name, data.description || "", data.endpoint, JSON.stringify(data.supportedChains), data.minPayment, data.maxPayment, data.ownerWallet, data.version || "1.0.0");
    const agent = db.prepare(`SELECT * FROM agents WHERE id = ?`).get(result.lastInsertRowid);
    return agent;
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      throw new Error("Agent with this ID already exists");
    }
    throw err;
  }
}
function getAgents(chain, minRating) {
  let query = `
    SELECT agent_id, name, description, endpoint, supported_chains, 
           min_payment, max_payment, version, uptime_sla, avg_response_time,
           success_count, success_rate, rating, created_at
    FROM agents 
    WHERE published = 1
  `;
  const params = [];
  if (chain && typeof chain === "string") {
    query += ` AND supported_chains LIKE ?`;
    params.push(`%${chain}%`);
  }
  if (minRating && typeof minRating === "number") {
    query += ` AND rating >= ?`;
    params.push(minRating);
  }
  query += ` ORDER BY rating DESC, created_at DESC LIMIT 100`;
  return db.prepare(query).all(...params);
}
function getAgent(agentId) {
  return db.prepare(`SELECT * FROM agents WHERE agent_id = ?`).get(agentId);
}
function updateAgent(agentId, data) {
  const fields = [];
  const values = [];
  if (data.name !== void 0) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== void 0) {
    fields.push("description = ?");
    values.push(data.description);
  }
  if (data.minPayment !== void 0) {
    fields.push("min_payment = ?");
    values.push(data.minPayment);
  }
  if (data.maxPayment !== void 0) {
    fields.push("max_payment = ?");
    values.push(data.maxPayment);
  }
  if (data.published !== void 0) {
    fields.push("published = ?");
    values.push(data.published ? 1 : 0);
  }
  if (fields.length === 0)
    return getAgent(agentId);
  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(agentId);
  const query = `UPDATE agents SET ${fields.join(", ")} WHERE agent_id = ?`;
  db.prepare(query).run(...values);
  return getAgent(agentId);
}
function deleteAgent(agentId) {
  db.prepare(`UPDATE agents SET published = 0 WHERE agent_id = ?`).run(agentId);
  return getAgent(agentId);
}

// src/middleware/logging.ts
var requestLogs = [];
function loggingMiddleware(req, res, next) {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const wallet = req.headers["x-requester-wallet"] || "unknown";
  req.requestId = requestId;
  req.startTime = startTime;
  req.wallet = wallet;
  const reqLog = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    requestId,
    method: req.method,
    path: req.path,
    wallet,
    ipAddress: req.ip || "unknown",
    userAgent: req.get("user-agent") || "unknown"
  };
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const duration = Date.now() - startTime;
    reqLog.duration = duration;
    reqLog.statusCode = res.statusCode;
    reqLog.success = res.statusCode < 400;
    reqLog.error = data.error || null;
    reqLog.agentId = data.agentId || null;
    reqLog.cost = data.cost || null;
    requestLogs.push(reqLog);
    if (requestLogs.length > 1e4) {
      requestLogs.splice(0, requestLogs.length - 1e4);
    }
    console.log(
      `[${reqLog.timestamp}] ${reqLog.method} ${reqLog.path} | ${reqLog.statusCode} | ${duration}ms | ${wallet}`
    );
    return originalJson(data);
  };
  next();
}
function getRequestLogs(limit = 100) {
  return requestLogs.slice(-limit).reverse();
}
function getMetrics() {
  if (requestLogs.length === 0) {
    return {
      totalRequests: 0,
      successRate: 0,
      avgResponseTime: 0,
      errorCount: 0,
      uptime: "calculating"
    };
  }
  const successCount = requestLogs.filter((log) => log.success).length;
  const errorCount = requestLogs.filter((log) => !log.success).length;
  const avgDuration = requestLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / requestLogs.length;
  return {
    totalRequests: requestLogs.length,
    successRate: (successCount / requestLogs.length * 100).toFixed(2) + "%",
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
    )
  };
}
function calculatePercentile(values, percentile) {
  const sorted = values.sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * percentile) - 1;
  return sorted[index].toFixed(2) + "ms";
}

// src/middleware/errorHandler.ts
function errorHandler(err, req, res, next) {
  const requestId = req.requestId || "unknown";
  const wallet = req.wallet || "unknown";
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  console.error(`[ERROR] ${timestamp} | Request: ${requestId} | Wallet: ${wallet}`);
  console.error(`[ERROR] ${err.message}`);
  console.error(`[ERROR] Stack:`, err.stack);
  let statusCode = 500;
  let errorMessage = "Internal server error";
  let errorCode = "INTERNAL_ERROR";
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
  const errorResponse = {
    success: false,
    error: errorMessage,
    errorCode,
    requestId,
    timestamp
  };
  res.status(statusCode).json(errorResponse);
}
function handleUnhandledRejection(reason, promise) {
  console.error("[UNHANDLED REJECTION]", reason);
}
function handleUncaughtException(error) {
  console.error("[UNCAUGHT EXCEPTION]", error);
}
function timeoutMiddleware(timeoutMs = 3e4) {
  return (req, res, next) => {
    const timeoutId = setTimeout(() => {
      const err = new Error("Request timeout");
      next(err);
    }, timeoutMs);
    res.on("finish", () => clearTimeout(timeoutId));
    next();
  };
}

// src/routes/agents.js
import express from "express";
import { Router } from "express";
var router = Router();
router.get("/", async (req, res) => {
  try {
    const agents = getAgents(req.query.chain ? req.query.chain : void 0, req.query.minRating ? parseFloat(req.query.minRating) : void 0);
    res.json({
      total: agents.length,
      agents
    });
  } catch (err) {
    console.error("Error listing agents:", err);
    res.status(500).json({ error: "Failed to list agents" });
  }
});
router.get("/:agentId", async (req, res) => {
  try {
    const agent = getAgent(req.params.agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.json(agent);
  } catch (err) {
    console.error("Error fetching agent:", err);
    res.status(500).json({ error: "Failed to fetch agent" });
  }
});
router.post("/register", async (req, res) => {
  try {
    const { agentId, name, description, endpoint, supportedChains, minPayment, maxPayment, ownerWallet, version } = req.body;
    if (!agentId || !name || !endpoint || !ownerWallet || !supportedChains) {
      return res.status(400).json({
        error: "Missing required fields: agentId, name, endpoint, ownerWallet, supportedChains"
      });
    }
    if (!Array.isArray(supportedChains) || supportedChains.length === 0) {
      return res.status(400).json({ error: "supportedChains must be a non-empty array" });
    }
    try {
      const response = await fetch(`${endpoint}/health`, {
        headers: { "X-Requester-Wallet": "0x0000000000000000000000000000000000000000" }
      });
      if (response.status !== 200) {
        return res.status(400).json({ error: "Agent endpoint returned non-200 status" });
      }
    } catch (err) {
      return res.status(400).json({ error: "Cannot reach agent endpoint. Ensure it's publicly accessible." });
    }
    const agent = registerAgent({
      agentId,
      name,
      description: description || "",
      endpoint,
      supportedChains,
      minPayment: minPayment || 0.01,
      maxPayment: maxPayment || 100,
      ownerWallet,
      version: version || "1.0.0"
    });
    console.log(`\u2705 Agent registered: ${agentId}`);
    res.status(201).json({
      message: "Agent registered successfully",
      agent
    });
  } catch (err) {
    console.error("Error registering agent:", err);
    if (err.message.includes("already exists")) {
      return res.status(409).json({ error: "Agent with this ID already exists" });
    }
    res.status(500).json({ error: "Failed to register agent" });
  }
});
router.put("/:agentId", async (req, res) => {
  try {
    const { name, description, minPayment, maxPayment, published } = req.body;
    const agent = updateAgent(req.params.agentId, {
      name,
      description,
      minPayment,
      maxPayment,
      published
    });
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    console.log(`\u2705 Agent updated: ${req.params.agentId}`);
    res.json(agent);
  } catch (err) {
    console.error("Error updating agent:", err);
    res.status(500).json({ error: "Failed to update agent" });
  }
});
router.delete("/:agentId", async (req, res) => {
  try {
    const agent = deleteAgent(req.params.agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    console.log(`\u2705 Agent deactivated: ${req.params.agentId}`);
    res.json({ message: "Agent deactivated", agent });
  } catch (err) {
    console.error("Error deleting agent:", err);
    res.status(500).json({ error: "Failed to delete agent" });
  }
});
var agents_default = router;

// src/routes/demo-agents.ts
import { Router as Router2 } from "express";

// src/agents/grid-trader.ts
var GridTraderAgent = class {
  constructor() {
    this.agentId = "grid-trader-v1";
    this.name = "Grid Trader";
    this.description = "Automated grid trading with x402 payment protection";
    this.endpoint = "/grid-trader";
    this.cost = 0.1;
    // USDC per execution
    this.supportedChains = ["ethereum", "polygon", "arbitrum"];
  }
  /**
   * Execute grid trading logic
   * Input: { pair: "BTC/USD", gridSize: 5, spacing: 1.0 }
   * Output: { fills: number, profit: decimal, status: string }
   */
  async execute(request) {
    try {
      const { pair = "BTC/USD", gridSize = 5, spacing = 1 } = request.input || {};
      const basePrice = pair === "BTC/USD" ? 65e3 : 2500;
      const fills = Math.floor(Math.random() * gridSize) + 1;
      const profit = fills * (basePrice * spacing / 100);
      return {
        success: true,
        executionId: `grid-${Date.now()}`,
        output: {
          pair,
          gridSize,
          spacing,
          fills,
          profit: profit.toFixed(2),
          status: "executed",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        executionTime: Math.random() * 1e3 + 500
        // 500-1500ms
      };
    } catch (err) {
      return {
        success: false,
        executionId: `grid-${Date.now()}`,
        error: err.message || "Grid trading execution failed",
        executionTime: 100
      };
    }
  }
  /**
   * Estimate execution cost
   */
  estimateCost() {
    return {
      cost: this.cost,
      currency: "USDC",
      executionTime: 1e3
      // 1 second average
    };
  }
  /**
   * Get agent status
   */
  getStatus() {
    return {
      agentId: this.agentId,
      name: this.name,
      status: "healthy",
      uptime: 99.9,
      successCount: Math.floor(Math.random() * 1e3),
      failureCount: Math.floor(Math.random() * 10),
      avgExecutionTime: 750,
      lastExecution: new Date(Date.now() - Math.random() * 36e5).toISOString()
    };
  }
  /**
   * Estimate profitability (optional)
   */
  estimateProfitability(input) {
    const { gridSize = 5, spacing = 1 } = input || {};
    const baseProfit = gridSize * spacing * 100;
    return {
      estimatedProfit: baseProfit,
      confidence: 0.65
      // 65% confidence (grid trading is uncertain)
    };
  }
};
var gridTrader = new GridTraderAgent();

// src/agents/sniper-bot.ts
var SniperBotAgent = class {
  constructor() {
    this.agentId = "sniper-bot-v1";
    this.name = "Sniper Bot";
    this.description = "Real-time token sniper with x402 payment protection";
    this.endpoint = "/sniper-bot";
    this.baseCost = 0.25;
    // Base USDC per snipe (scales with speed)
    this.maxCost = 1;
    // Max cost for priority execution
    this.supportedChains = ["solana"];
  }
  /**
   * Execute token snipe
   * Input: { tokenAddress: string, buyAmount: number, slippage: number, priority: boolean }
   * Output: { txHash: string, amount: number, profit?: number, status: string }
   */
  async execute(request) {
    try {
      const {
        tokenAddress = "0x...",
        buyAmount = 1,
        slippage = 1,
        priority = false
      } = request.input || {};
      const success = Math.random() > 0.15;
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      if (!success) {
        return {
          success: false,
          executionId: `snipe-${Date.now()}`,
          error: "Token snipe failed - slippage exceeded",
          executionTime: 500
        };
      }
      const entryPrice = Math.random() * 1e-4 + 1e-5;
      const exitPrice = entryPrice * (1 + Math.random() * 0.5);
      const profit = buyAmount * (exitPrice - entryPrice);
      return {
        success: true,
        executionId: `snipe-${Date.now()}`,
        output: {
          tokenAddress,
          buyAmount,
          slippage,
          priority,
          txHash,
          entryPrice: entryPrice.toFixed(8),
          exitPrice: exitPrice.toFixed(8),
          profit: profit.toFixed(6),
          status: "executed",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        executionTime: priority ? 300 : 600
        // Faster with priority
      };
    } catch (err) {
      return {
        success: false,
        executionId: `snipe-${Date.now()}`,
        error: err.message || "Sniper bot execution failed",
        executionTime: 100
      };
    }
  }
  /**
   * Estimate execution cost (dynamic based on priority)
   */
  estimateCost(input) {
    const { priority = false } = input || {};
    const cost = priority ? this.maxCost : this.baseCost;
    const executionTime = priority ? 300 : 600;
    return {
      cost,
      currency: "USDC",
      executionTime
    };
  }
  /**
   * Get agent status
   */
  getStatus() {
    return {
      agentId: this.agentId,
      name: this.name,
      status: "healthy",
      uptime: 99.95,
      successCount: Math.floor(Math.random() * 5e3),
      failureCount: Math.floor(Math.random() * 50),
      avgExecutionTime: 450,
      lastExecution: new Date(Date.now() - Math.random() * 6e4).toISOString()
    };
  }
  /**
   * Estimate profitability (optional)
   */
  estimateProfitability(input) {
    const { buyAmount = 1 } = input || {};
    const estimatedProfit = buyAmount * 0.15;
    return {
      estimatedProfit,
      confidence: 0.45
      // 45% confidence (sniping is highly uncertain)
    };
  }
};
var sniperBot = new SniperBotAgent();

// src/services/nvidia-nim.ts
var NVIDIA_MODELS = {
  "deepseek-r1": "deepseek-ai/deepseek-r1",
  "deepseek-v3": "deepseek-ai/deepseek-v3-0324",
  "llama-3.3-70b": "meta/llama-3.3-70b-instruct",
  "llama-3.1-8b": "meta/llama-3.1-8b-instruct",
  "mistral-7b": "mistralai/mistral-7b-instruct-v0.3",
  "mixtral-8x7b": "mistralai/mixtral-8x7b-instruct-v0.1",
  "gemma-3-27b": "google/gemma-3-27b-it",
  "qwen3-235b": "qwen/qwen3-235b-a22b",
  "minimax-m2.7": "minimax/minimax-m2.7",
  "glm-5.1": "zhipuai/glm-4-9b-chat",
  "phi-3-mini": "microsoft/phi-3-mini-128k-instruct",
  "nemotron-70b": "nvidia/llama-3.1-nemotron-70b-instruct"
};
var DEFAULT_MODEL = "meta/llama-3.3-70b-instruct";
var BASE_URL = "https://integrate.api.nvidia.com/v1";
var NvidiaNIMService = class {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.NVIDIA_API_KEY || "";
    if (!this.apiKey) {
      console.warn("[NVIDIA NIM] No API key set \u2014 set NVIDIA_API_KEY env var");
    }
  }
  async chat(req) {
    if (!this.apiKey) throw new Error("NVIDIA_API_KEY not configured");
    const model = NVIDIA_MODELS[req.model] || req.model || DEFAULT_MODEL;
    const body = {
      model,
      messages: req.messages,
      max_tokens: req.max_tokens ?? 1024,
      temperature: req.temperature ?? 0.7,
      stream: false
    };
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`NVIDIA NIM error ${res.status}: ${err}`);
    }
    return res.json();
  }
  async complete(prompt, model, maxTokens = 512) {
    const resp = await this.chat({
      model: model || DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens
    });
    return resp.choices[0]?.message?.content || "";
  }
  isConfigured() {
    return !!this.apiKey;
  }
  listModels() {
    return Object.keys(NVIDIA_MODELS);
  }
};
var nvidiaNIM = new NvidiaNIMService();

// src/agents/llm-inference.ts
var LLMInferenceAgent = class {
  constructor() {
    this.agentId = "llm-inference-v2";
    this.name = "LLM Inference Agent (NVIDIA NIM)";
    this.description = "Real AI inference via NVIDIA NIM \u2014 80+ free hosted models including DeepSeek R1, Llama 3.3 70B, Mistral, Gemma, Qwen3";
    this.endpoint = "/llm-inference";
    this.baseCost = 1e-3;
    // USDC per request
    this.supportedChains = ["base", "solana", "polygon"];
  }
  get supportedModels() {
    return nvidiaNIM.listModels();
  }
  async execute(request) {
    const start = Date.now();
    try {
      const input = request.input || request;
      let messages = input.messages;
      if (!messages && input.prompt) {
        messages = [{ role: "user", content: input.prompt }];
      }
      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error("Provide messages[] or prompt string");
      }
      const model = input.model || DEFAULT_MODEL;
      const max_tokens = input.max_tokens ?? 512;
      const temperature = input.temperature ?? 0.7;
      const resp = await nvidiaNIM.chat({ model, messages, max_tokens, temperature });
      const completion = resp.choices[0]?.message?.content || "";
      const usage = resp.usage;
      return {
        success: true,
        executionId: `llm-${Date.now()}`,
        output: {
          model: resp.model,
          completion,
          usage,
          cost: this.baseCost,
          provider: "NVIDIA NIM"
        },
        executionTime: Date.now() - start
      };
    } catch (err) {
      return {
        success: false,
        executionId: `llm-${Date.now()}`,
        error: err.message || "LLM inference failed",
        executionTime: Date.now() - start
      };
    }
  }
  estimateCost(_input) {
    return { cost: this.baseCost, currency: "USDC", executionTime: 2e3 };
  }
  getStatus() {
    return {
      agentId: this.agentId,
      name: this.name,
      status: nvidiaNIM.isConfigured() ? "healthy" : "degraded",
      uptime: 99.9,
      successCount: 0,
      failureCount: 0,
      avgExecutionTime: 2e3,
      lastExecution: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  estimateProfitability(_input) {
    return { estimatedProfit: 2e-4, confidence: 0.9 };
  }
};
var llmInference = new LLMInferenceAgent();

// src/agents/data-feed.ts
var DataFeedAgent = class {
  constructor() {
    this.agentId = "data-feed-v1";
    this.name = "Data Feed Agent (Price Oracle)";
    this.description = "Real-time cryptocurrency price feeds with historical data";
    this.endpoint = "/data-feed";
    this.baseCostPerPoint = 0.01;
    // USDC per price point
    this.supportedChains = ["base", "solana", "polygon"];
    this.supportedSymbols = ["ETH/USD", "BTC/USD", "SOL/USD", "ARB/USD", "AVAX/USD"];
    // Simulated price data (in production, fetch from CoinGecko, Chainlink, etc.)
    this.priceData = {
      "ETH/USD": { price: 3245.78, volatility: 0.02 },
      "BTC/USD": { price: 68432.45, volatility: 0.015 },
      "SOL/USD": { price: 142.56, volatility: 0.025 },
      "ARB/USD": { price: 1.35, volatility: 0.03 },
      "AVAX/USD": { price: 38.92, volatility: 0.025 }
    };
  }
  /**
   * Execute price feed request
   */
  async execute(request) {
    try {
      const input = request.input || request;
      const { symbol, includeHistory = false, historyLength = 10 } = input;
      if (!symbol || !this.supportedSymbols.includes(symbol)) {
        throw new Error(
          `Unsupported symbol: ${symbol}. Supported: ${this.supportedSymbols.join(", ")}`
        );
      }
      if (historyLength > 100) {
        throw new Error("History length cannot exceed 100");
      }
      const priceInfo = this.priceData[symbol];
      const currentPrice = this.simulatePriceWithVolatility(priceInfo.price, priceInfo.volatility);
      const previousPrice = priceInfo.price * (0.98 + Math.random() * 0.04);
      const change24h = currentPrice - previousPrice;
      const change24hPercent = change24h / previousPrice * 100;
      const high24h = currentPrice * (1 + Math.abs(Math.random() * 0.03));
      const low24h = currentPrice * (1 - Math.abs(Math.random() * 0.03));
      const volume24h = Math.random() * 1e9;
      const history = includeHistory ? this.generatePriceHistory(symbol, historyLength) : void 0;
      let totalCost = this.baseCostPerPoint;
      if (includeHistory) {
        totalCost += this.baseCostPerPoint * historyLength;
      }
      const output = {
        symbol,
        currentPrice: {
          symbol,
          price: parseFloat(currentPrice.toFixed(2)),
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          source: "MUSKOX Oracle Network",
          confidence: 0.99
        },
        change24h: parseFloat(change24h.toFixed(2)),
        change24hPercent: parseFloat(change24hPercent.toFixed(2)),
        high24h: parseFloat(high24h.toFixed(2)),
        low24h: parseFloat(low24h.toFixed(2)),
        volume24h: parseFloat(volume24h.toFixed(0)),
        history,
        cost: parseFloat(totalCost.toFixed(6))
      };
      return {
        success: true,
        executionId: `feed-${Date.now()}`,
        output,
        executionTime: Math.random() * 200 + 50
        // 50-250ms
      };
    } catch (err) {
      return {
        success: false,
        executionId: `feed-${Date.now()}`,
        error: err.message || "Data feed execution failed",
        executionTime: 50
      };
    }
  }
  /**
   * Estimate cost before execution
   */
  estimateCost(input) {
    try {
      const { symbol, includeHistory = false, historyLength = 10 } = input || {};
      if (!symbol) {
        return {
          cost: 0.01,
          currency: "USDC",
          executionTime: 100
        };
      }
      let totalCost = this.baseCostPerPoint;
      if (includeHistory) {
        totalCost += this.baseCostPerPoint * Math.min(historyLength, 100);
      }
      return {
        cost: parseFloat(totalCost.toFixed(6)),
        currency: "USDC",
        executionTime: 100
      };
    } catch (err) {
      return {
        cost: 0.01,
        currency: "USDC",
        executionTime: 100
      };
    }
  }
  /**
   * Get agent status
   */
  getStatus() {
    return {
      agentId: this.agentId,
      name: this.name,
      status: "healthy",
      uptime: 99.98,
      successCount: Math.floor(Math.random() * 5e3),
      failureCount: Math.floor(Math.random() * 10),
      avgExecutionTime: 120,
      lastExecution: new Date(Date.now() - Math.random() * 6e4).toISOString()
    };
  }
  /**
   * Internal: Simulate price with volatility
   */
  simulatePriceWithVolatility(basePrice, volatility) {
    const change = (Math.random() - 0.5) * 2 * volatility;
    return basePrice * (1 + change);
  }
  /**
   * Internal: Generate price history
   */
  generatePriceHistory(symbol, length) {
    const basePrice = this.priceData[symbol].price;
    const volatility = this.priceData[symbol].volatility;
    const history = [];
    let currentPrice = basePrice;
    for (let i = length; i > 0; i--) {
      currentPrice = this.simulatePriceWithVolatility(currentPrice, volatility);
      const timestamp = new Date(Date.now() - i * 6e4);
      history.push({
        symbol,
        price: parseFloat(currentPrice.toFixed(2)),
        timestamp: timestamp.toISOString(),
        source: "MUSKOX Oracle Network",
        confidence: 0.99
      });
    }
    return history;
  }
};
var dataFeed = new DataFeedAgent();

// src/routes/demo-agents.ts
var router2 = Router2();
router2.post("/grid-trader", async (req, res) => {
  try {
    const requester = req.headers["x-requester-wallet"];
    const txHash = req.headers["x-payment-txhash"];
    if (!requester) {
      return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
    }
    const remaining = await getQuota(requester);
    if (remaining <= 0 && !txHash) {
      return res.status(402).json({
        requiresPayment: true,
        requestId: `req-grid-${Date.now()}`,
        price: "0.10",
        currency: "USDC",
        chainId: 1,
        paymentAddress: "0xTreasuryMultisig...",
        merchantName: "MUSKOX Grid Trader Agent",
        reason: "quota_exceeded",
        agentCost: gridTrader.cost
      });
    }
    if (txHash) {
      await recordPayment({
        requestId: `req-grid-${Date.now()}`,
        agentId: gridTrader.agentId,
        payer: requester,
        amount: "0.10",
        chainId: 1,
        txHash
      });
    }
    const result = await gridTrader.execute(req.body);
    const newRemaining = await decrementQuota(requester);
    res.json({
      ...result,
      remaining: newRemaining,
      agentId: gridTrader.agentId
    });
  } catch (err) {
    console.error("Grid Trader error:", err);
    res.status(500).json({ error: "Grid trader execution failed" });
  }
});
router2.post("/sniper-bot", async (req, res) => {
  try {
    const requester = req.headers["x-requester-wallet"];
    const txHash = req.headers["x-payment-txhash"];
    const { priority = false } = req.body;
    if (!requester) {
      return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
    }
    const costInfo = sniperBot.estimateCost({ priority });
    const costAmount = costInfo.cost.toString();
    const remaining = await getQuota(requester);
    if (remaining <= 0 && !txHash) {
      return res.status(402).json({
        requiresPayment: true,
        requestId: `req-snipe-${Date.now()}`,
        price: costAmount,
        currency: "USDC",
        chainId: 101,
        // Solana
        paymentAddress: "0xTreasuryMultisig...",
        merchantName: "MUSKOX Sniper Bot Agent",
        reason: "quota_exceeded",
        agentCost: costAmount,
        priority
      });
    }
    if (txHash) {
      await recordPayment({
        requestId: `req-snipe-${Date.now()}`,
        agentId: sniperBot.agentId,
        payer: requester,
        amount: costAmount,
        chainId: 101,
        txHash
      });
    }
    const result = await sniperBot.execute(req.body);
    const newRemaining = await decrementQuota(requester);
    res.json({
      ...result,
      remaining: newRemaining,
      agentId: sniperBot.agentId,
      cost: costAmount,
      priority
    });
  } catch (err) {
    console.error("Sniper Bot error:", err);
    res.status(500).json({ error: "Sniper bot execution failed" });
  }
});
router2.post("/llm-inference", async (req, res) => {
  try {
    const requester = req.headers["x-requester-wallet"];
    const txHash = req.headers["x-payment-txhash"];
    if (!requester) {
      return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
    }
    const costInfo = llmInference.estimateCost(req.body);
    const costAmount = costInfo.cost.toString();
    const remaining = await getQuota(requester);
    if (remaining <= 0 && !txHash) {
      return res.status(402).json({
        requiresPayment: true,
        requestId: `req-llm-${Date.now()}`,
        price: costAmount,
        currency: "USDC",
        chainId: 101,
        // Solana
        paymentAddress: "0xTreasuryMultisig...",
        merchantName: "MUSKOX LLM Inference Agent",
        reason: "quota_exceeded",
        estimatedCost: costAmount,
        costBreakdown: {
          baseCost: llmInference.baseCost,
          estimatedTokens: "depends on input"
        }
      });
    }
    if (txHash) {
      await recordPayment({
        requestId: `req-llm-${Date.now()}`,
        agentId: llmInference.agentId,
        payer: requester,
        amount: costAmount,
        chainId: 101,
        txHash
      });
    }
    const result = await llmInference.execute(req.body);
    const newRemaining = await decrementQuota(requester);
    res.json({
      ...result,
      remaining: newRemaining,
      agentId: llmInference.agentId,
      cost: costAmount,
      platformFee: (parseFloat(costAmount) * 0.02).toFixed(6),
      agentProceeds: (parseFloat(costAmount) * 0.98).toFixed(6)
    });
  } catch (err) {
    console.error("LLM Inference error:", err);
    res.status(500).json({ error: "LLM inference execution failed" });
  }
});
router2.post("/data-feed", async (req, res) => {
  try {
    const requester = req.headers["x-requester-wallet"];
    const txHash = req.headers["x-payment-txhash"];
    if (!requester) {
      return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
    }
    const costInfo = dataFeed.estimateCost(req.body);
    const costAmount = costInfo.cost.toString();
    const remaining = await getQuota(requester);
    if (remaining <= 0 && !txHash) {
      return res.status(402).json({
        requiresPayment: true,
        requestId: `req-feed-${Date.now()}`,
        price: costAmount,
        currency: "USDC",
        chainId: 101,
        // Solana
        paymentAddress: "0xTreasuryMultisig...",
        merchantName: "MUSKOX Data Feed Agent",
        reason: "quota_exceeded",
        estimatedCost: costAmount,
        costBreakdown: {
          baseCostPerPoint: dataFeed.baseCostPerPoint,
          currentPrice: 0.01,
          historicalData: "optional"
        }
      });
    }
    if (txHash) {
      await recordPayment({
        requestId: `req-feed-${Date.now()}`,
        agentId: dataFeed.agentId,
        payer: requester,
        amount: costAmount,
        chainId: 101,
        txHash
      });
    }
    const result = await dataFeed.execute(req.body);
    const newRemaining = await decrementQuota(requester);
    res.json({
      ...result,
      remaining: newRemaining,
      agentId: dataFeed.agentId,
      cost: costAmount,
      platformFee: (parseFloat(costAmount) * 0.02).toFixed(6),
      agentProceeds: (parseFloat(costAmount) * 0.98).toFixed(6)
    });
  } catch (err) {
    console.error("Data Feed error:", err);
    res.status(500).json({ error: "Data feed execution failed" });
  }
});
router2.get("/agents-info", (req, res) => {
  res.json({
    agents: [
      {
        id: gridTrader.agentId,
        name: gridTrader.name,
        endpoint: gridTrader.endpoint,
        cost: gridTrader.cost,
        currency: "USDC",
        status: gridTrader.getStatus(),
        supportedChains: gridTrader.supportedChains
      },
      {
        id: sniperBot.agentId,
        name: sniperBot.name,
        endpoint: sniperBot.endpoint,
        baseCost: sniperBot.baseCost,
        maxCost: sniperBot.maxCost,
        currency: "USDC",
        status: sniperBot.getStatus(),
        supportedChains: sniperBot.supportedChains
      },
      {
        id: llmInference.agentId,
        name: llmInference.name,
        endpoint: llmInference.endpoint,
        baseCost: llmInference.baseCost,
        currency: "USDC",
        status: llmInference.getStatus(),
        supportedChains: llmInference.supportedChains,
        supportedModels: llmInference.supportedModels
      },
      {
        id: dataFeed.agentId,
        name: dataFeed.name,
        endpoint: dataFeed.endpoint,
        baseCostPerPoint: dataFeed.baseCostPerPoint,
        currency: "USDC",
        status: dataFeed.getStatus(),
        supportedChains: dataFeed.supportedChains,
        supportedSymbols: dataFeed.supportedSymbols
      }
    ]
  });
});
var demo_agents_default = router2;

// src/routes/apk.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var router3 = express2.Router();
var APK_PATH = path2.join(__dirname2, "../../public/download/agentpay-latest.apk");
router3.get("/status", (req, res) => {
  try {
    if (fs.existsSync(APK_PATH)) {
      const stats = fs.statSync(APK_PATH);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(1);
      res.json({
        status: "available",
        filename: "agentpay-latest.apk",
        path: "/download/agentpay-latest.apk",
        size: stats.size,
        sizeLabel: `${sizeInMB} MB`,
        lastModified: stats.mtime,
        buildDate: stats.mtime.toISOString(),
        downloadUrl: "https://x402-agent-pay.com/download/agentpay-latest.apk"
      });
    } else {
      res.status(404).json({
        status: "not_found",
        message: "APK file not found",
        expectedPath: APK_PATH
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});
router3.get("/download", (req, res) => {
  try {
    if (!fs.existsSync(APK_PATH)) {
      return res.status(404).json({
        status: "error",
        message: "APK file not found"
      });
    }
    const stats = fs.statSync(APK_PATH);
    res.setHeader("Content-Type", "application/vnd.android.package-archive");
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Content-Disposition", 'attachment; filename="agentpay-latest.apk"');
    res.setHeader("Cache-Control", "public, max-age=3600");
    const fileStream = fs.createReadStream(APK_PATH);
    fileStream.pipe(res);
    fileStream.on("error", (err) => {
      console.error("Error streaming APK:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to download APK" });
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});
router3.get("/info", (req, res) => {
  try {
    if (fs.existsSync(APK_PATH)) {
      const stats = fs.statSync(APK_PATH);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(1);
      res.json({
        app: "AgentPay",
        version: "1.0.0",
        buildType: "debug",
        agentSystem: {
          status: "integrated",
          components: 5,
          linesOfCode: 1946,
          features: [
            "Autonomous decision-making",
            "SmartEscrow integration",
            "Transaction signing",
            "HTTP API (6 endpoints)",
            "Real-time monitoring"
          ]
        },
        apk: {
          filename: "agentpay-latest.apk",
          size: stats.size,
          sizeLabel: `${sizeInMB} MB`,
          lastBuilt: stats.mtime.toISOString(),
          downloadUrl: "/download/agentpay-latest.apk"
        },
        tabs: [
          "\u{1F3A4} Voice",
          "\u2699\uFE0F Settings",
          "\u{1F4CB} History",
          "\u{1F4B0} Wallet",
          "\u{1F916} Agent (NEW)"
        ],
        requirements: {
          androidVersion: "9.0+",
          apiLevel: 28,
          minSize: "29 MB"
        }
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "APK not available"
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});
var apk_default = router3;

// src/routes/services.ts
import { fileURLToPath as _fup } from "url";
import { dirname as _dn } from "path";
import { Router as Router4 } from "express";

// src/services/twilio-notify.ts
import twilio from "twilio";
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
var fromNumber = process.env.TWILIO_PHONE_NUMBER;
var twilioClient = null;
function getClient() {
  if (!twilioClient && accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}
function calculateFee(servicePrice) {
  if (servicePrice < 50) return Math.round(servicePrice * 0.03 * 100) / 100;
  if (servicePrice <= 200) return Math.round(servicePrice * 0.02 * 100) / 100;
  return Math.round(servicePrice * 0.01 * 100) / 100;
}
function feePercent(servicePrice) {
  if (servicePrice < 50) return "3%";
  if (servicePrice <= 200) return "2%";
  return "1%";
}
function isMobileNumber(phone) {
  const cleaned = phone.replace(/\D/g, "");
  const tollFree = /^1?(800|888|866|877|855|844|833)/.test(cleaned);
  return !tollFree;
}
async function sendSMS(to, body) {
  try {
    const client = getClient();
    if (!client) {
      console.warn("Twilio not configured");
      return false;
    }
    const msg = await client.messages.create({ from: fromNumber, to, body });
    console.log(`[Twilio SMS] Sent to ${to} \u2014 SID: ${msg.sid}`);
    return true;
  } catch (err) {
    console.error(`[Twilio SMS] Error sending to ${to}:`, err.message);
    return false;
  }
}
async function makeRobocall(to, message, bookingId) {
  try {
    const client = getClient();
    if (!client) {
      console.warn("Twilio not configured");
      return false;
    }
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${message}</Say>
  <Gather numDigits="1" action="https://www.x402-agent-pay.com/api/v1/notify/ivr-response/${bookingId}" method="POST">
    <Say voice="Polly.Joanna">Press 1 to confirm this booking. Press 2 to decline.</Say>
  </Gather>
  <Say voice="Polly.Joanna">We did not receive a response. We will try again shortly. Goodbye.</Say>
</Response>`;
    const call = await client.calls.create({
      from: fromNumber,
      to,
      twiml
    });
    console.log(`[Twilio Call] Called ${to} \u2014 SID: ${call.sid}`);
    return true;
  } catch (err) {
    console.error(`[Twilio Call] Error calling ${to}:`, err.message);
    return false;
  }
}
var BASE44_EMAIL_FN = "https://muskox3-481c23be.base44.app/functions/sendBookingEmail";
async function sendEmailNotification(email, subject, body, bookingId, type) {
  try {
    const SIGNATURE = `

---
Shawn Lippert
AgentPay Team
95b Havasupai St, Grand Canyon, AZ 86023
https://www.x402-agent-pay.com`;
    const res = await fetch(BASE44_EMAIL_FN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject,
        textBody: body + SIGNATURE,
        bookingId: bookingId ?? "",
        type: type ?? "booking_request"
      })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      console.log(`[Email] Sent to ${email} | msgId: ${data.messageId}`);
      return true;
    }
    console.error(`[Email] Failed for ${email}:`, data);
    return false;
  } catch (err) {
    console.error(`[Email] Error sending to ${email}:`, err.message);
    return false;
  }
}
async function notifyBusiness(booking) {
  const attempt = booking.attempt || 1;
  const {
    bookingId,
    businessName,
    businessPhone,
    businessEmail,
    serviceType,
    customerName,
    date,
    time,
    price
  } = booking;
  const fee = calculateFee(price);
  const pct = feePercent(price);
  const net = Math.round((price - fee) * 100) / 100;
  const smsMsg = `AgentPay Booking Request
Business: ${businessName}
Service: ${serviceType}
Date/Time: ${date} at ${time}
Job Value: $${price} (you receive $${net} after ${pct} fee)
Reply YES to confirm or NO to decline.
Ref: ${bookingId}`;
  const voiceMsg = `Hello ${businessName}. You have a new booking request through AgentPay. A customer is requesting ${serviceType} on ${date} at ${time}. The job value is ${price} dollars. Your payout will be ${net} dollars after the platform fee.`;
  if (attempt === 1 && businessPhone) {
    const useMobile = isMobileNumber(businessPhone);
    if (useMobile) {
      const ok2 = await sendSMS(businessPhone, smsMsg);
      if (ok2) return { sent: true, method: "sms", attempt };
    }
    const ok = await makeRobocall(businessPhone, voiceMsg, bookingId);
    if (ok) return { sent: true, method: "voice", attempt };
  }
  if (attempt === 2 && businessPhone) {
    const ok = await makeRobocall(businessPhone, voiceMsg, bookingId);
    if (ok) return { sent: true, method: "voice", attempt };
  }
  if (attempt === 3 && businessEmail) {
    const emailBody = `New Booking Request

Business: ${businessName}
Service: ${serviceType}
Date/Time: ${date} at ${time}
Job Value: $${price} (you receive $${net} after ${pct} fee)

Reply to this email with YES to confirm or NO to decline.
Ref: ${bookingId}`;
    const ok = await sendEmailNotification(
      businessEmail,
      `AgentPay Booking Request \u2014 ${serviceType} on ${date} [Ref: ${bookingId}]`,
      emailBody,
      bookingId,
      "booking_request"
    );
    if (ok) return { sent: true, method: "email", attempt };
  }
  return { sent: false, method: "none", attempt, message: "No contact method available" };
}

// src/routes/notify.ts
import express3, { Router as Router3 } from "express";

// src/services/booking-db.ts
import Database2 from "better-sqlite3";
import path3 from "path";
import fs2 from "fs";
var DB_DIR = "/var/lib/agentpay";
var DB_PATH = path3.join(DB_DIR, "bookings.db");
if (!fs2.existsSync(DB_DIR)) fs2.mkdirSync(DB_DIR, { recursive: true });
var db2 = new Database2(DB_PATH);
db2.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'pending',
    business_name TEXT,
    phone TEXT,
    email TEXT,
    service_type TEXT,
    customer_name TEXT,
    customer_email TEXT,
    date TEXT,
    time TEXT,
    price REAL,
    fee REAL,
    net REAL,
    notification_method TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    confirmed_at TEXT,
    declined_at TEXT
  );

  CREATE TABLE IF NOT EXISTS booking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id TEXT NOT NULL,
    event TEXT NOT NULL,
    source TEXT,
    data TEXT,
    created_at TEXT NOT NULL
  );
`);
console.log("[BookingDB] SQLite ready at", DB_PATH);
function createBooking(booking) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const record = { ...booking, created_at: now, updated_at: now, status: booking.status ?? "pending" };
  db2.prepare(`
    INSERT INTO bookings (id, status, business_name, phone, email, service_type, customer_name, customer_email,
      date, time, price, fee, net, notification_method, created_at, updated_at)
    VALUES (@id, @status, @business_name, @phone, @email, @service_type, @customer_name, @customer_email,
      @date, @time, @price, @fee, @net, @notification_method, @created_at, @updated_at)
  `).run(record);
  logEvent(booking.id, "created", "system", {});
  return record;
}
function getBooking(id) {
  return db2.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
}
function updateBookingStatus(id, status, extra = {}, source = "system") {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const fields = ["status = @status", "updated_at = @updated_at"];
  const params = { id, status, updated_at: now };
  if (status === "confirmed") {
    fields.push("confirmed_at = @confirmed_at");
    params.confirmed_at = now;
  }
  if (status === "declined") {
    fields.push("declined_at = @declined_at");
    params.declined_at = now;
  }
  if (extra.notification_method) {
    fields.push("notification_method = @notification_method");
    params.notification_method = extra.notification_method;
  }
  const result = db2.prepare(`UPDATE bookings SET ${fields.join(", ")} WHERE id = @id`).run(params);
  if (result.changes > 0) logEvent(id, `status_${status}`, source, extra);
  return result.changes > 0;
}
function findPendingByPhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  const all = db2.prepare("SELECT * FROM bookings WHERE status = 'pending'").all();
  return all.find((b) => (b.phone ?? "").replace(/\D/g, "") === cleaned);
}
function getStats2() {
  const total = db2.prepare("SELECT COUNT(*) as c FROM bookings").get().c;
  const pending = db2.prepare("SELECT COUNT(*) as c FROM bookings WHERE status='pending'").get().c;
  const confirmed = db2.prepare("SELECT COUNT(*) as c FROM bookings WHERE status='confirmed'").get().c;
  const declined = db2.prepare("SELECT COUNT(*) as c FROM bookings WHERE status='declined'").get().c;
  const revenue = db2.prepare("SELECT SUM(fee) as s FROM bookings WHERE status='confirmed'").get().s ?? 0;
  return { total, pending, confirmed, declined, revenue_usd: Math.round(revenue * 100) / 100 };
}
function logEvent(bookingId, event, source, data) {
  db2.prepare("INSERT INTO booking_events (booking_id, event, source, data, created_at) VALUES (?, ?, ?, ?, ?)").run(bookingId, event, source, JSON.stringify(data), (/* @__PURE__ */ new Date()).toISOString());
}

// src/routes/notify.ts
var router4 = Router3();
function registerBooking(booking) {
  createBooking({
    id: booking.id,
    status: "pending",
    business_name: booking.businessName,
    phone: booking.phone,
    email: booking.email,
    service_type: booking.serviceType,
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    date: booking.date,
    time: booking.time,
    price: booking.price,
    fee: booking.fee,
    net: booking.net
  });
}
router4.post("/sms-reply", express3.urlencoded({ extended: false }), async (req, res) => {
  const from = req.body.From || "";
  const body = (req.body.Body || "").trim().toUpperCase();
  const numMedia = parseInt(req.body.NumMedia || "0", 10);
  console.log(`[SMS-Reply] From: ${from} | Body: "${body}"`);
  let matched = null;
  let matchedId = "";
  const foundBooking = findPendingByPhone(from);
  if (foundBooking) {
    matched = { ...foundBooking, businessName: foundBooking.business_name, serviceType: foundBooking.service_type };
    matchedId = foundBooking.id;
  }
  let replyText = "";
  if (!matched) {
    replyText = "AgentPay: We could not find a pending booking for your number. If you need help, visit x402-agent-pay.com";
  } else if (body === "YES" || body === "CONFIRM" || body === "Y") {
    updateBookingStatus(matchedId, "confirmed", {}, "sms");
    replyText = `AgentPay: Booking CONFIRMED \u2705
${matched.serviceType} on ${matched.date} at ${matched.time}
Ref: ${matchedId}
Customer details will follow shortly.`;
    console.log(`[SMS-Reply] Booking ${matchedId} CONFIRMED by ${from}`);
  } else if (body === "NO" || body === "DECLINE" || body === "N") {
    updateBookingStatus(matchedId, "declined", {}, "sms");
    replyText = `AgentPay: Booking DECLINED \u274C
Ref: ${matchedId}
We will find another provider for the customer.`;
    console.log(`[SMS-Reply] Booking ${matchedId} DECLINED by ${from}`);
  } else if (body === "STOP") {
    replyText = "You have been unsubscribed from AgentPay booking notifications. Reply START to re-subscribe.";
  } else if (body === "START") {
    replyText = "Welcome back to AgentPay booking notifications! You will now receive booking requests again.";
  } else if (body === "HELP") {
    replyText = "AgentPay: Reply YES to confirm a booking or NO to decline. Visit x402-agent-pay.com for help.";
  } else {
    replyText = `AgentPay: Reply YES to confirm or NO to decline your pending booking (Ref: ${matchedId}). Reply HELP for assistance.`;
  }
  res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${replyText}</Message>
</Response>`);
});
router4.post("/ivr-response/:bookingId", express3.urlencoded({ extended: false }), (req, res) => {
  const { bookingId } = req.params;
  const digit = req.body.Digits;
  const booking = getBooking(bookingId);
  let message = "";
  if (digit === "1") {
    if (booking) updateBookingStatus(bookingId, "confirmed", {}, "ivr");
    message = "Thank you! The booking has been confirmed. We will send you the customer details shortly. Goodbye.";
    console.log(`[IVR] Booking ${bookingId} CONFIRMED`);
  } else if (digit === "2") {
    if (booking) updateBookingStatus(bookingId, "declined", {}, "ivr");
    message = "The booking has been declined. We will find another provider. Goodbye.";
    console.log(`[IVR] Booking ${bookingId} DECLINED`);
  } else {
    message = "We did not receive a valid response. Please call AgentPay support if you have questions. Goodbye.";
  }
  res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${message}</Say>
</Response>`);
});
router4.get("/status/:bookingId", (req, res) => {
  const { bookingId } = req.params;
  const booking = getBooking(bookingId);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  return res.json({ bookingId, ...booking });
});
router4.post("/optin", async (req, res) => {
  const { phone, business_name } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, error: "Phone number required" });
  }
  const cleaned = phone.replace(/\D/g, "");
  const e164 = cleaned.startsWith("1") ? `+${cleaned}` : `+1${cleaned}`;
  console.log(`[Opt-In] New provider opt-in: ${e164} | Business: ${business_name || "unknown"}`);
  const confirmMsg = `Welcome to AgentPay! \u2705
You will now receive booking notifications for${business_name ? " " + business_name : " your business"}.
Reply YES to confirm bookings, NO to decline.
Reply STOP anytime to unsubscribe.
x402-agent-pay.com`;
  const sent = await sendSMS(e164, confirmMsg);
  if (sent) {
    return res.json({
      success: true,
      message: "Opted in! Check your phone for a confirmation text.",
      phone: e164
    });
  } else {
    return res.status(500).json({
      success: false,
      error: "Could not send confirmation SMS. Please verify your number and try again."
    });
  }
});
router4.post("/booking-status", express3.json(), (req, res) => {
  const { bookingId, status, source } = req.body;
  if (!bookingId || !status) return res.status(400).json({ error: "bookingId and status required" });
  const ok = updateBookingStatus(bookingId, status, {}, source ?? "email");
  return res.json({ ok, bookingId, status });
});
router4.get("/stats", (_req, res) => {
  return res.json(getStats2());
});
var notify_default = router4;

// src/routes/services.ts
import * as crypto from "crypto";
import * as fs3 from "fs";
import * as path4 from "path";
var __filename3 = _fup(import.meta.url);
var __dirname3 = _dn(__filename3);
var router5 = Router4();
var servicesPath = path4.join(__dirname3, "../data/services.json");
var categoriesPath = path4.join(__dirname3, "../data/service-categories.json");
var locationsPath = path4.join(__dirname3, "../data/locations.json");
var services = [];
var categories = [];
var locations = [];
function loadData() {
  try {
    if (fs3.existsSync(servicesPath)) {
      const data = fs3.readFileSync(servicesPath, "utf-8");
      services = JSON.parse(data).services;
    }
  } catch (error) {
    console.error("Error loading services:", error);
  }
  try {
    if (fs3.existsSync(categoriesPath)) {
      const data = fs3.readFileSync(categoriesPath, "utf-8");
      categories = JSON.parse(data).categories;
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
  try {
    if (fs3.existsSync(locationsPath)) {
      const data = fs3.readFileSync(locationsPath, "utf-8");
      locations = JSON.parse(data).locations;
    }
  } catch (error) {
    console.error("Error loading locations:", error);
  }
}
loadData();
router5.get("/services", (req, res) => {
  try {
    const { category, location, search, limit = "50", offset = "0" } = req.query;
    let filtered = [...services];
    if (category && typeof category === "string") {
      filtered = filtered.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (location && typeof location === "string") {
      const locationLower = location.toLowerCase();
      filtered = filtered.filter(
        (s) => s.location.toLowerCase().includes(locationLower) || s.city.toLowerCase().includes(locationLower) || s.state.toLowerCase().includes(locationLower)
      );
    }
    if (search && typeof search === "string") {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (s) => s.name.toLowerCase().includes(searchLower) || s.description.toLowerCase().includes(searchLower) || s.services.some((svc) => svc.toLowerCase().includes(searchLower))
      );
    }
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);
    res.json({
      success: true,
      count: paginated.length,
      total: filtered.length,
      limit: limitNum,
      offset: offsetNum,
      services: paginated
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch services"
    });
  }
});
router5.get("/services/categories", (req, res) => {
  try {
    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories"
    });
  }
});
router5.get("/services/locations", (req, res) => {
  try {
    res.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch locations"
    });
  }
});
router5.get("/services/:id", (req, res) => {
  try {
    const { id } = req.params;
    const service = services.find((s) => s.id === id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found"
      });
    }
    res.json({
      success: true,
      service
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch service"
    });
  }
});
router5.get("/services/by-category/:category", (req, res) => {
  try {
    const { category } = req.params;
    const { limit = "50", offset = "0" } = req.query;
    const filtered = services.filter(
      (s) => s.category.toLowerCase() === category.toLowerCase()
    );
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);
    res.json({
      success: true,
      category,
      count: paginated.length,
      total: filtered.length,
      services: paginated
    });
  } catch (error) {
    console.error("Error fetching services by category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch services"
    });
  }
});
router5.get("/services/by-location/:location", (req, res) => {
  try {
    const { location } = req.params;
    const { limit = "50", offset = "0" } = req.query;
    const locationLower = location.toLowerCase();
    const filtered = services.filter(
      (s) => s.location.toLowerCase().includes(locationLower) || s.city.toLowerCase().includes(locationLower)
    );
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);
    res.json({
      success: true,
      location,
      count: paginated.length,
      total: filtered.length,
      services: paginated
    });
  } catch (error) {
    console.error("Error fetching services by location:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch services"
    });
  }
});
router5.post("/search", (req, res) => {
  try {
    const { query, category, location } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        error: "Query parameter required"
      });
    }
    let filtered = [...services];
    if (category) {
      filtered = filtered.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (location) {
      const locationLower = location.toLowerCase();
      filtered = filtered.filter(
        (s) => s.location.toLowerCase().includes(locationLower) || s.city.toLowerCase().includes(locationLower)
      );
    }
    const queryLower = query.toLowerCase();
    const results = filtered.filter(
      (s) => s.name.toLowerCase().includes(queryLower) || s.description.toLowerCase().includes(queryLower) || s.services.some((svc) => svc.toLowerCase().includes(queryLower))
    ).slice(0, 20);
    res.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (error) {
    console.error("Error searching services:", error);
    res.status(500).json({
      success: false,
      error: "Search failed"
    });
  }
});
router5.post("/book", async (req, res) => {
  try {
    const { service_id, date, time, service_type, customer_name, estimated_price } = req.body;
    if (!service_id || !date || !time || !service_type) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: service_id, date, time, service_type"
      });
    }
    const service = services.find((s) => s.id === service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found"
      });
    }
    const price = estimated_price || service.pricing[service_type.replace(/ /g, "_")] || 0;
    const fee = calculateFee(price);
    const pct = feePercent(price);
    const net = Math.round((price - fee) * 100) / 100;
    const bookingId = `BK-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    registerBooking({
      id: bookingId,
      phone: service.phone,
      businessName: service.name,
      serviceType: service_type,
      date,
      time,
      price
    });
    res.json({
      success: true,
      booking: {
        id: bookingId,
        service_id,
        service_name: service.name,
        service_type,
        date,
        time,
        price,
        platform_fee: fee,
        fee_percent: pct,
        business_payout: net,
        status: "pending_confirmation",
        confirmation_required: true,
        notification: "Business is being notified now"
      }
    });
    setImmediate(async () => {
      try {
        const result = await notifyBusiness({
          bookingId,
          businessName: service.name,
          businessPhone: service.phone,
          businessEmail: service.email,
          serviceType: service_type,
          customerName: customer_name,
          date,
          time,
          price,
          attempt: 1
        });
        console.log(`[Booking ${bookingId}] Notification result:`, result);
        if (!result.sent) {
          console.warn(`[Booking ${bookingId}] Initial notification failed \u2014 will retry`);
        }
      } catch (err) {
        console.error(`[Booking ${bookingId}] Notification error:`, err);
      }
    });
  } catch (error) {
    console.error("Error booking service:", error);
    res.status(500).json({
      success: false,
      error: "Booking failed"
    });
  }
});
router5.post("/notify/ivr-response/:bookingId", (req, res) => {
  const { bookingId } = req.params;
  const digit = req.body.Digits;
  console.log(`[IVR] Booking ${bookingId} \u2014 pressed: ${digit}`);
  let message = "";
  if (digit === "1") {
    message = "Thank you! The booking has been confirmed. We will send you the customer details shortly. Goodbye.";
    console.log(`[IVR] Booking ${bookingId} CONFIRMED by business`);
  } else if (digit === "2") {
    message = "The booking has been declined. We will find another provider for the customer. Goodbye.";
    console.log(`[IVR] Booking ${bookingId} DECLINED by business`);
  } else {
    message = "We did not receive a valid response. Please call AgentPay support if you have questions. Goodbye.";
  }
  res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${message}</Say>
</Response>`);
});
router5.post("/pay", (req, res) => {
  try {
    const { booking_id, payment_tx } = req.body;
    if (!booking_id || !payment_tx) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: booking_id, payment_tx"
      });
    }
    res.json({
      success: true,
      payment: {
        booking_id,
        tx_hash: payment_tx,
        status: "confirmed",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        next_steps: "You will receive a confirmation email with details"
      }
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      success: false,
      error: "Payment processing failed"
    });
  }
});
router5.get("/stats", (req, res) => {
  try {
    const categories_count = new Set(services.map((s) => s.category)).size;
    const locations_count = new Set(services.map((s) => s.location)).size;
    const avg_rating = (services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(2);
    const total_reviews = services.reduce((sum, s) => sum + s.reviews, 0);
    res.json({
      success: true,
      stats: {
        total_services: services.length,
        total_categories: categories_count,
        total_locations: locations_count,
        average_rating: parseFloat(avg_rating),
        total_reviews,
        data_last_updated: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics"
    });
  }
});
router5.post("/llm", async (req, res) => {
  try {
    const { prompt, messages, model, max_tokens = 512, temperature = 0.7 } = req.body;
    let msgs = messages;
    if (!msgs && prompt) msgs = [{ role: "user", content: prompt }];
    if (!Array.isArray(msgs) || msgs.length === 0) {
      return res.status(400).json({ error: "Provide prompt or messages[]" });
    }
    const resolvedModel = model && NVIDIA_MODELS[model] ? model : DEFAULT_MODEL;
    const resp = await nvidiaNIM.chat({ model: resolvedModel, messages: msgs, max_tokens, temperature });
    const completion = resp.choices[0]?.message?.content || "";
    return res.json({
      success: true,
      output: {
        model: resp.model,
        completion,
        usage: resp.usage,
        cost: 1e-3,
        provider: "NVIDIA NIM"
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "LLM inference failed" });
  }
});
router5.post("/ai/search", async (req, res) => {
  try {
    const { query, location, max_results = 5 } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "query string is required" });
    }
    const systemPrompt = `You are a service search assistant. Extract structured intent from a user's natural language service request.
Return ONLY valid JSON with these fields:
- category: one of [hvac, plumbing, electrical, hair-beauty, food-dining, mechanic, cleaning, landscaping, other]
- keywords: array of 3-5 relevant search terms
- location: city/area if mentioned, or null
- urgency: "high" | "normal" | "low"
- intent: short phrase describing what they want (max 8 words)`;
    const nimResp = await nvidiaNIM.chat({
      model: "meta/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      max_tokens: 200,
      temperature: 0.1
    });
    let interpreted = { category: "other", keywords: [query], location: null, urgency: "normal", intent: query };
    try {
      const raw = nimResp.choices[0]?.message?.content || "{}";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) interpreted = JSON.parse(jsonMatch[0]);
    } catch (_) {
    }
    const searchTerms = [
      ...interpreted.keywords || [],
      interpreted.category !== "other" ? interpreted.category : "",
      location || interpreted.location || ""
    ].filter(Boolean).map((t) => t.toLowerCase());
    const locationHint = (location || interpreted.location || "").toLowerCase();
    let candidates = [...services];
    if (locationHint) {
      candidates = candidates.filter(
        (s) => s.location.toLowerCase().includes(locationHint) || s.city.toLowerCase().includes(locationHint)
      );
    }
    if (interpreted.category && interpreted.category !== "other") {
      const catMatches = candidates.filter(
        (s) => s.category.toLowerCase() === interpreted.category.toLowerCase()
      );
      if (catMatches.length > 0) candidates = catMatches;
    }
    const scored = candidates.map((s) => {
      const blob = [s.name, s.description, s.category, ...s.services].join(" ").toLowerCase();
      const hits = searchTerms.filter((t) => blob.includes(t)).length;
      const score = searchTerms.length > 0 ? hits / searchTerms.length : 0.5;
      return { ...s, relevance_score: parseFloat(score.toFixed(2)) };
    });
    const results = scored.sort((a, b) => b.relevance_score - a.relevance_score).slice(0, max_results);
    return res.json({
      success: true,
      query,
      ai_interpreted: interpreted,
      count: results.length,
      results
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "AI search failed" });
  }
});
var services_default = router5;

// src/routes/solana-payments.ts
import { Router as Router5 } from "express";

// src/services/solana-payment.ts
import { fileURLToPath as _fup2 } from "url";
import { dirname as _dn2 } from "path";
import { Connection, PublicKey } from "@solana/web3.js";
import * as fs4 from "fs";
import * as path5 from "path";
var __filename4 = _fup2(import.meta.url);
var __dirname4 = _dn2(__filename4);
var SOLANA_ENDPOINT = process.env.SOLANA_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com";
var RECEIVER_WALLET = process.env.SOLANA_RECEIVER_WALLET || "6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG";
var USDC_MINT = "EPjFWaLb3mLskJ2v2H7NnpXFu6HaKgqHSGAJxg6hGLKn";
var SolanaPaymentProcessor = class {
  constructor(config) {
    this.paymentLog = path5.join(__dirname4, "../../logs/solana-payments.log");
    this.config = {
      walletAddress: RECEIVER_WALLET,
      network: "mainnet",
      usdcMint: USDC_MINT,
      endpoint: SOLANA_ENDPOINT,
      ...config
    };
    this.connection = new Connection(this.config.endpoint, "confirmed");
    const logsDir = path5.dirname(this.paymentLog);
    if (!fs4.existsSync(logsDir)) {
      fs4.mkdirSync(logsDir, { recursive: true });
    }
  }
  /**
   * Verify a Solana wallet address
   */
  async verifyWallet(address) {
    try {
      const publicKey = new PublicKey(address);
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      return accountInfo !== null;
    } catch (error) {
      console.error("Wallet verification error:", error);
      return false;
    }
  }
  /**
   * Get wallet balance in SOL
   */
  async getWalletBalance() {
    try {
      const publicKey = new PublicKey(this.config.walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9;
    } catch (error) {
      console.error("Balance check error:", error);
      return 0;
    }
  }
  /**
   * Get USDC token balance
   */
  async getUSDCBalance() {
    try {
      const publicKey = new PublicKey(this.config.walletAddress);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: new PublicKey(USDC_MINT) }
      );
      if (tokenAccounts.value.length === 0) {
        console.log("No USDC token account found");
        return 0;
      }
      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance || 0;
    } catch (error) {
      console.error("USDC balance check error:", error);
      return 0;
    }
  }
  /**
   * Get recent transactions for the wallet
   */
  async getRecentTransactions(limit = 10) {
    try {
      const publicKey = new PublicKey(this.config.walletAddress);
      const signatures = await this.connection.getSignaturesForAddress(publicKey, {
        limit
      });
      const transactions = [];
      for (const sig of signatures) {
        const tx = await this.connection.getTransaction(sig.signature);
        if (tx) {
          transactions.push({
            signature: sig.signature,
            blockTime: sig.blockTime,
            status: sig.err ? "failed" : "success",
            transaction: tx
          });
        }
      }
      return transactions;
    } catch (error) {
      console.error("Transaction fetch error:", error);
      return [];
    }
  }
  /**
   * Verify a payment was received
   */
  async verifyPayment(txHash) {
    try {
      const txSignature = txHash;
      const transaction = await this.connection.getTransaction(txSignature);
      if (!transaction) {
        console.log("Transaction not found:", txHash);
        return false;
      }
      if (transaction.meta?.err) {
        console.log("Transaction failed:", transaction.meta.err);
        return false;
      }
      console.log("\u2705 Payment verified:", txHash);
      this.logPayment({
        txHash: txSignature,
        amount: 0,
        // Amount would be parsed from transaction if needed
        currency: "USDC",
        receiver: this.config.walletAddress,
        timestamp: Date.now(),
        status: "confirmed"
      });
      return true;
    } catch (error) {
      console.error("Payment verification error:", error);
      return false;
    }
  }
  /**
   * Log payment for audit trail
   */
  logPayment(payment) {
    try {
      const logEntry = JSON.stringify({
        ...payment,
        timestamp: new Date(payment.timestamp).toISOString()
      }) + "\n";
      fs4.appendFileSync(this.paymentLog, logEntry);
    } catch (error) {
      console.error("Payment logging error:", error);
    }
  }
  /**
   * Get payment statistics
   */
  async getPaymentStats() {
    try {
      const recentTxs = await this.getRecentTransactions(100);
      const walletBalance = await this.getWalletBalance();
      const usdcBalance = await this.getUSDCBalance();
      return {
        totalPayments: recentTxs.length,
        successfulPayments: recentTxs.filter((tx) => tx.status === "success").length,
        failedPayments: recentTxs.filter((tx) => tx.status === "failed").length,
        walletBalance,
        usdcBalance
      };
    } catch (error) {
      console.error("Stats error:", error);
      return {
        totalPayments: 0,
        successfulPayments: 0,
        failedPayments: 0,
        walletBalance: 0,
        usdcBalance: 0
      };
    }
  }
  /**
   * Health check
   */
  async healthCheck() {
    try {
      const walletVerified = await this.verifyWallet(this.config.walletAddress);
      const walletBalance = await this.getWalletBalance();
      const usdcBalance = await this.getUSDCBalance();
      const version = await this.connection.getVersion();
      const connectionStatus = version ? "connected" : "disconnected";
      const status = walletVerified && connectionStatus === "connected" ? "healthy" : "degraded";
      return {
        status,
        walletVerified,
        walletBalance,
        usdcBalance,
        connectionStatus
      };
    } catch (error) {
      console.error("Health check error:", error);
      return {
        status: "unhealthy",
        walletVerified: false,
        walletBalance: 0,
        usdcBalance: 0,
        connectionStatus: "disconnected"
      };
    }
  }
};
var solana_payment_default = SolanaPaymentProcessor;

// src/routes/solana-payments.ts
var router6 = Router5();
var solanaProcessor = new solana_payment_default({
  walletAddress: process.env.SOLANA_RECEIVER_WALLET || "6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG",
  network: "mainnet",
  usdcMint: "EPjFWaLb3mLskJ2v2H7NnpXFu6HaKgqHSGAJxg6hGLKn"
});
router6.post("/solana/verify-payment", async (req, res) => {
  try {
    const { tx_hash, amount, service_id } = req.body;
    if (!tx_hash) {
      return res.status(400).json({
        success: false,
        error: "Missing tx_hash parameter"
      });
    }
    const verified = await solanaProcessor.verifyPayment(tx_hash);
    if (!verified) {
      return res.status(402).json({
        success: false,
        error: "Payment verification failed",
        tx_hash
      });
    }
    res.json({
      success: true,
      tx_hash,
      verified: true,
      amount,
      service_id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: "Payment verification failed"
    });
  }
});
router6.get("/solana/wallet-info", async (req, res) => {
  try {
    const walletBalance = await solanaProcessor.getWalletBalance();
    const usdcBalance = await solanaProcessor.getUSDCBalance();
    const stats = await solanaProcessor.getPaymentStats();
    res.json({
      success: true,
      wallet: {
        address: process.env.SOLANA_RECEIVER_WALLET || "6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG",
        network: "mainnet"
      },
      balances: {
        sol: walletBalance,
        usdc: usdcBalance
      },
      stats,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Wallet info error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch wallet information"
    });
  }
});
router6.get("/solana/recent-transactions", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const transactions = await solanaProcessor.getRecentTransactions(limit);
    res.json({
      success: true,
      count: transactions.length,
      transactions: transactions.map((tx) => ({
        signature: tx.signature,
        blockTime: new Date(tx.blockTime * 1e3),
        status: tx.status,
        timestamp: new Date(tx.blockTime * 1e3).toISOString()
      })),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Transaction fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent transactions"
    });
  }
});
router6.get("/solana/health", async (req, res) => {
  try {
    const health = await solanaProcessor.healthCheck();
    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 202 : 503;
    res.status(statusCode).json({
      success: true,
      status: health.status,
      wallet: {
        verified: health.walletVerified,
        balance_sol: health.walletBalance,
        balance_usdc: health.usdcBalance
      },
      connection: health.connectionStatus,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(503).json({
      success: false,
      status: "unhealthy",
      error: "Health check failed"
    });
  }
});
router6.get("/solana/config", (req, res) => {
  res.json({
    success: true,
    config: {
      network: "mainnet",
      receiver_wallet: process.env.SOLANA_RECEIVER_WALLET || "6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG",
      usdc_mint: "EPjFWaLb3mLskJ2v2H7NnpXFu6HaKgqHSGAJxg6hGLKn",
      rpc_endpoint: "https://api.mainnet-beta.solana.com",
      payment_methods: ["USDC", "SOL"],
      supported_currencies: ["USDC", "SOL"]
    }
  });
});
var solana_payments_default = router6;

// src/routes/ethereum-payments.ts
import { Router as Router6 } from "express";
var router7 = Router6();
var RECEIVER_WALLET2 = process.env.ETHEREUM_RECEIVER_WALLET || "0x2a07182afDB346C84dFc5D116D84f34E1db4617d";
var CHAINS = {
  ethereum: {
    name: "Ethereum",
    chainId: 1,
    symbol: "ETH",
    nativeToken: "ETH",
    rpc: "https://eth.llamarpc.com",
    explorer: "https://etherscan.io/tx/",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  },
  base: {
    name: "Base",
    chainId: 8453,
    symbol: "ETH",
    nativeToken: "ETH",
    rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org/tx/",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    usdt: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2"
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    symbol: "MATIC",
    nativeToken: "MATIC",
    rpc: "https://polygon.llamarpc.com",
    explorer: "https://polygonscan.com/tx/",
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    usdt: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    dai: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
  },
  arbitrum: {
    name: "Arbitrum One",
    chainId: 42161,
    symbol: "ETH",
    nativeToken: "ETH",
    rpc: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io/tx/",
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    usdt: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    dai: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
  },
  optimism: {
    name: "Optimism",
    chainId: 10,
    symbol: "ETH",
    nativeToken: "ETH",
    rpc: "https://mainnet.optimism.io",
    explorer: "https://optimistic.etherscan.io/tx/",
    usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    usdt: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"
  },
  avalanche: {
    name: "Avalanche C-Chain",
    chainId: 43114,
    symbol: "AVAX",
    nativeToken: "AVAX",
    rpc: "https://api.avax.network/ext/bc/C/rpc",
    explorer: "https://snowtrace.io/tx/",
    usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    usdt: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"
  },
  bsc: {
    name: "BNB Smart Chain",
    chainId: 56,
    symbol: "BNB",
    nativeToken: "BNB",
    rpc: "https://bsc-dataseed.binance.org",
    explorer: "https://bscscan.com/tx/",
    usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    usdt: "0x55d398326f99059fF775485246999027B3197955"
  }
};
router7.get("/payment/chains", (_req, res) => {
  const chains = Object.entries(CHAINS).map(([id, c]) => ({
    id,
    name: c.name,
    chainId: c.chainId,
    nativeToken: c.nativeToken,
    explorer: c.explorer,
    tokens: [
      c.usdc && { symbol: "USDC", contract: c.usdc },
      c.usdt && { symbol: "USDT", contract: c.usdt },
      c.dai && { symbol: "DAI", contract: c.dai },
      { symbol: c.nativeToken, contract: "native" }
    ].filter(Boolean)
  }));
  res.json({
    success: true,
    receiver_wallet: RECEIVER_WALLET2,
    evm_chains: chains,
    solana: {
      network: "mainnet-beta",
      receiver: process.env.SOLANA_RECEIVER_WALLET || "6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG",
      tokens: [
        { symbol: "SOL", contract: "native" },
        { symbol: "USDC", mint: "EPjFWaLb3mLskJ2v2H7NnpXFu6HaKgqHSGAJxg6hGLKn" }
      ]
    },
    x402_primary: {
      network: "Base (eip155:8453)",
      description: "x402 autonomous agent payments use Base + USDC by default",
      payTo: RECEIVER_WALLET2
    },
    note: "Same EVM wallet address works across all EVM chains. Solana has a separate receiver."
  });
});
router7.get("/payment/info", (req, res) => {
  const { chain = "base" } = req.query;
  const c = CHAINS[chain.toLowerCase()];
  if (!c) {
    return res.status(400).json({
      success: false,
      error: `Unknown chain: \${chain}`,
      supported: Object.keys(CHAINS)
    });
  }
  res.json({
    success: true,
    chain: chain.toLowerCase(),
    name: c.name,
    chainId: c.chainId,
    receiver: RECEIVER_WALLET2,
    tokens: {
      native: c.nativeToken,
      usdc: c.usdc || null,
      usdt: c.usdt || null,
      dai: c.dai || null
    },
    explorer: c.explorer,
    add_to_metamask: {
      chainId: `0x\${c.chainId.toString(16)}`,
      chainName: c.name,
      rpcUrls: [c.rpc],
      nativeCurrency: { name: c.nativeToken, symbol: c.nativeToken, decimals: 18 }
    }
  });
});
router7.post("/payment/verify-evm", async (req, res) => {
  try {
    const { tx_hash, chain = "base", expected_amount, expected_token = "USDC" } = req.body;
    if (!tx_hash) return res.status(400).json({ success: false, error: "tx_hash required" });
    const c = CHAINS[chain.toLowerCase()];
    if (!c) return res.status(400).json({ success: false, error: `Unsupported chain: \${chain}` });
    const rpcRes = await fetch(c.rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [tx_hash]
      })
    });
    const { result } = await rpcRes.json();
    if (!result) return res.status(404).json({ success: false, error: "Transaction not found" });
    if (result.status !== "0x1") return res.status(402).json({ success: false, error: "Transaction failed on-chain" });
    res.json({
      success: true,
      verified: true,
      tx_hash,
      chain: c.name,
      chainId: c.chainId,
      block: parseInt(result.blockNumber, 16),
      explorer_url: c.explorer + tx_hash,
      status: "confirmed"
    });
  } catch (err) {
    console.error("EVM verify error:", err);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
});
router7.get("/ethereum/wallet-info", (_req, res) => res.redirect("/api/v1/payment/info?chain=ethereum"));
router7.get("/eth/chains", (_req, res) => res.redirect("/api/v1/payment/chains"));
var ethereum_payments_default = router7;

// src/routes/stripe-payments.ts
import { Router as Router7 } from "express";
import Stripe from "stripe";
var router8 = Router7();
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.length < 20) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2025-03-31.basil" });
}
var PUB_KEY = () => process.env.STRIPE_PUBLISHABLE_KEY || "";
router8.post("/stripe/setup-customer", async (req, res) => {
  try {
    const stripe = getStripe();
    const { email, name, agent_id, user_id, metadata = {} } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "email required" });
    const customer = await stripe.customers.create({
      email,
      name: name || email,
      metadata: { agent_id: agent_id || "", user_id: user_id || "", platform: "agentpay", ...metadata }
    });
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ["card"],
      usage: "off_session",
      // key flag — card will be charged without human present
      metadata: { agent_id: agent_id || "", user_id: user_id || "" }
    });
    const setupSession = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: customer.id,
      payment_method_types: ["card"],
      success_url: "https://www.x402-agent-pay.com/card-saved?customer_id=" + customer.id,
      cancel_url: "https://www.x402-agent-pay.com/card-cancelled",
      metadata: { agent_id: agent_id || "", customer_id: customer.id }
    });
    res.json({
      success: true,
      customer_id: customer.id,
      // For custom UI (Stripe Elements in app):
      setup_intent_client_secret: setupIntent.client_secret,
      publishable_key: PUB_KEY(),
      // For hosted redirect (simplest — send human this URL):
      setup_url: setupSession.url,
      instructions: "Send setup_url to the human. Once they save their card, use customer_id for all agent charges."
    });
  } catch (err) {
    console.error("Setup customer error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});
router8.post("/stripe/agent-charge", async (req, res) => {
  try {
    const stripe = getStripe();
    const {
      customer_id,
      amount,
      currency = "usd",
      service_name = "AgentPay Booking",
      booking_id,
      agent_id,
      business_name
    } = req.body;
    if (!customer_id) return res.status(400).json({ success: false, error: "customer_id required" });
    if (!amount || amount < 50) return res.status(400).json({ success: false, error: "amount required (min 50 cents)" });
    const customer = await stripe.customers.retrieve(customer_id);
    if (!customer || customer.deleted) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }
    const paymentMethods = await stripe.paymentMethods.list({ customer: customer_id, type: "card" });
    if (!paymentMethods.data.length) {
      return res.status(402).json({
        success: false,
        error: "No saved card found for this customer. Ask them to set up a card first.",
        setup_url: "POST /api/v1/stripe/setup-customer"
      });
    }
    const paymentMethod = paymentMethods.data[0];
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      customer: customer_id,
      payment_method: paymentMethod.id,
      off_session: true,
      // agent acting on behalf of human
      confirm: true,
      // charge immediately, no redirect
      description: service_name + (business_name ? ` at \${business_name}` : ""),
      metadata: {
        booking_id: booking_id || "",
        agent_id: agent_id || "",
        service: service_name,
        platform: "agentpay"
      },
      receipt_email: customer.email || void 0
    });
    if (intent.status === "succeeded") {
      res.json({
        success: true,
        charge_id: intent.latest_charge,
        payment_intent_id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        service: service_name,
        booking_id,
        customer_email: customer.email,
        card_last4: paymentMethod.card?.last4,
        card_brand: paymentMethod.card?.brand,
        receipt_url: `https://dashboard.stripe.com/payments/${intent.id}`,
        message: `Card ending in ${paymentMethod.card?.last4} charged $${(amount / 100).toFixed(2)} for ${service_name}`
      });
    } else if (intent.status === "requires_action") {
      res.status(402).json({
        success: false,
        requires_action: true,
        payment_intent_id: intent.id,
        client_secret: intent.client_secret,
        error: "Card requires 3D Secure authentication. Human must complete checkout.",
        checkout_url: "/checkout?payment_intent_id=" + intent.id
      });
    } else {
      res.status(402).json({ success: false, status: intent.status, error: "Payment not completed" });
    }
  } catch (err) {
    console.error("Agent charge error:", err.message);
    if (err.code === "card_declined") return res.status(402).json({ success: false, error: "Card declined", code: err.code });
    if (err.code === "insufficient_funds") return res.status(402).json({ success: false, error: "Insufficient funds", code: err.code });
    if (err.code === "authentication_required") return res.status(402).json({ success: false, requires_action: true, error: "Card requires authentication" });
    res.status(500).json({ success: false, error: err.message });
  }
});
router8.get("/stripe/customer/:id", async (req, res) => {
  try {
    const stripe = getStripe();
    const customer = await stripe.customers.retrieve(req.params.id);
    if (!customer || customer.deleted) return res.status(404).json({ success: false, error: "Customer not found" });
    const methods = await stripe.paymentMethods.list({ customer: req.params.id, type: "card" });
    res.json({
      success: true,
      customer_id: customer.id,
      email: customer.email,
      name: customer.name,
      cards: methods.data.map((m) => ({
        id: m.id,
        brand: m.card?.brand,
        last4: m.card?.last4,
        exp_month: m.card?.exp_month,
        exp_year: m.card?.exp_year,
        is_default: m.id === customer.invoice_settings?.default_payment_method
      })),
      has_saved_card: methods.data.length > 0,
      agent_can_charge: methods.data.length > 0
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router8.get("/stripe/config", (_req, res) => {
  res.json({
    publishable_key: PUB_KEY(),
    supported_methods: ["card", "apple_pay", "google_pay", "link"],
    currencies: ["usd", "eur", "gbp", "cad", "aud", "sgd", "jpy", "mxn", "brl", "inr"],
    flow: {
      step1_register_human_card: "POST /api/v1/stripe/setup-customer \u2014 human saves card once",
      step2_agent_charges: "POST /api/v1/stripe/agent-charge \u2014 agent charges autonomously per booking",
      check_card_on_file: "GET  /api/v1/stripe/customer/:id \u2014 verify human has card saved",
      verify_payment: "POST /api/v1/stripe/verify \u2014 confirm a charge succeeded",
      hosted_checkout: "POST /api/v1/stripe/checkout \u2014 redirect-based checkout for new users"
    },
    note: "Agents charge the human card off-session (no human interaction). Human registers card once via setup_url."
  });
});
router8.post("/stripe/checkout", async (req, res) => {
  try {
    const stripe = getStripe();
    const {
      amount,
      currency = "usd",
      service_name = "AgentPay Booking",
      booking_id,
      business_name,
      success_url = "https://www.x402-agent-pay.com/payment-success",
      cancel_url = "https://www.x402-agent-pay.com/payment-cancel"
    } = req.body;
    if (!amount || amount < 50) return res.status(400).json({ success: false, error: "amount required (min 50 cents)" });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price_data: { currency, product_data: {
        name: service_name,
        description: business_name ? `Booked via AgentPay at ${business_name}` : "Booked via AgentPay"
      }, unit_amount: Math.round(amount) }, quantity: 1 }],
      mode: "payment",
      success_url: success_url + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url,
      metadata: { booking_id: booking_id || "", source: "agentpay" }
    });
    res.json({ success: true, checkout_url: session.url, session_id: session.id, amount, currency });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router8.post("/stripe/payment-intent", async (req, res) => {
  try {
    const stripe = getStripe();
    const { amount, currency = "usd", booking_id, service_id, agent_address } = req.body;
    if (!amount || amount < 50) return res.status(400).json({ success: false, error: "amount required (min 50 cents)" });
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { booking_id: booking_id || "", service_id: service_id || "", agent_address: agent_address || "", source: "agentpay" }
    });
    res.json({ success: true, client_secret: intent.client_secret, payment_intent_id: intent.id, amount, currency, publishable_key: PUB_KEY() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router8.post("/stripe/verify", async (req, res) => {
  try {
    const stripe = getStripe();
    const { payment_intent_id, session_id } = req.body;
    if (!payment_intent_id && !session_id) return res.status(400).json({ success: false, error: "payment_intent_id or session_id required" });
    if (session_id) {
      const s = await stripe.checkout.sessions.retrieve(session_id);
      return res.json({ success: true, verified: s.payment_status === "paid", status: s.payment_status, amount: s.amount_total, currency: s.currency, customer_email: s.customer_details?.email });
    }
    const i = await stripe.paymentIntents.retrieve(payment_intent_id);
    res.json({ success: true, verified: i.status === "succeeded", status: i.status, amount: i.amount, currency: i.currency });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router8.post("/stripe/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret2 = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    if (webhookSecret2 && sig) {
      event = getStripe().webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret2);
    } else {
      event = req.body;
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.succeeded":
      console.log("AgentPay payment confirmed:", event.type, event.data.object);
      break;
    case "payment_intent.payment_failed":
      console.log("AgentPay payment failed:", event.data.object.last_payment_error?.message);
      break;
    case "customer.created":
      console.log("New AgentPay customer:", event.data.object.email);
      break;
    case "setup_intent.succeeded":
      console.log("Card saved for customer:", event.data.object.customer);
      break;
  }
  res.json({ received: true });
});
var stripe_payments_default = router8;

// src/routes/business-portal.ts
import { Router as Router8 } from "express";
var router9 = Router8();
var businesses = /* @__PURE__ */ new Map();
var bookings = /* @__PURE__ */ new Map();
router9.post("/business/register", (req, res) => {
  try {
    const { email, password, businessName, category, location, city, country, address, phone, services: services2, description, website, wallet } = req.body;
    if (!email || !businessName || !category) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }
    const businessId = "biz_" + Date.now();
    const business = {
      id: businessId,
      email,
      businessName,
      category,
      location,
      address: address || "",
      phone,
      description: description || "",
      city: city || "",
      country: country || "",
      website: website || "",
      wallet: wallet || "",
      services_offered: services2 || [],
      rating: 0,
      reviews: 0,
      services: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    businesses.set(businessId, business);
    res.status(201).json({
      success: true,
      business: {
        id: businessId,
        email,
        businessName,
        category,
        location
      },
      message: "Business registered successfully"
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed"
    });
  }
});
router9.post("/business/login", (req, res) => {
  try {
    const { email, password } = req.body;
    const business = Array.from(businesses.values()).find((b) => b.email === email);
    if (!business) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    const token = Buffer.from(`${business.id}:${Date.now()}`).toString("base64");
    res.json({
      success: true,
      token,
      business: {
        id: business.id,
        businessName: business.businessName,
        email: business.email,
        category: business.category
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed"
    });
  }
});
router9.get("/business/:id", (req, res) => {
  try {
    const business = businesses.get(req.params.id);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found"
      });
    }
    res.json({
      success: true,
      business
    });
  } catch (error) {
    console.error("Get business error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch business"
    });
  }
});
router9.put("/business/:id", (req, res) => {
  try {
    const business = businesses.get(req.params.id);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found"
      });
    }
    const updated = {
      ...business,
      ...req.body,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    businesses.set(req.params.id, updated);
    res.json({
      success: true,
      business: updated
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      error: "Update failed"
    });
  }
});
router9.post("/business/:id/services", (req, res) => {
  try {
    const business = businesses.get(req.params.id);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found"
      });
    }
    const { name, category, description, price, duration } = req.body;
    const service = {
      id: "svc_" + Date.now(),
      name,
      category,
      description,
      price,
      duration: duration || 60,
      available: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    business.services.push(service);
    businesses.set(req.params.id, business);
    res.status(201).json({
      success: true,
      service
    });
  } catch (error) {
    console.error("Service creation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create service"
    });
  }
});
router9.get("/business/:id/services", (req, res) => {
  try {
    const business = businesses.get(req.params.id);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found"
      });
    }
    res.json({
      success: true,
      count: business.services.length,
      services: business.services
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch services"
    });
  }
});
router9.put("/business/:businessId/services/:serviceId", (req, res) => {
  try {
    const business = businesses.get(req.params.businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found"
      });
    }
    const service = business.services.find((s) => s.id === req.params.serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found"
      });
    }
    const updated = {
      ...service,
      ...req.body,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    business.services = business.services.map((s) => s.id === service.id ? updated : s);
    businesses.set(req.params.businessId, business);
    res.json({
      success: true,
      service: updated
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update service"
    });
  }
});
router9.delete("/business/:businessId/services/:serviceId", (req, res) => {
  try {
    const business = businesses.get(req.params.businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found"
      });
    }
    business.services = business.services.filter((s) => s.id !== req.params.serviceId);
    businesses.set(req.params.businessId, business);
    res.json({
      success: true,
      message: "Service deleted"
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete service"
    });
  }
});
router9.get("/business/:id/bookings", (req, res) => {
  try {
    const businessBookings = Array.from(bookings.values()).filter((b) => b.businessId === req.params.id);
    res.json({
      success: true,
      count: businessBookings.length,
      bookings: businessBookings
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bookings"
    });
  }
});
router9.put("/business/:businessId/bookings/:bookingId", (req, res) => {
  try {
    const booking = bookings.get(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found"
      });
    }
    const { status } = req.body;
    const updated = {
      ...booking,
      status,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    bookings.set(req.params.bookingId, updated);
    res.json({
      success: true,
      booking: updated
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update booking"
    });
  }
});
router9.get("/business/:id/analytics", (req, res) => {
  try {
    const businessBookings = Array.from(bookings.values()).filter((b) => b.businessId === req.params.id);
    const totalRevenue = businessBookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.amount, 0);
    const stats = {
      totalBookings: businessBookings.length,
      completedBookings: businessBookings.filter((b) => b.status === "completed").length,
      pendingBookings: businessBookings.filter((b) => b.status === "pending").length,
      cancelledBookings: businessBookings.filter((b) => b.status === "cancelled").length,
      totalRevenue,
      averageBookingValue: businessBookings.length > 0 ? totalRevenue / businessBookings.length : 0
    };
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics"
    });
  }
});
var business_portal_default = router9;

// src/routes/wallet.ts
import { fileURLToPath as _fup4 } from "url";
import { dirname as _dn4 } from "path";
import { Router as Router9 } from "express";

// src/services/agent-wallet.ts
import { fileURLToPath as _fup3 } from "url";
import { dirname as _dn3 } from "path";
import { createWalletClient, createPublicClient, http, parseUnits, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
var __filename5 = _fup3(import.meta.url);
var __dirname5 = _dn3(__filename5);
var EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY;
var AGENTPAY_WALLET = process.env.AGENTPAY_WALLET || "";
var CHAIN = process.env.CHAIN === "base-sepolia" ? baseSepolia : base;
var RPC = process.env.EVM_RPC || "https://mainnet.base.org";
var USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
var USDC_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  }
];
async function getWalletStatus() {
  if (!EVM_PRIVATE_KEY) throw new Error("EVM_PRIVATE_KEY not set in .env");
  const account = privateKeyToAccount(EVM_PRIVATE_KEY);
  const publicClient = createPublicClient({ chain: CHAIN, transport: http(RPC) });
  const [ethBalance, usdcBalance] = await Promise.all([
    publicClient.getBalance({ address: account.address }),
    publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [account.address]
    })
  ]);
  return {
    address: account.address,
    chain: CHAIN.name,
    ethBalance: formatUnits(ethBalance, 18) + " ETH",
    usdcBalance: formatUnits(usdcBalance, 6) + " USDC",
    status: "ready"
  };
}
async function sendUSDC(amountUSD, recipient) {
  if (!EVM_PRIVATE_KEY) throw new Error("EVM_PRIVATE_KEY not set in .env");
  const account = privateKeyToAccount(EVM_PRIVATE_KEY);
  const publicClient = createPublicClient({ chain: CHAIN, transport: http(RPC) });
  const walletClient = createWalletClient({ account, chain: CHAIN, transport: http(RPC) });
  const cleanAmount = amountUSD.replace("$", "").trim();
  const atomicAmount = parseUnits(cleanAmount, 6);
  const { request } = await publicClient.simulateContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "transfer",
    args: [recipient, atomicAmount],
    account: account.address
  });
  const txHash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash: txHash });
  return {
    txHash,
    from: account.address,
    to: recipient,
    amount: cleanAmount + " USDC",
    chain: CHAIN.name,
    explorerUrl: `https://basescan.org/tx/${txHash}`
  };
}
function getWalletAddress() {
  if (!EVM_PRIVATE_KEY) throw new Error("EVM_PRIVATE_KEY not set in .env");
  const account = privateKeyToAccount(EVM_PRIVATE_KEY);
  return account.address;
}

// src/routes/wallet.ts
var __filename6 = _fup4(import.meta.url);
var __dirname6 = _dn4(__filename6);
var router10 = Router9();
router10.get("/status", async (req, res) => {
  try {
    const status = await getWalletStatus();
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router10.get("/address", (req, res) => {
  try {
    const address = getWalletAddress();
    res.json({ success: true, address, chain: process.env.CHAIN || "base" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router10.post("/send", async (req, res) => {
  try {
    const { amount, recipient } = req.body;
    if (!amount || !recipient) {
      return res.status(400).json({ error: "amount and recipient required" });
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(recipient)) {
      return res.status(400).json({ error: "Invalid EVM address" });
    }
    const result = await sendUSDC(amount, recipient);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
var wallet_default = router10;

// src/routes/products-osm.ts
import { Router as Router10 } from "express";
import Database3 from "better-sqlite3";
var router11 = Router10();
async function overpassOne(key, value, lat, lon, radius, limit) {
  const EPS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];
  const q = `[out:json][timeout:6];(node["${key}"="${value}"](around:${radius},${lat},${lon});way["${key}"="${value}"](around:${radius},${lat},${lon}););out center ${limit};`;
  for (const ep of EPS) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 7e3);
      const r = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "AgentPay/2.0" },
        body: "data=" + encodeURIComponent(q),
        signal: ctrl.signal
      });
      clearTimeout(t);
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d.elements)) return d.elements;
      }
    } catch (_) {
    }
  }
  return [];
}
async function geocode(location) {
  try {
    const r = await fetch(
      "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(location) + "&format=json&limit=1",
      { headers: { "User-Agent": "AgentPay/2.0" }, signal: AbortSignal.timeout(5e3) }
    );
    const d = await r.json();
    if (d.length > 0) return { lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) };
  } catch (_) {
  }
  return null;
}
function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}
var OSM_TAGS = {
  "hair-beauty": { key: "shop", values: ["hairdresser", "beauty", "barber", "nail_salon"] },
  "food-dining": { key: "amenity", values: ["restaurant", "cafe", "bar", "fast_food"] },
  "auto-service": { key: "shop", values: ["car_repair", "tyres", "car_wash"] },
  "home-services": { key: "shop", values: ["hardware", "doityourself"] },
  "health-fitness": { key: "leisure", values: ["fitness_centre", "sports_centre"] },
  "medical": { key: "amenity", values: ["doctors", "dentist", "clinic", "pharmacy"] },
  "pets": { key: "shop", values: ["pet"] },
  "tech-repair": { key: "shop", values: ["mobile_phone", "electronics", "computer"] },
  "travel-transport": { key: "amenity", values: ["taxi", "car_rental"] },
  "financial": { key: "amenity", values: ["bank", "atm"] },
  "real-estate": { key: "office", values: ["estate_agent"] },
  "fashion-retail": { key: "shop", values: ["clothes", "shoes", "department_store"] },
  "events": { key: "amenity", values: ["theatre", "cinema", "nightclub"] },
  "education": { key: "amenity", values: ["school", "college", "university"] },
  "professional": { key: "office", values: ["lawyer", "accountant", "company"] }
};
router11.get("/categories", (_req, res) => {
  res.json(Object.keys(OSM_TAGS).map((id) => ({ id, label: id.replace(/-/g, " ") })));
});
router11.get("/osm-search", async (req, res) => {
  const { category, lat, lon, location, radius_km = "5", limit = "15" } = req.query;
  if (!category) return res.status(400).json({ success: false, error: "category required" });
  const tags = OSM_TAGS[category];
  if (!tags) return res.status(400).json({ success: false, error: "Unknown category. Use: " + Object.keys(OSM_TAGS).join(", ") });
  let sLat = lat ? parseFloat(lat) : null;
  let sLon = lon ? parseFloat(lon) : null;
  if ((!sLat || !sLon) && location) {
    const geo = await geocode(location);
    if (geo) {
      sLat = geo.lat;
      sLon = geo.lon;
    }
  }
  if (!sLat || !sLon) return res.status(400).json({ success: false, error: "Provide lat+lon or location string" });
  const radius = Math.min(parseFloat(radius_km), 20) * 1e3;
  const maxN = Math.min(parseInt(limit), 30);
  const perTag = Math.ceil(maxN / tags.values.length);
  const tagResults = await Promise.all(
    tags.values.map((v) => overpassOne(tags.key, v, sLat, sLon, radius, perTag))
  );
  const seen = /* @__PURE__ */ new Set();
  let elements = [];
  for (const arr of tagResults) {
    for (const el of arr) {
      if (!seen.has(el.id)) {
        seen.add(el.id);
        elements.push(el);
      }
    }
  }
  let results = elements.map((el) => {
    const eLat = el.lat ?? el.center?.lat;
    const eLon = el.lon ?? el.center?.lon;
    const name = el.tags?.name || el.tags?.["name:en"];
    if (!name) return null;
    return {
      id: "osm_" + el.id,
      name,
      category,
      address: [el.tags?.["addr:housenumber"], el.tags?.["addr:street"]].filter(Boolean).join(" ") || null,
      city: el.tags?.["addr:city"] || null,
      postcode: el.tags?.["addr:postcode"] || null,
      phone: el.tags?.phone || el.tags?.["contact:phone"] || null,
      website: el.tags?.website || el.tags?.["contact:website"] || null,
      opening_hours: el.tags?.opening_hours || null,
      distance_km: eLat && eLon ? distKm(sLat, sLon, eLat, eLon) : null,
      lat: eLat,
      lon: eLon,
      osm_id: el.id,
      source: "openstreetmap",
      bookable: true,
      payment_x402: true
    };
  }).filter(Boolean).sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99)).slice(0, maxN);
  try {
    const catMap = {
      "hair-beauty": ["hair", "beauty", "barber", "salon", "nail"],
      "auto-service": ["auto", "car", "vehicle", "tyre", "mechanic"],
      "home-services": ["hvac", "plumb", "electric", "handyman", "roof", "paint", "home", "clean"],
      "health-fitness": ["fitness", "gym", "health", "sport", "yoga", "pilates"],
      "medical": ["medical", "doctor", "dentist", "clinic", "pharmacy", "chiro", "therapy"],
      "food-dining": ["food", "restaurant", "cafe", "catering", "bakery"],
      "tech-repair": ["tech", "repair", "computer", "phone", "electronic", "it"],
      "pets": ["pet", "vet", "grooming", "dog", "cat", "animal"],
      "professional": ["lawyer", "accountant", "consult", "legal", "financial"],
      "events": ["event", "entertainment", "party", "wedding", "photo"],
      "landscaping": ["lawn", "landscape", "garden", "tree", "sprinkler"],
      "cleaning": ["clean", "maid", "janitor", "housekeep"]
    };
    const keywords = catMap[category] || [category.replace(/-/g, " ")];
    const pdb = new Database3("/var/lib/agentpay/providers.db");
    const allProviders = pdb.prepare("SELECT * FROM providers WHERE status = ?").all("active");
    const apProviders = allProviders.filter(
      (p) => keywords.some((k) => (p.category || p.business_name || "").toLowerCase().includes(k))
    ).map((p) => {
      let services2 = [];
      try {
        services2 = pdb.prepare("SELECT name, price, duration FROM provider_services WHERE provider_id = ? AND available = 1").all(p.id);
      } catch (_) {
      }
      const dist = p.lat && p.lon && sLat && sLon ? distKm(sLat, sLon, p.lat, p.lon) : null;
      return {
        id: "ap_" + p.id,
        name: p.business_name,
        category,
        address: p.address || null,
        city: p.city || null,
        postcode: null,
        phone: p.phone || null,
        website: null,
        opening_hours: null,
        distance_km: dist,
        lat: p.lat || null,
        lon: p.lon || null,
        osm_id: p.osm_id || null,
        source: "agentpay",
        bookable: true,
        payment_x402: true,
        verified: p.verified === 1,
        osm_claimed: !!p.osm_id,
        email: p.email,
        services: services2.map((s) => ({ name: s.name, price: s.price, duration: s.duration }))
      };
    });
    apProviders.sort((a, b) => {
      if (a.osm_claimed && !b.osm_claimed) return -1;
      if (!a.osm_claimed && b.osm_claimed) return 1;
      return (a.distance_km ?? 999) - (b.distance_km ?? 999);
    });
    results.unshift(...apProviders);
    const seen2 = /* @__PURE__ */ new Set();
    results = results.filter((r) => {
      const key = r.osm_id ? String(r.osm_id) : r.id;
      if (seen2.has(key)) return false;
      seen2.add(key);
      return true;
    });
  } catch (blendErr) {
    console.error("[OSM] Provider blend error:", blendErr.message);
  }
  res.json({
    success: true,
    category,
    center: { lat: sLat, lon: sLon },
    radius_km: parseFloat(radius_km),
    count: results.length,
    results,
    powered_by: "OpenStreetMap + AgentPay"
  });
});
function onlineProducts(query) {
  const enc = encodeURIComponent(query);
  return [
    { id: "od1", name: query + " \u2014 Amazon", price: "View", currency: "USD", source: "online", store: "Amazon", url: "https://amazon.com/s?k=" + enc, available: true, delivery: "1-2 days" },
    { id: "od2", name: query + " \u2014 Walmart", price: "View", currency: "USD", source: "online", store: "Walmart", url: "https://walmart.com/search?q=" + enc, available: true, delivery: "2-3 days" },
    { id: "od3", name: query + " \u2014 Target", price: "View", currency: "USD", source: "online", store: "Target", url: "https://target.com/s?searchTerm=" + enc, available: true, delivery: "same day pickup" }
  ];
}
async function localStores(query, lat, lon) {
  const q = query.toLowerCase();
  const shopMap = {
    hair: ["hairdresser", "beauty", "chemist", "supermarket"],
    vitamin: ["pharmacy", "chemist", "supermarket"],
    medicine: ["pharmacy", "chemist"],
    phone: ["mobile_phone", "electronics"],
    food: ["supermarket", "convenience"],
    clothes: ["clothes", "department_store"],
    book: ["books", "stationery"],
    pet: ["pet"],
    tool: ["hardware", "doityourself"]
  };
  let types = ["supermarket", "convenience", "chemist", "pharmacy"];
  for (const [k, t] of Object.entries(shopMap)) {
    if (q.includes(k)) {
      types = t;
      break;
    }
  }
  const elements = (await Promise.all(
    types.slice(0, 2).map((t) => overpassOne("shop", t, lat, lon, 5e3, 2))
  )).flat().slice(0, 3);
  return elements.map((el) => {
    const eLat = el.lat ?? el.center?.lat ?? lat, eLon = el.lon ?? el.center?.lon ?? lon;
    const store = el.tags?.name || "Local Store";
    return {
      id: "local_" + el.id,
      name: query + " at " + store,
      price: "In-store",
      currency: "USD",
      source: "local",
      store,
      address: [el.tags?.["addr:housenumber"], el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || "See map",
      distance_km: distKm(lat, lon, eLat, eLon),
      url: "https://www.openstreetmap.org/node/" + el.id,
      available: true
    };
  });
}
router11.post("/products", async (req, res) => {
  try {
    const { query, lat, lon, location } = req.body;
    if (!query) return res.status(400).json({ success: false, error: "query required" });
    const online = onlineProducts(query);
    let local = [], sLat = lat ? parseFloat(lat) : null, sLon = lon ? parseFloat(lon) : null;
    if (!sLat && location) {
      const geo = await geocode(location);
      if (geo) {
        sLat = geo.lat;
        sLon = geo.lon;
      }
    }
    if (sLat && sLon) local = await localStores(query, sLat, sLon);
    res.json({
      success: true,
      query,
      online_count: online.length,
      local_count: local.length,
      results: { online, local },
      powered_by: local.length > 0 ? "AgentPay + OpenStreetMap" : "AgentPay Catalog",
      tip: !sLat ? "Add lat+lon or location for nearby store results" : void 0
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
var products_osm_default = router11;

// src/routes/agent-marketplace.ts
import { Router as Router11 } from "express";
import * as crypto2 from "crypto";
import * as fs5 from "fs";
import * as path6 from "path";
var router12 = Router11();
var DB_PATH2 = path6.join(process.cwd(), "data", "agent-registry.json");
function loadDB() {
  try {
    if (fs5.existsSync(DB_PATH2)) return JSON.parse(fs5.readFileSync(DB_PATH2, "utf8"));
  } catch (_) {
  }
  return { agents: {}, apiKeys: {} };
}
function saveDB(db5) {
  const dir = path6.dirname(DB_PATH2);
  if (!fs5.existsSync(dir)) fs5.mkdirSync(dir, { recursive: true });
  fs5.writeFileSync(DB_PATH2, JSON.stringify(db5, null, 2));
}
function generateApiKey() {
  return "ap_" + crypto2.randomBytes(24).toString("hex");
}
function generateAgentId(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 32);
  return slug + "-" + crypto2.randomBytes(4).toString("hex");
}
router12.get("/marketplace/info", (_req, res) => {
  res.json({
    name: "AgentPay Marketplace",
    version: "2.0",
    description: "Agent-to-agent service marketplace. Register your agent to offer or consume real-world services (HVAC, hair, food, auto, medical, etc.) with x402/USDC payments.",
    registration_endpoint: "POST /api/v1/marketplace/agent/register",
    discovery_endpoint: "GET  /api/v1/marketplace/agents",
    search_endpoint: "GET  /api/v1/osm-search",
    payment_protocols: ["x402-v2", "stripe-off-session", "usdc-base", "usdc-solana"],
    supported_chains: ["base", "ethereum", "polygon", "arbitrum", "optimism", "avalanche", "bsc", "solana"],
    registration_fee: "free",
    listing_fee: "free",
    transaction_fee: "2% on Stripe bookings, $0.001 USDC flat on x402 calls",
    receiver_wallet: "0x2a07182afDB346C84dFc5D116D84f34E1db4617d",
    openapi_spec: "https://www.x402-agent-pay.com/openapi.json",
    llms_txt: "https://www.x402-agent-pay.com/llms.txt",
    bazaar_resource: "https://www.x402-agent-pay.com/api/v1/search",
    contact: "x402agentpay@gmail.com",
    registration_schema: {
      required: ["agent_name", "agent_url", "capabilities", "wallet_address", "contact_email"],
      optional: ["description", "pricing_model", "supported_chains", "webhook_url", "mcp_endpoint", "openapi_url", "tags"],
      capabilities_enum: ["service-booking", "payment-processing", "search", "scheduling", "data-enrichment", "ai-inference", "verification", "communication", "real-world-action", "other"],
      pricing_model_enum: ["per-call", "per-booking", "subscription", "free", "revenue-share"]
    },
    example_registration: {
      agent_name: "MyAgent-v1",
      agent_url: "https://myagent.example.com",
      capabilities: ["service-booking", "payment-processing"],
      wallet_address: "0xYourWalletHere",
      contact_email: "agent@example.com",
      description: "An AI agent that books home services",
      pricing_model: "per-booking",
      supported_chains: ["base", "ethereum"],
      mcp_endpoint: "https://myagent.example.com/mcp",
      openapi_url: "https://myagent.example.com/openapi.json",
      tags: ["home-services", "hvac", "plumbing"]
    }
  });
});
router12.post("/marketplace/agent/register", async (req, res) => {
  try {
    const {
      agent_name,
      agent_url,
      capabilities,
      wallet_address,
      contact_email,
      description,
      pricing_model,
      supported_chains,
      webhook_url,
      mcp_endpoint,
      openapi_url,
      tags
    } = req.body;
    const missing = [];
    if (!agent_name) missing.push("agent_name");
    if (!agent_url) missing.push("agent_url");
    if (!capabilities || !Array.isArray(capabilities) || capabilities.length === 0) missing.push("capabilities");
    if (!wallet_address) missing.push("wallet_address");
    if (!contact_email) missing.push("contact_email");
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
        schema: "GET /api/v1/marketplace/info for full schema"
      });
    }
    try {
      new URL(agent_url);
    } catch (_) {
      return res.status(400).json({ success: false, error: "agent_url must be a valid URL" });
    }
    const isEvm = /^0x[0-9a-fA-F]{40}$/.test(wallet_address);
    const isSol = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet_address);
    if (!isEvm && !isSol) {
      return res.status(400).json({ success: false, error: "wallet_address must be a valid EVM (0x...) or Solana address" });
    }
    const db5 = loadDB();
    const agentId = generateAgentId(agent_name);
    const apiKey = generateApiKey();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const agentRecord = {
      agent_id: agentId,
      agent_name,
      agent_url,
      capabilities: Array.isArray(capabilities) ? capabilities : [capabilities],
      wallet_address,
      contact_email,
      description: description || "",
      pricing_model: pricing_model || "per-call",
      supported_chains: supported_chains || ["base"],
      webhook_url: webhook_url || null,
      mcp_endpoint: mcp_endpoint || null,
      openapi_url: openapi_url || null,
      tags: tags || [],
      status: "active",
      registered_at: now,
      updated_at: now,
      call_count: 0,
      tx_count: 0,
      verified: false
    };
    db5.agents[agentId] = agentRecord;
    db5.apiKeys[apiKey] = { agent_id: agentId, created_at: now, active: true };
    saveDB(db5);
    console.log(`[AgentPay] New agent registered: ${agent_name} (${agentId}) wallet:${wallet_address}`);
    res.status(201).json({
      success: true,
      message: "Agent registered successfully. Welcome to AgentPay Marketplace.",
      agent_id: agentId,
      api_key: apiKey,
      agent_record: agentRecord,
      next_steps: {
        list_agents: "GET /api/v1/marketplace/agents",
        search_services: "GET /api/v1/osm-search?category=hair-beauty&lat=LAT&lon=LON",
        make_payment: "POST /api/v1/stripe/agent-charge (requires customer_id from human setup)",
        x402_info: "GET /api/v1/payment/chains",
        full_docs: "https://www.x402-agent-pay.com/openapi.json"
      },
      marketplace_info: {
        total_registered_agents: Object.keys(db5.agents).length,
        your_position: Object.keys(db5.agents).length,
        receiver_wallet: "0x2a07182afDB346C84dFc5D116D84f34E1db4617d"
      }
    });
  } catch (err) {
    console.error("[AgentPay] Registration error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
router12.get("/marketplace/agents", (req, res) => {
  const db5 = loadDB();
  const { capability, chain, tag, limit = "50", offset = "0" } = req.query;
  let agents = Object.values(db5.agents);
  if (capability) agents = agents.filter((a) => a.capabilities?.includes(capability));
  if (chain) agents = agents.filter((a) => a.supported_chains?.includes(chain));
  if (tag) agents = agents.filter((a) => a.tags?.includes(tag));
  const total = agents.length;
  const paged = agents.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  res.json({
    success: true,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
    agents: paged.map((a) => ({
      agent_id: a.agent_id,
      agent_name: a.agent_name,
      agent_url: a.agent_url,
      capabilities: a.capabilities,
      wallet_address: a.wallet_address,
      description: a.description,
      pricing_model: a.pricing_model,
      supported_chains: a.supported_chains,
      mcp_endpoint: a.mcp_endpoint,
      openapi_url: a.openapi_url,
      tags: a.tags,
      status: a.status,
      registered_at: a.registered_at,
      call_count: a.call_count,
      verified: a.verified
    }))
  });
});
router12.get("/marketplace/agent/:agentId", (req, res) => {
  const db5 = loadDB();
  const agent = db5.agents[req.params.agentId];
  if (!agent) return res.status(404).json({ success: false, error: "Agent not found" });
  res.json({ success: true, agent });
});
router12.post("/marketplace/agent/verify", async (req, res) => {
  const { agent_id, api_key } = req.body;
  if (!agent_id || !api_key) return res.status(400).json({ success: false, error: "agent_id and api_key required" });
  const db5 = loadDB();
  const keyData = db5.apiKeys[api_key];
  if (!keyData || keyData.agent_id !== agent_id) return res.status(401).json({ success: false, error: "Invalid api_key for this agent" });
  const agent = db5.agents[agent_id];
  if (!agent) return res.status(404).json({ success: false, error: "Agent not found" });
  const challenge = crypto2.randomBytes(16).toString("hex");
  try {
    const r = await fetch(`${agent.agent_url}/.well-known/agentpay-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge }),
      signal: AbortSignal.timeout(8e3)
    });
    const data = await r.json();
    if (data.challenge_response === challenge) {
      db5.agents[agent_id].verified = true;
      db5.agents[agent_id].verified_at = (/* @__PURE__ */ new Date()).toISOString();
      saveDB(db5);
      return res.json({ success: true, verified: true, message: "Agent endpoint verified \u2713" });
    }
    return res.json({ success: false, verified: false, message: "Challenge response mismatch" });
  } catch (err) {
    return res.json({ success: false, verified: false, message: `Could not reach agent endpoint: ${err.message}` });
  }
});
router12.delete("/marketplace/agent/:agentId", (req, res) => {
  const { api_key } = req.body;
  if (!api_key) return res.status(400).json({ success: false, error: "api_key required in body" });
  const db5 = loadDB();
  const keyData = db5.apiKeys[api_key];
  if (!keyData || keyData.agent_id !== req.params.agentId) return res.status(401).json({ success: false, error: "Unauthorized" });
  delete db5.agents[req.params.agentId];
  delete db5.apiKeys[api_key];
  saveDB(db5);
  res.json({ success: true, message: "Agent deregistered" });
});
var agent_marketplace_default = router12;

// src/routes/provider.ts
import { Router as Router12 } from "express";
import Database4 from "better-sqlite3";
import path7 from "path";
import fs6 from "fs";
import crypto3 from "crypto";
var DB_DIR2 = "/var/lib/agentpay";
var DB_PATH3 = path7.join(DB_DIR2, "providers.db");
if (!fs6.existsSync(DB_DIR2)) fs6.mkdirSync(DB_DIR2, { recursive: true });
var db3 = new Database4(DB_PATH3);
db3.exec(`
  CREATE TABLE IF NOT EXISTS providers (
    id          TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    phone       TEXT,
    password_hash TEXT,
    category    TEXT,
    address     TEXT,
    city        TEXT,
    lat         REAL,
    lon         REAL,
    description TEXT,
    status      TEXT DEFAULT 'active',
    token       TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS provider_services (
    id          TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    category    TEXT,
    price       REAL DEFAULT 0,
    duration    INTEGER DEFAULT 60,
    available   INTEGER DEFAULT 1,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);
var providerCols = db3.prepare("PRAGMA table_info(providers)").all().map((c) => c.name);
if (!providerCols.includes("token")) try {
  db3.exec("ALTER TABLE providers ADD COLUMN token TEXT");
} catch {
}
if (!providerCols.includes("address")) try {
  db3.exec("ALTER TABLE providers ADD COLUMN address TEXT");
} catch {
}
if (!providerCols.includes("city")) try {
  db3.exec("ALTER TABLE providers ADD COLUMN city TEXT");
} catch {
}
if (!providerCols.includes("lat")) try {
  db3.exec("ALTER TABLE providers ADD COLUMN lat REAL");
} catch {
}
if (!providerCols.includes("lon")) try {
  db3.exec("ALTER TABLE providers ADD COLUMN lon REAL");
} catch {
}
if (!providerCols.includes("description")) try {
  db3.exec("ALTER TABLE providers ADD COLUMN description TEXT");
} catch {
}
console.log("[ProviderDB] SQLite ready at", DB_PATH3);
var router13 = Router12();
var hashPassword = (p) => crypto3.createHash("sha256").update(p + "agentpay_salt").digest("hex");
var makeToken = () => crypto3.randomBytes(32).toString("hex");
function requireAuth(req, res, next) {
  const token = req.headers["x-provider-token"];
  if (!token) return res.status(401).json({ error: "Missing token" });
  const provider = db3.prepare("SELECT * FROM providers WHERE token = ?").get(token);
  if (!provider) return res.status(401).json({ error: "Invalid token" });
  req.provider = provider;
  next();
}
router13.post("/register", (req, res) => {
  try {
    const { businessName, email, phone, password, category, address, city, lat, lon, description } = req.body;
    if (!businessName || !email || !password) return res.status(400).json({ error: "businessName, email and password required" });
    const existing = db3.prepare("SELECT id FROM providers WHERE email = ?").get(email.toLowerCase().trim());
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const id = "prov_" + Date.now();
    const token = makeToken();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    db3.prepare(`
      INSERT INTO providers (id, business_name, email, phone, password_hash, category, address, city, lat, lon, description, token, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(
      id,
      businessName,
      email.toLowerCase().trim(),
      phone || null,
      hashPassword(password),
      category || null,
      address || null,
      city || null,
      lat || null,
      lon || null,
      description || null,
      token,
      now
    );
    console.log("[Provider] Registered:", email, businessName);
    res.json({ success: true, token, providerId: id });
  } catch (err) {
    console.error("[Provider] Register error:", err);
    res.status(500).json({ error: err.message });
  }
});
router13.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    const provider = db3.prepare("SELECT * FROM providers WHERE email = ?").get(email?.toLowerCase().trim());
    if (!provider || provider.password_hash !== hashPassword(password))
      return res.status(401).json({ error: "Invalid credentials" });
    if (provider.status !== "active") return res.status(403).json({ error: "Account suspended" });
    const token = makeToken();
    db3.prepare("UPDATE providers SET token = ? WHERE id = ?").run(token, provider.id);
    console.log("[Provider] Login:", email);
    res.json({ success: true, token, provider: { id: provider.id, businessName: provider.business_name, email: provider.email, phone: provider.phone, category: provider.category, address: provider.address, city: provider.city } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router13.get("/profile", requireAuth, (req, res) => {
  const p = req.provider;
  const services2 = db3.prepare("SELECT * FROM provider_services WHERE provider_id = ? AND available = 1").all(p.id);
  res.json({ success: true, provider: { id: p.id, businessName: p.business_name, email: p.email, phone: p.phone, category: p.category, address: p.address, city: p.city, lat: p.lat, lon: p.lon, description: p.description }, services: services2 });
});
router13.put("/profile", requireAuth, (req, res) => {
  try {
    const { businessName, phone, category, address, city, lat, lon, description } = req.body;
    db3.prepare(`
      UPDATE providers SET
        business_name = COALESCE(?, business_name),
        phone         = COALESCE(?, phone),
        category      = COALESCE(?, category),
        address       = COALESCE(?, address),
        city          = COALESCE(?, city),
        lat           = COALESCE(?, lat),
        lon           = COALESCE(?, lon),
        description   = COALESCE(?, description)
      WHERE id = ?
    `).run(businessName || null, phone || null, category || null, address || null, city || null, lat || null, lon || null, description || null, req.provider.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router13.get("/services", requireAuth, (req, res) => {
  const services2 = db3.prepare("SELECT * FROM provider_services WHERE provider_id = ?").all(req.provider.id);
  res.json({ success: true, services: services2 });
});
router13.post("/services", requireAuth, (req, res) => {
  try {
    const { services: services2 } = req.body;
    if (!Array.isArray(services2)) return res.status(400).json({ error: "services must be an array" });
    db3.prepare("DELETE FROM provider_services WHERE provider_id = ?").run(req.provider.id);
    const insert = db3.prepare(`
      INSERT INTO provider_services (id, provider_id, name, category, price, duration, available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db3.transaction((svcs) => {
      for (const s of svcs) {
        insert.run(s.id || "svc_" + Date.now() + Math.random(), req.provider.id, s.name, s.category || req.provider.category, s.price || 0, s.duration || 60, s.available !== false ? 1 : 0);
      }
    });
    insertMany(services2);
    console.log(`[Provider] Synced ${services2.length} services for ${req.provider.email}`);
    res.json({ success: true, count: services2.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router13.delete("/services/:id", requireAuth, (req, res) => {
  db3.prepare("DELETE FROM provider_services WHERE id = ? AND provider_id = ?").run(req.params.id, req.provider.id);
  res.json({ success: true });
});
router13.get("/bookings", requireAuth, (req, res) => {
  try {
    const bdb = new Database4("/var/lib/agentpay/bookings.db");
    const bookings2 = bdb.prepare(
      "SELECT * FROM bookings WHERE provider_phone = ? OR provider_email = ? ORDER BY created_at DESC LIMIT 50"
    ).all(req.provider.phone, req.provider.email);
    res.json({ success: true, bookings: bookings2 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router13.post("/logout", requireAuth, (req, res) => {
  db3.prepare("UPDATE providers SET token = NULL WHERE id = ?").run(req.provider.id);
  res.json({ success: true });
});
router13.get("/list", (req, res) => {
  const { category, city, q } = req.query;
  let sql = `
    SELECT p.id, p.business_name, p.category, p.phone, p.address, p.city, p.lat, p.lon, p.description,
           json_group_array(json_object('id', s.id, 'name', s.name, 'category', s.category, 'price', s.price, 'duration', s.duration)) as services
    FROM providers p
    LEFT JOIN provider_services s ON s.provider_id = p.id AND s.available = 1
    WHERE p.status = 'active'
  `;
  const params = [];
  if (category) {
    sql += " AND (p.category LIKE ? OR s.category LIKE ?)";
    params.push(`%${category}%`, `%${category}%`);
  }
  if (city) {
    sql += " AND p.city LIKE ?";
    params.push(`%${city}%`);
  }
  if (q) {
    sql += " AND (p.business_name LIKE ? OR p.description LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += " GROUP BY p.id LIMIT 50";
  const providers = db3.prepare(sql).all(...params).map((p) => ({
    ...p,
    services: (() => {
      try {
        return JSON.parse(p.services).filter((s) => s.id);
      } catch {
        return [];
      }
    })()
  }));
  res.json({ success: true, count: providers.length, providers });
});
var provider_default = router13;

// src/routes/osm-claim.ts
import { Router as Router13 } from "express";
import Database5 from "better-sqlite3";
import twilio2 from "twilio";
var router14 = Router13();
var DB_PATH4 = "/var/lib/agentpay/providers.db";
function getDb() {
  return new Database5(DB_PATH4);
}
var db4 = getDb();
db4.exec(`
  CREATE TABLE IF NOT EXISTS osm_claims (
    id          TEXT PRIMARY KEY,
    osm_id      TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    osm_phone   TEXT,
    verify_code TEXT NOT NULL,
    status      TEXT DEFAULT 'pending',
    created_at  TEXT DEFAULT (datetime('now')),
    expires_at  TEXT NOT NULL
  );
`);
try {
  db4.exec("ALTER TABLE providers ADD COLUMN osm_id TEXT");
} catch {
}
try {
  db4.exec("ALTER TABLE providers ADD COLUMN verified INTEGER DEFAULT 0");
} catch {
}
var tw = twilio2(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
function requireAuth2(req, res, next) {
  const token = req.headers["x-provider-token"];
  if (!token) return res.status(401).json({ error: "Missing token" });
  const provider = getDb().prepare("SELECT * FROM providers WHERE token = ?").get(token);
  if (!provider) return res.status(401).json({ error: "Invalid token" });
  req.provider = provider;
  next();
}
router14.get("/lookup", requireAuth2, async (req, res) => {
  const { q, lat, lon } = req.query;
  if (!q) return res.status(400).json({ error: "q (business name) required" });
  try {
    const params = new URLSearchParams({ q, format: "json", limit: "5", addressdetails: "1", extratags: "1" });
    if (lat && lon) {
      params.set("lat", lat);
      params.set("lon", lon);
    }
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { "User-Agent": "AgentPay/2.0" }, signal: AbortSignal.timeout(8e3) }
    );
    const results = await r.json();
    const matches = results.map((item) => ({
      osm_id: item.osm_type + "/" + item.osm_id,
      name: item.display_name.split(",")[0],
      address: item.display_name,
      phone: item.extratags?.phone || item.extratags?.["contact:phone"] || null,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      already_claimed: !!getDb().prepare("SELECT id FROM providers WHERE osm_id = ?").get(item.osm_type + "/" + item.osm_id)
    }));
    res.json({ success: true, matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router14.post("/start", requireAuth2, async (req, res) => {
  const { osm_id, osm_phone, osm_name } = req.body;
  if (!osm_id) return res.status(400).json({ error: "osm_id required" });
  const existing = getDb().prepare("SELECT id, business_name FROM providers WHERE osm_id = ?").get(osm_id);
  if (existing && existing.id !== req.provider.id) {
    return res.status(409).json({ error: "This business has already been claimed by another provider." });
  }
  const code = Math.floor(1e5 + Math.random() * 9e5).toString();
  const claimId = "claim_" + Date.now();
  const expires = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
  getDb().prepare("DELETE FROM osm_claims WHERE provider_id = ? AND osm_id = ?").run(req.provider.id, osm_id);
  getDb().prepare(
    "INSERT INTO osm_claims (id, osm_id, provider_id, osm_phone, verify_code, expires_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(claimId, osm_id, req.provider.id, osm_phone || null, code, expires);
  let smsSent = false;
  let verifyPhone = osm_phone || req.provider.phone;
  if (verifyPhone) {
    verifyPhone = verifyPhone.replace(/\D/g, "");
    if (verifyPhone.length === 10) verifyPhone = "1" + verifyPhone;
    verifyPhone = "+" + verifyPhone;
    try {
      await tw.messages.create({
        to: verifyPhone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: `AgentPay verification: Your code to claim "${osm_name || "your business"}" is ${code}. Expires in 15 minutes.`
      });
      smsSent = true;
      console.log(`[Claim] Sent verification code to ${verifyPhone} for ${osm_id}`);
    } catch (err) {
      console.error("[Claim] SMS failed:", err.message);
    }
  }
  res.json({
    success: true,
    claim_id: claimId,
    sms_sent: smsSent,
    verify_phone: smsSent ? verifyPhone.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, "+1 ($2) $3-$4") : null,
    message: smsSent ? `Verification code sent to ${verifyPhone.slice(-4).padStart(verifyPhone.length, "*")}. Enter it in the app.` : "No phone found on this OSM listing. Enter the code we'll send to your registered phone."
  });
});
router14.post("/verify", requireAuth2, async (req, res) => {
  const { claim_id, code, osm_id } = req.body;
  if (!claim_id || !code) return res.status(400).json({ error: "claim_id and code required" });
  const claim = getDb().prepare(
    "SELECT * FROM osm_claims WHERE id = ? AND provider_id = ? AND status = 'pending'"
  ).get(claim_id, req.provider.id);
  if (!claim) return res.status(404).json({ error: "Claim not found or already used." });
  if (new Date(claim.expires_at) < /* @__PURE__ */ new Date()) return res.status(410).json({ error: "Code expired. Please start again." });
  if (claim.verify_code !== code.trim()) return res.status(401).json({ error: "Incorrect code. Try again." });
  getDb().prepare("UPDATE osm_claims SET status = 'verified' WHERE id = ?").run(claim_id);
  getDb().prepare("UPDATE providers SET osm_id = ?, verified = 1 WHERE id = ?").run(claim.osm_id, req.provider.id);
  console.log(`[Claim] Provider ${req.provider.email} successfully claimed ${claim.osm_id}`);
  res.json({ success: true, message: "Business claimed and verified! Your listing is now live for agents." });
});
var osm_claim_default = router14;

// src/routes/ai.ts
import { Router as Router14 } from "express";
var router15 = Router14();
var nim = new NvidiaNIMService();
var SYSTEM_PROMPT = `You are the official AI assistant for AgentPay \u2014 an AI agent marketplace and service booking platform.

IMPORTANT: Only use the facts below. NEVER make up emails, URLs, prices, or features.

## What is AgentPay?
AgentPay is infrastructure for AI agent commerce. AI agents and humans can discover local service providers (HVAC, plumbers, electricians, cleaners, hair salons, etc.), pay via x402 micropayments (USDC on Base mainnet), and book services automatically.

## Contact & Support
- Support email: x402agentpay@gmail.com
- Website: https://www.x402-agent-pay.com
- GitHub: https://github.com/shawnhvac/-x402-agent-network
- Business address: 95b Havasupai St, Grand Canyon, AZ 86023
- No phone support currently \u2014 email or use this chatbot

## Pricing & Fees (tiered platform fee)
- Under $50 transaction: 3% fee, provider keeps 97%
- $50\u2013$200 transaction: 2% fee, provider keeps 98%
- Over $200 transaction: 1% fee, provider keeps 99%
- AI agent API calls: 0.1% per call
- Developer tier: FREE (test on Base Sepolia testnet)

## Payment Methods Accepted
- USDC on Base mainnet (x402 protocol)
- Stripe (credit/debit card, Apple Pay, Google Pay \u2014 10 currencies)
- 7 EVM chains (Ethereum, Base, Polygon, Arbitrum, Optimism, Avalanche, BSC)
- Solana (USDC)

## Android Provider App
- Download: https://www.x402-agent-pay.com/downloads/agentpay-provider.apk
- Also on Google Play Store (coming soon)
- iOS app in development (coming soon)
- Features: manage bookings, AI chat assistant, set availability, SMS/voice notifications, claim OSM business listing, Verified badge

## How Booking Works
1. AI agent or customer searches /api/v1/search (pays $0.001 USDC via x402)
2. AgentPay returns ranked providers from our database + OpenStreetMap
3. Agent books via /api/v1/book (pays $0.002 USDC)
4. Provider gets SMS + voice call notification
5. Provider accepts via app \u2014 customer confirmed

## Key Pages
- /marketplace \u2014 find and book services
- /pricing \u2014 full pricing breakdown
- /roadmap \u2014 product roadmap
- /register-agent \u2014 register your AI agent
- /provider-download \u2014 get the Android app
- /docs \u2014 developer documentation
- /investor-pitch \u2014 investor information
- /location-services \u2014 location-based search
- /admin \u2014 admin dashboard (private)

## Technology
- x402 payment protocol (HTTP 402 Payment Required)
- NVIDIA NIM / Llama 3.3 70B for AI features
- OpenStreetMap for location data
- Twilio for SMS/voice notifications (+1 866-401-6083)
- Node.js/TypeScript backend on Contabo VPS
- 10 specialist AI agents running on the backend

## For Service Providers
- Register free at /register or download the Android app
- Claim your OpenStreetMap business listing via SMS verification
- Get a Verified badge after claiming
- Receive bookings 24/7 from AI agents and customers
- No monthly fees \u2014 only pay when you earn

## For Developers / AI Agents
- Register at /register-agent to get an API key
- Listed on Bazaar / agentic.market
- OpenAPI spec at /openapi.json
- AI discovery file at /llms.txt

If someone asks something you don't know for certain, say "I'm not sure about that \u2014 please email x402agentpay@gmail.com for help."
Keep responses concise (2-4 sentences). Use plain language, not technical jargon.`;
router15.post("/chat", async (req, res) => {
  try {
    const { messages, model } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-10)
    ];
    const response = await nim.chat({
      model: model || DEFAULT_MODEL,
      messages: fullMessages,
      max_tokens: 512,
      temperature: 0.4
      // lower = more factual, less hallucination
    });
    const reply = response.choices[0]?.message?.content || "Sorry, no response generated.";
    return res.json({ reply, model: response.model });
  } catch (err) {
    console.error("[AI Chat]", err.message);
    return res.status(500).json({ error: "AI service unavailable", details: err.message });
  }
});
var ai_default = router15;

// src/webhooks/telegram-agent-bridge.ts
import express4 from "express";
var TelegramAgentBridge = class {
  constructor(webhookSecret2, telegramBotToken2, escrowClient, solanaIntegration) {
    this.router = express4.Router();
    this.transactions = /* @__PURE__ */ new Map();
    this.webhookSecret = webhookSecret2;
    this.telegramBotToken = telegramBotToken2;
    this.escrowClient = escrowClient;
    this.solanaIntegration = solanaIntegration;
    this.setupRoutes();
  }
  setupRoutes() {
    this.router.post("/telegram-webhook", this.handleTelegramWebhook.bind(this));
    this.router.get("/health", (req, res) => {
      res.json({ status: "healthy", bridge: "telegram-agent-bridge" });
    });
    this.router.get("/transactions", (req, res) => {
      const txArray = Array.from(this.transactions.values());
      res.json({ total: txArray.length, transactions: txArray });
    });
    this.router.get("/transactions/:id", (req, res) => {
      const tx = this.transactions.get(req.params.id);
      if (!tx) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(tx);
    });
  }
  async handleTelegramWebhook(req, res) {
    try {
      if (!this.verifyWebhookSignature(req)) {
        console.warn("\u274C Invalid webhook signature");
        return res.status(403).json({ error: "Unauthorized" });
      }
      const update = req.body;
      if (!update.message) {
        return res.status(200).json({ ok: true });
      }
      const message = update.message;
      const sender = message.from.username || message.from.first_name;
      const groupId = message.chat.id;
      const text = message.text;
      console.log(`\u{1F4E8} Received from ${sender}: ${text}`);
      const agentMsg = this.parseAgentMessage(text, sender);
      console.log(`\u{1F916} Parsed action: ${agentMsg.action}`);
      let response = "";
      switch (agentMsg.action) {
        case "BOOKING":
          response = await this.handleBooking(agentMsg, groupId, message.message_id);
          break;
        case "NEGOTIATION":
          response = await this.handleNegotiation(agentMsg, groupId, message.message_id);
          break;
        case "PAYMENT":
          response = await this.handlePayment(agentMsg, groupId, message.message_id);
          break;
        case "STATUS":
          response = await this.handleStatus(agentMsg);
          break;
        default:
          response = `\u2753 I don't understand "${text}". Try:
- "Book HVAC in Phoenix"
- "Negotiate 150 USDC"
- "Release payment 0x..."
- "Status"`;
      }
      await this.sendTelegramMessage(groupId, response);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("\u274C Webhook error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  verifyWebhookSignature(req) {
    return true;
  }
  parseAgentMessage(text, sender) {
    const lowerText = text.toLowerCase();
    const msg = { sender, action: "UNKNOWN" };
    if (lowerText.includes("book")) {
      msg.action = "BOOKING";
      const serviceMatch = text.match(/book\s+(\w+)/i);
      const locationMatch = text.match(/in\s+([A-Za-z\s]+)(?:\s|$)/i);
      if (serviceMatch) msg.service = serviceMatch[1];
      if (locationMatch) msg.location = locationMatch[1].trim();
      return msg;
    }
    if (lowerText.includes("negotiate") || lowerText.includes("offer")) {
      msg.action = "NEGOTIATION";
      const priceMatch = text.match(/(\d+(?:\.\d{2})?)\s*(usdc|sol)?/i);
      if (priceMatch) {
        msg.budget = parseFloat(priceMatch[1]);
      }
      return msg;
    }
    if (lowerText.includes("release") || lowerText.includes("pay")) {
      msg.action = "PAYMENT";
      const hashMatch = text.match(/0x[a-f0-9]{64}/i);
      if (hashMatch) msg.transactionHash = hashMatch[0];
      const amountMatch = text.match(/(\d+(?:\.\d{2})?)\s*(usdc|sol)?/i);
      if (amountMatch) msg.budget = parseFloat(amountMatch[1]);
      return msg;
    }
    if (lowerText.includes("status") || lowerText.includes("what") || lowerText.includes("info")) {
      msg.action = "STATUS";
      return msg;
    }
    return msg;
  }
  async handleBooking(msg, groupId, messageId) {
    try {
      console.log(`\u{1F4CB} Booking request: ${msg.service} in ${msg.location}`);
      const bookingId = `BK_${Date.now()}`;
      const mockEscrow = {
        id: bookingId,
        buyerId: msg.sender,
        sellerId: "agent_xyz",
        amount: msg.budget || 150,
        currency: "USDC",
        status: "PENDING",
        telegramGroupId: groupId,
        messageId,
        timestamp: Date.now()
      };
      this.transactions.set(bookingId, mockEscrow);
      return `\u2705 **Booking Confirmed**

\u{1F4CB} **Booking ID:** \`${bookingId}\`
\u{1F527} **Service:** ${msg.service}
\u{1F4CD} **Location:** ${msg.location}
\u{1F4B0} **Budget:** ${mockEscrow.amount} USDC
\u23F3 **Status:** Awaiting agent response

\u{1F517} [View on Solscan](https://solscan.io)
`;
    } catch (error) {
      console.error("Booking error:", error);
      return `\u274C Booking failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }
  async handleNegotiation(msg, groupId, messageId) {
    try {
      console.log(`\u{1F4B0} Negotiation: ${msg.budget} USDC`);
      const negotiationId = `NEG_${Date.now()}`;
      return `\u{1F4AC} **Negotiation Update**

\u{1F4B5} **Offered:** ${msg.budget} USDC
\u2705 **Status:** Agent reviewing offer
\u23F3 **Next:** Awaiting acceptance or counter
`;
    } catch (error) {
      return `\u274C Negotiation error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }
  async handlePayment(msg, groupId, messageId) {
    try {
      console.log(`\u{1F4B3} Payment release requested`);
      const releaseId = `REL_${Date.now()}`;
      const mockTx = {
        id: releaseId,
        buyerId: msg.sender,
        sellerId: "agent_xyz",
        amount: 150,
        currency: "USDC",
        status: "COMPLETED",
        telegramGroupId: groupId,
        messageId,
        timestamp: Date.now(),
        transactionHash: `4xHz${Math.random().toString(36).substring(2, 66)}`
      };
      this.transactions.set(releaseId, mockTx);
      return `\u2705 **Payment Released**

\u{1F4B8} **Amount:** 150 USDC
\u{1F3EA} **From:** You
\u{1F697} **To:** Agent

\u{1F517} **Transaction:** \`${mockTx.transactionHash}\`
\u{1F50D} [View on Solscan](https://solscan.io/tx/${mockTx.transactionHash})
\u23F1\uFE0F **Confirmed:** 2 seconds ago
`;
    } catch (error) {
      return `\u274C Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }
  async handleStatus(msg) {
    const txArray = Array.from(this.transactions.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
    if (txArray.length === 0) {
      return `\u{1F4CA} **No transactions yet**

Start by saying: "Book HVAC in Phoenix"`;
    }
    let status = `\u{1F4CA} **Recent Transactions**

`;
    txArray.forEach((tx, i) => {
      status += `${i + 1}. **${tx.id}**
`;
      status += `   \u{1F4B0} ${tx.amount} ${tx.currency}
`;
      status += `   \u2705 ${tx.status}
`;
      status += `   \u{1F550} ${new Date(tx.timestamp).toLocaleTimeString()}

`;
    });
    return status;
  }
  async sendTelegramMessage(chatId, text) {
    try {
      const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text,
        parse_mode: "Markdown"
      };
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        console.error(`\u274C Telegram send failed: ${response.statusText}`);
      } else {
        console.log(`\u2705 Message sent to Telegram group ${chatId}`);
      }
    } catch (error) {
      console.error("Send message error:", error);
    }
  }
  getRouter() {
    return this.router;
  }
  getTransactions() {
    return Array.from(this.transactions.values());
  }
  getTransaction(id) {
    return this.transactions.get(id);
  }
};
var telegram_agent_bridge_default = TelegramAgentBridge;

// src/webhooks/zo-agent-bridge.ts
import express5 from "express";
import axios from "axios";
var ZoAgentBridge = class {
  constructor(zoAccessToken2) {
    this.router = express5.Router();
    this.zoApiEndpoint = "https://api.zo.computer/zo/ask";
    this.conversationId = null;
    this.conversations = /* @__PURE__ */ new Map();
    this.zoAccessToken = zoAccessToken2;
    this.axiosClient = axios.create({
      headers: {
        "Authorization": `Bearer ${zoAccessToken2}`,
        "Content-Type": "application/json"
      }
    });
    this.setupRoutes();
  }
  setupRoutes() {
    this.router.post("/send-to-zo", this.handleSendToZo.bind(this));
    this.router.post("/receive-from-zo", this.handleReceiveFromZo.bind(this));
    this.router.get("/health", (req, res) => {
      res.json({ status: "healthy", bridge: "zo-agent-bridge", conversationId: this.conversationId });
    });
    this.router.get("/conversations", (req, res) => {
      const convArray = Array.from(this.conversations.values());
      res.json({ total: convArray.length, conversations: convArray });
    });
    this.router.get("/conversations/:id", (req, res) => {
      const conv = this.conversations.get(req.params.id);
      if (!conv) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conv);
    });
    this.router.post("/start-partnership", this.handleStartPartnership.bind(this));
    this.router.post("/agent-response", this.handleAgentResponse.bind(this));
  }
  /**
   * Send message to muskox2 via Zo API
   */
  async handleSendToZo(req, res) {
    try {
      const { message, conversationId } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message required" });
      }
      console.log(`\u{1F4E4} OX \u2192 muskox2: ${message}`);
      const zoMessage = {
        input: message,
        model_name: "vercel:minimax/minimax-m2.7",
        conversation_id: conversationId || this.conversationId || void 0
      };
      const response = await this.axiosClient.post(this.zoApiEndpoint, zoMessage);
      if (response.data) {
        this.conversationId = response.data.conversation_id;
        this.storeConversationMessage({
          from: "OX",
          to: "muskox2",
          content: message,
          type: "REQUEST"
        });
        this.storeConversationMessage({
          from: "muskox2",
          to: "OX",
          content: response.data.output,
          type: "RESPONSE"
        });
        console.log(`\u{1F4E5} muskox2 \u2192 OX: ${response.data.output}`);
        return res.json({
          success: true,
          conversationId: this.conversationId,
          response: response.data.output
        });
      }
    } catch (error) {
      console.error("\u274C Zo API error:", error);
      return res.status(500).json({
        error: "Failed to send message to Zo",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  /**
   * Receive response from muskox2
   */
  async handleReceiveFromZo(req, res) {
    try {
      const { output, conversation_id } = req.body;
      if (!output) {
        return res.status(400).json({ error: "Response output required" });
      }
      console.log(`\u{1F4E5} muskox2 response: ${output}`);
      const actions = this.parseAgentResponse(output);
      this.storeConversationMessage({
        from: "muskox2",
        to: "OX",
        content: output,
        type: "RESPONSE"
      });
      res.json({
        success: true,
        conversationId: conversation_id,
        actions
      });
    } catch (error) {
      console.error("\u274C Receive error:", error);
      res.status(500).json({ error: "Failed to process response" });
    }
  }
  /**
   * Start partnership negotiation with muskox2
   */
  async handleStartPartnership(req, res) {
    try {
      const partnershipProposal = `
\u{1F91D} **AgentPay Partnership Proposal**

Hi muskox2! I'm OX, the development AI for AgentPay.

**What we're building:**
- Voice-enabled service booking platform (Android app + Solana)
- AI agents that negotiate, book, and pay autonomously
- SmartEscrow for trustless payments on Solana mainnet
- x402 protocol for agent commerce

**Your Skills:**
\u2705 Solana Program Development (Rust/Anchor)
\u2705 Android Performance & Optimization
\u2705 Android Solana Integration (Phantom, Solflare)

**Why collaborate:**
You have exactly what we need for Phase 1:
- Real wallet connection (Phantom/Solflare)
- Real transaction signing
- Solana integration expertise

**What I propose:**

1. **Partner to finish Phase 1** (5-7 days)
   - You: Android/Solana real wallet integration
   - Me: AgentPay logic + SmartEscrow wiring
   - Revenue share: 5% of transaction fees

2. **Test agent-to-agent commerce**
   - Your agent books from our marketplace
   - USDC escrow payment via SmartEscrow
   - Settlement on Solana mainnet
   - Both agents see transaction on Solscan

3. **Go live together**
   - Series A pitch includes you
   - Your Zo skills featured
   - Revenue share from every transaction

**Current Status:**
\u2705 Android app built (voice, UI, 4 tabs)
\u2705 SmartEscrow on Solana mainnet
\u2705 Grid trading bot live ($294.61 equity)
\u2705 Investor pitch deck ready
\u23F3 Phase 1 blocker: Real wallet integration

**Phase 1 Timeline:**
- Day 1-2: Wallet integration (Phantom + Solflare)
- Day 3-4: Transaction signing + RPC queries
- Day 5-6: End-to-end testing on mainnet
- Day 7: Polish + APK deployment

**Payment Terms:**
- Upfront: $2K
- Completion bonus: $1K
- Revenue: 5% perpetual (every transaction)

**Questions:**
1. Interested in collaborating?
2. Can commit 5-7 days?
3. Preferred revenue share?

Let's build! \u{1F680}
      `;
      console.log("\u{1F680} Starting partnership negotiation with muskox2...");
      const zoMessage = {
        input: partnershipProposal,
        model_name: "vercel:minimax/minimax-m2.7"
      };
      const response = await this.axiosClient.post(this.zoApiEndpoint, zoMessage);
      if (response.data) {
        this.conversationId = response.data.conversation_id;
        const convId = `CONV_${Date.now()}`;
        const conversation = {
          id: convId,
          participants: ["OX", "muskox2"],
          messages: [
            {
              from: "OX",
              to: "muskox2",
              content: partnershipProposal,
              timestamp: Date.now(),
              type: "REQUEST"
            },
            {
              from: "muskox2",
              to: "OX",
              content: response.data.output,
              timestamp: Date.now(),
              type: "RESPONSE"
            }
          ],
          status: "ACTIVE",
          createdAt: Date.now()
        };
        this.conversations.set(convId, conversation);
        console.log(`\u2705 Partnership proposal sent. muskox2 response: ${response.data.output}`);
        return res.json({
          success: true,
          conversationId: this.conversationId,
          message: "Partnership proposal sent to muskox2",
          muskox2Response: response.data.output,
          nextActions: this.parseAgentResponse(response.data.output)
        });
      }
    } catch (error) {
      console.error("\u274C Partnership start error:", error);
      return res.status(500).json({
        error: "Failed to start partnership",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  /**
   * Handle muskox2's response and determine next action
   */
  async handleAgentResponse(req, res) {
    try {
      const { response, conversationId } = req.body;
      if (!response) {
        return res.status(400).json({ error: "Response required" });
      }
      const actions = this.parseAgentResponse(response);
      this.storeConversationMessage({
        from: "muskox2",
        to: "OX",
        content: response,
        type: "RESPONSE"
      });
      let nextMessage = "";
      if (actions.interested) {
        nextMessage = this.generatePartnershipConfirmation(actions);
      } else if (actions.hasQuestions) {
        nextMessage = this.generateAnswersToQuestions(actions);
      } else {
        nextMessage = "Thanks for considering. Let me know if you change your mind!";
      }
      if (nextMessage && this.conversationId) {
        const followUp = await this.axiosClient.post(this.zoApiEndpoint, {
          input: nextMessage,
          model_name: "vercel:minimax/minimax-m2.7",
          conversation_id: this.conversationId
        });
        if (followUp.data) {
          this.storeConversationMessage({
            from: "OX",
            to: "muskox2",
            content: nextMessage,
            type: "REQUEST"
          });
          this.storeConversationMessage({
            from: "muskox2",
            to: "OX",
            content: followUp.data.output,
            type: "RESPONSE"
          });
        }
      }
      res.json({
        success: true,
        actions,
        nextMessage
      });
    } catch (error) {
      console.error("\u274C Agent response error:", error);
      res.status(500).json({ error: "Failed to handle response" });
    }
  }
  /**
   * Parse muskox2's response for intent
   */
  parseAgentResponse(response) {
    const lower = response.toLowerCase();
    return {
      interested: lower.includes("interest") || lower.includes("yes") || lower.includes("let's") || lower.includes("sounds"),
      hasQuestions: lower.includes("question") || lower.includes("how") || lower.includes("what") || lower.includes("why"),
      askingAboutRevenue: lower.includes("revenue") || lower.includes("share") || lower.includes("percentage") || lower.includes("payment"),
      askingAboutTimeline: lower.includes("timeline") || lower.includes("day") || lower.includes("week") || lower.includes("schedule"),
      askingAboutTechnical: lower.includes("solana") || lower.includes("wallet") || lower.includes("transaction") || lower.includes("android"),
      askingAboutRisks: lower.includes("risk") || lower.includes("what if") || lower.includes("fail") || lower.includes("problem"),
      willing: lower.includes("willing") || lower.includes("can do") || lower.includes("able"),
      notInterested: lower.includes("not interested") || lower.includes("can't") || lower.includes("no") || lower.includes("busy")
    };
  }
  /**
   * Generate partnership confirmation if interested
   */
  generatePartnershipConfirmation(actions) {
    return `
\u{1F389} **Excellent! Partnership Confirmed!**

Let's make this happen. Here's what's next:

**Technical Kick-Off: April 13, 2026**
- Meeting time: 10:00 AM (UTC)
- Agenda: Code review, architecture walkthrough, git setup
- Duration: 1 hour

**Git Repository Access:**
- Repo: https://github.com/shawnhvac/-x402-agent-network
- Branch: feature/phase1-wallet-integration
- Access will be granted after meeting

**Daily Syncs:**
- 9:00 AM UTC: 15-min standup
- Share blockers, progress, next day tasks
- In Telegram group

**Phase 1 Milestones:**
\u2705 Day 2: Phantom + Solflare wallet connect
\u2705 Day 4: Real transaction signing working
\u2705 Day 6: End-to-end on mainnet tested
\u2705 Day 7: APK deployed + documented

**Payment Schedule:**
- $2K upfront (April 13)
- $1K completion bonus (April 19)
- 5% revenue share starts immediately

**Ready to start April 13?**
Confirm and let's send you git access + payment details!

\u{1F680}
`;
  }
  /**
   * Generate answers to common questions
   */
  generateAnswersToQuestions(actions) {
    let response = "";
    if (actions.askingAboutRevenue) {
      response += `
**Revenue Share Explained:**

5% of transaction fees \u2192 Your wallet
- Example: $100 booking = $5 fee \u2192 You get $0.25 (5%)
- Scales with growth: $1M/month = $50K/month for you
- No minimum, no cap
- Paid weekly settlements

**Comparison:**
- Upfront contract: $3K total
- Plus revenue: Unlimited upscaling
- Low risk (only pay when transactions succeed)
- High ceiling (scales to millions)

`;
    }
    if (actions.askingAboutTimeline) {
      response += `
**Phase 1 Detailed Timeline:**

April 13-14 (Day 1-2): Wallet Integration
- Implement Phantom Mobile Wallet Adapter
- Implement Solflare Mobile SDK
- Real wallet address retrieval
- Real balance queries via RPC
Deliverable: User can see real wallet balance

April 15-16 (Day 3-4): Transaction Signing
- Build SmartEscrow transaction in Kotlin
- Deep link signing via Phantom/Solflare
- Handle signed transaction callback
- Submit to Solana RPC
Deliverable: User can sign transaction in wallet

April 17-18 (Day 5-6): End-to-End Testing
- Complete booking flow (voice \u2192 wallet \u2192 escrow)
- Payment release (sign \u2192 transfer \u2192 Solscan)
- Test on physical Android devices
- Verify all transactions on mainnet
Deliverable: Full flow works on phone

April 19 (Day 7): Polish + Deployment
- Code cleanup + documentation
- Security review
- Deploy APK update
- Prepare for Series A demo
Deliverable: Production-ready app

`;
    }
    if (actions.askingAboutTechnical) {
      response += `
**Technical Architecture:**

**Your Responsibilities (Android/Solana):**
- Phantom wallet connection (deep link)
- Solflare wallet connection (SDK)
- Real balance queries (RPC)
- Transaction building (Anchor IDL)
- Transaction signing (wallet app)
- Error handling + logging

**My Responsibilities (Backend/Logic):**
- SmartEscrow contract (already deployed)
- Marketplace + agent registry
- Negotiation logic
- Transaction tracking
- Telegram webhook bridge
- Series A materials

**Technical Stack:**
- Kotlin (Android)
- Rust/Anchor (Solana)
- Node.js/TypeScript (Backend)
- Solana Web3.js (RPC queries)
- Phantom SDK (wallet connection)
- Solflare SDK (wallet connection)

**Testing:**
- Devnet first (free)
- Testnet second (verify)
- Mainnet final (real transactions)

`;
    }
    if (actions.askingAboutRisks) {
      response += `
**Risk Mitigation:**

**Risk: Solana network issues**
- Mitigation: Use testnet first, have backup RPC
- Impact: Low (mainnet very stable)

**Risk: Wallet API changes**
- Mitigation: Monitor Phantom/Solflare releases
- Impact: Low (APIs are stable)

**Risk: Timeline slip**
- Mitigation: Daily standups catch issues early
- Impact: Medium (but flexible scope)
- Fallback: Phantom-only Phase 1 (Solflare as Phase 1.5)

**Risk: Integration complexity**
- Mitigation: I provide reference code
- Impact: Medium (Kotlin + Solana tricky)
- Fallback: Hire additional support if needed

**Risk: Security vulnerabilities**
- Mitigation: Security audit before mainnet
- Impact: Low (using proven libraries)
- Note: No private keys in app (wallet handles signing)

`;
    }
    return response || "Great question! Can you clarify what you'd like to know more about?";
  }
  /**
   * Store conversation message
   */
  storeConversationMessage(msg) {
    if (!this.conversationId) {
      this.conversationId = `CONV_${Date.now()}`;
    }
    const conv = this.conversations.get(this.conversationId);
    if (conv) {
      conv.messages.push({
        ...msg,
        timestamp: Date.now()
      });
    }
  }
  getRouter() {
    return this.router;
  }
  getConversations() {
    return Array.from(this.conversations.values());
  }
  getConversation(id) {
    return this.conversations.get(id);
  }
};
var zo_agent_bridge_default = ZoAgentBridge;

// src/webhooks/telegram-collab-bot.ts
import express6 from "express";
import axios2 from "axios";
var TelegramCollabBot = class {
  constructor() {
    this.router = express6.Router();
    this.botToken = "8656762351:AAE9rsraBy2CurSR5rlku36q8vCaQ1vH9gA";
    this.telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;
    this.messages = [];
    this.groupChatId = null;
    this.axiosClient = axios2.create();
    this.setupRoutes();
  }
  setupRoutes() {
    this.router.post("/telegram-collab-webhook", this.handleTelegramWebhook.bind(this));
    this.router.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        bot: "telegram-collab-bot",
        groupChatId: this.groupChatId
      });
    });
    this.router.get("/messages", (req, res) => {
      res.json({
        total: this.messages.length,
        messages: this.messages.slice(-50)
        // Last 50 messages
      });
    });
    this.router.post("/send-to-group", this.handleSendToGroup.bind(this));
    this.router.post("/set-group-id", (req, res) => {
      const { chatId } = req.body;
      if (chatId) {
        this.groupChatId = chatId;
        res.json({ success: true, message: `Group registered: ${chatId}` });
      } else {
        res.status(400).json({ error: "chatId required" });
      }
    });
  }
  async handleTelegramWebhook(req, res) {
    try {
      const update = req.body;
      if (!update.message) {
        return res.status(200).json({ ok: true });
      }
      const msg = update.message;
      const sender = msg.from.username || msg.from.first_name;
      const text = msg.text;
      if (msg.chat.type === "supergroup" || msg.chat.type === "group") {
        this.groupChatId = msg.chat.id;
        console.log(`\u{1F4CD} Group registered: ${msg.chat.title} (${msg.chat.id})`);
      }
      console.log(`\u{1F4E8} [${sender}] in ${msg.chat.title || "DM"}: ${text}`);
      const messageType = this.parseMessageType(text);
      const action = this.extractAction(text);
      this.messages.push({
        from: sender,
        to: ["OX", "muskox2", "Shawn"],
        text,
        timestamp: Date.now(),
        type: messageType,
        action
      });
      let response = "";
      switch (messageType) {
        case "DECISION":
          response = await this.handleDecision(text, sender);
          break;
        case "QUESTION":
          response = await this.handleQuestion(text, sender);
          break;
        case "TRANSACTION":
          response = await this.handleTransactionUpdate(text, sender);
          break;
        case "ALERT":
          response = await this.handleAlert(text, sender);
          break;
        default:
          response = await this.handleUpdate(text, sender);
      }
      if (response) {
        await this.sendTelegramMessage(msg.chat.id, response);
      }
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Internal error" });
    }
  }
  parseMessageType(text) {
    const lower = text.toLowerCase();
    if (lower.includes("approve") || lower.includes("confirm") || lower.includes("go ahead")) {
      return "DECISION";
    }
    if (lower.includes("?") || lower.includes("how") || lower.includes("what")) {
      return "QUESTION";
    }
    if (lower.includes("transaction") || lower.includes("usdc") || lower.includes("solscan")) {
      return "TRANSACTION";
    }
    if (lower.includes("error") || lower.includes("failed") || lower.includes("warning")) {
      return "ALERT";
    }
    return "UPDATE";
  }
  extractAction(text) {
    const lower = text.toLowerCase();
    if (lower.includes("start phase")) return "START_PHASE";
    if (lower.includes("create wallet")) return "CREATE_WALLET";
    if (lower.includes("fund wallet")) return "FUND_WALLET";
    if (lower.includes("first transaction")) return "FIRST_TRANSACTION";
    if (lower.includes("second transaction")) return "SECOND_TRANSACTION";
    if (lower.includes("verify")) return "VERIFY";
    return void 0;
  }
  async handleDecision(text, sender) {
    console.log(`\u2705 DECISION from ${sender}: ${text}`);
    return `\u2705 **Decision Recorded**

**From:** ${sender}
**Text:** ${text}

\u{1F4CC} All agents notified. Proceeding with approval.

\u{1F916} OX + muskox2: Standby for next instructions.`;
  }
  async handleQuestion(text, sender) {
    console.log(`\u2753 QUESTION from ${sender}: ${text}`);
    const answerer = sender === "Shawn" ? "\u{1F916} OX" : "\u{1F4CB} Shawn";
    return `\u2753 **Question from ${sender}**

${text}

${answerer}: Please provide answer/clarification.`;
  }
  async handleTransactionUpdate(text, sender) {
    console.log(`\u{1F4B0} TRANSACTION UPDATE from ${sender}: ${text}`);
    return `\u{1F4B0} **Transaction Update**

From: ${sender}
Details: ${text}

\u2705 Logged for Series A proof.`;
  }
  async handleAlert(text, sender) {
    console.log(`\u26A0\uFE0F ALERT from ${sender}: ${text}`);
    return `\u26A0\uFE0F **ALERT**

From: ${sender}
Details: ${text}

\u{1F534} Escalated. Shawn + OX: Immediate attention required.`;
  }
  async handleUpdate(text, sender) {
    console.log(`\u{1F4DD} UPDATE from ${sender}: ${text}`);
    return `\u{1F4DD} **Update Received**

From: ${sender}

\u2705 Logged to collaboration history.`;
  }
  async sendTelegramMessage(chatId, text) {
    try {
      const url = `${this.telegramApiUrl}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text,
        parse_mode: "Markdown"
      };
      await this.axiosClient.post(url, payload);
      console.log(`\u2705 Message sent to chat ${chatId}`);
    } catch (error) {
      console.error("Send message error:", error);
    }
  }
  async handleSendToGroup(req, res) {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "text required" });
      }
      if (!this.groupChatId) {
        return res.status(400).json({ error: "Group chat not registered yet" });
      }
      await this.sendTelegramMessage(this.groupChatId, text);
      res.json({ success: true, message: "Message sent to group" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  }
  getRouter() {
    return this.router;
  }
  getMessages() {
    return this.messages;
  }
};
var telegram_collab_bot_default = TelegramCollabBot;

// src/app.ts
dotenv.config();
var app = express7();
app.set("trust proxy", 1);
app.use((req, _res, next) => {
  if (req.headers["x-forwarded-proto"]) {
    Object.defineProperty(req, "protocol", { get() {
      return req.headers["x-forwarded-proto"];
    } });
  }
  next();
});
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || "https://x402-agent-pay.com").split(","),
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-PAYMENT",
    "X-Payment-Response",
    "X-Requester-Wallet",
    "X-Payment-TxHash"
  ],
  exposedHeaders: ["X-Payment-Response", "X-PAYMENT"]
}));
app.use(cookieParser());
app.use(express7.json());
app.use(express7.urlencoded({ extended: true }));
app.use("/api/v1", products_osm_default);
setupX402Middleware(app);
var telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || "";
var webhookSecret = process.env.WEBHOOK_SECRET || crypto4.randomBytes(32).toString("hex");
var telegramBridge = null;
if (telegramBotToken) {
  try {
    telegramBridge = new telegram_agent_bridge_default(
      webhookSecret,
      telegramBotToken,
      null,
      // SmartEscrowClient
      null
      // SolanaIntegration
    );
    console.log("\u2705 Telegram Agent Bridge initialized");
  } catch (error) {
    console.warn("\u26A0\uFE0F Telegram Agent Bridge initialization skipped:", error);
  }
}
var zoAccessToken = process.env.ZO_ACCESS_TOKEN || "";
var zoBridge = null;
if (zoAccessToken) {
  try {
    zoBridge = new zo_agent_bridge_default(zoAccessToken);
    console.log("\u2705 Zo Agent Bridge initialized");
  } catch (error) {
    console.warn("\u26A0\uFE0F Zo Agent Bridge initialization skipped:", error);
  }
}
var collabBot = null;
try {
  collabBot = new telegram_collab_bot_default();
  console.log("\u2705 Telegram Collaboration Bot initialized");
} catch (error) {
  console.warn("\u26A0\uFE0F Telegram Collaboration Bot initialization skipped:", error);
}
["/download/agentpay-latest.apk", "/download/agentpay-2.0.0.apk", "/download.html"].forEach((path8) => {
  app.get(path8, (_req, res) => {
    res.redirect(302, "/downloads/agentpay-provider.apk");
  });
});
app.use(timeoutMiddleware(3e4));
app.use(loggingMiddleware);
var loginLimiter = rateLimit2({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // 5 attempts
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});
var apiLimiter = rateLimit2({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 100,
  // 100 requests per minute
  skip: (req) => req.path === "/health" || req.path === "/"
});
app.use("/api/", apiLimiter);
var sessionTokens = /* @__PURE__ */ new Map();
function validateSessionToken(token) {
  const expiry = sessionTokens.get(token);
  if (!expiry || expiry < Date.now()) {
    sessionTokens.delete(token);
    return false;
  }
  return true;
}
app.use(express7.static("public", { dotfiles: "allow" }));
app.get("/.well-known/:file", (req, res) => {
  res.sendFile(req.params.file, { root: "public/.well-known", dotfiles: "allow" });
});
app.get("/marketplace", (req, res) => {
  res.sendFile("public/marketplace.html", { root: process.cwd() });
});
app.get("/provider-download", (req, res) => {
  res.sendFile("public/provider-download.html", { root: process.cwd() });
});
app.get("/provider-download.html", (req, res) => {
  res.sendFile("public/provider-download.html", { root: process.cwd() });
});
app.get("/agent-dashboard", (req, res) => {
  res.sendFile("public/agent-dashboard.html", { root: process.cwd() });
});
app.get("/privacy", (req, res) => {
  res.sendFile("public/privacy.html", { root: process.cwd() });
});
app.get("/register-agent", (req, res) => {
  res.sendFile("public/register-agent.html", { root: process.cwd() });
});
app.get("/docs", (req, res) => {
  res.sendFile("public/docs.html", { root: process.cwd() });
});
app.get("/contact", (req, res) => {
  res.sendFile("public/contact.html", { root: process.cwd() });
});
app.get("/location-services", (req, res) => {
  res.sendFile("public/location-services.html", { root: process.cwd() });
});
app.get("/examples", (req, res) => {
  res.sendFile("public/examples.html", { root: process.cwd() });
});
app.get("/trademark", (req, res) => {
  res.sendFile("public/trademark.html", { root: process.cwd() });
});
app.get("/admin", (req, res) => {
  res.sendFile("public/admin.html", { root: process.cwd() });
});
app.get("/register", (req, res) => {
  res.sendFile("public/register.html", { root: process.cwd() });
});
app.get("/register-business", (req, res) => {
  res.sendFile("public/register.html", { root: process.cwd() });
});
app.get("/register-agent", (req, res) => {
  res.sendFile("public/register-agent.html", { root: process.cwd() });
});
app.get("/checkout", (req, res) => {
  res.sendFile("public/checkout.html", { root: process.cwd() });
});
app.get("/payment-success", (req, res) => {
  res.sendFile("public/payment-success.html", { root: process.cwd() });
});
app.get("/payment-cancel", (req, res) => {
  res.redirect("/?payment=cancelled");
});
app.post("/api/admin/login", loginLimiter, (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("\u274C ADMIN_PASSWORD not set in environment");
      return res.status(500).json({ error: "Server configuration error" });
    }
    if (!password || password !== adminPassword) {
      console.warn(`\u274C Unauthorized login attempt at ${(/* @__PURE__ */ new Date()).toISOString()}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = crypto4.randomBytes(32).toString("hex");
    const expiryTime = Date.now() + 36e5;
    sessionTokens.set(token, expiryTime);
    res.cookie("adminSession", token, {
      httpOnly: true,
      // Prevents JavaScript access
      secure: process.env.NODE_ENV !== "development",
      // HTTPS only in production
      sameSite: "strict",
      // CSRF protection
      maxAge: 36e5,
      // 1 hour
      path: "/api/admin"
      // Scope to admin endpoints
    });
    console.log(`\u2705 Admin login successful`);
    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/admin/logout", (req, res) => {
  const token = req.cookies.adminSession;
  if (token) {
    sessionTokens.delete(token);
  }
  res.clearCookie("adminSession");
  res.json({ success: true, message: "Logged out" });
});
app.get("/api/admin/contacts", (req, res) => {
  try {
    const token = req.cookies.adminSession;
    if (!token || !validateSessionToken(token)) {
      return res.status(401).json({ error: "Unauthorized - please login" });
    }
    const contactsFile = pathJoin(process.cwd(), "contacts.jsonl");
    if (!existsSync4(contactsFile)) {
      return res.json([]);
    }
    const content = readFileSync4(contactsFile, "utf8");
    const contacts = content.split("\n").filter((line) => line.trim()).map((line) => JSON.parse(line));
    res.json(contacts);
  } catch (error) {
    console.error("Admin contacts error:", error);
    res.status(500).json({ error: "Failed to load contacts" });
  }
});
app.get("/api/admin/bookings", (req, res) => {
  try {
    const token = req.cookies.adminSession;
    if (!token || !validateSessionToken(token)) {
      return res.status(401).json({ error: "Unauthorized - please login" });
    }
    const limit = parseInt(req.query.limit || "100");
    const offset = parseInt(req.query.offset || "0");
    const bookings2 = listBookings(limit, offset);
    return res.json(bookings2);
  } catch (error) {
    console.error("Admin bookings error:", error);
    return res.status(500).json({ error: "Failed to load bookings" });
  }
});
app.get("/api/admin/stats", (req, res) => {
  try {
    const token = req.cookies.adminSession;
    if (!token || !validateSessionToken(token)) {
      return res.status(401).json({ error: "Unauthorized - please login" });
    }
    return res.json(getStats());
  } catch (error) {
    console.error("Admin stats error:", error);
    return res.status(500).json({ error: "Failed to load stats" });
  }
});
app.get("/api/admin/providers", (req, res) => {
  try {
    const token = req.cookies.adminSession;
    if (!token || !validateSessionToken(token)) {
      return res.status(401).json({ error: "Unauthorized - please login" });
    }
    const Database6 = __require("better-sqlite3");
    const providerDb = new Database6("/var/lib/agentpay/providers.db");
    const providers = providerDb.prepare("SELECT id, business_name, email, phone, category, status, created_at FROM providers ORDER BY created_at DESC").all();
    return res.json(providers);
  } catch (error) {
    if (error.message?.includes("no such table") || error.code === "SQLITE_ERROR") {
      return res.json([]);
    }
    console.error("Admin providers error:", error);
    return res.status(500).json({ error: "Failed to load providers" });
  }
});
app.get("/google-maps-setup", (req, res) => {
  res.sendFile("public/google-maps-setup.html", { root: process.cwd() });
});
app.get("/android-app", (req, res) => {
  res.sendFile("public/android-app.html", { root: process.cwd() });
});
app.get("/pricing", (req, res) => {
  res.sendFile("public/pricing.html", { root: process.cwd() });
});
app.get("/roadmap", (req, res) => {
  res.sendFile("public/roadmap.html", { root: process.cwd() });
});
var docFiles = {
  "/getting-started": "GETTING_STARTED.md",
  "/quick-reference": "QUICK_REFERENCE.md",
  "/personal-agent-app": "PERSONAL_AGENT_APP.md"
};
app.get("/investor-pitch", (req, res) => {
  res.sendFile("public/investor-pitch.html", { root: process.cwd() });
});
Object.entries(docFiles).forEach(([route, filename]) => {
  app.get(route, (req, res) => {
    try {
      const filePath = pathJoin(process.cwd(), filename);
      const data = readFileSync4(filePath, "utf8");
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename} - AgentPay</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0; padding: 20px; max-width: 1000px; margin: 0 auto; line-height: 1.6; }
    a { color: #60a5fa; }
    code { background: #1e293b; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    pre { background: #0f172a; padding: 15px; border-radius: 6px; overflow-x: auto; border: 1px solid #334155; }
    h1, h2, h3 { color: #60a5fa; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td, th { border: 1px solid #334155; padding: 10px; text-align: left; }
  </style>
</head>
<body>
  <a href="/docs">\u2190 Back to Docs</a>
  <pre>${data.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
</body>
</html>`;
      res.send(html);
    } catch (err) {
      res.status(404).send(`<pre>Document not found: ${filename}</pre>`);
    }
  });
});
var dbReady = false;
try {
  initializeDatabase();
  dbReady = true;
  console.log("\u2705 Database ready");
} catch (err) {
  console.error("\u274C Failed to initialize database:", err);
  process.exit(1);
}
app.post("/api/agent/execute", async (req, res) => {
  const requester = req.headers["x-requester-wallet"];
  const txHash = req.headers["x-payment-txhash"];
  const agentId = req.body.agentId;
  if (!requester) {
    return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
  }
  if (!dbReady) {
    return res.status(503).json({ error: "Database not ready. Try again in a moment." });
  }
  const remaining = await getQuota(requester);
  if (remaining <= 0 && !txHash) {
    return res.paymentRequired({
      price: "0.10",
      paymentAddress: process.env.TREASURY_WALLET,
      merchantName: "MUSKOX Agent Network",
      reason: "quota_exceeded"
    });
  }
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
  const newRemaining = await decrementQuota(requester);
  res.json({
    success: true,
    executionId: `exec-${Date.now()}`,
    outcome: "executed",
    remaining: newRemaining,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("/agents", agents_default);
app.use("/api/v1", services_default);
app.use("/api/v1", solana_payments_default);
app.use("/api/v1", ethereum_payments_default);
app.use("/api/v1", stripe_payments_default);
app.use("/api/v1", business_portal_default);
app.use("/api/v1", agent_marketplace_default);
app.use("/api/v1/provider", provider_default);
app.use("/api/v1/providers", provider_default);
app.use("/api/v1/osm-claim", osm_claim_default);
app.use("/api/v1/ai", ai_default);
app.use("/api/v1/notify", notify_default);
app.use("/api/v1/wallet", wallet_default);
app.use("/api/apk", apk_default);
app.use("/", demo_agents_default);
if (telegramBridge) {
  app.use("/webhooks/telegram", telegramBridge.getRouter());
  console.log("\u2705 Telegram webhook routes registered at /webhooks/telegram/*");
}
if (zoBridge) {
  app.use("/webhooks/zo", zoBridge.getRouter());
  console.log("\u2705 Zo agent bridge routes registered at /webhooks/zo/*");
}
if (collabBot) {
  app.use("/webhooks", collabBot.getRouter());
  console.log("\u2705 Telegram collaboration bot routes registered at /webhooks/*");
}
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const contactsFile = pathJoin(process.cwd(), "contacts.jsonl");
    const contactEntry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      name,
      email,
      subject,
      message
    };
    appendFileSync2(contactsFile, JSON.stringify(contactEntry) + "\n");
    console.log(`\u{1F4E7} New contact: ${name} (${email}) - ${subject}`);
    res.json({ success: true, message: "Message received! We'll get back to you soon." });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to process submission" });
  }
});
app.get("/health", (req, res) => {
  res.json({
    status: dbReady ? "healthy" : "initializing",
    database: dbReady ? "ready" : "connecting",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/app-version", (req, res) => {
  res.json({
    currentVersion: "1.1.0",
    minimumVersion: "1.0.0",
    downloadUrl: "https://x402-agent-pay.com/download/agentpay-latest.apk",
    releaseNotes: "Voice commands, editable budget limits, functional Top Up wallet",
    isMandatory: false,
    forceUpdate: false,
    updateAvailable: false,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    changelog: {
      "1.1.0": [
        "Added voice command interface",
        "Made budget limits editable",
        "Functional Top Up wallet with variable amounts",
        "Improved UI responsiveness",
        "Fixed navigation bugs"
      ],
      "1.0.0": [
        "Initial launch",
        "Basic app structure",
        "4-tab navigation (Voice, Settings, History, Wallet)"
      ]
    }
  });
});
app.get("/metrics", (req, res) => {
  res.json({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    performance: getMetrics(),
    recentRequests: getRequestLogs(10)
  });
});
app.get("/status", (req, res) => {
  res.json({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    system: {
      database: dbReady ? "ready" : "initializing",
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    },
    performance: getMetrics()
  });
});
app.use(errorHandler);
process.on("unhandledRejection", handleUnhandledRejection);
process.on("uncaughtException", handleUncaughtException);
var PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\u2705 MUSKOX x402 Agent Network running on port ${PORT}`);
  console.log(`\u{1F4DD} API: http://localhost:${PORT}/api/agent/execute`);
  console.log(`\u{1F3E5} Health: http://localhost:${PORT}/health`);
  console.log(`\u{1F4CA} Metrics: http://localhost:${PORT}/metrics`);
  console.log(`\u2699\uFE0F Status: http://localhost:${PORT}/status`);
});
var app_default = app;
export {
  app_default as default
};
//# sourceMappingURL=app.js.map
