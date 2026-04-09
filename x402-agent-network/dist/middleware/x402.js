/**
 * x402.ts - HTTP 402 Payment Required Middleware
 * Implements Coinbase x402 standard for agent payments
 * Multi-chain support: Solana, Stellar, Hedera
 */
import { verifySolanaPayment } from '../chains/solana.js';
import { verifyStellarPayment } from '../chains/stellar.js';
import { verifyHederaPayment } from '../chains/hedera.js';
import { verifyCardanoPayment } from '../chains/cardano.js';
/**
 * Verify payment on specified chain
 */
export async function verifyPaymentOnChain(chain, txHash, senderWallet, treasuryWallet, expectedAmount) {
    switch (chain) {
        case 'solana':
            return await verifySolanaPayment(txHash, senderWallet, treasuryWallet, expectedAmount);
        case 'stellar':
            return await verifyStellarPayment(txHash, senderWallet, treasuryWallet, expectedAmount);
        case 'hedera':
            return await verifyHederaPayment(txHash, senderWallet, treasuryWallet, expectedAmount);
        case 'cardano':
            return await verifyCardanoPayment(txHash, senderWallet, treasuryWallet, expectedAmount);
        default:
            console.error('❌ Unknown chain:', chain);
            return false;
    }
}
/**
 * Generate a proper HTTP 402 Payment Required response
 * @param options Configuration for payment request
 * @returns Formatted response object
 */
export function paymentRequired(options) {
    const chain = options.chain || 'solana';
    const chainId = options.chainId || 0;
    return {
        requiresPayment: true,
        requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        price: options.price,
        currency: "USDC",
        chainId: chainId,
        chain: chain,
        paymentAddress: options.paymentAddress,
        merchantName: options.merchantName,
        reason: options.reason,
        nextSteps: `Send ${options.price} USDC to ${options.paymentAddress} on ${chain}, then retry with X-Payment-TxHash and X-Payment-Chain headers`,
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