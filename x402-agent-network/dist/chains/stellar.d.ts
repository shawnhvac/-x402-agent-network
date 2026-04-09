/**
 * Stellar Chain Support for AgentPay
 * Simple account-based verification like Solana
 */
/**
 * Verify USDC or XLM payment on Stellar
 */
export declare function verifyStellarPayment(txHash: string, requesterWallet: string, treasuryWallet: string, expectedAmount: number): Promise<boolean>;
/**
 * Check account balance on Stellar (USDC or XLM)
 */
export declare function getStellarBalance(walletAddress: string, assetCode?: string): Promise<number | null>;
/**
 * Get Stellar account info
 */
export declare function getStellarAccount(walletAddress: string): Promise<{
    address: string;
    sequence: any;
    subentryCount: any;
    balances: any;
    valid: boolean;
} | {
    valid: boolean;
    address?: undefined;
    sequence?: undefined;
    subentryCount?: undefined;
    balances?: undefined;
}>;
declare const _default: {
    verifyStellarPayment: typeof verifyStellarPayment;
    getStellarBalance: typeof getStellarBalance;
    getStellarAccount: typeof getStellarAccount;
};
export default _default;
