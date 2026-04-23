
import twilio from 'twilio';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load .env manually
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const sid = env.TWILIO_ACCOUNT_SID;
const token = env.TWILIO_AUTH_TOKEN;
const from = env.TWILIO_PHONE_NUMBER;

console.log("SID:", sid?.substring(0,10) + "...");
console.log("From:", from);

const client = twilio(sid, token);

// Fetch account info
try {
  const accounts = await client.api.v2010.accounts.list({ limit: 1 });
  console.log("Account fetch OK:", accounts[0]?.friendlyName, "| Status:", accounts[0]?.status);
} catch(e) {
  console.error("Account fetch failed:", e.message);
}
