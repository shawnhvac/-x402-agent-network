/**
 * x402 Payment Middleware
 * Enables AgentPay endpoints to accept x402 payments via Bazaar
 *
 * Each endpoint requires agent to make x402 payment before accessing
 * Automatically registers with Bazaar after first successful payment
 */
import { Express } from "express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
/**
 * Initialize x402 payment infrastructure
 *
 * Uses CDP facilitator for production (handles Bazaar auto-registration)
 * Falls back to x402.org for testing/staging
 */
export declare const initializeX402: () => {
    x402Server: x402ResourceServer;
    facilitatorClient: HTTPFacilitatorClient;
};
/**
 * Setup x402 payment middleware on Express app
 *
 * Protects three core endpoints:
 * 1. /api/v1/search - Find services ($0.001)
 * 2. /api/v1/book - Reserve service ($0.002)
 * 3. /api/v1/pay - Execute payment ($0.001)
 */
export declare const setupX402Middleware: (app: Express) => void;
/**
 * Extract x402 payment info from request
 * Called after payment middleware validates the payment
 */
export declare const getX402PaymentInfo: (req: any) => {
    verified: any;
    payer: any;
    amount: any;
    network: any;
};
