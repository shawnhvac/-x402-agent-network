/**
 * db.ts - PostgreSQL Database Connection + Schema
 * Handles agent registry + payment tracking
 */
declare const pool: import("pg").Pool;
/**
 * Initialize database schema
 * Creates agents + payments tables if they don't exist
 */
export declare function initializeDatabase(): Promise<void>;
/**
 * Get quota for a wallet (with auto-reset if needed)
 */
export declare function getQuota(wallet: string): Promise<number>;
/**
 * Decrement quota for a wallet
 */
export declare function decrementQuota(wallet: string): Promise<number>;
/**
 * Record a payment in the database
 */
export declare function recordPayment(data: {
    requestId: string;
    agentId: string;
    payer: string;
    amount: string;
    chainId: number;
    txHash?: string;
}): Promise<void>;
/**
 * Export pool for other modules
 */
export default pool;
