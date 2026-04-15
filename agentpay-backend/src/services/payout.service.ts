import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export class PayoutService {
  /**
   * Get provider earnings summary
   */
  static async getProviderEarnings(providerId: string) {
    try {
      // Get completed bookings
      const bookings = await prisma.booking.findMany({
        where: {
          providerId,
          paymentStatus: 'completed',
        },
        include: {
          service: true,
        },
      });

      const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);

      // Get pending payouts
      const pendingPayouts = await prisma.payout.findMany({
        where: {
          providerId,
          status: 'pending',
        },
      });

      const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.netAmount, 0);

      // Get completed payouts
      const completedPayouts = await prisma.payout.findMany({
        where: {
          providerId,
          status: 'completed',
        },
      });

      const completedAmount = completedPayouts.reduce((sum, p) => sum + p.netAmount, 0);

      return {
        providerId,
        totalBookings: bookings.length,
        totalRevenue,
        pendingPayouts: pendingAmount,
        completedPayouts: completedAmount,
        totalEarnings: completedAmount + pendingAmount,
      };
    } catch (error) {
      console.error('Get earnings error:', error);
      throw error;
    }
  }

  /**
   * Schedule daily payout for a provider
   */
  static async scheduleProviderPayout(providerId: string) {
    try {
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
      });

      if (!provider) {
        console.log(`Provider ${providerId} not found`);
        return null;
      }

      // Get unpaid bookings from last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const completedBookings = await prisma.booking.findMany({
        where: {
          providerId,
          paymentStatus: 'completed',
          completedAt: {
            gte: twentyFourHoursAgo,
          },
        },
      });

      if (completedBookings.length === 0) {
        console.log(`No bookings to payout for provider ${providerId}`);
        return null;
      }

      // Calculate total payout
      const totalAmount = completedBookings.reduce((sum, b) => sum + b.amount, 0);
      const feeAmount = completedBookings.reduce((sum, b) => {
        const percent = this.calculateFeePercent(b.amount);
        return sum + (b.amount * percent);
      }, 0);

      const netAmount = totalAmount - feeAmount;

      // Create payout record
      const payout = await prisma.payout.create({
        data: {
          providerId,
          amount: totalAmount,
          fee: feeAmount,
          netAmount,
          status: 'pending',
          method: 'bank',
        },
      });

      console.log(`📊 Payout scheduled for ${provider.name}: $${netAmount.toFixed(2)}`);
      return payout;
    } catch (error) {
      console.error('Schedule payout error:', error);
      throw error;
    }
  }

  /**
   * Process a pending payout to provider's bank
   */
  static async processPayout(payoutId: string) {
    try {
      const payout = await prisma.payout.findUnique({
        where: { id: payoutId },
        include: {
          provider: true,
        },
      });

      if (!payout) {
        console.log(`Payout ${payoutId} not found`);
        return null;
      }

      if (!payout.provider.bankAccount) {
        console.log(`No bank account for provider ${payout.providerId}`);
        return null;
      }

      // Call bank API to transfer funds (mock for now)
      const transferResult = await this.transferToBank(
        payout.provider.bankAccount,
        payout.netAmount
      );

      if (!transferResult.success) {
        console.error(`Transfer failed for payout ${payoutId}`);
        return null;
      }

      // Update payout status
      const updatedPayout = await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: 'completed',
          txId: transferResult.transactionId,
        },
      });

      console.log(`💰 Payout completed: ${payout.provider.name} received $${payout.netAmount.toFixed(2)}`);
      return updatedPayout;
    } catch (error) {
      console.error('Process payout error:', error);
      throw error;
    }
  }

  /**
   * Process all pending payouts (called by cron job)
   */
  static async processBatchPayouts() {
    try {
      console.log('🔄 Processing batch payouts...');

      const pendingPayouts = await prisma.payout.findMany({
        where: { status: 'pending' },
        take: 100, // Batch of 100
      });

      console.log(`Found ${pendingPayouts.length} pending payouts`);

      let completed = 0;
      let failed = 0;

      for (const payout of pendingPayouts) {
        try {
          await this.processPayout(payout.id);
          completed++;
        } catch (error) {
          console.error(`Failed to process payout ${payout.id}:`, error);
          failed++;
        }
      }

      console.log(`✅ Batch complete: ${completed} succeeded, ${failed} failed`);
      return { completed, failed };
    } catch (error) {
      console.error('Batch payout error:', error);
      throw error;
    }
  }

  /**
   * Calculate tiered fee percent
   */
  private static calculateFeePercent(amount: number): number {
    if (amount < 10) return 0.03;
    if (amount < 50) return 0.025;
    if (amount < 200) return 0.02;
    if (amount < 1000) return 0.015;
    return 0.01;
  }

  /**
   * Mock bank transfer (replace with real API)
   */
  private static async transferToBank(bankAccount: string, amount: number) {
    try {
      // In production, call your bank's API (Stripe Connect, ACH, etc.)
      // For now, simulate successful transfer
      
      return {
        success: true,
        transactionId: `TRANSFER_${Date.now()}`,
        amount,
        bankAccount,
      };
    } catch (error) {
      return {
        success: false,
        error: error,
      };
    }
  }
}

export default PayoutService;
