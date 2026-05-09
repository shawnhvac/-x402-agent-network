import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = '/var/lib/agentpay';
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// ─── FREE TIER ────────────────────────────────────────────────────────────
// First 10 completed bookings per provider = FREE (onboarding incentive)
export const FREE_BOOKING_LIMIT = 10;

// ─── TIERED FEE MODEL ────────────────────────────────────────────────────
// Incentivizes large-ticket services by charging them less
// Small purchases pay more % so we still make revenue on low-value bookings
//
//  Under $25        → 5%  (small purchases / quick services)
//  $25  – $100      → 4%
//  $100 – $500      → 3%
//  $500 – $2,000    → 2%
//  Over $2,000      → 1%  (large services: contractors, medical, legal, etc.)
//
export interface FeeResult {
  is_free:           boolean;
  fee_percent:       string;
  fee_amount:        number;   // USD
  net_to_provider:   number;   // USD
  service_price:     number;
  completed_bookings: number;
  free_remaining:    number;
  tier_label:        string;
}

export function calculateBookingFee(servicePrice: number, completedBookings: number): FeeResult {
  const is_free = completedBookings < FREE_BOOKING_LIMIT;

  let rate = 0;
  let fee_percent = '0%';
  let tier_label = 'Free Tier';

  if (!is_free) {
    if (servicePrice < 25) {
      rate = 0.05; fee_percent = '5%'; tier_label = 'Micro (<$25)';
    } else if (servicePrice < 100) {
      rate = 0.04; fee_percent = '4%'; tier_label = 'Standard ($25–$100)';
    } else if (servicePrice < 500) {
      rate = 0.03; fee_percent = '3%'; tier_label = 'Pro ($100–$500)';
    } else if (servicePrice < 2000) {
      rate = 0.02; fee_percent = '2%'; tier_label = 'Business ($500–$2K)';
    } else {
      rate = 0.01; fee_percent = '1%'; tier_label = 'Enterprise (>$2K)';
    }
  }

  const fee_amount      = Math.round(servicePrice * rate * 100) / 100;
  const net_to_provider = Math.round((servicePrice - fee_amount) * 100) / 100;

  return {
    is_free,
    fee_percent,
    fee_amount,
    net_to_provider,
    service_price: servicePrice,
    completed_bookings: completedBookings,
    free_remaining: Math.max(0, FREE_BOOKING_LIMIT - completedBookings),
    tier_label,
  };
}

// Legacy aliases used elsewhere in the codebase
export function calculateFee(servicePrice: number): number {
  if (servicePrice < 25)   return Math.round(servicePrice * 0.05 * 100) / 100;
  if (servicePrice < 100)  return Math.round(servicePrice * 0.04 * 100) / 100;
  if (servicePrice < 500)  return Math.round(servicePrice * 0.03 * 100) / 100;
  if (servicePrice < 2000) return Math.round(servicePrice * 0.02 * 100) / 100;
  return Math.round(servicePrice * 0.01 * 100) / 100;
}
export function feePercent(servicePrice: number): string {
  if (servicePrice < 25)   return '5%';
  if (servicePrice < 100)  return '4%';
  if (servicePrice < 500)  return '3%';
  if (servicePrice < 2000) return '2%';
  return '1%';
}

// ─── Provider booking counter ─────────────────────────────────────────────
const providerDb = new Database(path.join(DB_DIR, 'providers.db'));

// Ensure columns exist
const provCols = (providerDb.prepare('PRAGMA table_info(providers)').all() as any[]).map((c: any) => c.name);
if (!provCols.includes('completed_bookings')) providerDb.exec("ALTER TABLE providers ADD COLUMN completed_bookings INTEGER DEFAULT 0");
if (!provCols.includes('total_revenue'))      providerDb.exec("ALTER TABLE providers ADD COLUMN total_revenue REAL DEFAULT 0");
if (!provCols.includes('total_fees_paid'))    providerDb.exec("ALTER TABLE providers ADD COLUMN total_fees_paid REAL DEFAULT 0");

export function getProviderUsage(providerId: string): { completed_bookings: number; total_revenue: number; total_fees_paid: number } {
  const row = providerDb.prepare('SELECT completed_bookings, total_revenue, total_fees_paid FROM providers WHERE id = ?').get(providerId) as any;
  return {
    completed_bookings: row?.completed_bookings ?? 0,
    total_revenue:      row?.total_revenue      ?? 0,
    total_fees_paid:    row?.total_fees_paid     ?? 0,
  };
}

export function recordCompletedBooking(providerId: string, servicePrice: number, feeAmount: number): void {
  providerDb.prepare(`
    UPDATE providers SET
      completed_bookings = completed_bookings + 1,
      total_revenue      = total_revenue + ?,
      total_fees_paid    = total_fees_paid + ?
    WHERE id = ?
  `).run(servicePrice, feeAmount, providerId);
}

// ─── Message log ──────────────────────────────────────────────────────────
const msgDb = new Database(path.join(DB_DIR, 'messaging.db'));
msgDb.exec(`
  CREATE TABLE IF NOT EXISTS message_log (
    id           TEXT PRIMARY KEY,
    provider_id  TEXT,
    phone        TEXT NOT NULL,
    booking_id   TEXT,
    channel      TEXT,
    body         TEXT,
    status       TEXT DEFAULT 'sent',
    created_at   TEXT DEFAULT (datetime('now'))
  );
`);

export function logMessage(id: string, phone: string, body: string, bookingId: string, channel: string, providerId?: string) {
  msgDb.prepare(`INSERT OR IGNORE INTO message_log (id, provider_id, phone, booking_id, body, channel) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, providerId || null, phone, bookingId, body, channel);
}

// ─── Sent.dm ──────────────────────────────────────────────────────────────
const SENTDM_API_KEY = process.env.SENTDM_API_KEY || '';
const SENTDM_BASE    = 'https://api.sent.dm/v1';

async function sentdmSendRaw(phone: string, body: string): Promise<{ ok: boolean; channel?: string; messageId?: string; error?: string }> {
  if (!SENTDM_API_KEY) {
    console.warn('[Sent.dm] No API key configured');
    return { ok: false, error: 'SENTDM_API_KEY not configured' };
  }
  try {
    const res = await fetch(`${SENTDM_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SENTDM_API_KEY}` },
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

// ─── Main notify function ─────────────────────────────────────────────────
export async function notifyBusiness(
  phone:        string,
  businessName: string,
  serviceType:  string,
  customerName: string,
  date:         string,
  time:         string,
  price:        number,
  bookingId:    string,
  providerId?:  string,
): Promise<{ ok: boolean; channel?: string; fee: FeeResult; error?: string }> {

  const usage   = providerId ? getProviderUsage(providerId) : { completed_bookings: 0, total_revenue: 0, total_fees_paid: 0 };
  const fee     = calculateBookingFee(price, usage.completed_bookings);

  const feeNote = fee.is_free
    ? `🎉 FREE booking (${fee.free_remaining} of 10 free bookings remaining)`
    : `AgentPay fee: ${fee.fee_percent} = $${fee.fee_amount} — You receive: $${fee.net_to_provider}`;

  const msgBody =
    `📅 New booking request via AgentPay!\n\n` +
    `Business: ${businessName}\n` +
    `Service:  ${serviceType}\n` +
    `Customer: ${customerName}\n` +
    `Date/Time: ${date} at ${time}\n` +
    `Service Price: $${price}\n` +
    `${feeNote}\n\n` +
    `Reply YES to accept or NO to decline.\n` +
    `Confirm completed: x402-agent-pay.com/confirm/${bookingId}`;

  const result = await sentdmSendRaw(phone, msgBody);
  const msgId  = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  logMessage(msgId, phone, msgBody, bookingId, result.channel || 'sms', providerId);

  console.log(`[Sent.dm] to:${phone} booking:${bookingId} free:${fee.is_free} fee:${fee.fee_percent} channel:${result.channel} ok:${result.ok}`);
  return { ok: result.ok, channel: result.channel, fee, error: result.error };
}

// ─── Email fallback ───────────────────────────────────────────────────────
const BASE44_EMAIL_FN = 'https://muskox3-481c23be.base44.app/functions/sendBookingEmail';

export async function sendEmailNotification(
  email: string, subject: string, body: string, bookingId?: string, type?: string
): Promise<boolean> {
  try {
    const SIG = `\n\n---\nShawn Lippert | AgentPay\nhttps://www.x402-agent-pay.com`;
    const res = await fetch(BASE44_EMAIL_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, subject, textBody: body + SIG, bookingId: bookingId ?? '', type: type ?? 'booking_request' }),
    });
    const data = await res.json().catch(() => ({})) as any;
    return res.ok && (data as any).ok;
  } catch { return false; }
}

export async function sendSMS(to: string, body: string): Promise<boolean> {
  const r = await sentdmSendRaw(to, body);
  return r.ok;
}

export async function makeRobocall(to: string, message: string, bookingId: string): Promise<boolean> {
  return sendSMS(to, `[Voice] ${message} | Booking: ${bookingId}`);
}
