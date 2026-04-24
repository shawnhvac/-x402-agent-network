/**
 * agents/llm-inference.ts - LLM Inference Agent
 * Real inference powered by NVIDIA NIM (free hosted models)
 *
 * Cost: 0.001 USDC per request (x402 protected)
 */
import { nvidiaNIM, DEFAULT_MODEL } from "../services/nvidia-nim.js";
export class LLMInferenceAgent {
    constructor() {
        this.agentId = "llm-inference-v2";
        this.name = "LLM Inference Agent (NVIDIA NIM)";
        this.description = "Real AI inference via NVIDIA NIM — 80+ free hosted models including DeepSeek R1, Llama 3.3 70B, Mistral, Gemma, Qwen3";
        this.endpoint = "/llm-inference";
        this.baseCost = 0.001; // USDC per request
        this.supportedChains = ["base", "solana", "polygon"];
    }
    get supportedModels() {
        return nvidiaNIM.listModels();
    }
    async execute(request) {
        const start = Date.now();
        try {
            const input = (request.input || request);
            // Build messages array
            let messages = input.messages;
            if (!messages && input.prompt) {
                messages = [{ role: "user", content: input.prompt }];
            }
            if (!Array.isArray(messages) || messages.length === 0) {
                throw new Error("Provide messages[] or prompt string");
            }
            const model = input.model || DEFAULT_MODEL;
            const max_tokens = input.max_tokens ?? 512;
            const temperature = input.temperature ?? 0.7;
            // Call real NVIDIA NIM API
            const resp = await nvidiaNIM.chat({ model, messages, max_tokens, temperature });
            const completion = resp.choices[0]?.message?.content || "";
            const usage = resp.usage;
            return {
                success: true,
                executionId: `llm-${Date.now()}`,
                output: {
                    model: resp.model,
                    completion,
                    usage,
                    cost: this.baseCost,
                    provider: "NVIDIA NIM",
                },
                executionTime: Date.now() - start,
            };
        }
        catch (err) {
            return {
                success: false,
                executionId: `llm-${Date.now()}`,
                error: err.message || "LLM inference failed",
                executionTime: Date.now() - start,
            };
        }
    }
    estimateCost(_input) {
        return { cost: this.baseCost, currency: "USDC", executionTime: 2000 };
    }
    getStatus() {
        return {
            agentId: this.agentId,
            name: this.name,
            status: nvidiaNIM.isConfigured() ? "healthy" : "degraded",
            uptime: 99.9,
            successCount: 0,
            failureCount: 0,
            avgExecutionTime: 2000,
            lastExecution: new Date().toISOString(),
        };
    }
    estimateProfitability(_input) {
        return { estimatedProfit: 0.0002, confidence: 0.9 };
    }
}
export const llmInference = new LLMInferenceAgent();
//# sourceMappingURL=llm-inference.js.map