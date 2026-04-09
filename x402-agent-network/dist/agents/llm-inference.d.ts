/**
 * agents/llm-inference.ts - LLM Inference Agent
 * Universal language model inference with x402 payment protection
 *
 * Cost: 0.05 USDC per 1K tokens (dynamic pricing)
 * Purpose: Demonstrate x402 works for ANY agent type (not just trading)
 */
import type { AgentExecutionRequest, AgentExecutionResult, AgentStatus } from "../AgentSpec.js";
/**
 * LLM Inference Agent Implementation
 * Simulates LLM inference with realistic token counting
 */
export declare class LLMInferenceAgent {
    agentId: string;
    name: string;
    description: string;
    endpoint: string;
    baseCostPerKTokens: number;
    maxTokensPerRequest: number;
    supportedChains: string[];
    supportedModels: string[];
    /**
     * Execute LLM inference
     */
    execute(request: AgentExecutionRequest): Promise<AgentExecutionResult>;
    /**
     * Estimate cost before execution (for x402 payment calculation)
     * Users can call this to see price before paying
     */
    estimateCost(input?: any): {
        cost: number;
        currency: string;
        executionTime: number;
    };
    /**
     * Get agent status and health
     */
    getStatus(): AgentStatus;
    /**
     * Estimate profitability (optional)
     */
    estimateProfitability(input: any): {
        estimatedProfit: number;
        confidence: number;
    };
    /**
     * Internal: Count tokens (simple estimation)
     * In production, use actual tokenizer library
     */
    private countTokens;
    /**
     * Internal: Calculate cost based on tokens
     * Formula: (total_tokens / 1000) * base_cost_per_1k_tokens
     */
    private calculateCost;
    /**
     * Internal: Simulate LLM response
     * In production, call actual LLM API (OpenAI, Grok, Claude, Llama)
     */
    private simulateLLMResponse;
}
export declare const llmInference: LLMInferenceAgent;
