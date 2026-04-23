
import twilio from 'twilio';
import * as fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

// Send real SMS
try {
  const msg = await client.messages.create({
    from: env.TWILIO_PHONE_NUMBER,
    to: '+19282011832',
    body: 'AgentPay Booking Request\n\nBusiness: Manhattan Hair Studio\nService: Haircut\nDate/Time: Apr 25 at 10:00 AM\nJob Value: $65 (you receive $63.70 after 2% fee)\n\nReply YES to confirm or NO to decline.\nRef: BK-TEST-001'
  });
  console.log("SMS sent! SID:", msg.sid, "Status:", msg.status);
} catch(e) {
  console.error("SMS failed:", e.message);
}
