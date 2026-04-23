import { fileURLToPath as _fup } from 'url';
import { dirname as _dn } from 'path';
const __filename = _fup(import.meta.url);
const __dirname = _dn(__filename);
import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';

// Stripe Configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_live_';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_51TMGCIEx';

interface StripePaymentConfig {
  secretKey: string;
  publishableKey: string;
  currency: string;
}

interface StripeCharge {
  chargeId: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail: string;
  description: string;
  paymentMethod: string;
  timestamp: number;
  metadata: {
    service_id?: string;
    booking_id?: string;
    agent_address?: string;
  };
}

class StripePaymentProcessor {
  private stripe: Stripe;
  private config: StripePaymentConfig;
  private paymentLog: string = path.join(__dirname, '../../logs/stripe-payments.log');

  constructor(config?: Partial<StripePaymentConfig>) {
    this.config = {
      secretKey: STRIPE_SECRET_KEY,
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      currency: 'usd',
      ...config
    };

    this.stripe = new Stripe(this.config.secretKey, {
      apiVersion: '2024-04-10'
    });

    // Ensure logs directory exists
    const logsDir = path.dirname(this.paymentLog);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  /**
   * Create a payment intent for checkout
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: metadata || {}
      });

      return {
        clientSecret: paymentIntent.client_secret || '',
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw error;
    }
  }

  /**
   * Verify a payment intent
   */
  async verifyPayment(paymentIntentId: string): Promise<StripeCharge | null> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        console.log('Payment not yet succeeded:', paymentIntent.status);
        return null;
      }

      const charge: StripeCharge = {
        chargeId: paymentIntent.charges.data[0]?.id || '',
        amount: (paymentIntent.amount || 0) / 100, // Convert from cents
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        customerEmail: paymentIntent.receipt_email || '',
        description: paymentIntent.description || '',
        paymentMethod: paymentIntent.payment_method_types[0] || '',
        timestamp: Date.now(),
        metadata: {
          service_id: paymentIntent.metadata?.service_id,
          booking_id: paymentIntent.metadata?.booking_id,
          agent_address: paymentIntent.metadata?.agent_address
        }
      };

      this.logPayment(charge);
      return charge;
    } catch (error) {
      console.error('Payment verification error:', error);
      return null;
    }
  }

  /**
   * Create a charge directly (legacy)
   */
  async createCharge(
    amount: number,
    token: string,
    description: string,
    metadata?: Record<string, string>
  ): Promise<StripeCharge | null> {
    try {
      const charge = await this.stripe.charges.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        source: token,
        description,
        metadata: metadata || {}
      });

      const stripeCharge: StripeCharge = {
        chargeId: charge.id,
        amount: (charge.amount || 0) / 100,
        currency: charge.currency,
        status: charge.status,
        customerEmail: charge.receipt_email || '',
        description: charge.description || '',
        paymentMethod: charge.payment_method || '',
        timestamp: charge.created * 1000,
        metadata: {
          service_id: charge.metadata?.service_id,
          booking_id: charge.metadata?.booking_id,
          agent_address: charge.metadata?.agent_address
        }
      };

      if (charge.status === 'succeeded') {
        this.logPayment(stripeCharge);
      }

      return stripeCharge;
    } catch (error) {
      console.error('Charge creation error:', error);
      return null;
    }
  }

  /**
   * Get charge details
   */
  async getChargeDetails(chargeId: string): Promise<StripeCharge | null> {
    try {
      const charge = await this.stripe.charges.retrieve(chargeId);

      return {
        chargeId: charge.id,
        amount: (charge.amount || 0) / 100,
        currency: charge.currency,
        status: charge.status,
        customerEmail: charge.receipt_email || '',
        description: charge.description || '',
        paymentMethod: charge.payment_method || '',
        timestamp: charge.created * 1000,
        metadata: {
          service_id: charge.metadata?.service_id,
          booking_id: charge.metadata?.booking_id,
          agent_address: charge.metadata?.agent_address
        }
      };
    } catch (error) {
      console.error('Charge details error:', error);
      return null;
    }
  }

  /**
   * Refund a charge
   */
  async refundCharge(chargeId: string, amount?: number): Promise<boolean> {
    try {
      const refund = await this.stripe.refunds.create({
        charge: chargeId,
        amount: amount ? Math.round(amount * 100) : undefined
      });

      console.log('Refund created:', refund.id);
      return refund.status === 'succeeded';
    } catch (error) {
      console.error('Refund error:', error);
      return false;
    }
  }

  /**
   * Get recent charges
   */
  async getRecentCharges(limit: number = 10): Promise<StripeCharge[]> {
    try {
      const charges = await this.stripe.charges.list({
        limit: Math.min(limit, 100)
      });

      return charges.data.map(charge => ({
        chargeId: charge.id,
        amount: (charge.amount || 0) / 100,
        currency: charge.currency,
        status: charge.status,
        customerEmail: charge.receipt_email || '',
        description: charge.description || '',
        paymentMethod: charge.payment_method || '',
        timestamp: charge.created * 1000,
        metadata: {
          service_id: charge.metadata?.service_id,
          booking_id: charge.metadata?.booking_id,
          agent_address: charge.metadata?.agent_address
        }
      }));
    } catch (error) {
      console.error('Charges fetch error:', error);
      return [];
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<{
    totalCharges: number;
    successfulCharges: number;
    failedCharges: number;
    totalRevenue: number;
  } | null> {
    try {
      const charges = await this.getRecentCharges(100);

      const totalRevenue = charges
        .filter(c => c.status === 'succeeded')
        .reduce((sum, c) => sum + c.amount, 0);

      return {
        totalCharges: charges.length,
        successfulCharges: charges.filter(c => c.status === 'succeeded').length,
        failedCharges: charges.filter(c => c.status === 'failed').length,
        totalRevenue
      };
    } catch (error) {
      console.error('Stats error:', error);
      return null;
    }
  }

  /**
   * Log payment for audit trail
   */
  private logPayment(payment: StripeCharge): void {
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
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    connected: boolean;
    accountId: string;
  }> {
    try {
      const account = await this.stripe.account.retrieve();

      return {
        status: account.id ? 'healthy' : 'degraded',
        connected: true,
        accountId: account.id || ''
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'unhealthy',
        connected: false,
        accountId: ''
      };
    }
  }
}

export default StripePaymentProcessor;
export { StripeCharge, StripePaymentConfig };
