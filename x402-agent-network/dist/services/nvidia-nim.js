/**
 * services/nvidia-nim.ts - NVIDIA NIM Inference Service
 * Free hosted AI inference via NVIDIA's API (~80 models)
 * Base URL: https://integrate.api.nvidia.com/v1
 */
// Available free NVIDIA NIM models
export const NVIDIA_MODELS = {
    "deepseek-r1": "deepseek-ai/deepseek-r1",
    "deepseek-v3": "deepseek-ai/deepseek-v3-0324",
    "llama-3.3-70b": "meta/llama-3.3-70b-instruct",
    "llama-3.1-8b": "meta/llama-3.1-8b-instruct",
    "mistral-7b": "mistralai/mistral-7b-instruct-v0.3",
    "mixtral-8x7b": "mistralai/mixtral-8x7b-instruct-v0.1",
    "gemma-3-27b": "google/gemma-3-27b-it",
    "qwen3-235b": "qwen/qwen3-235b-a22b",
    "minimax-m2.7": "minimax/minimax-m2.7",
    "glm-5.1": "zhipuai/glm-4-9b-chat",
    "phi-3-mini": "microsoft/phi-3-mini-128k-instruct",
    "nemotron-70b": "nvidia/llama-3.1-nemotron-70b-instruct",
};
export const DEFAULT_MODEL = "meta/llama-3.3-70b-instruct";
const BASE_URL = "https://integrate.api.nvidia.com/v1";
export class NvidiaNIMService {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.NVIDIA_API_KEY || "";
        if (!this.apiKey) {
            console.warn("[NVIDIA NIM] No API key set — set NVIDIA_API_KEY env var");
        }
    }
    async chat(req) {
        if (!this.apiKey)
            throw new Error("NVIDIA_API_KEY not configured");
        const model = NVIDIA_MODELS[req.model] || req.model || DEFAULT_MODEL;
        const body = {
            model,
            messages: req.messages,
            max_tokens: req.max_tokens ?? 1024,
            temperature: req.temperature ?? 0.7,
            stream: false,
        };
        const res = await fetch(`${BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`NVIDIA NIM error ${res.status}: ${err}`);
        }
        return res.json();
    }
    async complete(prompt, model, maxTokens = 512) {
        const resp = await this.chat({
            model: model || DEFAULT_MODEL,
            messages: [{ role: "user", content: prompt }],
            max_tokens: maxTokens,
        });
        return resp.choices[0]?.message?.content || "";
    }
    isConfigured() {
        return !!this.apiKey;
    }
    listModels() {
        return Object.keys(NVIDIA_MODELS);
    }
}
export const nvidiaNIM = new NvidiaNIMService();
//# sourceMappingURL=nvidia-nim.js.map