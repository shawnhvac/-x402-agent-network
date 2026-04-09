/**
 * x402.ts - HTTP 402 Payment Required Middleware
 * Implements Coinbase x402 standard for agent payments
 * Multi-chain support: Solana, Stellar, Hedera
 */
export type ChainType = 'solana' | 'stellar' | 'hedera' | 'cardano';
export interface PaymentRequiredOptions {
    price: string;
    paymentAddress: string;
    merchantName: string;
    reason: "quota_exceeded" | "payment_required" | "premium_feature";
    chainId?: number;
    chain?: ChainType;
    webhookUrl?: string;
}
export interface PaymentRequired402Response {
    requiresPayment: true;
    requestId: string;
    price: string;
    currency: "USDC";
    chainId: number;
    chain: ChainType;
    paymentAddress: string;
    merchantName: string;
    reason: "quota_exceeded" | "payment_required" | "premium_feature";
    nextSteps: string;
    paymentLink?: string;
    webhookUrl?: string | undefined;
    expectedConfirmationTime: number;
    docLink: string;
}
/**
 * Verify payment on specified chain
 */
export declare function verifyPaymentOnChain(chain: ChainType, txHash: string, senderWallet: string, treasuryWallet: string, expectedAmount: number): Promise<boolean>;
/**
 * Generate a proper HTTP 402 Payment Required response
 * @param options Configuration for payment request
 * @returns Formatted response object
 */
export declare function paymentRequired(options: PaymentRequiredOptions): PaymentRequired402Response;
/**
 * Express middleware to add x402 helpers to response object
 */
export declare function x402Middleware(req: any, res: any, next: any): void;
