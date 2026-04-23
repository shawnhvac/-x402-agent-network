import express, { Router, Request, Response } from 'express';
import { sendSMS } from '../services/twilio-notify.js';
import { createBooking, getBooking, updateBookingStatus, findPendingByPhone, getStats } from '../services/booking-db.js';

const router = Router();

// ── registerBooking: now persists to SQLite ───────────────────────
export function registerBooking(booking: {
  id: string;
  phone?: string;
  email?: string;
  businessName: string;
  serviceType: string;
  customerName?: string;
  customerEmail?: string;
  date: string;
  time: string;
  price: number;
  fee?: number;
  net?: number;
}) {
  createBooking({
    id: booking.id,
    status: 'pending',
    business_name: booking.businessName,
    phone: booking.phone,
    email: booking.email,
    service_type: booking.serviceType,
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    date: booking.date,
    time: booking.time,
    price: booking.price,
    fee: booking.fee,
    net: booking.net,
  });
}

// ── ITEM 1: Twilio SMS reply webhook (YES/NO) ─────────────────────────────
/**
 * POST /api/v1/notify/sms-reply
 * Twilio sends inbound SMS here (configure in Twilio console:
 *   Phone Numbers → +18664016083 → Messaging → Webhook: https://www.x402-agent-pay.com/api/v1/notify/sms-reply)
 */
router.post('/sms-reply', express.urlencoded({ extended: false }), async (req: Request, res: Response) => {
  // Twilio sends form-encoded body
  const from    = req.body.From   || '';   // provider's number
  const body    = (req.body.Body  || '').trim().toUpperCase();
  const numMedia = parseInt(req.body.NumMedia || '0', 10);

  console.log(`[SMS-Reply] From: ${from} | Body: "${body}"`);

  // Find pending booking for this phone number
  let matched: any = null;
  let matchedId: string = '';
  const foundBooking = findPendingByPhone(from);
  if (foundBooking) { matched = { ...foundBooking, businessName: foundBooking.business_name, serviceType: foundBooking.service_type }; matchedId = foundBooking.id; }

  let replyText = '';

  if (!matched) {
    replyText = 'AgentPay: We could not find a pending booking for your number. If you need help, visit x402-agent-pay.com';
  } else if (body === 'YES' || body === 'CONFIRM' || body === 'Y') {
    updateBookingStatus(matchedId, 'confirmed', {}, 'sms');
    replyText =
      `AgentPay: Booking CONFIRMED ✅\n` +
      `${matched.serviceType} on ${matched.date} at ${matched.time}\n` +
      `Ref: ${matchedId}\n` +
      `Customer details will follow shortly.`;
    console.log(`[SMS-Reply] Booking ${matchedId} CONFIRMED by ${from}`);
  } else if (body === 'NO' || body === 'DECLINE' || body === 'N') {
    updateBookingStatus(matchedId, 'declined', {}, 'sms');
    replyText =
      `AgentPay: Booking DECLINED ❌\n` +
      `Ref: ${matchedId}\n` +
      `We will find another provider for the customer.`;
    console.log(`[SMS-Reply] Booking ${matchedId} DECLINED by ${from}`);
  } else if (body === 'STOP') {
    replyText = 'You have been unsubscribed from AgentPay booking notifications. Reply START to re-subscribe.';
  } else if (body === 'START') {
    replyText = 'Welcome back to AgentPay booking notifications! You will now receive booking requests again.';
  } else if (body === 'HELP') {
    replyText = 'AgentPay: Reply YES to confirm a booking or NO to decline. Visit x402-agent-pay.com for help.';
  } else {
    replyText = `AgentPay: Reply YES to confirm or NO to decline your pending booking (Ref: ${matchedId}). Reply HELP for assistance.`;
  }

  // Respond with TwiML (Twilio reads this as the reply SMS)
  res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${replyText}</Message>
</Response>`);
});

// ── ITEM 1b: IVR response (already in services.ts, also handle here for cleanliness)
/**
 * POST /api/v1/notify/ivr-response/:bookingId
 * Twilio voice IVR — business pressed 1 (confirm) or 2 (decline)
 */
router.post('/ivr-response/:bookingId', express.urlencoded({ extended: false }), (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const digit = req.body.Digits;
  const booking = getBooking(bookingId);

  let message = '';
  if (digit === '1') {
    if (booking) updateBookingStatus(bookingId, 'confirmed', {}, 'ivr');
    message = 'Thank you! The booking has been confirmed. We will send you the customer details shortly. Goodbye.';
    console.log(`[IVR] Booking ${bookingId} CONFIRMED`);
  } else if (digit === '2') {
    if (booking) updateBookingStatus(bookingId, 'declined', {}, 'ivr');
    message = 'The booking has been declined. We will find another provider. Goodbye.';
    console.log(`[IVR] Booking ${bookingId} DECLINED`);
  } else {
    message = 'We did not receive a valid response. Please call AgentPay support if you have questions. Goodbye.';
  }

  res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${message}</Say>
</Response>`);
});

// ── Booking status check (internal/admin) ────────────────────────────────
router.get('/status/:bookingId', (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const booking = getBooking(bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  return res.json({ bookingId, ...booking });
});

// ── ITEM 2: Provider SMS opt-in (from sms-consent.html form) ─────────────
/**
 * POST /api/v1/notify/optin
 * Body: { phone: string }
 * Sends a welcome/confirmation SMS to the provider and records opt-in
 */
router.post('/optin', async (req: Request, res: Response) => {
  const { phone, business_name } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number required' });
  }

  // Normalize phone
  const cleaned = phone.replace(/\D/g, '');
  const e164 = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;

  console.log(`[Opt-In] New provider opt-in: ${e164} | Business: ${business_name || 'unknown'}`);

  // Send confirmation SMS
  const confirmMsg =
    `Welcome to AgentPay! ✅\n` +
    `You will now receive booking notifications for${business_name ? ' ' + business_name : ' your business'}.\n` +
    `Reply YES to confirm bookings, NO to decline.\n` +
    `Reply STOP anytime to unsubscribe.\n` +
    `x402-agent-pay.com`;

  const sent = await sendSMS(e164, confirmMsg);

  if (sent) {
    return res.json({
      success: true,
      message: 'Opted in! Check your phone for a confirmation text.',
      phone: e164
    });
  } else {
    return res.status(500).json({
      success: false,
      error: 'Could not send confirmation SMS. Please verify your number and try again.'
    });
  }
});


// ── Booking status update (from email monitor) ───────────────────
router.post('/booking-status', express.json(), (req: Request, res: Response) => {
  const { bookingId, status, source } = req.body;
  if (!bookingId || !status) return res.status(400).json({ error: 'bookingId and status required' });
  const ok = updateBookingStatus(bookingId, status, {}, source ?? 'email');
  return res.json({ ok, bookingId, status });
});

// ── Stats endpoint ────────────────────────────────────────────────
router.get('/stats', (_req: Request, res: Response) => {
  return res.json(getStats());
});

export default router;

