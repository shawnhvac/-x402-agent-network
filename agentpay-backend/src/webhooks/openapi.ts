import { Router, Request, Response, raw } from 'express';
import OpenAPIService from '../services/openapi.service';

const router = Router();

/**
 * POST /webhooks/openapi
 * Handle OpenAPI webhook events
 */
router.post(
  '/',
  raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-openapi-signature'] as string;

      if (!signature) {
        return res.status(400).json({ error: 'Missing x-openapi-signature header' });
      }

      // Verify webhook signature
      let event;
      try {
        event = OpenAPIService.verifyWebhookSignature(req.body as string, signature);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).json({ error: 'Invalid signature' });
      }

      // Handle events
      switch (event.type) {
        case 'charge.succeeded':
          console.log('📨 OpenAPI Webhook: charge.succeeded');
          await OpenAPIService.handleChargeSucceeded(event.data.id);
          break;

        case 'charge.failed':
          console.log('📨 OpenAPI Webhook: charge.failed');
          await OpenAPIService.handleChargeFailed(event.data.id);
          break;

        case 'charge.refunded':
          console.log('📨 OpenAPI Webhook: charge.refunded');
          await OpenAPIService.handleChargeRefunded(event.data.id);
          break;

        default:
          console.log(`Unhandled OpenAPI webhook type: ${event.type}`);
      }

      // Acknowledge receipt
      res.json({ received: true });
    } catch (error: any) {
      console.error('OpenAPI webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

export default router;
