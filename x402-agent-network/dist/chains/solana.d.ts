/**
 * Solana Chain Support for AgentPay
 */
export declare function verifySolanaPayment(txHash: string, requesterWallet: string, treasuryWallet: string, expectedAmount: number): Promise<boolean>;
declare const _default: {
    verifySolanaPayment: typeof verifySolanaPayment;
};
export default _default;
