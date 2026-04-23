
import { readFileSync } from 'fs';
import { createPrivateKey } from 'crypto';
import { SignJWT, importPKCS8 } from 'jose';

const CDP_KEY_PATH = '/root/.openclaw/workspace/cdp_key.json';
async function buildCDPToken(method, path) {
  const cdpKey = JSON.parse(readFileSync(CDP_KEY_PATH, 'utf8'));
  const keyObj = createPrivateKey({ key: cdpKey.privateKey, format: 'pem' });
  const pkcs8 = keyObj.export({ type: 'pkcs8', format: 'pem' }).toString();
  const pk = await importPKCS8(pkcs8.toString(), 'ES256');
  const now = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString().slice(2, 18);
  return new SignJWT({ sub: cdpKey.name, iss: 'cdp', aud: ['cdp_service'],
    uris: [`${method} api.cdp.coinbase.com${path}`], nbf: now })
    .setProtectedHeader({ alg: 'ES256', kid: cdpKey.name, nonce })
    .setIssuedAt(now).setExpirationTime(now + 120).sign(pk);
}
async function cdp(method, path, body) {
  const token = await buildCDPToken(method, path);
  const resp = await fetch('https://api.cdp.coinbase.com' + path, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Idempotency-Key': Date.now().toString() },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: resp.status, text: await resp.text() };
}

// Try to create a CDP MPC wallet (managed by Coinbase)
// This gives us a wallet we can fund and use as buyer
const r = await cdp('POST', '/platform/v2/wallets', { network_id: 'base-mainnet' });
console.log('Create wallet:', r.status, r.text.slice(0, 300));
