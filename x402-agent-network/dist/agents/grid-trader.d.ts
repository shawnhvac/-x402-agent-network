/**
 * agents/grid-trader.ts - Grid Trading Agent
 * Demonstrates x402 payment protection for trading services
 *
 * Cost: 0.10 USDC per execution
 * Purpose: Execute grid trading strategy on BTC/ETH
 */
import type { AgentExecutionRequest, AgentExecutionResult, AgentStatus } from "../AgentSpec.js";
/**
 * Grid Trader Agent Implementation
 * Simulates grid trading logic with x402 payment integration
 */
export declare class GridTraderAgent {
    agentId: string;
    name: string;
    description: string;
    endpoint: string;
    cost: number;
    supportedChains: string[];
    /**
     * Execute grid trading logic
     * Input: { pair: "BTC/USD", gridSize: 5, spacing: 1.0 }
     * Output: { fills: number, profit: decimal, status: string }
     */
    execute(request: AgentExecutionRequest): Promise<AgentExecutionResult>;
    /**
     * Estimate execution cost
     */
    estimateCost(): {
        cost: number;
        currency: string;
        executionTime: number;
    };
    /**
     * Get agent status
     */
    getStatus(): AgentStatus;
    /**
     * Estimate profitability (optional)
     */
    estimateProfitability(input: any): {
        estimatedProfit: number;
        confidence: number;
    };
}
export declare const gridTrader: GridTraderAgent;
