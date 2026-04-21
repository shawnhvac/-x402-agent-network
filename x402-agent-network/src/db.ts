/**
 * db.ts - PostgreSQL Database Connection + Schema
 * Handles agent registry + payment tracking
 */

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost/x402_agents"
});

/**
 * Initialize database schema
 * Creates agents + payments tables if they don't exist
 */
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log("📊 Initializing database schema...");

    // Agents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        agent_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        endpoint VARCHAR(255) NOT NULL,
        supported_chains TEXT[] DEFAULT '{}',
        min_payment DECIMAL(18, 6) NOT NULL DEFAULT 0.01,
        max_payment DECIMAL(18, 6) NOT NULL DEFAULT 100,
        owner_wallet VARCHAR(255) NOT NULL,
        version VARCHAR(20) DEFAULT '1.0.0',
        x402_compliant BOOLEAN DEFAULT true,
        uptime_sla DECIMAL(5, 2) DEFAULT 99.9,
        avg_response_time INT DEFAULT 0,
        success_count INT DEFAULT 0,
        failure_count INT DEFAULT 0,
        total_requests INT DEFAULT 0,
        success_rate DECIMAL(5, 2) DEFAULT 100,
        rating DECIMAL(3, 2) DEFAULT 0,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        request_id VARCHAR(255) UNIQUE,
        agent_id VARCHAR(255),
        payer VARCHAR(255) NOT NULL,
        amount DECIMAL(18, 6) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USDC',
        chain_id INT DEFAULT 1,
        tx_hash VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        platform_fee DECIMAL(18, 6) DEFAULT 0,
        net_amount DECIMAL(18, 6) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        confirmed_at TIMESTAMP
      );
    `);

    // Quotas table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotas (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(255) UNIQUE NOT NULL,
        remaining_calls INT DEFAULT 10,
        last_reset TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Database schema initialized successfully");
  } catch (err) {
    console.error("❌ Database initialization error:", err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get quota for a wallet (with auto-reset if needed)
 */
export async function getQuota(wallet: string): Promise<number> {
  try {
    const result = await pool.query(
      `SELECT remaining_calls FROM quotas WHERE wallet_address = $1`,
      [wallet]
    );

    if (result.rows.length === 0) {
      // Create new quota entry
      await pool.query(
        `INSERT INTO quotas (wallet_address, remaining_calls) VALUES ($1, $2)`,
        [wallet, 10]
      );
      return 10;
    }

    return result.rows[0].remaining_calls;
  } catch (err) {
    console.error("Error getting quota:", err);
    return 0;
  }
}

/**
 * Decrement quota for a wallet
 */
export async function decrementQuota(wallet: string): Promise<number> {
  try {
    const result = await pool.query(
      `UPDATE quotas SET remaining_calls = remaining_calls - 1 
       WHERE wallet_address = $1 RETURNING remaining_calls`,
      [wallet]
    );

    if (result.rows.length === 0) {
      // Create entry if doesn't exist
      await pool.query(
        `INSERT INTO quotas (wallet_address, remaining_calls) VALUES ($1, $2)`,
        [wallet, 9]
      );
      return 9;
    }

    return result.rows[0].remaining_calls;
  } catch (err) {
    console.error("Error decrementing quota:", err);
    return 0;
  }
}

/**
 * Record a payment in the database
 */
export async function recordPayment(data: {
  requestId: string;
  agentId: string;
  payer: string;
  amount: string;
  chainId: number;
  txHash?: string;
}): Promise<void> {
  try {
    const platformFee = (parseFloat(data.amount) * 2) / 100; // 2% fee
    const netAmount = parseFloat(data.amount) - platformFee;

    await pool.query(
      `INSERT INTO payments (request_id, agent_id, payer, amount, currency, chain_id, tx_hash, platform_fee, net_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        data.requestId,
        data.agentId,
        data.payer,
        data.amount,
        "USDC",
        data.chainId,
        data.txHash,
        platformFee.toString(),
        netAmount.toString()
      ]
    );

    console.log(`✅ Payment recorded: ${data.amount} USDC from ${data.payer}`);
  } catch (err) {
    console.error("Error recording payment:", err);
  }
}

/**
 * Export pool for other modules
 */
export default pool;
