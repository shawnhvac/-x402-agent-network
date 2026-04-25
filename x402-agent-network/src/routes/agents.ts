/**
 * routes/agents.ts - Agent Registry REST Endpoints with Auth
 */

import express from "express";
import { Router } from "express";
import type { Request, Response } from "express";
import crypto from "crypto";
import Database from "better-sqlite3";
import {
  getAgent,
  getAgents,
  registerAgent,
  updateAgent,
  deleteAgent
} from "../db-sqlite.js";

const router = Router();

// ── Shared DB (same file as db-sqlite) ───────────────────────────────────────
// @ts-ignore
const authDb = new Database("/root/.openclaw/workspace/x402-agent-network/x402-agent-network/x402.db");

// Ensure auth tables exist
authDb.exec(`
  CREATE TABLE IF NOT EXISTS agent_auth (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id       TEXT UNIQUE NOT NULL,
    owner_wallet   TEXT NOT NULL,
    api_key_hash   TEXT UNIQUE NOT NULL,
    plan           TEXT DEFAULT 'free',
    status         TEXT DEFAULT 'active',
    calls_today    INTEGER DEFAULT 0,
    calls_month    INTEGER DEFAULT 0,
    last_reset_day TEXT DEFAULT (date('now')),
    last_call_at   DATETIME,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_registered  TEXT
  );
  CREATE TABLE IF NOT EXISTS agent_rate_log (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    ip      TEXT,
    wallet  TEXT,
    action  TEXT,
    ts      DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

function genApiKey(): { key: string; hash: string } {
  const key  = "ap_" + crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  return { key, hash };
}

function hashKey(k: string): string {
  return crypto.createHash("sha256").update(k).digest("hex");
}

function checkSpam(ip: string, wallet: string): string | null {
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const ipCount = (authDb.prepare(
    "SELECT COUNT(*) as c FROM agent_rate_log WHERE ip=? AND action='register' AND ts>?"
  ).get(ip, oneHourAgo) as any).c;
  if (ipCount >= 3) return "Too many registrations from this IP. Try again in 1 hour.";

  const walletCount = (authDb.prepare(
    "SELECT COUNT(*) as c FROM agent_auth WHERE owner_wallet=? AND status='active'"
  ).get(wallet) as any).c;
  if (walletCount >= 2) return "Maximum 2 active agents per wallet address.";
  return null;
}

function issueKey(agentId: string, wallet: string, ip: string): string {
  const { key, hash } = genApiKey();
  authDb.prepare(`
    INSERT INTO agent_auth (agent_id, owner_wallet, api_key_hash, ip_registered)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(agent_id) DO UPDATE SET api_key_hash=excluded.api_key_hash
  `).run(agentId, wallet, hash, ip);
  authDb.prepare("INSERT INTO agent_rate_log (ip, wallet, action) VALUES (?,?,'register')").run(ip, wallet);
  return key;
}

function validateKey(key: string): { valid: boolean; agentId?: string; reason?: string } {
  if (!key || !key.startsWith("ap_")) return { valid: false, reason: "Invalid key format" };
  const row = authDb.prepare(
    "SELECT agent_id, status FROM agent_auth WHERE api_key_hash=?"
  ).get(hashKey(key)) as any;
  if (!row)             return { valid: false, reason: "API key not found" };
  if (row.status !== "active") return { valid: false, reason: "Account suspended" };
  return { valid: true, agentId: row.agent_id };
}

function checkRate(key: string): { ok: boolean; reason?: string; remaining?: number } {
  const hash = hashKey(key);
  const row  = authDb.prepare("SELECT * FROM agent_auth WHERE api_key_hash=?").get(hash) as any;
  if (!row) return { ok: false, reason: "Unknown key" };
  const today = new Date().toISOString().slice(0, 10);
  const limit = 500;
  if (row.last_reset_day !== today) {
    authDb.prepare("UPDATE agent_auth SET calls_today=0, last_reset_day=? WHERE api_key_hash=?").run(today, hash);
    row.calls_today = 0;
  }
  if (row.calls_today >= limit) return { ok: false, reason: `Daily limit of ${limit} calls reached. Upgrade your plan.` };
  authDb.prepare(
    "UPDATE agent_auth SET calls_today=calls_today+1, calls_month=calls_month+1, last_call_at=CURRENT_TIMESTAMP WHERE api_key_hash=?"
  ).run(hash);
  return { ok: true, remaining: limit - row.calls_today - 1 };
}

// ── Middleware ────────────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: any) {
  const key = (req.headers["x-api-key"] as string) || ((req.headers["authorization"] as string) || "").replace("Bearer ", "");
  const v   = validateKey(key);
  if (!v.valid) return res.status(401).json({ error: "Unauthorized", reason: v.reason });
  const r = checkRate(key);
  if (!r.ok)    return res.status(429).json({ error: "Rate limit exceeded", reason: r.reason });
  (req as any).agentId       = v.agentId;
  (req as any).remainingCalls = r.remaining;
  next();
}

// ── Routes ────────────────────────────────────────────────────────────────────

/** GET /agents — list all */
router.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const agents = (getAgents as any)();
    return res.json({ total: agents.length, agents });
  } catch (err) {
    return res.status(500).json({ error: "Failed to list agents" });
  }
});

/** GET /agents/:agentId */
router.get("/:agentId", async (req: Request, res: Response): Promise<any> => {
  try {
    if (req.params.agentId === "me") return res.status(401).json({ error: "X-Api-Key required" });
    const agent = getAgent(req.params.agentId);
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    return res.json(agent);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch agent" });
  }
});

/** POST /agents/register */
router.post("/register", async (req: Request, res: Response): Promise<any> => {
  try {
    const { agentId, name, description, endpoint, supportedChains, minPayment, maxPayment, ownerWallet, version } = req.body;

    // Spam / rate check
    const ip    = ((req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
    const block = checkSpam(ip, ownerWallet);
    if (block) return res.status(429).json({ error: "Registration blocked", reason: block });

    // Validation
    if (!agentId || !name || !endpoint || !ownerWallet || !supportedChains) {
      return res.status(400).json({ error: "Missing required fields: agentId, name, endpoint, ownerWallet, supportedChains" });
    }
    if (!Array.isArray(supportedChains) || supportedChains.length === 0) {
      return res.status(400).json({ error: "supportedChains must be a non-empty array" });
    }
    if (!/^[a-z0-9-_]+$/.test(agentId)) {
      return res.status(400).json({ error: "agentId must be lowercase letters, numbers, hyphens, underscores only" });
    }

    // Register agent record
    const agent = (registerAgent as any)({
      agentId, name, description: description || "", endpoint, supportedChains,
      minPayment: minPayment || 0.001, maxPayment: maxPayment || 100, ownerWallet, version: version || "1.0.0"
    });

    // Issue API key
    const apiKey = issueKey(agentId, ownerWallet, ip);

    console.log(`✅ Agent registered: ${agentId} wallet:${ownerWallet}`);
    return res.status(201).json({
      message: "Agent registered successfully",
      agent,
      apiKey,
      warning: "Save your API key — it will NOT be shown again. Pass it as X-Api-Key header on all requests."
    });
  } catch (err: any) {
    console.error("Error registering agent:", err);
    if (err.message?.includes("already exists")) {
      return res.status(409).json({ error: "Agent with this ID already exists" });
    }
    return res.status(500).json({ error: "Failed to register agent" });
  }
});

/** POST /agents/login — verify key and return agent info */
router.post("/login", async (req: Request, res: Response): Promise<any> => {
  const key = (req.headers["x-api-key"] as string) || req.body?.apiKey;
  if (!key) return res.status(400).json({ error: "Provide API key in X-Api-Key header" });
  const v = validateKey(key);
  if (!v.valid) return res.status(401).json({ error: "Invalid API key", reason: v.reason });
  const row = authDb.prepare(
    "SELECT agent_id, owner_wallet, plan, status, calls_today, calls_month, created_at FROM agent_auth WHERE api_key_hash=?"
  ).get(hashKey(key)) as any;
  return res.json({ authenticated: true, agent: row });
});

/** GET /agents/me — dashboard (requires auth) */
router.get("/me", requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const agent = getAgent((req as any).agentId);
    const auth  = authDb.prepare(
      "SELECT plan, status, calls_today, calls_month, owner_wallet FROM agent_auth WHERE agent_id=?"
    ).get((req as any).agentId) as any;
    return res.json({ agent: { ...agent, ...auth }, remainingCalls: (req as any).remainingCalls });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch agent" });
  }
});

/** PUT /agents/:agentId */
router.put("/:agentId", async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, minPayment, maxPayment, published } = req.body;
    const agent = (updateAgent as any)(req.params.agentId, { name, description, minPayment, maxPayment, published });
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    return res.json(agent);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update agent" });
  }
});

/** DELETE /agents/:agentId */
router.delete("/:agentId", async (req: Request, res: Response): Promise<any> => {
  try {
    const agent = deleteAgent(req.params.agentId);
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    return res.json({ message: "Agent deactivated", agent });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete agent" });
  }
});

export default router;
