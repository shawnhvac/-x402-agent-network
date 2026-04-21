/**
 * AgentSpec.ts - Universal x402 Agent Interface (v1.0)
 * Every agent on the network implements this interface
 */
export interface Agent {
    id: string;
    name: string;
    version: string;
    description: string;
    supportedChains: ("ethereum" | "polygon" | "base" | "solana" | "arbitrum")[];
    minPayment: number;
    maxPayment: number;
    endpoint: string;
    ownerWallet: string;
    execute(payload: Record<string, unknown>, requester: string, chain: string): Promise<ExecutionResult>;
    estimateCost(payload: Record<string, unknown>, chain: string): Promise<number>;
    getStatus(): Promise<AgentStatus>;
    estimateProfitability?(marketCondition: string): Promise<number | null>;
}
export interface ExecutionResult {
    success: boolean;
    outcome: string;
    executionId: string;
    amountExecuted?: number;
    profit?: number;
    transactionHash?: string;
    data?: Record<string, unknown>;
    timestamp: string;
    error?: string;
}
export interface AgentStatus {
    healthy: boolean;
    uptime: number;
    responseTime: number;
    successCount: number;
    failureCount: number;
    totalRequests: number;
    lastUpdated: string;
}
export interface AgentRegistryEntry {
    agentId: string;
    name: string;
    description: string;
    endpoint: string;
    supportedChains: string[];
    minPayment: number;
    maxPayment: number;
    ownerWallet: string;
    version: string;
    x402Compliant: boolean;
    uptimeSLA: number;
    avgResponseTime: number;
    successCount: number;
    successRate: number;
    rating: number;
    createdAt: string;
    updatedAt: string;
    published: boolean;
}
