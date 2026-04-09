/**
 * agents/data-feed.ts - Data Feed Agent (Price Oracle)
 * Real-time price feeds for multiple cryptocurrency pairs
 *
 * Cost: 0.01 USDC per price point
 * Purpose: Demonstrate x402 works for data agents (not just trading)
 */
import type { AgentExecutionRequest, AgentExecutionResult, AgentStatus } from "../AgentSpec.js";
/**
 * Data Feed Agent Implementation
 * Simulates real-time price oracle data
 */
export declare class DataFeedAgent {
    agentId: string;
    name: string;
    description: string;
    endpoint: string;
    baseCostPerPoint: number;
    supportedChains: string[];
    supportedSymbols: string[];
    private priceData;
    /**
     * Execute price feed request
     */
    execute(request: AgentExecutionRequest): Promise<AgentExecutionResult>;
    /**
     * Estimate cost before execution
     */
    estimateCost(input?: any): {
        cost: number;
        currency: string;
        executionTime: number;
    };
    /**
     * Get agent status
     */
    getStatus(): AgentStatus;
    /**
     * Internal: Simulate price with volatility
     */
    private simulatePriceWithVolatility;
    /**
     * Internal: Generate price history
     */
    private generatePriceHistory;
}
export declare const dataFeed: DataFeedAgent;
