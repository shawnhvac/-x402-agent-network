import { recordCompletedBooking, calculateBookingFee, getProviderUsage, FREE_BOOKING_LIMIT } from '../services/sentdm-notify.js';
import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import Stripe from 'stripe';
import crypto from 'crypto';

const router = Router();
const DB_PATH = '/var/lib/agentpay/bookings.db';

function getDb() { return new Database(DB_PATH); }

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(key, { apiVersion: '2025-03-31.basil' });
}

// ── POST /api/v1/escrow/hold ──────────────────────────────────────────────
// Called after consumer books — charges card and holds in Stripe
router.post('/hold', async (req: Request, res: Response) => {
  try {
    const { booking_id, stripe_customer_id, amount, description, consumer_wallet, provider_wallet } = req.body;
    if (!booking_id || !amount) return res.status(400).json({ error: 'booking_id and amount required' });

    const db = getDb();
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id) as any;
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.escrow_status === 'held') return res.json({ ok: true, message: 'Already in escrow', booking_id });

    let paymentId = '';
    let paymentMethod = 'stripe';

    // If crypto wallet provided, use on-chain escrow (x402)
    if (consumer_wallet) {
      paymentMethod = 'crypto';
      paymentId = `crypto_${crypto.randomUUID()}`;
      // TODO: integrate x402 on-chain escrow — for now log intent
      console.log(`[Escrow] Crypto hold requested: ${consumer_wallet} → ${provider_wallet} for $${amount}`);
    } else if (stripe_customer_id) {
      // Stripe PaymentIntent with capture_method=manual = escrow
      const stripe = getStripe();
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        customer: stripe_customer_id,
        payment_method_types: ['card'],
        capture_method: 'manual', // ← KEY: charges card but holds, not captured yet
        confirm: true,
        off_session: true,
        description: description || `AgentPay escrow: ${booking_id}`,
        metadata: { booking_id, platform: 'agentpay' },
      });
      paymentId = intent.id;
      console.log(`[Escrow] Stripe hold: ${intent.id} status:${intent.status} amount:$${amount}`);
    }

    // Update booking
    db.prepare(`UPDATE bookings SET
      escrow_status = 'held',
      escrow_amount = ?,
      stripe_payment_id = ?,
      payment_method = ?,
      consumer_wallet = ?,
      provider_wallet = ?,
      status = 'confirmed',
      updated_at = datetime('now')
      WHERE id = ?
    `).run(amount, paymentId, paymentMethod, consumer_wallet || null, provider_wallet || null, booking_id);

    db.prepare(`INSERT INTO escrow_events (booking_id, event, amount, tx_hash, actor, note)
      VALUES (?, 'held', ?, ?, 'system', ?)
    `).run(booking_id, amount, paymentId, `${paymentMethod} hold created`);

    res.json({ ok: true, booking_id, escrow_status: 'held', payment_id: paymentId, payment_method: paymentMethod, amount });
  } catch (err: any) {
    console.error('[Escrow hold error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/v1/escrow/provider-confirm ──────────────────────────────────
// Provider confirms service rendered (SMS reply YES or portal click)
router.post('/provider-confirm', async (req: Request, res: Response) => {
  try {
    const { booking_id, provider_token } = req.body;
    if (!booking_id) return res.status(400).json({ error: 'booking_id required' });

    const db = getDb();
    db.prepare(`UPDATE bookings SET provider_confirmed = 1, updated_at = datetime('now') WHERE id = ?`).run(booking_id);
    db.prepare(`INSERT INTO escrow_events (booking_id, event, actor, note) VALUES (?, 'provider_confirmed', 'provider', 'Service marked complete by provider')`).run(booking_id);

    // Check if consumer also confirmed → auto-release
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id) as any;
    if (booking?.consumer_confirmed) {
      return releaseEscrow(booking_id, res, db);
    }

    res.json({ ok: true, booking_id, message: 'Provider confirmed. Waiting for consumer approval to release funds.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/v1/escrow/consumer-confirm ─────────────────────────────────
// Consumer confirms happy with service → releases escrow
router.post('/consumer-confirm', async (req: Request, res: Response) => {
  try {
    const { booking_id, consumer_token } = req.body;
    if (!booking_id) return res.status(400).json({ error: 'booking_id required' });

    const db = getDb();
    db.prepare(`UPDATE bookings SET consumer_confirmed = 1, updated_at = datetime('now') WHERE id = ?`).run(booking_id);
    db.prepare(`INSERT INTO escrow_events (booking_id, event, actor, note) VALUES (?, 'consumer_confirmed', 'consumer', 'Service approved by consumer')`).run(booking_id);

    return releaseEscrow(booking_id, res, db);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/v1/escrow/release ───────────────────────────────────────────
// Internal: capture the Stripe PaymentIntent = release funds to provider
async function releaseEscrow(booking_id: string, res: Response, db: any) {
  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id) as any;
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.escrow_status === 'released') return res.json({ ok: true, message: 'Already released', booking_id });

    let txHash = '';

    if (booking.payment_method === 'stripe' && booking.stripe_payment_id) {
      const stripe = getStripe();
      const captured = await stripe.paymentIntents.capture(booking.stripe_payment_id);
      txHash = captured.id;
      console.log(`[Escrow] Stripe captured: ${captured.id} status:${captured.status}`);
    } else if (booking.payment_method === 'crypto') {
      // TODO: trigger x402 on-chain release via treasury wallet
      txHash = `crypto_release_${Date.now()}`;
      console.log(`[Escrow] Crypto release: wallet ${booking.provider_wallet}`);
    }

    db.prepare(`UPDATE bookings SET
      escrow_status = 'released',
      released_at = datetime('now'),
      status = 'completed',
      escrow_tx_hash = ?,
      updated_at = datetime('now')
      WHERE id = ?
    `).run(txHash, booking_id);

    db.prepare(`INSERT INTO escrow_events (booking_id, event, amount, tx_hash, actor, note)
      VALUES (?, 'released', ?, ?, 'system', 'Both parties confirmed — funds released')
    `).run(booking_id, booking.escrow_amount, txHash);

    // Record completed booking on provider — increments counter, tracks revenue & fees
    if (booking.provider_id) {
      const usage = getProviderUsage(booking.provider_id);
      const feeInfo = calculateBookingFee(booking.escrow_amount, usage.completed_bookings);
      recordCompletedBooking(booking.provider_id, booking.escrow_amount, feeInfo.fee_amount);
      console.log(`[Escrow] Provider ${booking.provider_id} completed booking #${usage.completed_bookings + 1} — fee: ${feeInfo.fee_percent} ($${feeInfo.fee_amount})`);
    }

    return res.json({ ok: true, booking_id, escrow_status: 'released', tx_hash: txHash, amount: booking.escrow_amount });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/escrow/dispute ───────────────────────────────────────────
// Either party raises a dispute — funds frozen, manual review
router.post('/dispute', async (req: Request, res: Response) => {
  try {
    const { booking_id, reason, raised_by } = req.body;
    if (!booking_id) return res.status(400).json({ error: 'booking_id required' });

    const db = getDb();
    db.prepare(`UPDATE bookings SET escrow_status = 'disputed', dispute_at = datetime('now'), status = 'disputed', updated_at = datetime('now') WHERE id = ?`).run(booking_id);
    db.prepare(`INSERT INTO escrow_events (booking_id, event, actor, note) VALUES (?, 'disputed', ?, ?)`).run(booking_id, raised_by || 'unknown', reason || 'No reason provided');

    // TODO: notify Shawn via email for manual review
    res.json({ ok: true, booking_id, escrow_status: 'disputed', message: 'Dispute raised. AgentPay team will review within 24 hours.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/v1/escrow/status/:booking_id ────────────────────────────────
router.get('/status/:booking_id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const booking = db.prepare('SELECT id, status, escrow_status, escrow_amount, payment_method, provider_confirmed, consumer_confirmed, released_at, dispute_at, escrow_tx_hash FROM bookings WHERE id = ?').get(req.params.booking_id) as any;
    if (!booking) return res.status(404).json({ error: 'Not found' });
    const events = db.prepare('SELECT event, actor, note, created_at FROM escrow_events WHERE booking_id = ? ORDER BY id DESC LIMIT 10').all(req.params.booking_id);
    res.json({ ...booking, events });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/v1/escrow/sms-webhook ──────────────────────────────────────
// Sent.dm webhook — provider replies YES/NO via SMS/WhatsApp
router.post('/sms-webhook', async (req: Request, res: Response) => {
  try {
    const { from, body, metadata } = req.body;
    const reply = (body || '').trim().toUpperCase();
    const bookingId = metadata?.booking_id || req.body.booking_id;

    console.log(`[SMS Webhook] from:${from} reply:${reply} booking:${bookingId}`);

    if (!bookingId) return res.status(400).json({ error: 'No booking_id in metadata' });

    const db = getDb();
    if (reply === 'YES' || reply === 'ACCEPT' || reply === 'Y') {
      db.prepare(`UPDATE bookings SET status = 'provider_accepted', updated_at = datetime('now') WHERE id = ?`).run(bookingId);
      db.prepare(`INSERT INTO escrow_events (booking_id, event, actor, note) VALUES (?, 'provider_accepted_sms', 'provider', 'Provider replied YES via SMS')`).run(bookingId);
      res.json({ ok: true, action: 'accepted', booking_id: bookingId });
    } else if (reply === 'NO' || reply === 'DECLINE' || reply === 'N') {
      db.prepare(`UPDATE bookings SET status = 'provider_declined', updated_at = datetime('now') WHERE id = ?`).run(bookingId);
      db.prepare(`INSERT INTO escrow_events (booking_id, event, actor, note) VALUES (?, 'provider_declined_sms', 'provider', 'Provider replied NO via SMS')`).run(bookingId);
      // TODO: trigger refund if escrow was held
      res.json({ ok: true, action: 'declined', booking_id: bookingId });
    } else {
      res.json({ ok: true, action: 'ignored', message: 'Reply not recognized' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/v1/escrow/usage/:phone ──────────────────────────────────────
// Check free tier usage for a provider phone
router.get('/usage/:phone', (req: Request, res: Response) => {
  try {
    const msgDb = new Database('/var/lib/agentpay/messaging.db');
    const row = msgDb.prepare('SELECT * FROM provider_message_usage WHERE phone = ?').get(req.params.phone) as any;
    const count = row?.msg_count ?? 0;
    res.json({
      phone: req.params.phone,
      messages_sent: count,
      free_remaining: Math.max(0, 10 - count),
      is_free: count < 10,
      charge_per_message: count >= 10 ? '$0.05' : 'free',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
