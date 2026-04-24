import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
// Lazy-init so missing creds don't crash startup
let twilioClient = null;
function getClient() {
    if (!twilioClient && accountSid && authToken) {
        twilioClient = twilio(accountSid, authToken);
    }
    return twilioClient;
}
// ─── Fee calculator ───────────────────────────────────────────────
export function calculateFee(servicePrice) {
    if (servicePrice < 50)
        return Math.round(servicePrice * 0.03 * 100) / 100;
    if (servicePrice <= 200)
        return Math.round(servicePrice * 0.02 * 100) / 100;
    return Math.round(servicePrice * 0.01 * 100) / 100;
}
export function feePercent(servicePrice) {
    if (servicePrice < 50)
        return '3%';
    if (servicePrice <= 200)
        return '2%';
    return '1%';
}
// ─── Phone type detection (simple heuristic — US numbers) ─────────
function isMobileNumber(phone) {
    // If it starts with known mobile area codes or has +1 — treat all as mobile for now
    // In production integrate Twilio Lookup API for definitive mobile/landline check
    const cleaned = phone.replace(/\D/g, '');
    // Landline patterns heuristic: 800/888/866/877/855/844/833 = toll-free = voice only
    const tollFree = /^1?(800|888|866|877|855|844|833)/.test(cleaned);
    return !tollFree;
}
// ─── Send SMS ─────────────────────────────────────────────────────
export async function sendSMS(to, body) {
    try {
        const client = getClient();
        if (!client) {
            console.warn('Twilio not configured');
            return false;
        }
        const msg = await client.messages.create({ from: fromNumber, to, body });
        console.log(`[Twilio SMS] Sent to ${to} — SID: ${msg.sid}`);
        return true;
    }
    catch (err) {
        console.error(`[Twilio SMS] Error sending to ${to}:`, err.message);
        return false;
    }
}
// ─── Make robocall (TwiML voice) ──────────────────────────────────
export async function makeRobocall(to, message, bookingId) {
    try {
        const client = getClient();
        if (!client) {
            console.warn('Twilio not configured');
            return false;
        }
        // TwiML: say message, gather keypress
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${message}</Say>
  <Gather numDigits="1" action="https://www.x402-agent-pay.com/api/v1/notify/ivr-response/${bookingId}" method="POST">
    <Say voice="Polly.Joanna">Press 1 to confirm this booking. Press 2 to decline.</Say>
  </Gather>
  <Say voice="Polly.Joanna">We did not receive a response. We will try again shortly. Goodbye.</Say>
</Response>`;
        const call = await client.calls.create({
            from: fromNumber,
            to,
            twiml,
        });
        console.log(`[Twilio Call] Called ${to} — SID: ${call.sid}`);
        return true;
    }
    catch (err) {
        console.error(`[Twilio Call] Error calling ${to}:`, err.message);
        return false;
    }
}
// ─── Send email via Base44 sendBookingEmail backend function ─────
const BASE44_EMAIL_FN = 'https://muskox3-481c23be.base44.app/functions/sendBookingEmail';
export async function sendEmailNotification(email, subject, body, bookingId, type) {
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
        if (res.ok && data.ok) {
            console.log(`[Email] Sent to ${email} | msgId: ${data.messageId}`);
            return true;
        }
        console.error(`[Email] Failed for ${email}:`, data);
        return false;
    }
    catch (err) {
        console.error(`[Email] Error sending to ${email}:`, err.message);
        return false;
    }
}
export async function notifyBusiness(booking) {
    const attempt = booking.attempt || 1;
    const { bookingId, businessName, businessPhone, businessEmail, serviceType, customerName, date, time, price } = booking;
    const fee = calculateFee(price);
    const pct = feePercent(price);
    const net = Math.round((price - fee) * 100) / 100;
    const smsMsg = `AgentPay Booking Request\n` +
        `Business: ${businessName}\n` +
        `Service: ${serviceType}\n` +
        `Date/Time: ${date} at ${time}\n` +
        `Job Value: $${price} (you receive $${net} after ${pct} fee)\n` +
        `Reply YES to confirm or NO to decline.\n` +
        `Ref: ${bookingId}`;
    const voiceMsg = `Hello ${businessName}. You have a new booking request through AgentPay. ` +
        `A customer is requesting ${serviceType} on ${date} at ${time}. ` +
        `The job value is ${price} dollars. Your payout will be ${net} dollars after the platform fee.`;
    // Attempt 1 — SMS if mobile, voice if landline/toll-free
    // Attempt 2 — escalate: voice call
    // Attempt 3 — email fallback
    if (attempt === 1 && businessPhone) {
        const useMobile = isMobileNumber(businessPhone);
        if (useMobile) {
            const ok = await sendSMS(businessPhone, smsMsg);
            if (ok)
                return { sent: true, method: 'sms', attempt };
        }
        // Landline or SMS failed — try voice
        const ok = await makeRobocall(businessPhone, voiceMsg, bookingId);
        if (ok)
            return { sent: true, method: 'voice', attempt };
    }
    if (attempt === 2 && businessPhone) {
        const ok = await makeRobocall(businessPhone, voiceMsg, bookingId);
        if (ok)
            return { sent: true, method: 'voice', attempt };
    }
    if (attempt === 3 && businessEmail) {
        const emailBody = `New Booking Request\n\n` +
            `Business: ${businessName}\n` +
            `Service: ${serviceType}\n` +
            `Date/Time: ${date} at ${time}\n` +
            `Job Value: $${price} (you receive $${net} after ${pct} fee)\n\n` +
            `Reply to this email with YES to confirm or NO to decline.\n` +
            `Ref: ${bookingId}`;
        const ok = await sendEmailNotification(businessEmail, `AgentPay Booking Request — ${serviceType} on ${date} [Ref: ${bookingId}]`, emailBody, bookingId, 'booking_request');
        if (ok)
            return { sent: true, method: 'email', attempt };
    }
    return { sent: false, method: 'none', attempt, message: 'No contact method available' };
}
//# sourceMappingURL=twilio-notify.js.map