import cron from 'node-cron';
import PayoutService from '../services/payout.service';

/**
 * Schedule daily payout processing
 * Runs every day at 6:00 AM UTC
 */
export const initializePayoutJobs = () => {
  console.log('⏰ Initializing payout scheduler...');

  // Daily payout at 6 AM UTC
  cron.schedule('0 6 * * *', async () => {
    console.log('\n🔄 [CRON] Daily payout batch started');
    try {
      const result = await PayoutService.processBatchPayouts();
      console.log(`[CRON] ✅ Batch complete: ${result.completed} succeeded, ${result.failed} failed\n`);
    } catch (error) {
      console.error(`[CRON] ❌ Payout job failed:`, error);
    }
  });

  // Optional: Health check every hour (for monitoring)
  cron.schedule('0 * * * *', () => {
    console.log('[CRON] Hourly health check: Payout scheduler is active');
  });

  console.log('✅ Payout jobs initialized (runs daily at 6 AM UTC)');
};

export default { initializePayoutJobs };
