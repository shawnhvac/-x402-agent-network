/**
 * app.ts - Main Express application
 * WEEK 1: Basic x402 flow + agent registry
 */
import express from "express";
import dotenv from "dotenv";
import { x402Middleware } from "./middleware/x402.js";
import { initializeDatabase, getQuota, decrementQuota, recordPayment } from "./db-sqlite.js";
import { loggingMiddleware, getRequestLogs, getMetrics } from "./middleware/logging.js";
import { errorHandler, handleUnhandledRejection, handleUncaughtException, timeoutMiddleware } from "./middleware/errorHandler.js";
import agentRoutes from "./routes/agents.js";
import demoAgentRoutes from "./routes/demo-agents.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(timeoutMiddleware(30000)); // 30 second timeout
app.use(loggingMiddleware); // Log all requests
app.use(x402Middleware);
// Serve static files (landing page)
app.use(express.static("public"));
// Marketplace and Dashboard routes
// Serve specific HTML pages without .html extension
app.get("/marketplace", (req, res) => {
    res.sendFile("public/marketplace.html", { root: process.cwd() });
});
app.get("/agent-dashboard", (req, res) => {
    res.sendFile("public/agent-dashboard.html", { root: process.cwd() });
});
app.get("/docs", (req, res) => {
    res.sendFile("public/docs.html", { root: process.cwd() });
});
app.get("/contact", (req, res) => {
    res.sendFile("public/contact.html", { root: process.cwd() });
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
/**
 * Admin API - Get all contacts
 */
app.get("/api/admin/contacts", (req, res) => {
    try {
        // Simple session check (in production, use proper JWT/sessions)
        if (req.headers['x-admin-session'] !== 'true') {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const contactsFile = pathJoin(process.cwd(), 'contacts.jsonl');
        if (!existsSync(contactsFile)) {
            return res.json([]);
        }
        const content = readFileSync(contactsFile, 'utf8');
        const contacts = content
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => JSON.parse(line));
        res.json(contacts);
    }
    catch (error) {
        console.error("Admin contacts error:", error);
        res.status(500).json({ error: "Failed to load contacts" });
    }
});
// Documentation markdown files served as HTML
import { readFileSync } from 'fs';
import { join } from 'path';
const docFiles = {
    '/getting-started': 'GETTING_STARTED.md',
    '/quick-reference': 'QUICK_REFERENCE.md',
    '/pricing': 'PRICING.md',
    '/roadmap': 'ROADMAP.md',
    '/investor-pitch': 'INVESTOR_PITCH.md',
    '/personal-agent-app': 'PERSONAL_AGENT_APP.md',
    '/android-app': 'ANDROID_APP_BUILD.md',
    '/google-maps-setup': 'GOOGLE_MAPS_SETUP.md'
};
Object.entries(docFiles).forEach(([route, filename]) => {
    app.get(route, (req, res) => {
        try {
            const filePath = join(process.cwd(), filename);
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
        }
        catch (err) {
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
}
catch (err) {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
}
/**
 * DAYS 1-2: Basic x402 flow
 * DAYS 3-4: Using PostgreSQL quotas
 */
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
    // Get current quota from database
    const remaining = await getQuota(requester);
    if (remaining <= 0 && !txHash) {
        // Return HTTP 402 Payment Required
        return res.paymentRequired({
            price: "0.10",
            paymentAddress: process.env.TREASURY_WALLET,
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
// Import at top
import { appendFileSync, existsSync } from 'fs';
import { join as pathJoin } from 'path';
/**
 * Contact form endpoint - Save to file
 */
app.post("/api/contact", async (req, res) => {
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
    }
    catch (error) {
        console.error("Contact form error:", error);
        res.status(500).json({ error: "Failed to process submission" });
    }
});
/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
    res.json({
        status: dbReady ? "healthy" : "initializing",
        database: dbReady ? "ready" : "connecting",
        timestamp: new Date().toISOString()
    });
});
/**
 * Metrics endpoint - Performance monitoring
 */
app.get("/metrics", (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        performance: getMetrics(),
        recentRequests: getRequestLogs(10),
    });
});
/**
 * Status endpoint - Full system status
 */
app.get("/status", (req, res) => {
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
//# sourceMappingURL=app.js.map