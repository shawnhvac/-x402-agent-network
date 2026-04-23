
import { createPrivateKey } from 'crypto';
import { SignJWT, importPKCS8 } from 'jose';
import { readFileSync } from 'fs';

const cdpKey = JSON.parse(readFileSync('/root/.openclaw/workspace/cdp_key.json', 'utf8'));
const keyObj = createPrivateKey({ key: cdpKey.privateKey, format: 'pem' });
const pkcs8 = keyObj.export({ type: 'pkcs8', format: 'pem' }).toString();
const privateKey = await importPKCS8(pkcs8, 'ES256');
const now = Math.floor(Date.now() / 1000);
const nonce = Math.random().toString().slice(2, 18);

const token = await new SignJWT({
  sub: cdpKey.name, iss: 'cdp', aud: ['cdp_service'],
  uris: ['GET api.cdp.coinbase.com/platform/v2/x402/discovery/resources'],
  nbf: now,
}).setProtectedHeader({ alg: 'ES256', kid: cdpKey.name, nonce })
  .setIssuedAt(now).setExpirationTime(now + 120).sign(privateKey);

// Get all pages
let allItems = [];
let offset = 0;
while (true) {
  const res = await fetch(
    `https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?limit=100&offset=${offset}`,
    { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  const body = await res.json();
  allItems = allItems.concat(body.items || []);
  console.log(`Page offset=${offset}: ${body.items?.length} items`);
  if (!body.items?.length || body.items.length < 100) break;
  offset += 100;
}

console.log('Total resources in Bazaar:', allItems.length);
const agentpay = allItems.filter(i => 
  i.resource?.includes('x402-agent-pay') || 
  i.accepts?.some(a => a.payTo === '0x52893C94B03B5c5732c5AE71728cD69E360645Ce')
);
console.log('\nAgentPay entries found:', agentpay.length);
if (agentpay.length) {
  console.log(JSON.stringify(agentpay, null, 2));
} else {
  // Show last 3 resources (most recently added)
  console.log('\nMost recent entries:');
  allItems.slice(-3).forEach(i => console.log(' -', i.resource, '|', i.lastUpdated));
}
