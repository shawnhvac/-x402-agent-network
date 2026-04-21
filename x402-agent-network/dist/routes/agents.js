/**
 * routes/agents.ts - Agent Registry REST Endpoints (SQLite Version)
 * Handles agent CRUD + discovery
 */
import { Router } from "express";
import { getAgent, getAgents, registerAgent, updateAgent, deleteAgent } from "../db-sqlite.js";
const router = Router();
/**
 * GET /agents - List all published agents
 * Query params:
 *   - chain: Filter by supported chain (ethereum, polygon, etc)
 *   - minRating: Minimum rating (0-5)
 */
router.get("/", async (req, res) => {
    try {
        const chainParam = req.query.chain ? (Array.isArray(req.query.chain) ? req.query.chain[0] : req.query.chain) : undefined;
        const agents = getAgents(chainParam, req.query.minRating ? parseFloat(Array.isArray(req.query.minRating) ? req.query.minRating[0] : req.query.minRating) : undefined);
        res.json({
            total: agents.length,
            agents: agents
        });
    }
    catch (err) {
        console.error("Error listing agents:", err);
        res.status(500).json({ error: "Failed to list agents" });
    }
});
/**
 * GET /agents/:agentId - Get single agent details
 */
router.get("/:agentId", async (req, res) => {
    try {
        const agent = getAgent(req.params.agentId);
        if (!agent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        res.json(agent);
    }
    catch (err) {
        console.error("Error fetching agent:", err);
        res.status(500).json({ error: "Failed to fetch agent" });
    }
});
/**
 * POST /agents/register - Register new agent
 * Required fields:
 *   - agentId: Unique identifier
 *   - name: Human-readable name
 *   - endpoint: HTTP endpoint URL
 *   - ownerWallet: Wallet address that receives payments
 *   - supportedChains: Array of chains (ethereum, polygon, etc)
 *   - minPayment: Minimum payment in USDC
 *   - maxPayment: Maximum payment in USDC
 */
router.post("/register", async (req, res) => {
    try {
        const { agentId, name, description, endpoint, supportedChains, minPayment, maxPayment, ownerWallet, version } = req.body;
        // Validation
        if (!agentId || !name || !endpoint || !ownerWallet || !supportedChains) {
            return res.status(400).json({
                error: "Missing required fields: agentId, name, endpoint, ownerWallet, supportedChains"
            });
        }
        if (!Array.isArray(supportedChains) || supportedChains.length === 0) {
            return res.status(400).json({ error: "supportedChains must be a non-empty array" });
        }
        // Verify endpoint is reachable
        try {
            const response = await fetch(`${endpoint}/health`, {
                headers: { "X-Requester-Wallet": "0x0000000000000000000000000000000000000000" }
            });
            if (response.status !== 200) {
                return res.status(400).json({ error: "Agent endpoint returned non-200 status" });
            }
        }
        catch (err) {
            return res.status(400).json({ error: "Cannot reach agent endpoint. Ensure it's publicly accessible." });
        }
        // Register agent
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
        console.log(`✅ Agent registered: ${agentId}`);
        res.status(201).json({
            message: "Agent registered successfully",
            agent: agent
        });
    }
    catch (err) {
        console.error("Error registering agent:", err);
        if (err.message.includes("already exists")) {
            return res.status(409).json({ error: "Agent with this ID already exists" });
        }
        res.status(500).json({ error: "Failed to register agent" });
    }
});
/**
 * PUT /agents/:agentId - Update agent details
 */
router.put("/:agentId", async (req, res) => {
    try {
        const { name, description, minPayment, maxPayment, published } = req.body;
        const publishedVal = published !== undefined ? (Array.isArray(published) ? published[0] : published) : undefined;
        const agent = updateAgent(req.params.agentId, {
            name,
            description,
            minPayment,
            maxPayment,
            published: publishedVal
        });
        if (!agent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        console.log(`✅ Agent updated: ${req.params.agentId}`);
        res.json(agent);
    }
    catch (err) {
        console.error("Error updating agent:", err);
        res.status(500).json({ error: "Failed to update agent" });
    }
});
/**
 * DELETE /agents/:agentId - Deactivate agent (soft delete)
 */
router.delete("/:agentId", async (req, res) => {
    try {
        const agent = deleteAgent(req.params.agentId);
        if (!agent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        console.log(`✅ Agent deactivated: ${req.params.agentId}`);
        res.json({ message: "Agent deactivated", agent: agent });
    }
    catch (err) {
        console.error("Error deleting agent:", err);
        res.status(500).json({ error: "Failed to delete agent" });
    }
});
export default router;
//# sourceMappingURL=agents.js.map