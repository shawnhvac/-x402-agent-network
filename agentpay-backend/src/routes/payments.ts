import { Router, Request, Response } from 'express';
import StripeService from '../services/stripe.service';

const router = Router();

/**
 * POST /api/v1/payments
 * Process a payment for a booking
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      bookingId,
      amount,
      stripeToken,
      userEmail,
    } = req.body;

    // Validate input
    if (!bookingId || !amount || !stripeToken || !userEmail) {
      return res.status(400).json({
        error: 'Missing required fields: bookingId, amount, stripeToken, userEmail',
      });
    }

    // Process payment
    const result = await StripeService.processBookingPayment(
      bookingId,
      amount,
      stripeToken,
      userEmail
    );

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    res.json({
      success: true,
      bookingId,
      chargeId: result.chargeId,
      amount: result.amount,
      fee: result.fee,
      providerAmount: result.providerAmount,
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
    });
  }
});

/**
 * POST /api/v1/payments/refund
 * Refund a charge
 */
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const { chargeId, amount } = req.body;

    if (!chargeId) {
      return res.status(400).json({
        error: 'Missing chargeId',
      });
    }

    const result = await StripeService.refundCharge(chargeId, amount);

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
      });
    }

    res.json({
      success: true,
      refundId: result.refundId,
      amount: result.amount,
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    res.status(500).json({
      error: 'Refund processing failed',
    });
  }
});

export default router;
