import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const openapi = axios.create({
  baseURL: 'https://api.openapi.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export class OpenAPIService {
  /**
   * Process payment via OpenAPI
   */
  static async chargeCard(
    amount: number,
    cardToken: string,
    email: string,
    metadata: any = {}
  ) {
    try {
      const response = await openapi.post('/charges', {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD',
        source: cardToken,
        description: 'AgentPay Booking',
        metadata: {
          email,
          ...metadata,
        },
      });

      return {
        success: true,
        chargeId: response.data.id,
        amount: response.data.amount / 100,
        status: response.data.status,
      };
    } catch (error: any) {
      console.error('OpenAPI charge error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Process booking payment via OpenAPI
   */
  static async processBookingPayment(
    bookingId: string,
    amount: number,
    cardToken: string,
    userEmail: string
  ) {
    try {
      // Charge card
      const chargeResult = await this.chargeCard(
        amount,
        cardToken,
        userEmail,
        { bookingId }
      );

      if (!chargeResult.success) {
        // Update booking to failed
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'failed',
            status: 'cancelled',
          },
        });
        return chargeResult;
      }

      // Calculate fee (same tiered structure as Stripe)
      const feePercent = this.calculateFee(amount);
      const feeAmount = amount * feePercent;
      const providerAmount = amount - feeAmount;

      // Create transaction record
      await prisma.transaction.create({
        data: {
          bookingId,
          amount,
          currency: 'USD',
          method: 'openapi',
          status: 'success',
          stripeChargeId: chargeResult.chargeId, // Reuse field for OpenAPI ID
          description: `OpenAPI payment for booking ${bookingId}`,
        },
      });

      // Update booking to confirmed
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'completed',
          transactionId: chargeResult.chargeId,
          status: 'confirmed',
        },
      });

      // Schedule payout to provider
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (booking) {
        await prisma.payout.create({
          data: {
            providerId: booking.providerId,
            amount,
            fee: feeAmount,
            netAmount: providerAmount,
            status: 'pending',
            method: 'openapi',
          },
        });
      }

      return {
        success: true,
        chargeId: chargeResult.chargeId,
        amount,
        fee: feeAmount,
        providerAmount,
      };
    } catch (error: any) {
      console.error('Booking payment error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refund a charge
   */
  static async refundCharge(chargeId: string, amount?: number) {
    try {
      const response = await openapi.post(`/charges/${chargeId}/refunds`, {
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        success: true,
        refundId: response.data.id,
        amount: response.data.amount / 100,
      };
    } catch (error: any) {
      console.error('Refund error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Calculate tiered fee (same as Stripe)
   */
  static calculateFee(amount: number): number {
    if (amount < 10) return 0.03; // 3%
    if (amount < 50) return 0.025; // 2.5%
    if (amount < 200) return 0.02; // 2%
    if (amount < 1000) return 0.015; // 1.5%
    return 0.01; // 1%
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(body: string, signature: string): any {
    const crypto = require('crypto');
    const secret = process.env.OPENAPI_WEBHOOK_SECRET || '';

    const hash = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      throw new Error('Webhook signature verification failed');
    }

    return JSON.parse(body);
  }

  /**
   * Handle charge succeeded webhook
   */
  static async handleChargeSucceeded(chargeId: string) {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: { stripeChargeId: chargeId, method: 'openapi' },
      });

      if (!transaction) {
        console.log(`Charge ${chargeId} not found in database`);
        return;
      }

      console.log(`✅ OpenAPI Charge succeeded: ${chargeId}`);
    } catch (error) {
      console.error('Handle charge succeeded error:', error);
    }
  }

  /**
   * Handle charge failed webhook
   */
  static async handleChargeFailed(chargeId: string) {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: { stripeChargeId: chargeId, method: 'openapi' },
      });

      if (transaction) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'failed' },
        });

        if (transaction.bookingId) {
          await prisma.booking.update({
            where: { id: transaction.bookingId },
            data: {
              paymentStatus: 'failed',
              status: 'cancelled',
            },
          });
        }
      }

      console.log(`❌ OpenAPI Charge failed: ${chargeId}`);
    } catch (error) {
      console.error('Handle charge failed error:', error);
    }
  }

  /**
   * Handle charge refunded webhook
   */
  static async handleChargeRefunded(chargeId: string) {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: { stripeChargeId: chargeId, method: 'openapi' },
      });

      if (transaction) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'refunded' },
        });

        if (transaction.bookingId) {
          await prisma.booking.update({
            where: { id: transaction.bookingId },
            data: {
              paymentStatus: 'refunded',
              status: 'cancelled',
            },
          });
        }
      }

      console.log(`🔄 OpenAPI Charge refunded: ${chargeId}`);
    } catch (error) {
      console.error('Handle charge refunded error:', error);
    }
  }
}

export default OpenAPIService;
