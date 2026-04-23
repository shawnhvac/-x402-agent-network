export interface WalletStatus {
    address: string;
    chain: string;
    usdcBalance: string;
    ethBalance: string;
    status: "ready" | "error";
}
export interface SendResult {
    txHash: string;
    from: string;
    to: string;
    amount: string;
    chain: string;
    explorerUrl: string;
}
/**
 * Get wallet status + balances (equivalent to: awal status && awal balance)
 */
export declare function getWalletStatus(): Promise<WalletStatus>;
/**
 * Send USDC to any address (equivalent to: awal send <amount> <recipient>)
 */
export declare function sendUSDC(amountUSD: string, recipient: `0x${string}`): Promise<SendResult>;
/**
 * Get wallet address (equivalent to: awal address)
 */
export declare function getWalletAddress(): string;
