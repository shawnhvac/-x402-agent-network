
import { readFileSync } from 'fs';
import { createPrivateKey } from 'crypto';
import { SignJWT, importPKCS8 } from 'jose';

const CDP_KEY_PATH = '/root/.openclaw/workspace/cdp_key.json';

async function buildCDPToken(method, path) {
  const cdpKey = JSON.parse(readFileSync(CDP_KEY_PATH, 'utf8'));
  const keyObj = createPrivateKey({ key: cdpKey.privateKey, format: 'pem' });
  const pkcs8 = keyObj.export({ type: 'pkcs8', format: 'pem' }).toString();
  const privateKey = await importPKCS8(pkcs8, 'ES256');
  const now = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString().slice(2, 18);
  return new SignJWT({ sub: cdpKey.name, iss: 'cdp', aud: ['cdp_service'],
    uris: [`${method} api.cdp.coinbase.com${path}`], nbf: now })
    .setProtectedHeader({ alg: 'ES256', kid: cdpKey.name, nonce })
    .setIssuedAt(now).setExpirationTime(now + 120).sign(privateKey);
}

async function cdp(method, path, body) {
  const token = await buildCDPToken(method, path);
  const resp = await fetch('https://api.cdp.coinbase.com' + path, {
    method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await resp.text();
  return { status: resp.status, body: text };
}

// List wallets via CDP
console.log('Listing CDP wallets...');
const wallets = await cdp('GET', '/platform/v2/wallets');
console.log('Wallets status:', wallets.status);
console.log('Wallets:', wallets.body.slice(0, 500));
