/**
 * app.ts - Main Express application
 * WEEK 1: Basic x402 flow + agent registry
 */

import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { readFileSync, appendFileSync, existsSync, createReadStream } from 'fs';
import { join as pathJoin } from 'path';
import { x402Middleware, paymentRequired, type PaymentRequiredOptions } from "./middleware/x402.js";
import { initializeDatabase, getQuota, decrementQuota, recordPayment } from "./db-sqlite.js";
import { loggingMiddleware, getRequestLogs, getMetrics } from "./middleware/logging.js";
import { errorHandler, handleUnhandledRejection, handleUncaughtException, timeoutMiddleware } from "./middleware/errorHandler.js";
import agentRoutes from "./routes/agents.js";
import demoAgentRoutes from "./routes/demo-agents.js";
import apkRoutes from "./routes/apk.js";
import TelegramAgentBridge from "./webhooks/telegram-agent-bridge.js";
import ZoAgentBridge from "./webhooks/zo-agent-bridge.js";
import TelegramCollabBot from "./webhooks/telegram-collab-bot.js";

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

// ✅ SECURITY: CORS Protection
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'https://x402-agent-pay.com').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ SECURITY: Cookie Parser for HttpOnly cookies
app.use(cookieParser());

// ✅ Initialize Telegram Agent Bridge
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
const webhookSecret = process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex');

let telegramBridge: TelegramAgentBridge | null = null;
if (telegramBotToken) {
  try {
    // Placeholder for SmartEscrow and Solana clients (would initialize in real deployment)
    telegramBridge = new TelegramAgentBridge(
      webhookSecret,
      telegramBotToken,
      null as any, // SmartEscrowClient
      null as any  // SolanaIntegration
    );
    console.log('✅ Telegram Agent Bridge initialized');
  } catch (error) {
    console.warn('⚠️ Telegram Agent Bridge initialization skipped:', error);
  }
}

// ✅ Initialize Zo Agent Bridge (direct agent-to-agent communication)
const zoAccessToken = process.env.ZO_ACCESS_TOKEN || '';
let zoBridge: ZoAgentBridge | null = null;
if (zoAccessToken) {
  try {
    zoBridge = new ZoAgentBridge(zoAccessToken);
    console.log('✅ Zo Agent Bridge initialized');
  } catch (error) {
    console.warn('⚠️ Zo Agent Bridge initialization skipped:', error);
  }
}

// ✅ Initialize Telegram Collaboration Bot
let collabBot: TelegramCollabBot | null = null;
try {
  collabBot = new TelegramCollabBot();
  console.log('✅ Telegram Collaboration Bot initialized');
} catch (error) {
  console.warn('⚠️ Telegram Collaboration Bot initialization skipped:', error);
}

// APK Download endpoint - BEFORE middleware to avoid being blocked
app.get("/download/agentpay-latest.apk", (req: Request, res: Response) => {
  const apkPath = pathJoin(process.cwd(), "public", "apk", "agentpay-latest.apk");
  
  if (!existsSync(apkPath)) {
    return res.status(404).json({ 
      status: "coming-soon",
      message: "Android APK coming soon!"
    });
  }
  
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="agentpay.apk"');
  createReadStream(apkPath).pipe(res);
});

app.use(express.json());
app.use(timeoutMiddleware(30000)); // 30 second timeout
app.use(loggingMiddleware); // Log all requests
app.use(x402Middleware);

// ✅ SECURITY: Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ SECURITY: Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  skip: (req) => req.path === '/health' || req.path === '/',
});

app.use('/api/', apiLimiter);

// ✅ SECURITY: Session token storage (in-memory for this deployment)
const sessionTokens = new Map<string, number>();

// ✅ SECURITY: Validate session token
function validateSessionToken(token: string): boolean {
  const expiry = sessionTokens.get(token);
  if (!expiry || expiry < Date.now()) {
    sessionTokens.delete(token);
    return false;
  }
  return true;
}

// Serve static files (landing page)
app.use(express.static("public"));

// Marketplace and Dashboard routes
// Serve specific HTML pages without .html extension
app.get("/marketplace", (req: Request, res: Response) => {
  res.sendFile("public/marketplace.html", { root: process.cwd() });
});

app.get("/agent-dashboard", (req: Request, res: Response) => {
  res.sendFile("public/agent-dashboard.html", { root: process.cwd() });
});

app.get("/docs", (req: Request, res: Response) => {
  res.sendFile("public/docs.html", { root: process.cwd() });
});

app.get("/contact", (req: Request, res: Response) => {
  res.sendFile("public/contact.html", { root: process.cwd() });
});

app.get("/examples", (req: Request, res: Response) => {
  res.sendFile("public/examples.html", { root: process.cwd() });
});

app.get("/trademark", (req: Request, res: Response) => {
  res.sendFile("public/trademark.html", { root: process.cwd() });
});

app.get("/admin", (req: Request, res: Response) => {
  res.sendFile("public/admin.html", { root: process.cwd() });
});

/**
 * ✅ SECURITY: Admin Login Endpoint
 * Validates password, creates secure HttpOnly session cookie
 */
app.post("/api/admin/login", loginLimiter, (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("❌ ADMIN_PASSWORD not set in environment");
      return res.status(500).json({ error: "Server configuration error" });
    }

    if (!password || password !== adminPassword) {
      console.warn(`❌ Unauthorized login attempt at ${new Date().toISOString()}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ SECURITY: Create secure session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiryTime = Date.now() + 3600000; // 1 hour
    sessionTokens.set(token, expiryTime);

    // ✅ SECURITY: Set HttpOnly cookie (cannot be accessed by JavaScript)
    res.cookie('adminSession', token, {
      httpOnly: true,              // Prevents JavaScript access
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',          // CSRF protection
      maxAge: 3600000,             // 1 hour
      path: '/api/admin'           // Scope to admin endpoints
    });

    console.log(`✅ Admin login successful`);
    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ✅ SECURITY: Admin Logout Endpoint
 * Clears session token and cookie
 */
app.post("/api/admin/logout", (req: Request, res: Response) => {
  const token = req.cookies.adminSession;
  if (token) {
    sessionTokens.delete(token);
  }
  res.clearCookie('adminSession');
  res.json({ success: true, message: 'Logged out' });
});

/**
 * ✅ SECURITY: Admin API - Get all contacts
 * Validates secure session token from HttpOnly cookie
 */
app.get("/api/admin/contacts", (req: Request, res: Response) => {
  try {
    // ✅ SECURITY: Validate session token from secure HttpOnly cookie
    const token = req.cookies.adminSession;
    
    if (!token || !validateSessionToken(token)) {
      return res.status(401).json({ error: "Unauthorized - please login" });
    }

    const contactsFile = pathJoin(process.cwd(), 'contacts.jsonl');
    
    if (!existsSync(contactsFile)) {
      return res.json([]);
    }

    const content = readFileSync(contactsFile, 'utf8');
    const contacts = content
      .split('\n')
      .filter((line: string) => line.trim())
      .map((line: string) => JSON.parse(line));

    res.json(contacts);
  } catch (error) {
    console.error("Admin contacts error:", error);
    res.status(500).json({ error: "Failed to load contacts" });
  }
});

// Documentation markdown files served as HTML

const docFiles = {
  '/getting-started': 'GETTING_STARTED.md',
  '/quick-reference': 'QUICK_REFERENCE.md',
  '/pricing': 'PRICING.md',
  '/roadmap': 'ROADMAP.md',
  '/personal-agent-app': 'PERSONAL_AGENT_APP.md',
  '/android-app': 'ANDROID_APP_BUILD.md',
  '/google-maps-setup': 'GOOGLE_MAPS_SETUP.md'
};

// Special: investor-pitch served as HTML, not markdown
app.get('/investor-pitch', (req: Request, res: Response) => {
  res.sendFile('public/investor-pitch.html', { root: process.cwd() });
});

Object.entries(docFiles).forEach(([route, filename]) => {
  app.get(route, (req: Request, res: Response) => {
    try {
      const filePath = pathJoin(process.cwd(), filename);
      const data = readFileSync(filePath, 'utf8');
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
  <a href="/docs">← Back to Docs</a>
  <pre>${data.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
      res.send(html);
    } catch (err) {
      res.status(404).send(`<pre>Document not found: ${filename}</pre>`);
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
 * APK Download & Status Routes
 */
app.use("/api/apk", apkRoutes);

/**
 * DAYS 5-7: Demo Agent Endpoints (Grid Trader + Sniper Bot)
 */
app.use("/", demoAgentRoutes);

/**
 * Telegram Agent Bridge - Webhook for agent-to-agent communication
 */
if (telegramBridge) {
  app.use("/webhooks/telegram", telegramBridge.getRouter());
  console.log('✅ Telegram webhook routes registered at /webhooks/telegram/*');
}

/**
 * Zo Agent Bridge - Direct agent-to-agent communication
 */
if (zoBridge) {
  app.use("/webhooks/zo", zoBridge.getRouter());
  console.log('✅ Zo agent bridge routes registered at /webhooks/zo/*');
}

/**
 * Telegram Collaboration Bot - 3-Way Agent Communication
 */
if (collabBot) {
  app.use("/webhooks", collabBot.getRouter());
  console.log('✅ Telegram collaboration bot routes registered at /webhooks/*');
}

/**
 * Contact form endpoint - Save to file
 */
app.post("/api/contact", async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Save to contacts file
    const contactsFile = pathJoin(process.cwd(), 'contacts.jsonl');
    const contactEntry = {
      timestamp: new Date().toISOString(),
      name,
      email,
      subject,
      message
    };
    
    appendFileSync(contactsFile, JSON.stringify(contactEntry) + '\n');
    console.log(`📧 New contact: ${name} (${email}) - ${subject}`);
    
    res.json({ success: true, message: "Message received! We'll get back to you soon." });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to process submission" });
  }
});

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
 * App version check endpoint (for in-app updates)
 * Mobile apps call this to check if a new version is available
 */
app.get("/api/app-version", (req: Request, res: Response) => {
  res.json({
    currentVersion: "1.1.0",
    minimumVersion: "1.0.0",
    downloadUrl: "https://x402-agent-pay.com/download/agentpay-latest.apk",
    releaseNotes: "Voice commands, editable budget limits, functional Top Up wallet",
    isMandatory: false,
    forceUpdate: false,
    updateAvailable: false,
    lastUpdated: new Date().toISOString(),
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
