
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { createPrivateKey } from 'crypto';
import { SignJWT, importPKCS8 } from 'jose';
import { readFileSync } from 'fs';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PAYER_PK);
const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') });
const signer = { address: account.address, signTypedData: (args) => walletClient.signTypedData(args) };

const buyer = new x402Client();
registerExactEvmScheme(buyer, { signer });

// Get probe and make payload
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
const payReq = JSON.parse(Buffer.from(probe.headers.get('payment-required'), 'base64').toString());
const rawPayload = await buyer.createPaymentPayload(payReq);
const matchingReqs = payReq.accepts[0];

// Build CDP JWT
const CDP_KEY_PATH = '/root/.openclaw/workspace/cdp_key.json';
const cdpKey = JSON.parse(readFileSync(CDP_KEY_PATH, 'utf8'));
const keyObj = createPrivateKey({ key: cdpKey.privateKey, format: 'pem' });
const pkcs8 = keyObj.export({ type: 'pkcs8', format: 'pem' }).toString();
const privateKey = await importPKCS8(pkcs8, 'ES256');
const now = Math.floor(Date.now()/1000);
const token = await new SignJWT({
  sub: cdpKey.name, iss: 'cdp', aud: ['cdp_service'],
  uris: ['POST api.cdp.coinbase.com/platform/v2/x402/verify'],
  nbf: now
}).setProtectedHeader({ alg: 'ES256', kid: cdpKey.name, nonce: Math.random().toString().slice(2,18) })
  .setIssuedAt(now).setExpirationTime(now+120).sign(privateKey);

console.log('Calling CDP /verify...');
const res = await fetch('https://api.cdp.coinbase.com/platform/v2/x402/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({
    x402Version: rawPayload.x402Version,
    paymentPayload: rawPayload,
    paymentRequirements: matchingReqs
  })
});

const body = await res.text();
console.log('CDP /verify status:', res.status);
console.log('CDP /verify body:', body.slice(0, 800));
