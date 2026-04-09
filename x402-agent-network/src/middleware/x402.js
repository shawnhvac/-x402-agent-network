/**
 * x402.ts - HTTP 402 Payment Required Middleware
 * Implements Coinbase x402 standard for agent payments
 */
/**
 * Generate a proper HTTP 402 Payment Required response
 * @param options Configuration for payment request
 * @returns Formatted response object
 */
export function paymentRequired(options) {
    const chainId = options.chainId || 1; // Default to Ethereum mainnet
    return {
        requiresPayment: true,
        requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        price: options.price,
        currency: "USDC",
        chainId: chainId,
        paymentAddress: options.paymentAddress,
        merchantName: options.merchantName,
        reason: options.reason,
        nextSteps: `Send ${options.price} USDC to ${options.paymentAddress} on chain ${chainId}, then retry with X-Payment-TxHash header`,
        expectedConfirmationTime: 30,
        webhookUrl: options.webhookUrl,
        docLink: "https://docs.agents.muskox.io/x402"
    };
}
/**
 * Express middleware to add x402 helpers to response object
 */
export function x402Middleware(req, res, next) {
    // Add payment required helper to response
    res.paymentRequired = function (options) {
        return this.status(402).json(paymentRequired(options));
    };
    next();
}
//# sourceMappingURL=x402.js.map