interface SolanaPaymentConfig {
    walletAddress: string;
    network: 'mainnet' | 'devnet';
    usdcMint: string;
    endpoint: string;
}
interface PaymentTransaction {
    txHash: string;
    amount: number;
    currency: string;
    receiver: string;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
}
declare class SolanaPaymentProcessor {
    private connection;
    private config;
    private paymentLog;
    constructor(config?: Partial<SolanaPaymentConfig>);
    /**
     * Verify a Solana wallet address
     */
    verifyWallet(address: string): Promise<boolean>;
    /**
     * Get wallet balance in SOL
     */
    getWalletBalance(): Promise<number>;
    /**
     * Get USDC token balance
     */
    getUSDCBalance(): Promise<number>;
    /**
     * Get recent transactions for the wallet
     */
    getRecentTransactions(limit?: number): Promise<any[]>;
    /**
     * Verify a payment was received
     */
    verifyPayment(txHash: string): Promise<boolean>;
    /**
     * Log payment for audit trail
     */
    private logPayment;
    /**
     * Get payment statistics
     */
    getPaymentStats(): Promise<{
        totalPayments: number;
        successfulPayments: number;
        failedPayments: number;
        walletBalance: number;
        usdcBalance: number;
    }>;
    /**
     * Health check
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        walletVerified: boolean;
        walletBalance: number;
        usdcBalance: number;
        connectionStatus: 'connected' | 'disconnected';
    }>;
}
export default SolanaPaymentProcessor;
export { PaymentTransaction, SolanaPaymentConfig };
