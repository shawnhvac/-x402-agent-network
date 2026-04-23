interface EthereumPaymentConfig {
    walletAddress: string;
    network: 'mainnet' | 'sepolia';
    usdcContract: string;
    rpcEndpoint: string;
    etherscanKey: string;
}
interface EthereumTransaction {
    txHash: string;
    from: string;
    to: string;
    amount: string;
    token: string;
    blockNumber: number;
    timestamp: number;
    status: 'confirmed' | 'pending' | 'failed';
    gasUsed: string;
    gasPrice: string;
}
declare class EthereumPaymentProcessor {
    private config;
    private paymentLog;
    constructor(config?: Partial<EthereumPaymentConfig>);
    /**
     * Verify an Ethereum transaction
     */
    verifyTransaction(txHash: string): Promise<EthereumTransaction | null>;
    /**
     * Verify via Etherscan API
     */
    private verifyViaEtherscan;
    /**
     * Verify via RPC endpoint
     */
    private verifyViaRPC;
    /**
     * Check if payment went to correct address
     */
    verifyPaymentRecipient(txHash: string): Promise<boolean>;
    /**
     * Get wallet balance via Etherscan
     */
    getWalletBalance(): Promise<{
        eth: number;
        usdc: number;
    } | null>;
    /**
     * Get recent transactions
     */
    getRecentTransactions(limit?: number): Promise<EthereumTransaction[]>;
    /**
     * Log payment for audit trail
     */
    private logPayment;
    /**
     * Get payment statistics
     */
    getPaymentStats(): Promise<{
        totalTransactions: number;
        confirmedPayments: number;
        failedPayments: number;
    } | null>;
    /**
     * Health check
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        walletAddress: string;
        balance: {
            eth: number;
            usdc: number;
        } | null;
        rpcStatus: 'connected' | 'disconnected';
    }>;
}
export default EthereumPaymentProcessor;
export { EthereumTransaction, EthereumPaymentConfig };
