
import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { createPrivateKey } from 'crypto';
import { SignJWT, importPKCS8 } from 'jose';
import { readFileSync } from 'fs';

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

// Get payment requirements
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
const payReq = JSON.parse(Buffer.from(probe.headers.get('payment-required'), 'base64').toString());
const req = payReq.accepts[0];

// Create payment
const rawPayment = await buyer.createPaymentPayload(payReq);
const payment = { ...rawPayment, scheme: req.scheme, network: req.network };

// Call CDP verify directly
console.log('Calling CDP /verify directly...');
const verifyToken = await buildCDPToken('verify');
const verifyResp = await fetch('https://api.cdp.coinbase.com/platform/v2/x402/verify', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${verifyToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ payment, paymentRequirements: req }),
});
console.log('CDP verify status:', verifyResp.status);
console.log('CDP verify body:', await verifyResp.text());
