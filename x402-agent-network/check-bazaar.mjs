
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

const res = await fetch(
  'https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?payTo=0x52893C94B03B5c5732c5AE71728cD69E360645Ce',
  { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
);
const body = await res.json();
console.log('Status:', res.status);
console.log('Response:', JSON.stringify(body, null, 2));
