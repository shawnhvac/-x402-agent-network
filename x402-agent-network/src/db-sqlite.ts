/**
 * db-sqlite.ts - SQLite Database for local development/testing
 * Quick setup without requiring PostgreSQL installation
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../x402.db");
// @ts-ignore
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

/**
 * Initialize database schema
 */
export function initializeDatabase(): void {
  try {
    console.log("📊 Initializing SQLite database...");

    // Agents table
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

    // Payments table
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

    // Quotas table
    db.exec(`
      CREATE TABLE IF NOT EXISTS quotas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT UNIQUE NOT NULL,
        remaining_calls INTEGER DEFAULT 10,
        last_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ SQLite database initialized successfully");
    console.log(`📁 Database file: ${dbPath}`);
  } catch (err) {
    console.error("❌ Database initialization error:", err);
    throw err;
  }
}

/**
 * Get quota for a wallet
 */
export function getQuota(wallet: string): number {
  try {
    const result = db.prepare(
      `SELECT remaining_calls FROM quotas WHERE wallet_address = ?`
    ).get(wallet) as any;

    if (!result) {
      // Create new quota entry
      db.prepare(
        `INSERT INTO quotas (wallet_address, remaining_calls) VALUES (?, ?)`
      ).run(wallet, 10);
      return 10;
    }

    return result.remaining_calls;
  } catch (err) {
    console.error("Error getting quota:", err);
    return 0;
  }
}

/**
 * Decrement quota for a wallet
 */
export function decrementQuota(wallet: string): number {
  try {
    const result = db.prepare(
      `UPDATE quotas SET remaining_calls = remaining_calls - 1 
       WHERE wallet_address = ? RETURNING remaining_calls`
    ).run(wallet);

    if (!result) {
      // Create entry if doesn't exist
      db.prepare(
        `INSERT INTO quotas (wallet_address, remaining_calls) VALUES (?, ?)`
      ).run(wallet, 9);
      return 9;
    }

    // Get the updated value
    const updated = db.prepare(
      `SELECT remaining_calls FROM quotas WHERE wallet_address = ?`
    ).get(wallet) as any;

    return updated?.remaining_calls || 9;
  } catch (err) {
    console.error("Error decrementing quota:", err);
    return 0;
  }
}

/**
 * Record a payment
 */
export function recordPayment(data: {
  requestId: string;
  agentId: string;
  payer: string;
  amount: string;
  chainId: number;
  txHash?: string;
}): void {
  try {
    const platformFee = (parseFloat(data.amount) * 2) / 100;
    const netAmount = parseFloat(data.amount) - platformFee;

    db.prepare(
      `INSERT INTO payments (request_id, agent_id, payer, amount, currency, chain_id, tx_hash, platform_fee, net_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.requestId,
      data.agentId,
      data.payer,
      data.amount,
      "USDC",
      data.chainId,
      data.txHash,
      platformFee.toString(),
      netAmount.toString()
    );

    console.log(`✅ Payment recorded: ${data.amount} USDC from ${data.payer}`);
  } catch (err) {
    console.error("Error recording payment:", err);
  }
}

/**
 * Register an agent
 */
export function registerAgent(data: {
  agentId: string;
  name: string;
  description?: string;
  endpoint: string;
  supportedChains: string[];
  minPayment: number;
  maxPayment: number;
  ownerWallet: string;
  version?: string;
}): any {
  try {
    const result = db.prepare(
      `INSERT INTO agents 
       (agent_id, name, description, endpoint, supported_chains, min_payment, max_payment, owner_wallet, version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.agentId,
      data.name,
      data.description || "",
      data.endpoint,
      JSON.stringify(data.supportedChains),
      data.minPayment,
      data.maxPayment,
      data.ownerWallet,
      data.version || "1.0.0"
    );

    const agent = db.prepare(
      `SELECT * FROM agents WHERE id = ?`
    ).get(result.lastInsertRowid);

    return agent;
  } catch (err: any) {
    if (err.message.includes("UNIQUE constraint failed")) {
      throw new Error("Agent with this ID already exists");
    }
    throw err;
  }
}

/**
 * Get all agents
 */
export function getAgents(chain?: string | null, minRating?: number | null): any[] {
  let query = `
    SELECT agent_id, name, description, endpoint, supported_chains, 
           min_payment, max_payment, version, uptime_sla, avg_response_time,
           success_count, success_rate, rating, created_at
    FROM agents 
    WHERE published = 1
  `;

  const params: any[] = [];

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

/**
 * Get single agent
 */
export function getAgent(agentId: string): any {
  return db.prepare(
    `SELECT * FROM agents WHERE agent_id = ?`
  ).get(agentId);
}

/**
 * Update agent
 */
export function updateAgent(agentId: string, data: any): any {
  const fields = [];
  const values = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }
  if (data.minPayment !== undefined) {
    fields.push("min_payment = ?");
    values.push(data.minPayment);
  }
  if (data.maxPayment !== undefined) {
    fields.push("max_payment = ?");
    values.push(data.maxPayment);
  }
  if (data.published !== undefined) {
    fields.push("published = ?");
    values.push(data.published ? 1 : 0);
  }

  if (fields.length === 0) return getAgent(agentId);

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(agentId);

  const query = `UPDATE agents SET ${fields.join(", ")} WHERE agent_id = ?`;
  db.prepare(query).run(...values);

  return getAgent(agentId);
}

/**
 * Delete agent (soft delete)
 */
export function deleteAgent(agentId: string): any {
  db.prepare(
    `UPDATE agents SET published = 0 WHERE agent_id = ?`
  ).run(agentId);

  return getAgent(agentId);
}

// export default db; // Avoid type export issues
