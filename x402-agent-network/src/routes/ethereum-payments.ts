import { Router, Request, Response } from 'express';
import EthereumPaymentProcessor from '../services/ethereum-payment';

const router = Router();

// Initialize Ethereum payment processor
const ethereumProcessor = new EthereumPaymentProcessor({
  walletAddress: process.env.ETHEREUM_RECEIVER_WALLET || '0x52893C94B03B5c5732c5AE71728cD69E360645Ce',
  network: 'mainnet',
  usdcContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
});

/**
 * POST /api/v1/ethereum/verify-payment
 * Verify an Ethereum payment transaction
 */
router.post('/ethereum/verify-payment', async (req: Request, res: Response) => {
  try {
    const { tx_hash, amount, service_id } = req.body;

    if (!tx_hash) {
      return res.status(400).json({
        success: false,
        error: 'Missing tx_hash parameter'
      });
    }

    const verified = await ethereumProcessor.verifyPaymentRecipient(tx_hash);

    if (!verified) {
      return res.status(402).json({
        success: false,
        error: 'Payment verification failed',
        tx_hash
      });
    }

    const tx = await ethereumProcessor.verifyTransaction(tx_hash);

    res.json({
      success: true,
      tx_hash,
      verified: true,
      amount: tx?.amount || amount,
      token: tx?.token || 'ETH',
      service_id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed'
    });
  }
});

/**
 * GET /api/v1/ethereum/wallet-info
 * Get wallet information and balance
 */
router.get('/ethereum/wallet-info', async (req: Request, res: Response) => {
  try {
    const balance = await ethereumProcessor.getWalletBalance();
    const stats = await ethereumProcessor.getPaymentStats();

    res.json({
      success: true,
      wallet: {
        address: process.env.ETHEREUM_RECEIVER_WALLET || '0x52893C94B03B5c5732c5AE71728cD69E360645Ce',
        network: 'mainnet',
        chainId: 1
      },
      balances: balance ? {
        eth: balance.eth,
        usdc: balance.usdc
      } : null,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Wallet info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet information'
    });
  }
});

/**
 * GET /api/v1/ethereum/recent-transactions
 * Get recent transactions
 */
router.get('/ethereum/recent-transactions', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const transactions = await ethereumProcessor.getRecentTransactions(limit);

    res.json({
      success: true,
      count: transactions.length,
      transactions: transactions.map(tx => ({
        hash: tx.txHash,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        token: tx.token,
        status: tx.status,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice + ' Gwei',
        timestamp: new Date(tx.timestamp).toISOString()
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent transactions'
    });
  }
});

/**
 * GET /api/v1/ethereum/health
 * Health check for Ethereum integration
 */
router.get('/ethereum/health', async (req: Request, res: Response) => {
  try {
    const health = await ethereumProcessor.healthCheck();

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 202 : 503;

    res.status(statusCode).json({
      success: true,
      status: health.status,
      wallet: {
        address: health.walletAddress,
        balance_eth: health.balance?.eth || 0,
        balance_usdc: health.balance?.usdc || 0
      },
      rpc: health.rpcStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed'
    });
  }
});

/**
 * GET /api/v1/ethereum/config
 * Get public Ethereum configuration
 */
router.get('/ethereum/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    config: {
      network: 'mainnet',
      chainId: 1,
      receiver_wallet: process.env.ETHEREUM_RECEIVER_WALLET || '0x52893C94B03B5c5732c5AE71728cD69E360645Ce',
      usdc_contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      rpc_endpoint: 'https://eth.llamarpc.com',
      payment_methods: ['ETH', 'USDC', 'USDT'],
      supported_currencies: ['ETH', 'USDC', 'USDT', 'DAI']
    }
  });
});

/**
 * POST /api/v1/ethereum/transaction-details
 * Get details about a specific transaction
 */
router.post('/ethereum/transaction-details', async (req: Request, res: Response) => {
  try {
    const { tx_hash } = req.body;

    if (!tx_hash) {
      return res.status(400).json({
        success: false,
        error: 'Missing tx_hash parameter'
      });
    }

    const tx = await ethereumProcessor.verifyTransaction(tx_hash);

    if (!tx) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction: {
        hash: tx.txHash,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        token: tx.token,
        status: tx.status,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice + ' Gwei',
        timestamp: new Date(tx.timestamp).toISOString()
      }
    });
  } catch (error) {
    console.error('Transaction details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction details'
    });
  }
});

export default router;
