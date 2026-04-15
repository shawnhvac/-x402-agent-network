import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class StripeService {
  /**
   * Calculate AgentPay fee based on transaction amount (tiered)
   */
  static calculateFee(amount: number): number {
    if (amount < 10) return 0.03; // 3%
    if (amount < 50) return 0.025; // 2.5%
    if (amount < 200) return 0.02; // 2%
    if (amount < 1000) return 0.015; // 1.5%
    return 0.01; // 1%
  }

  /**
   * Charge a customer via Stripe
   */
  static async chargeCustomer(
    amount: number,
    currency: string,
    source: string,
    description: string,
    metadata: any = {}
  ) {
    try {
      const charge = await stripe.charges.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        source,
        description,
        metadata,
      });

      return {
        success: true,
        chargeId: charge.id,
        amount: charge.amount / 100,
        status: charge.status,
      };
    } catch (error: any) {
      console.error('Stripe charge error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process booking payment
   */
  static async processBookingPayment(
    bookingId: string,
    amount: number,
    source: string,
    userEmail: string
  ) {
    try {
      // Charge customer
      const chargeResult = await this.chargeCustomer(
        amount,
        'usd',
        source,
        `AgentPay Booking: ${bookingId}`,
        { bookingId, userEmail }
      );

      if (!chargeResult.success) {
        // Update booking status to failed
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'failed',
            status: 'cancelled',
          },
        });
        return chargeResult;
      }

      // Calculate fee
      const feePercent = this.calculateFee(amount);
      const feeAmount = amount * feePercent;
      const providerAmount = amount - feeAmount;

      // Create transaction record
      await prisma.transaction.create({
        data: {
          bookingId,
          amount,
          currency: 'USD',
          method: 'stripe',
          status: 'success',
          stripeChargeId: chargeResult.chargeId,
          description: `Booking payment for ${bookingId}`,
        },
      });

      // Update booking to paid
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
            method: 'stripe',
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
      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
      };
    } catch (error: any) {
      console.error('Refund error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get charge details
   */
  static async getCharge(chargeId: string) {
    try {
      const charge = await stripe.charges.retrieve(chargeId);
      return {
        id: charge.id,
        amount: charge.amount / 100,
        status: charge.status,
        description: charge.description,
        metadata: charge.metadata,
      };
    } catch (error: any) {
      console.error('Get charge error:', error);
      return null;
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(body: string, signature: string): any {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
      return event;
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error);
      throw error;
    }
  }

  /**
   * Handle charge.succeeded webhook
   */
  static async handleChargeSucceeded(chargeId: string) {
    try {
      const charge = await this.getCharge(chargeId);
      if (!charge) return;

      // Find transaction by chargeId
      const transaction = await prisma.transaction.findFirst({
        where: { stripeChargeId: chargeId },
      });

      if (transaction) {
        // Already processed
        console.log(`Charge ${chargeId} already processed`);
        return;
      }

      console.log(`✅ Charge succeeded: ${chargeId}`);
    } catch (error) {
      console.error('Handle charge succeeded error:', error);
    }
  }

  /**
   * Handle charge.failed webhook
   */
  static async handleChargeFailed(chargeId: string) {
    try {
      const charge = await this.getCharge(chargeId);
      if (!charge) return;

      // Find and update transaction
      const transaction = await prisma.transaction.findFirst({
        where: { stripeChargeId: chargeId },
      });

      if (transaction) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'failed' },
        });

        // Update booking
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

      console.log(`❌ Charge failed: ${chargeId}`);
    } catch (error) {
      console.error('Handle charge failed error:', error);
    }
  }

  /**
   * Handle charge.refunded webhook
   */
  static async handleChargeRefunded(chargeId: string) {
    try {
      // Find transaction
      const transaction = await prisma.transaction.findFirst({
        where: { stripeChargeId: chargeId },
      });

      if (transaction) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'refunded' },
        });

        // Update booking
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

      console.log(`🔄 Charge refunded: ${chargeId}`);
    } catch (error) {
      console.error('Handle charge refunded error:', error);
    }
  }
}

export default StripeService;
