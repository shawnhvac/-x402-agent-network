/**
 * db-sqlite.ts - SQLite Database for local development/testing
 * Quick setup without requiring PostgreSQL installation
 */
/**
 * Initialize database schema
 */
export declare function initializeDatabase(): void;
/**
 * Get quota for a wallet
 */
export declare function getQuota(wallet: string): number;
/**
 * Decrement quota for a wallet
 */
export declare function decrementQuota(wallet: string): number;
/**
 * Record a payment
 */
export declare function recordPayment(data: {
    requestId: string;
    agentId: string;
    payer: string;
    amount: string;
    chainId: number;
    txHash?: string;
}): void;
/**
 * Register an agent
 */
export declare function registerAgent(data: {
    agentId: string;
    name: string;
    description?: string;
    endpoint: string;
    supportedChains: string[];
    minPayment: number;
    maxPayment: number;
    ownerWallet: string;
    version?: string;
}): any;
/**
 * Get all agents
 */
export declare function getAgents(chain?: string | null, minRating?: number | null): any[];
/**
 * Get single agent
 */
export declare function getAgent(agentId: string): any;
/**
 * Update agent
 */
export declare function updateAgent(agentId: string, data: any): any;
/**
 * Delete agent (soft delete)
 */
export declare function deleteAgent(agentId: string): any;
//# sourceMappingURL=db-sqlite.d.ts.map