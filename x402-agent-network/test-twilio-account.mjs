
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Check account type
const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
console.log("Account status:", account.status);
console.log("Account type:", account.type);
console.log("Friendly name:", account.friendlyName);
