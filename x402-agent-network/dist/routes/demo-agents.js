/**
 * routes/demo-agents.ts - Demo Agent Endpoints
 * Grid Trader + Sniper Bot agents with x402 payment protection
 */
import { Router } from "express";
import { gridTrader } from "../agents/grid-trader.js";
import { sniperBot } from "../agents/sniper-bot.js";
import { llmInference } from "../agents/llm-inference.js";
import { dataFeed } from "../agents/data-feed.js";
import { getQuota, decrementQuota, recordPayment } from "../db-sqlite.js";
const router = Router();
/**
 * POST /grid-trader - Grid Trading Agent
 * Protected by x402: 0.10 USDC per execution
 */
router.post("/grid-trader", async (req, res) => {
    try {
        const requester = req.headers["x-requester-wallet"];
        const txHash = req.headers["x-payment-txhash"];
        if (!requester) {
            return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
        }
        // Check quota
        const remaining = await getQuota(requester);
        if (remaining <= 0 && !txHash) {
            // Return HTTP 402
            return res.status(402).json({
                requiresPayment: true,
                requestId: `req-grid-${Date.now()}`,
                price: "0.10",
                currency: "USDC",
                chainId: 1,
                paymentAddress: "0xTreasuryMultisig...",
                merchantName: "MUSKOX Grid Trader Agent",
                reason: "quota_exceeded",
                agentCost: gridTrader.cost,
            });
        }
        // Record payment if TX hash provided
        if (txHash) {
            await recordPayment({
                requestId: `req-grid-${Date.now()}`,
                agentId: gridTrader.agentId,
                payer: requester,
                amount: "0.10",
                chainId: 1,
                txHash,
            });
        }
        // Execute grid trader
        const result = await gridTrader.execute(req.body);
        const newRemaining = await decrementQuota(requester);
        res.json({
            ...result,
            remaining: newRemaining,
            agentId: gridTrader.agentId,
        });
    }
    catch (err) {
        console.error("Grid Trader error:", err);
        res.status(500).json({ error: "Grid trader execution failed" });
    }
});
/**
 * POST /sniper-bot - Sniper Bot Agent
 * Protected by x402: 0.25-1.00 USDC per execution (dynamic)
 */
router.post("/sniper-bot", async (req, res) => {
    try {
        const requester = req.headers["x-requester-wallet"];
        const txHash = req.headers["x-payment-txhash"];
        const { priority = false } = req.body;
        if (!requester) {
            return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
        }
        // Calculate dynamic cost
        const costInfo = sniperBot.estimateCost({ priority });
        const costAmount = costInfo.cost.toString();
        // Check quota
        const remaining = await getQuota(requester);
        if (remaining <= 0 && !txHash) {
            // Return HTTP 402
            return res.status(402).json({
                requiresPayment: true,
                requestId: `req-snipe-${Date.now()}`,
                price: costAmount,
                currency: "USDC",
                chainId: 101, // Solana
                paymentAddress: "0xTreasuryMultisig...",
                merchantName: "MUSKOX Sniper Bot Agent",
                reason: "quota_exceeded",
                agentCost: costAmount,
                priority,
            });
        }
        // Record payment if TX hash provided
        if (txHash) {
            await recordPayment({
                requestId: `req-snipe-${Date.now()}`,
                agentId: sniperBot.agentId,
                payer: requester,
                amount: costAmount,
                chainId: 101,
                txHash,
            });
        }
        // Execute sniper bot
        const result = await sniperBot.execute(req.body);
        const newRemaining = await decrementQuota(requester);
        res.json({
            ...result,
            remaining: newRemaining,
            agentId: sniperBot.agentId,
            cost: costAmount,
            priority,
        });
    }
    catch (err) {
        console.error("Sniper Bot error:", err);
        res.status(500).json({ error: "Sniper bot execution failed" });
    }
});
/**
 * POST /llm-inference - LLM Inference Agent
 * Protected by x402: Dynamic pricing based on tokens
 * Proves x402 works for ANY agent type (not just trading)
 */
router.post("/llm-inference", async (req, res) => {
    try {
        const requester = req.headers["x-requester-wallet"];
        const txHash = req.headers["x-payment-txhash"];
        if (!requester) {
            return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
        }
        // Estimate cost BEFORE checking quota (show user what they'll pay)
        const costInfo = llmInference.estimateCost(req.body);
        const costAmount = costInfo.cost.toString();
        // Check quota
        const remaining = await getQuota(requester);
        if (remaining <= 0 && !txHash) {
            // Return HTTP 402
            return res.status(402).json({
                requiresPayment: true,
                requestId: `req-llm-${Date.now()}`,
                price: costAmount,
                currency: "USDC",
                chainId: 101, // Solana
                paymentAddress: "0xTreasuryMultisig...",
                merchantName: "MUSKOX LLM Inference Agent",
                reason: "quota_exceeded",
                estimatedCost: costAmount,
                costBreakdown: {
                    baseCost: llmInference.baseCost,
                    estimatedTokens: "depends on input",
                },
            });
        }
        // Record payment if TX hash provided
        if (txHash) {
            await recordPayment({
                requestId: `req-llm-${Date.now()}`,
                agentId: llmInference.agentId,
                payer: requester,
                amount: costAmount,
                chainId: 101,
                txHash,
            });
        }
        // Execute LLM inference
        const result = await llmInference.execute(req.body);
        const newRemaining = await decrementQuota(requester);
        res.json({
            ...result,
            remaining: newRemaining,
            agentId: llmInference.agentId,
            cost: costAmount,
            platformFee: (parseFloat(costAmount) * 0.02).toFixed(6),
            agentProceeds: (parseFloat(costAmount) * 0.98).toFixed(6),
        });
    }
    catch (err) {
        console.error("LLM Inference error:", err);
        res.status(500).json({ error: "LLM inference execution failed" });
    }
});
/**
 * POST /data-feed - Data Feed Agent (Price Oracle)
 * Protected by x402: Dynamic pricing based on data points
 */
router.post("/data-feed", async (req, res) => {
    try {
        const requester = req.headers["x-requester-wallet"];
        const txHash = req.headers["x-payment-txhash"];
        if (!requester) {
            return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
        }
        // Estimate cost
        const costInfo = dataFeed.estimateCost(req.body);
        const costAmount = costInfo.cost.toString();
        // Check quota
        const remaining = await getQuota(requester);
        if (remaining <= 0 && !txHash) {
            // Return HTTP 402
            return res.status(402).json({
                requiresPayment: true,
                requestId: `req-feed-${Date.now()}`,
                price: costAmount,
                currency: "USDC",
                chainId: 101, // Solana
                paymentAddress: "0xTreasuryMultisig...",
                merchantName: "MUSKOX Data Feed Agent",
                reason: "quota_exceeded",
                estimatedCost: costAmount,
                costBreakdown: {
                    baseCostPerPoint: dataFeed.baseCostPerPoint,
                    currentPrice: 0.01,
                    historicalData: "optional",
                },
            });
        }
        // Record payment if TX hash provided
        if (txHash) {
            await recordPayment({
                requestId: `req-feed-${Date.now()}`,
                agentId: dataFeed.agentId,
                payer: requester,
                amount: costAmount,
                chainId: 101,
                txHash,
            });
        }
        // Execute data feed request
        const result = await dataFeed.execute(req.body);
        const newRemaining = await decrementQuota(requester);
        res.json({
            ...result,
            remaining: newRemaining,
            agentId: dataFeed.agentId,
            cost: costAmount,
            platformFee: (parseFloat(costAmount) * 0.02).toFixed(6),
            agentProceeds: (parseFloat(costAmount) * 0.98).toFixed(6),
        });
    }
    catch (err) {
        console.error("Data Feed error:", err);
        res.status(500).json({ error: "Data feed execution failed" });
    }
});
/**
 * GET /agents-info - Get status of all demo agents
 */
router.get("/agents-info", (req, res) => {
    res.json({
        agents: [
            {
                id: gridTrader.agentId,
                name: gridTrader.name,
                endpoint: gridTrader.endpoint,
                cost: gridTrader.cost,
                currency: "USDC",
                status: gridTrader.getStatus(),
                supportedChains: gridTrader.supportedChains,
            },
            {
                id: sniperBot.agentId,
                name: sniperBot.name,
                endpoint: sniperBot.endpoint,
                baseCost: sniperBot.baseCost,
                maxCost: sniperBot.maxCost,
                currency: "USDC",
                status: sniperBot.getStatus(),
                supportedChains: sniperBot.supportedChains,
            },
            {
                id: llmInference.agentId,
                name: llmInference.name,
                endpoint: llmInference.endpoint,
                baseCost: llmInference.baseCost,
                currency: "USDC",
                status: llmInference.getStatus(),
                supportedChains: llmInference.supportedChains,
                supportedModels: llmInference.supportedModels,
            },
            {
                id: dataFeed.agentId,
                name: dataFeed.name,
                endpoint: dataFeed.endpoint,
                baseCostPerPoint: dataFeed.baseCostPerPoint,
                currency: "USDC",
                status: dataFeed.getStatus(),
                supportedChains: dataFeed.supportedChains,
                supportedSymbols: dataFeed.supportedSymbols,
            },
        ],
    });
});
export default router;
//# sourceMappingURL=demo-agents.js.map