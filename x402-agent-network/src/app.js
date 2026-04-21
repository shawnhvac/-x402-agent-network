/**
 * app.ts - Main Express application
 * WEEK 1: Basic x402 flow + agent registry
 */
import express from "express";
import dotenv from "dotenv";
import { x402Middleware, paymentRequired } from "./middleware/x402.js";
import { initializeDatabase, getQuota, decrementQuota, recordPayment } from "./db-sqlite.js";
import agentRoutes from "./routes/agents.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(x402Middleware);
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
 * Start server
 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ MUSKOX x402 Agent Network running on port ${PORT}`);
    console.log(`📝 API: http://localhost:${PORT}/api/agent/execute`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
});
export default app;
//# sourceMappingURL=app.js.map