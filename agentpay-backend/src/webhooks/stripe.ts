import { Router, Request, Response, raw } from 'express';
import StripeService from '../services/stripe.service';

const router = Router();

/**
 * POST /webhooks/stripe
 * Handle Stripe webhook events
 */
router.post(
  '/',
  raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    try {
      const sig = req.headers['stripe-signature'] as string;

      if (!sig) {
        return res.status(400).json({ error: 'Missing stripe-signature header' });
      }

      // Verify webhook signature
      let event;
      try {
        event = StripeService.verifyWebhookSignature(req.body as string, sig);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).json({ error: 'Invalid signature' });
      }

      // Handle events
      switch (event.type) {
        case 'charge.succeeded':
          console.log('📨 Webhook: charge.succeeded');
          await StripeService.handleChargeSucceeded(event.data.object.id);
          break;

        case 'charge.failed':
          console.log('📨 Webhook: charge.failed');
          await StripeService.handleChargeFailed(event.data.object.id);
          break;

        case 'charge.refunded':
          console.log('📨 Webhook: charge.refunded');
          await StripeService.handleChargeRefunded(event.data.object.id);
          break;

        default:
          console.log(`Unhandled webhook type: ${event.type}`);
      }

      // Acknowledge receipt
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

export default router;
