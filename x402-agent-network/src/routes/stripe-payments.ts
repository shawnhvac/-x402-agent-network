import { Router, Request, Response } from 'express';
import StripePaymentProcessor from '../services/stripe-payment';

const router = Router();

// Initialize Stripe payment processor
const stripeProcessor = new StripePaymentProcessor({
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_live_',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_'
});

/**
 * POST /api/v1/stripe/create-payment-intent
 * Create a payment intent for checkout
 */
router.post('/stripe/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'usd', service_id, booking_id, agent_address } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const metadata: Record<string, string> = {};
    if (service_id) metadata.service_id = service_id;
    if (booking_id) metadata.booking_id = booking_id;
    if (agent_address) metadata.agent_address = agent_address;

    const paymentIntent = await stripeProcessor.createPaymentIntent(amount, currency, metadata);

    res.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      amount,
      currency,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

/**
 * POST /api/v1/stripe/verify-payment
 * Verify a Stripe payment
 */
router.post('/stripe/verify-payment', async (req: Request, res: Response) => {
  try {
    const { payment_intent_id, charge_id } = req.body;

    if (!payment_intent_id && !charge_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment_intent_id or charge_id'
      });
    }

    let charge = null;
    if (payment_intent_id) {
      charge = await stripeProcessor.verifyPayment(payment_intent_id);
    } else if (charge_id) {
      charge = await stripeProcessor.getChargeDetails(charge_id);
    }

    if (!charge) {
      return res.status(402).json({
        success: false,
        error: 'Payment verification failed'
      });
    }

    res.json({
      success: true,
      charge: {
        id: charge.chargeId,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        paymentMethod: charge.paymentMethod,
        timestamp: new Date(charge.timestamp).toISOString()
      }
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
 * GET /api/v1/stripe/recent-charges
 * Get recent charges
 */
router.get('/stripe/recent-charges', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const charges = await stripeProcessor.getRecentCharges(limit);

    res.json({
      success: true,
      count: charges.length,
      charges: charges.map(charge => ({
        id: charge.chargeId,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        paymentMethod: charge.paymentMethod,
        timestamp: new Date(charge.timestamp).toISOString()
      }))
    });
  } catch (error) {
    console.error('Charges fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch charges'
    });
  }
});

/**
 * POST /api/v1/stripe/refund
 * Refund a charge
 */
router.post('/stripe/refund', async (req: Request, res: Response) => {
  try {
    const { charge_id, amount } = req.body;

    if (!charge_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing charge_id'
      });
    }

    const refunded = await stripeProcessor.refundCharge(charge_id, amount);

    if (!refunded) {
      return res.status(402).json({
        success: false,
        error: 'Refund failed'
      });
    }

    res.json({
      success: true,
      message: 'Refund processed',
      charge_id,
      amount: amount || 'full',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: 'Refund processing failed'
    });
  }
});

/**
 * GET /api/v1/stripe/health
 * Health check for Stripe integration
 */
router.get('/stripe/health', async (req: Request, res: Response) => {
  try {
    const health = await stripeProcessor.healthCheck();

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 202 : 503;

    res.status(statusCode).json({
      success: true,
      status: health.status,
      connected: health.connected,
      accountId: health.accountId,
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
 * GET /api/v1/stripe/stats
 * Get payment statistics
 */
router.get('/stripe/stats', async (req: Request, res: Response) => {
  try {
    const stats = await stripeProcessor.getPaymentStats();

    if (!stats) {
      return res.status(503).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }

    res.json({
      success: true,
      stats: {
        totalCharges: stats.totalCharges,
        successfulCharges: stats.successfulCharges,
        failedCharges: stats.failedCharges,
        totalRevenue: stats.totalRevenue,
        successRate: stats.totalCharges > 0 
          ? ((stats.successfulCharges / stats.totalCharges) * 100).toFixed(2) + '%'
          : '0%'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * GET /api/v1/stripe/config
 * Get public Stripe configuration
 */
router.get('/stripe/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    config: {
      publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_',
      currency: 'usd',
      supportedPaymentMethods: [
        'card',
        'apple_pay',
        'google_pay',
        'bank_transfer'
      ]
    }
  });
});

export default router;
