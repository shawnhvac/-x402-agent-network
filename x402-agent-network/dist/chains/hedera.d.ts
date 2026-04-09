/**
 * Hedera Chain Support for AgentPay
 * High throughput, stable fees
 */
/**
 * Verify USDC or HBAR payment on Hedera
 */
export declare function verifyHederaPayment(txHash: string, senderAccount: string, receiverAccount: string, expectedAmount: number): Promise<boolean>;
/**
 * Get Hedera account balance
 */
export declare function getHederaBalance(accountId: string): Promise<number | null>;
/**
 * Get Hedera account info
 */
export declare function getHederaAccount(accountId: string): Promise<{
    accountId: string;
    balance: any;
    publicKey: any;
    valid: boolean;
} | {
    valid: boolean;
    accountId?: undefined;
    balance?: undefined;
    publicKey?: undefined;
}>;
declare const _default: {
    verifyHederaPayment: typeof verifyHederaPayment;
    getHederaBalance: typeof getHederaBalance;
    getHederaAccount: typeof getHederaAccount;
};
export default _default;
