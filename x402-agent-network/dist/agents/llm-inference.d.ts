/**
 * agents/llm-inference.ts - LLM Inference Agent
 * Real inference powered by NVIDIA NIM (free hosted models)
 *
 * Cost: 0.001 USDC per request (x402 protected)
 */
import type { AgentExecutionRequest, AgentExecutionResult, AgentStatus } from "../AgentSpec.js";
export declare class LLMInferenceAgent {
    agentId: string;
    name: string;
    description: string;
    endpoint: string;
    baseCost: number;
    supportedChains: string[];
    get supportedModels(): string[];
    execute(request: AgentExecutionRequest): Promise<AgentExecutionResult>;
    estimateCost(_input?: any): {
        cost: number;
        currency: string;
        executionTime: number;
    };
    getStatus(): AgentStatus;
    estimateProfitability(_input: any): {
        estimatedProfit: number;
        confidence: number;
    };
}
export declare const llmInference: LLMInferenceAgent;
