
import twilio from 'twilio';
import * as fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

// Check last 3 messages
const messages = await client.messages.list({ limit: 3 });
for (const m of messages) {
  console.log("SID:", m.sid);
  console.log("To:", m.to);
  console.log("From:", m.from);
  console.log("Status:", m.status);
  console.log("Error code:", m.errorCode);
  console.log("Error message:", m.errorMessage);
  console.log("Date sent:", m.dateSent);
  console.log("---");
}
