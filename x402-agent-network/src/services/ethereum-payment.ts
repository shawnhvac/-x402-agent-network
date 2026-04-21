import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Ethereum Configuration
const ETHEREUM_RPC = process.env.ETHEREUM_RPC_ENDPOINT || 'https://eth.llamarpc.com';
const RECEIVER_WALLET = process.env.ETHEREUM_RECEIVER_WALLET || '0x52893C94B03B5c5732c5AE71728cD69E360645Ce';
const USDC_CONTRACT = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // Mainnet USDC
const ETHERSCAN_API = process.env.ETHERSCAN_API_KEY || '';

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

class EthereumPaymentProcessor {
  private config: EthereumPaymentConfig;
  private paymentLog: string = path.join(__dirname, '../../logs/ethereum-payments.log');

  constructor(config?: Partial<EthereumPaymentConfig>) {
    this.config = {
      walletAddress: RECEIVER_WALLET,
      network: 'mainnet',
      usdcContract: USDC_CONTRACT,
      rpcEndpoint: ETHEREUM_RPC,
      etherscanKey: ETHERSCAN_API,
      ...config
    };

    // Ensure logs directory exists
    const logsDir = path.dirname(this.paymentLog);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  /**
   * Verify an Ethereum transaction
   */
  async verifyTransaction(txHash: string): Promise<EthereumTransaction | null> {
    try {
      // Method 1: Try Etherscan API if available
      if (this.config.etherscanKey) {
        return await this.verifyViaEtherscan(txHash);
      }

      // Method 2: Use RPC endpoint
      return await this.verifyViaRPC(txHash);
    } catch (error) {
      console.error('Transaction verification error:', error);
      return null;
    }
  }

  /**
   * Verify via Etherscan API
   */
  private async verifyViaEtherscan(txHash: string): Promise<EthereumTransaction | null> {
    try {
      const url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${this.config.etherscanKey}`;
      const response = await axios.get(url);
      const result = response.data.result;

      if (!result) {
        console.log('Transaction not found on Etherscan');
        return null;
      }

      const tx: EthereumTransaction = {
        txHash,
        from: result.from,
        to: result.to,
        amount: result.value ? String(parseInt(result.value, 16) / 1e18) : '0',
        token: 'ETH',
        blockNumber: parseInt(result.blockNumber, 16),
        timestamp: Date.now(),
        status: result.status === '0x1' ? 'confirmed' : 'failed',
        gasUsed: String(parseInt(result.gasUsed, 16)),
        gasPrice: String(parseInt(result.gasPrice, 16) / 1e9) // Convert to Gwei
      };

      if (tx.status === 'confirmed') {
        this.logPayment(tx);
      }

      return tx;
    } catch (error) {
      console.error('Etherscan verification error:', error);
      return null;
    }
  }

  /**
   * Verify via RPC endpoint
   */
  private async verifyViaRPC(txHash: string): Promise<EthereumTransaction | null> {
    try {
      const payload = {
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1
      };

      const response = await axios.post(this.config.rpcEndpoint, payload);
      const result = response.data.result;

      if (!result) {
        console.log('Transaction not found');
        return null;
      }

      const tx: EthereumTransaction = {
        txHash,
        from: result.from,
        to: result.to,
        amount: result.value ? String(parseInt(result.value, 16) / 1e18) : '0',
        token: 'ETH',
        blockNumber: result.blockNumber ? parseInt(result.blockNumber, 16) : 0,
        timestamp: Date.now(),
        status: result.status === '0x1' ? 'confirmed' : 'failed',
        gasUsed: String(parseInt(result.gasUsed, 16)),
        gasPrice: '0'
      };

      if (tx.status === 'confirmed') {
        this.logPayment(tx);
      }

      return tx;
    } catch (error) {
      console.error('RPC verification error:', error);
      return null;
    }
  }

  /**
   * Check if payment went to correct address
   */
  async verifyPaymentRecipient(txHash: string): Promise<boolean> {
    try {
      const tx = await this.verifyTransaction(txHash);

      if (!tx) {
        return false;
      }

      // Check if payment was sent to your wallet
      const isCorrectRecipient = tx.to.toLowerCase() === this.config.walletAddress.toLowerCase();
      const isConfirmed = tx.status === 'confirmed';

      return isCorrectRecipient && isConfirmed;
    } catch (error) {
      console.error('Payment recipient verification error:', error);
      return false;
    }
  }

  /**
   * Get wallet balance via Etherscan
   */
  async getWalletBalance(): Promise<{ eth: number; usdc: number } | null> {
    try {
      if (!this.config.etherscanKey) {
        console.log('Etherscan API key not configured');
        return null;
      }

      // Get ETH balance
      const ethUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${this.config.walletAddress}&apikey=${this.config.etherscanKey}`;
      const ethResponse = await axios.get(ethUrl);
      const ethBalance = parseInt(ethResponse.data.result) / 1e18;

      // Get USDC balance (token balance)
      const usdcUrl = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${this.config.usdcContract}&address=${this.config.walletAddress}&tag=latest&apikey=${this.config.etherscanKey}`;
      const usdcResponse = await axios.get(usdcUrl);
      const usdcBalance = parseInt(usdcResponse.data.result) / 1e6; // USDC is 6 decimals

      return {
        eth: ethBalance,
        usdc: usdcBalance
      };
    } catch (error) {
      console.error('Balance check error:', error);
      return null;
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 10): Promise<EthereumTransaction[]> {
    try {
      if (!this.config.etherscanKey) {
        console.log('Etherscan API key not configured');
        return [];
      }

      const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${this.config.walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${this.config.etherscanKey}`;
      const response = await axios.get(url);

      if (!response.data.result || !Array.isArray(response.data.result)) {
        return [];
      }

      return response.data.result.slice(0, limit).map((tx: any) => ({
        txHash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: String(parseInt(tx.value) / 1e18),
        token: 'ETH',
        blockNumber: parseInt(tx.blockNumber),
        timestamp: parseInt(tx.timeStamp) * 1000,
        status: tx.isError === '0' ? 'confirmed' : 'failed',
        gasUsed: String(parseInt(tx.gas)),
        gasPrice: String(parseInt(tx.gasPrice) / 1e9)
      }));
    } catch (error) {
      console.error('Transaction fetch error:', error);
      return [];
    }
  }

  /**
   * Log payment for audit trail
   */
  private logPayment(payment: EthereumTransaction): void {
    try {
      const logEntry = JSON.stringify({
        ...payment,
        timestamp: new Date(payment.timestamp).toISOString()
      }) + '\n';

      fs.appendFileSync(this.paymentLog, logEntry);
    } catch (error) {
      console.error('Payment logging error:', error);
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<{
    totalTransactions: number;
    confirmedPayments: number;
    failedPayments: number;
  } | null> {
    try {
      const recentTxs = await this.getRecentTransactions(100);

      return {
        totalTransactions: recentTxs.length,
        confirmedPayments: recentTxs.filter(tx => tx.status === 'confirmed').length,
        failedPayments: recentTxs.filter(tx => tx.status === 'failed').length
      };
    } catch (error) {
      console.error('Stats error:', error);
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    walletAddress: string;
    balance: { eth: number; usdc: number } | null;
    rpcStatus: 'connected' | 'disconnected';
  }> {
    try {
      const balance = await this.getWalletBalance();
      const rpcStatus = balance ? 'connected' : 'disconnected';
      const status = rpcStatus === 'connected' ? 'healthy' : 'degraded';

      return {
        status,
        walletAddress: this.config.walletAddress,
        balance,
        rpcStatus
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'unhealthy',
        walletAddress: this.config.walletAddress,
        balance: null,
        rpcStatus: 'disconnected'
      };
    }
  }
}

export default EthereumPaymentProcessor;
export { EthereumTransaction, EthereumPaymentConfig };
