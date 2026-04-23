
import { readFileSync } from 'fs';
import { createPrivateKey } from 'crypto';
import { SignJWT, importPKCS8 } from 'jose';
import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { HTTPFacilitatorClient } from '@x402/core/server';

const PK = process.env.EVM_PRIVATE_KEY;
const CDP_KEY_PATH = '/root/.openclaw/workspace/cdp_key.json';

async function buildCDPToken(action) {
  const cdpKey = JSON.parse(readFileSync(CDP_KEY_PATH, 'utf8'));
  const keyObj = createPrivateKey({ key: cdpKey.privateKey, format: 'pem' });
  const pkcs8 = keyObj.export({ type: 'pkcs8', format: 'pem' }).toString();
  const privateKey = await importPKCS8(pkcs8, 'ES256');
  const now = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString().slice(2, 18);
  const method = action === 'supported' ? 'GET' : 'POST';
  return new SignJWT({ sub: cdpKey.name, iss: 'cdp', aud: ['cdp_service'],
    uris: [`${method} api.cdp.coinbase.com/platform/v2/x402/${action}`], nbf: now })
    .setProtectedHeader({ alg: 'ES256', kid: cdpKey.name, nonce })
    .setIssuedAt(now).setExpirationTime(now + 120).sign(privateKey);
}

const account = privateKeyToAccount(PK);
const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') }).extend(publicActions);
const signer = { address: account.address, signTypedData: (args) => walletClient.signTypedData(args) };
const buyer = new x402Client();
registerExactEvmScheme(buyer, { signer });

// Get payment requirements from server
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
const prHeader = probe.headers.get('payment-required');
const payReq = JSON.parse(Buffer.from(prHeader, 'base64').toString());
const req = payReq.accepts[0];

// Sign payment
const rawPayload = await buyer.createPaymentPayload(payReq);
console.log('Full rawPayload:', JSON.stringify(rawPayload, null, 2));

// Call CDP verify DIRECTLY (not via server) to check if payment is valid
const facilitator = new HTTPFacilitatorClient({
  url: 'https://api.cdp.coinbase.com/platform/v2/x402',
  createAuthHeaders: async () => {
    const [v, s, sup] = await Promise.all([buildCDPToken('verify'), buildCDPToken('settle'), buildCDPToken('supported')]);
    return { verify: { Authorization: `Bearer ${v}` }, settle: { Authorization: `Bearer ${s}` }, supported: { Authorization: `Bearer ${sup}` } };
  }
});

console.log('\nCalling CDP verify directly with rawPayload...');
try {
  const result = await facilitator.verify(rawPayload, req);
  console.log('✅ CDP verify result:', JSON.stringify(result, null, 2));
} catch(e) {
  console.log('❌ CDP verify error:', e.message);
  if (e.cause) console.log('Cause:', JSON.stringify(e.cause, null, 2));
}
