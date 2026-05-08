import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// ─── Fee calculator ───────────────────────────────────────────────────────
export function calculateFee(servicePrice: number): number {
  if (servicePrice < 50)  return Math.round(servicePrice * 0.03 * 100) / 100;
  if (servicePrice <= 200) return Math.round(servicePrice * 0.02 * 100) / 100;
  return Math.round(servicePrice * 0.01 * 100) / 100;
}
export function feePercent(servicePrice: number): string {
  if (servicePrice < 50)  return '3%';
  if (servicePrice <= 200) return '2%';
  return '1%';
}

// ─── Free tier DB ─────────────────────────────────────────────────────────
const DB_DIR = '/var/lib/agentpay';
const DB_PATH = path.join(DB_DIR, 'messaging.db');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const msgDb = new Database(DB_PATH);
msgDb.exec(`
  CREATE TABLE IF NOT EXISTS provider_message_usage (
    phone        TEXT PRIMARY KEY,
    msg_count    INTEGER DEFAULT 0,
    first_msg_at TEXT,
    last_msg_at  TEXT,
    stripe_customer_id TEXT
  );
  CREATE TABLE IF NOT EXISTS message_log (
    id           TEXT PRIMARY KEY,
    phone        TEXT NOT NULL,
    booking_id   TEXT,
    direction    TEXT DEFAULT 'outbound',
    channel      TEXT,
    body         TEXT,
    status       TEXT DEFAULT 'sent',
    charged      INTEGER DEFAULT 0,
    charge_cents INTEGER DEFAULT 0,
    created_at   TEXT DEFAULT (datetime('now'))
  );
`);

const FREE_TIER_LIMIT = 10;
const MSG_PRICE_CENTS = 5; // $0.05 per message after free tier

export interface MessageUsage {
  phone: string;
  msg_count: number;
  first_msg_at: string;
  last_msg_at: string;
  stripe_customer_id?: string;
  is_free: boolean;
  remaining_free: number;
}

export function getUsage(phone: string): MessageUsage {
  const row = msgDb.prepare('SELECT * FROM provider_message_usage WHERE phone = ?').get(phone) as any;
  const count = row?.msg_count ?? 0;
  return {
    phone,
    msg_count: count,
    first_msg_at: row?.first_msg_at ?? '',
    last_msg_at:  row?.last_msg_at  ?? '',
    stripe_customer_id: row?.stripe_customer_id,
    is_free: count < FREE_TIER_LIMIT,
    remaining_free: Math.max(0, FREE_TIER_LIMIT - count),
  };
}

export function incrementUsage(phone: string): MessageUsage {
  const now = new Date().toISOString();
  msgDb.prepare(`
    INSERT INTO provider_message_usage (phone, msg_count, first_msg_at, last_msg_at)
    VALUES (?, 1, ?, ?)
    ON CONFLICT(phone) DO UPDATE SET
      msg_count   = msg_count + 1,
      last_msg_at = excluded.last_msg_at
  `).run(phone, now, now);
  return getUsage(phone);
}

export function logMessage(id: string, phone: string, body: string, bookingId: string, channel: string, charged: boolean, chargeCents: number) {
  msgDb.prepare(`
    INSERT OR IGNORE INTO message_log (id, phone, booking_id, body, channel, charged, charge_cents)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, phone, bookingId, body, channel, charged ? 1 : 0, chargeCents);
}

// ─── Sent.dm API ──────────────────────────────────────────────────────────
const SENTDM_API_KEY = process.env.SENTDM_API_KEY || '';
const SENTDM_BASE    = 'https://api.sent.dm/v1';

async function sentdmSend(phone: string, templateId: string, variables: Record<string,string>): Promise<{ ok: boolean; channel?: string; messageId?: string; error?: string }> {
  if (!SENTDM_API_KEY) return { ok: false, error: 'SENTDM_API_KEY not configured' };
  try {
    const res = await fetch(`${SENTDM_BASE}/messages/send-to-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENTDM_API_KEY}`,
      },
      body: JSON.stringify({ phoneNumber: phone, templateId, templateVariables: variables }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json() as any;
    if (res.ok) return { ok: true, channel: data.channel, messageId: data.id };
    return { ok: false, error: data.message || data.error || JSON.stringify(data) };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// Fallback: plain SMS via Sent.dm custom message endpoint
async function sentdmSendRaw(phone: string, body: string): Promise<{ ok: boolean; channel?: string; messageId?: string; error?: string }> {
  if (!SENTDM_API_KEY) return { ok: false, error: 'SENTDM_API_KEY not configured' };
  try {
    const res = await fetch(`${SENTDM_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENTDM_API_KEY}`,
      },
      body: JSON.stringify({ to: phone, body }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json() as any;
    if (res.ok) return { ok: true, channel: data.channel || 'sms', messageId: data.id };
    return { ok: false, error: data.message || data.error || JSON.stringify(data) };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ─── Main notifyBusiness function ────────────────────────────────────────
export async function notifyBusiness(
  phone: string,
  businessName: string,
  serviceType: string,
  customerName: string,
  date: string,
  time: string,
  price: number,
  bookingId: string,
  stripeCustomerId?: string,
): Promise<{ ok: boolean; channel?: string; charged: boolean; chargeCents: number; error?: string }> {

  const usage = incrementUsage(phone);
  const charged   = !usage.is_free; // is_free is AFTER increment, so check count
  const chargeCents = charged ? MSG_PRICE_CENTS : 0;

  const msgBody = `Hi ${businessName}! 👋 New appointment request via AgentPay:\n\n` +
    `Service: ${serviceType}\n` +
    `Customer: ${customerName}\n` +
    `Date: ${date} at ${time}\n` +
    `Price: $${price}\n` +
    `Booking ID: ${bookingId}\n\n` +
    `Reply YES to accept or NO to decline.\n` +
    `Confirm service complete: agentpay.me/confirm/${bookingId}`;

  // Try Sent.dm raw message (works without pre-approved template)
  const result = await sentdmSendRaw(phone, msgBody);

  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  logMessage(msgId, phone, msgBody, bookingId, result.channel || 'sms', charged, chargeCents);

  console.log(`[Sent.dm] ${phone} | booking:${bookingId} | channel:${result.channel} | free:${!charged} | ok:${result.ok}`);

  return { ok: result.ok, channel: result.channel, charged, chargeCents, error: result.error };
}

// ─── Email fallback (keep for non-phone businesses) ───────────────────────
const BASE44_EMAIL_FN = 'https://muskox3-481c23be.base44.app/functions/sendBookingEmail';

export async function sendEmailNotification(
  email: string, subject: string, body: string, bookingId?: string, type?: string
): Promise<boolean> {
  try {
    const SIGNATURE = `\n\n---\nShawn Lippert\nAgentPay Team\n95b Havasupai St, Grand Canyon, AZ 86023\nhttps://www.x402-agent-pay.com`;
    const res = await fetch(BASE44_EMAIL_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, subject, textBody: body + SIGNATURE, bookingId: bookingId ?? '', type: type ?? 'booking_request' }),
    });
    const data = await res.json().catch(() => ({})) as any;
    return res.ok && data.ok;
  } catch { return false; }
}

export async function sendSMS(to: string, body: string): Promise<boolean> {
  const r = await sentdmSendRaw(to, body);
  return r.ok;
}

export async function makeRobocall(to: string, message: string, bookingId: string): Promise<boolean> {
  // Sent.dm doesn't do voice — send rich WhatsApp/SMS instead
  return sendSMS(to, `[Voice fallback] ${message} | Booking: ${bookingId}`);
}
