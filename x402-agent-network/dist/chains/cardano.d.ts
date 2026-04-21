/**
 * Cardano Chain Support for AgentPay
 * Uses Koios (free community RPC) - no API key needed
 */
/**
 * Verify ADA or USDC payment on Cardano
 */
export declare function verifyCardanoPayment(txHash: string, senderAddress: string, receiverAddress: string, expectedAmount: number): Promise<boolean>;
/**
 * Get Cardano account balance
 */
export declare function getCardanoBalance(address: string): Promise<number | null>;
/**
 * Get Cardano account info
 */
export declare function getCardanoAccount(address: string): Promise<{
    valid: boolean;
    address?: undefined;
    balance?: undefined;
    tx_count?: undefined;
} | {
    address: string;
    balance: any;
    tx_count: any;
    valid: boolean;
}>;
declare const _default: {
    verifyCardanoPayment: typeof verifyCardanoPayment;
    getCardanoBalance: typeof getCardanoBalance;
    getCardanoAccount: typeof getCardanoAccount;
};
export default _default;
