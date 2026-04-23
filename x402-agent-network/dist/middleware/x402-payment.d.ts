/**
 * x402 Payment Middleware — AgentPay
 * Updated: Added Bazaar discovery extension for CDP indexing
 */
import { Express } from "express";
export declare function setupX402Middleware(app: Express): void;
export declare function getX402PaymentInfo(): {
    wallet: `0x${string}`;
    network: string;
    facilitator: string;
    endpoints: string[];
};
