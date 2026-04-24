/**
 * services/nvidia-nim.ts - NVIDIA NIM Inference Service
 * Free hosted AI inference via NVIDIA's API (~80 models)
 * Base URL: https://integrate.api.nvidia.com/v1
 */
export interface NIMMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
export interface NIMRequest {
    model: string;
    messages: NIMMessage[];
    max_tokens?: number;
    temperature?: number;
    stream?: boolean;
}
export interface NIMResponse {
    id: string;
    model: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export declare const NVIDIA_MODELS: Record<string, string>;
export declare const DEFAULT_MODEL = "meta/llama-3.3-70b-instruct";
export declare class NvidiaNIMService {
    private apiKey;
    constructor(apiKey?: string);
    chat(req: NIMRequest): Promise<NIMResponse>;
    complete(prompt: string, model?: string, maxTokens?: number): Promise<string>;
    isConfigured(): boolean;
    listModels(): string[];
}
export declare const nvidiaNIM: NvidiaNIMService;
