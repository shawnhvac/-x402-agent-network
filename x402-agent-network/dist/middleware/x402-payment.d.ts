/**
 * x402 Payment Middleware - AgentPay
 * Chains: Base mainnet (eip155:8453) + Polygon (eip155:137)
 * Security fixes: nonce replay, rate limiting, wallet validation
 */
import { Express } from "express";
export declare function checkAndStoreNonce(nonce: string): boolean;
export declare function setupX402Middleware(app: Express): Promise<void>;
export declare function getX402PaymentInfo(): {
    wallet: `0x${string}`;
    networks: string[];
    polygon_usdc: string;
    routes: {
        "POST /api/v1/search": {
            accepts: {
                scheme: "exact";
                price: string;
                network: string;
                payTo: `0x${string}`;
            }[];
            description: string;
        };
        "POST /api/v1/book": {
            accepts: {
                scheme: "exact";
                price: string;
                network: string;
                payTo: `0x${string}`;
            }[];
            description: string;
        };
        "POST /api/v1/ai/search": {
            accepts: {
                scheme: "exact";
                price: string;
                network: string;
                payTo: `0x${string}`;
            }[];
            description: string;
        };
        "POST /api/v1/llm": {
            accepts: {
                scheme: "exact";
                price: string;
                network: string;
                payTo: `0x${string}`;
            }[];
            description: string;
        };
        "POST /api/v1/pay": {
            accepts: {
                scheme: "exact";
                price: string;
                network: string;
                payTo: `0x${string}`;
            }[];
            description: string;
        };
    };
};
