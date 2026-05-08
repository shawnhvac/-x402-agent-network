// ─── Fee calculator ───────────────────────────────────────────────
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

// ─── SMS (stub — Twilio removed) ──────────────────────────────────
export async function sendSMS(to: string, body: string): Promise<boolean> {
  console.warn(`[SMS] Twilio removed. Skipping SMS to ${to}: ${body.substring(0, 60)}`);
  return false;
}

// ─── Voice call (stub — Twilio removed) ──────────────────────────
export async function makeRobocall(to: string, message: string, bookingId: string): Promise<boolean> {
  console.warn(`[Voice] Twilio removed. Skipping robocall to ${to} for booking ${bookingId}`);
  return false;
}

// ─── Send email via Base44 backend function ───────────────────────
const BASE44_EMAIL_FN = 'https://muskox3-481c23be.base44.app/functions/sendBookingEmail';

export async function sendEmailNotification(
  email: string,
  subject: string,
  body: string,
  bookingId?: string,
  type?: string
): Promise<boolean> {
  try {
    const SIGNATURE = `\n\n---\nShawn Lippert\nAgentPay Team\n95b Havasupai St, Grand Canyon, AZ 86023\nhttps://www.x402-agent-pay.com`;
    const res = await fetch(BASE44_EMAIL_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject,
        textBody: body + SIGNATURE,
        bookingId: bookingId ?? '',
        type: type ?? 'booking_request',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data as any).ok) {
      console.log(`[Email] Sent to ${email} | msgId: ${(data as any).messageId}`);
      return true;
    }
    console.error(`[Email] Failed for ${email}:`, data);
    return false;
  } catch (err: any) {
    console.error(`[Email] Error sending to ${email}:`, err.message);
    return false;
  }
}

// ─── Main notification orchestrator ──────────────────────────────
export interface BookingNotification {
  bookingId: string;
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
  serviceType: string;
  customerName?: string;
  date: string;
  time: string;
  price: number;
  attempt?: number;
}

export interface NotificationResult {
  sent: boolean;
  method: 'sms' | 'voice' | 'email' | 'none';
  attempt: number;
  message?: string;
}

export async function notifyBusiness(booking: BookingNotification): Promise<NotificationResult> {
  const attempt = booking.attempt || 1;
  const { bookingId, businessName, businessEmail,
          serviceType, customerName, date, time, price } = booking;

  const fee = calculateFee(price);
  const pct = feePercent(price);
  const net = Math.round((price - fee) * 100) / 100;

  // All notifications now go via email only
  if (businessEmail) {
    const emailBody =
      `New Booking Request\n\n` +
      `Business: ${businessName}\n` +
      `Service: ${serviceType}\n` +
      `Date/Time: ${date} at ${time}\n` +
      `Job Value: $${price} (you receive $${net} after ${pct} fee)\n\n` +
      `Reply YES to confirm or NO to decline.\n` +
      `Ref: ${bookingId}`;
    const ok = await sendEmailNotification(
      businessEmail,
      `AgentPay Booking Request — ${serviceType} on ${date} [Ref: ${bookingId}]`,
      emailBody,
      bookingId,
      'booking_request'
    );
    if (ok) return { sent: true, method: 'email', attempt };
  }

  console.warn(`[Notify] No contact method available for booking ${bookingId} — no email provided`);
  return { sent: false, method: 'none', attempt, message: 'No contact method available' };
}
