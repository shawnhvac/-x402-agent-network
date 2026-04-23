import { fileURLToPath as _fup } from 'url';
import { dirname as _dn } from 'path';
const __filename = _fup(import.meta.url);
const __dirname = _dn(__filename);
import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
// Solana Configuration
const SOLANA_ENDPOINT = process.env.SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
const RECEIVER_WALLET = process.env.SOLANA_RECEIVER_WALLET || '6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG';
const USDC_MINT = 'EPjFWaLb3mLskJ2v2H7NnpXFu6HaKgqHSGAJxg6hGLKn'; // Mainnet USDC
class SolanaPaymentProcessor {
    constructor(config) {
        this.paymentLog = path.join(__dirname, '../../logs/solana-payments.log');
        this.config = {
            walletAddress: RECEIVER_WALLET,
            network: 'mainnet',
            usdcMint: USDC_MINT,
            endpoint: SOLANA_ENDPOINT,
            ...config
        };
        this.connection = new Connection(this.config.endpoint, 'confirmed');
        // Ensure logs directory exists
        const logsDir = path.dirname(this.paymentLog);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
    }
    /**
     * Verify a Solana wallet address
     */
    async verifyWallet(address) {
        try {
            const publicKey = new PublicKey(address);
            const accountInfo = await this.connection.getAccountInfo(publicKey);
            return accountInfo !== null;
        }
        catch (error) {
            console.error('Wallet verification error:', error);
            return false;
        }
    }
    /**
     * Get wallet balance in SOL
     */
    async getWalletBalance() {
        try {
            const publicKey = new PublicKey(this.config.walletAddress);
            const balance = await this.connection.getBalance(publicKey);
            return balance / 1000000000; // Convert lamports to SOL
        }
        catch (error) {
            console.error('Balance check error:', error);
            return 0;
        }
    }
    /**
     * Get USDC token balance
     */
    async getUSDCBalance() {
        try {
            const publicKey = new PublicKey(this.config.walletAddress);
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(publicKey, { mint: new PublicKey(USDC_MINT) });
            if (tokenAccounts.value.length === 0) {
                console.log('No USDC token account found');
                return 0;
            }
            const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            return balance || 0;
        }
        catch (error) {
            console.error('USDC balance check error:', error);
            return 0;
        }
    }
    /**
     * Get recent transactions for the wallet
     */
    async getRecentTransactions(limit = 10) {
        try {
            const publicKey = new PublicKey(this.config.walletAddress);
            const signatures = await this.connection.getSignaturesForAddress(publicKey, {
                limit: limit
            });
            const transactions = [];
            for (const sig of signatures) {
                const tx = await this.connection.getTransaction(sig.signature);
                if (tx) {
                    transactions.push({
                        signature: sig.signature,
                        blockTime: sig.blockTime,
                        status: sig.err ? 'failed' : 'success',
                        transaction: tx
                    });
                }
            }
            return transactions;
        }
        catch (error) {
            console.error('Transaction fetch error:', error);
            return [];
        }
    }
    /**
     * Verify a payment was received
     */
    async verifyPayment(txHash) {
        try {
            const txSignature = txHash;
            const transaction = await this.connection.getTransaction(txSignature);
            if (!transaction) {
                console.log('Transaction not found:', txHash);
                return false;
            }
            // Check if transaction was successful
            if (transaction.meta?.err) {
                console.log('Transaction failed:', transaction.meta.err);
                return false;
            }
            console.log('✅ Payment verified:', txHash);
            this.logPayment({
                txHash: txSignature,
                amount: 0, // Amount would be parsed from transaction if needed
                currency: 'USDC',
                receiver: this.config.walletAddress,
                timestamp: Date.now(),
                status: 'confirmed'
            });
            return true;
        }
        catch (error) {
            console.error('Payment verification error:', error);
            return false;
        }
    }
    /**
     * Log payment for audit trail
     */
    logPayment(payment) {
        try {
            const logEntry = JSON.stringify({
                ...payment,
                timestamp: new Date(payment.timestamp).toISOString()
            }) + '\n';
            fs.appendFileSync(this.paymentLog, logEntry);
        }
        catch (error) {
            console.error('Payment logging error:', error);
        }
    }
    /**
     * Get payment statistics
     */
    async getPaymentStats() {
        try {
            const recentTxs = await this.getRecentTransactions(100);
            const walletBalance = await this.getWalletBalance();
            const usdcBalance = await this.getUSDCBalance();
            return {
                totalPayments: recentTxs.length,
                successfulPayments: recentTxs.filter(tx => tx.status === 'success').length,
                failedPayments: recentTxs.filter(tx => tx.status === 'failed').length,
                walletBalance,
                usdcBalance
            };
        }
        catch (error) {
            console.error('Stats error:', error);
            return {
                totalPayments: 0,
                successfulPayments: 0,
                failedPayments: 0,
                walletBalance: 0,
                usdcBalance: 0
            };
        }
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            const walletVerified = await this.verifyWallet(this.config.walletAddress);
            const walletBalance = await this.getWalletBalance();
            const usdcBalance = await this.getUSDCBalance();
            // Test connection
            const version = await this.connection.getVersion();
            const connectionStatus = version ? 'connected' : 'disconnected';
            const status = walletVerified && connectionStatus === 'connected' ? 'healthy' : 'degraded';
            return {
                status,
                walletVerified,
                walletBalance,
                usdcBalance,
                connectionStatus
            };
        }
        catch (error) {
            console.error('Health check error:', error);
            return {
                status: 'unhealthy',
                walletVerified: false,
                walletBalance: 0,
                usdcBalance: 0,
                connectionStatus: 'disconnected'
            };
        }
    }
}
export default SolanaPaymentProcessor;
//# sourceMappingURL=solana-payment.js.map