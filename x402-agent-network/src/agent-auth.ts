/**
 * agent-auth.ts - Agent Authentication & Anti-Spam Middleware
 * - API key generation on registration
 * - Rate limiting per wallet/IP
 * - Duplicate detection (wallet + agentId)
 * - API key validation middleware
 */

import Database from "better-sqlite3";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import type { Request, Response, NextFunction } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../x402.db");
// @ts-ignore
const db = new Database(dbPath);

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS agent_auth (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id      TEXT UNIQUE NOT NULL,
    owner_wallet  TEXT NOT NULL,
    api_key       TEXT UNIQUE NOT NULL,
    api_key_hash  TEXT UNIQUE NOT NULL,
    plan          TEXT DEFAULT 'free',
    status        TEXT DEFAULT 'active',
    calls_today   INTEGER DEFAULT 0,
    calls_month   INTEGER DEFAULT 0,
    last_call_at  DATETIME,
    last_reset_day TEXT DEFAULT (date('now')),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_registered TEXT
  );

  CREATE TABLE IF NOT EXISTS agent_rate_log (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    ip        TEXT,
    wallet    TEXT,
    action    TEXT,
    ts        DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── Helpers ───────────────────────────────────────────────────────────────────
export function generateApiKey(): { key: string; hash: string } {
  const key = "ap_" + crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  return { key, hash };
}

export function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

// ── Registration anti-spam ────────────────────────────────────────────────────
export function checkRegistrationSpam(ip: string, wallet: string): { blocked: boolean; reason?: string } {
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  // Max 3 registrations per IP per hour
  const ipCount = (db.prepare(`
    SELECT COUNT(*) as c FROM agent_rate_log
    WHERE ip = ? AND action = 'register' AND ts > ?
  `).get(ip, oneHourAgo) as any).c;

  if (ipCount >= 3) {
    return { blocked: true, reason: "Too many registrations from this IP. Try again in 1 hour." };
  }

  // Max 2 agents per wallet address
  const walletCount = (db.prepare(`
    SELECT COUNT(*) as c FROM agent_auth WHERE owner_wallet = ? AND status = 'active'
  `).get(wallet) as any).c;

  if (walletCount >= 2) {
    return { blocked: true, reason: "Maximum 2 agents per wallet address. Deactivate an existing agent first." };
  }

  return { blocked: false };
}

export function logRegistrationAttempt(ip: string, wallet: string) {
  db.prepare(`INSERT INTO agent_rate_log (ip, wallet, action) VALUES (?, ?, 'register')`).run(ip, wallet);
}

// ── Issue API key after registration ─────────────────────────────────────────
export function issueAgentApiKey(agentId: string, ownerWallet: string, ip: string): string {
  const { key, hash } = generateApiKey();
  db.prepare(`
    INSERT INTO agent_auth (agent_id, owner_wallet, api_key, api_key_hash, ip_registered)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(agent_id) DO UPDATE SET api_key=excluded.api_key, api_key_hash=excluded.api_key_hash
  `).run(agentId, ownerWallet, key, hash, ip);
  return key;
}

// ── Validate API key (used in middleware) ─────────────────────────────────────
export function validateApiKey(key: string): { valid: boolean; agentId?: string; reason?: string } {
  if (!key || !key.startsWith("ap_")) {
    return { valid: false, reason: "Invalid API key format" };
  }
  const hash = hashKey(key);
  const row = db.prepare(`SELECT agent_id, status FROM agent_auth WHERE api_key_hash = ?`).get(hash) as any;
  if (!row) return { valid: false, reason: "API key not found" };
  if (row.status !== "active") return { valid: false, reason: "Agent account is suspended" };
  return { valid: true, agentId: row.agent_id };
}

// ── Per-agent rate limiting ───────────────────────────────────────────────────
const PLAN_LIMITS: Record<string, { daily: number; monthly: number }> = {
  free:    { daily: 500,   monthly: 10000 },
  starter: { daily: 5000,  monthly: 100000 },
  pro:     { daily: 50000, monthly: 1000000 },
};

export function checkAgentRateLimit(apiKey: string): { allowed: boolean; reason?: string; remaining?: number } {
  const hash = hashKey(apiKey);
  const row = db.prepare(`SELECT * FROM agent_auth WHERE api_key_hash = ?`).get(hash) as any;
  if (!row) return { allowed: false, reason: "Unknown key" };

  const limits = PLAN_LIMITS[row.plan] || PLAN_LIMITS.free;
  const today = new Date().toISOString().slice(0, 10);

  // Reset daily counter if new day
  if (row.last_reset_day !== today) {
    db.prepare(`UPDATE agent_auth SET calls_today = 0, last_reset_day = ? WHERE api_key_hash = ?`).run(today, hash);
    row.calls_today = 0;
  }

  if (row.calls_today >= limits.daily) {
    return { allowed: false, reason: `Daily limit of ${limits.daily} calls reached. Upgrade your plan.` };
  }
  if (row.calls_month >= limits.monthly) {
    return { allowed: false, reason: `Monthly limit of ${limits.monthly} calls reached. Upgrade your plan.` };
  }

  // Increment counters
  db.prepare(`
    UPDATE agent_auth SET calls_today = calls_today + 1, calls_month = calls_month + 1, last_call_at = CURRENT_TIMESTAMP
    WHERE api_key_hash = ?
  `).run(hash);

  return { allowed: true, remaining: limits.daily - row.calls_today - 1 };
}

// ── Express middleware ────────────────────────────────────────────────────────
export function requireAgentAuth(req: Request, res: Response, next: NextFunction): any {
  const key = (req.headers["x-api-key"] as string) || (req.headers["authorization"] || "").replace("Bearer ", "");
  const validation = validateApiKey(key);
  if (!validation.valid) {
    return res.status(401).json({ error: "Unauthorized", reason: validation.reason });
  }
  const rateCheck = checkAgentRateLimit(key);
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: "Rate limit exceeded", reason: rateCheck.reason });
  }
  (req as any).agentId = validation.agentId;
  (req as any).remainingCalls = rateCheck.remaining;
  next();
}

// ── Agent login (key lookup) ──────────────────────────────────────────────────
export function agentLogin(apiKey: string): { success: boolean; agent?: any; reason?: string } {
  const validation = validateApiKey(apiKey);
  if (!validation.valid) return { success: false, reason: validation.reason };
  const row = db.prepare(`SELECT agent_id, owner_wallet, plan, status, calls_today, calls_month, created_at FROM agent_auth WHERE api_key_hash = ?`).get(hashKey(apiKey)) as any;
  return { success: true, agent: row };
}
