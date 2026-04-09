/**
 * agents/sniper-bot.ts - Sniper Bot Agent
 * Demonstrates x402 payment protection for sniping services
 *
 * Cost: Dynamic (0.25-1.00 USDC per snipe)
 * Purpose: Detect and execute token snipes on Raydium/Pump.fun
 */
import type { AgentExecutionRequest, AgentExecutionResult, AgentStatus } from "../AgentSpec.js";
/**
 * Sniper Bot Agent Implementation
 * Simulates token snipe detection with x402 payment integration
 */
export declare class SniperBotAgent {
    agentId: string;
    name: string;
    description: string;
    endpoint: string;
    baseCost: number;
    maxCost: number;
    supportedChains: string[];
    /**
     * Execute token snipe
     * Input: { tokenAddress: string, buyAmount: number, slippage: number, priority: boolean }
     * Output: { txHash: string, amount: number, profit?: number, status: string }
     */
    execute(request: AgentExecutionRequest): Promise<AgentExecutionResult>;
    /**
     * Estimate execution cost (dynamic based on priority)
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
     * Estimate profitability (optional)
     */
    estimateProfitability(input: any): {
        estimatedProfit: number;
        confidence: number;
    };
}
export declare const sniperBot: SniperBotAgent;
