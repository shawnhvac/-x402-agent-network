import { Router, Request, Response } from 'express';
import SolanaPaymentProcessor from '../services/solana-payment';

const router = Router();

// Initialize Solana payment processor
const solanaProcessor = new SolanaPaymentProcessor({
  walletAddress: process.env.SOLANA_RECEIVER_WALLET || '6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG',
  network: 'mainnet',
  usdcMint: 'EPjFWaLb3mLskJ2v2H7NnpXFu6HaKgqHSGAJxg6hGLKn'
});

/**
 * POST /api/v1/solana/verify-payment
 * Verify a Solana payment transaction
 */
router.post('/solana/verify-payment', async (req: Request, res: Response) => {
  try {
    const { tx_hash, amount, service_id } = req.body;

    if (!tx_hash) {
      return res.status(400).json({
        success: false,
        error: 'Missing tx_hash parameter'
      });
    }

    const verified = await solanaProcessor.verifyPayment(tx_hash);

    if (!verified) {
      return res.status(402).json({
        success: false,
        error: 'Payment verification failed',
        tx_hash
      });
    }

    res.json({
      success: true,
      tx_hash,
      verified: true,
      amount,
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
 * GET /api/v1/solana/wallet-info
 * Get wallet information and balance
 */
router.get('/solana/wallet-info', async (req: Request, res: Response) => {
  try {
    const walletBalance = await solanaProcessor.getWalletBalance();
    const usdcBalance = await solanaProcessor.getUSDCBalance();
    const stats = await solanaProcessor.getPaymentStats();

    res.json({
      success: true,
      wallet: {
        address: process.env.SOLANA_RECEIVER_WALLET || '6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG',
        network: 'mainnet'
      },
      balances: {
        sol: walletBalance,
        usdc: usdcBalance
      },
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
 * GET /api/v1/solana/recent-transactions
 * Get recent transactions
 */
router.get('/solana/recent-transactions', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const transactions = await solanaProcessor.getRecentTransactions(limit);

    res.json({
      success: true,
      count: transactions.length,
      transactions: transactions.map(tx => ({
        signature: tx.signature,
        blockTime: new Date(tx.blockTime * 1000),
        status: tx.status,
        timestamp: new Date(tx.blockTime * 1000).toISOString()
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
 * GET /api/v1/solana/health
 * Health check for Solana integration
 */
router.get('/solana/health', async (req: Request, res: Response) => {
  try {
    const health = await solanaProcessor.healthCheck();

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 202 : 503;

    res.status(statusCode).json({
      success: true,
      status: health.status,
      wallet: {
        verified: health.walletVerified,
        balance_sol: health.walletBalance,
        balance_usdc: health.usdcBalance
      },
      connection: health.connectionStatus,
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
 * GET /api/v1/solana/config
 * Get public Solana configuration
 */
router.get('/solana/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    config: {
      network: 'mainnet',
      receiver_wallet: process.env.SOLANA_RECEIVER_WALLET || '6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG',
      usdc_mint: 'EPjFWaLb3mLskJ2v2H7NnpXFu6HaKgqHSGAJxg6hGLKn',
      rpc_endpoint: 'https://api.mainnet-beta.solana.com',
      payment_methods: ['USDC', 'SOL'],
      supported_currencies: ['USDC', 'SOL']
    }
  });
});

export default router;
