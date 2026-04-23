
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { createEIP3009Payload } from '@x402/evm/exact/client';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PAYER_PK);
const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') });
console.log('Payer:', account.address);

const signer = {
  address: account.address,
  signTypedData: (args) => walletClient.signTypedData(args)
};

// Step 1: Probe
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
if (probe.status !== 402) { console.log('Not 402:', probe.status); process.exit(0); }

const payHeader = probe.headers.get('payment-required') || probe.headers.get('x-payment-required');
const payReq = JSON.parse(Buffer.from(payHeader, 'base64').toString('utf8'));
const requirements = payReq.accepts[0];

// Step 2: Create EIP3009 payload using official library
const rawPayload = await createEIP3009Payload(signer, 2, requirements);
console.log('rawPayload keys:', Object.keys(rawPayload));
console.log('rawPayload.payload keys:', Object.keys(rawPayload.payload || {}));
console.log('authorization.validAfter:', rawPayload.payload?.authorization?.validAfter);
console.log('authorization.validBefore:', rawPayload.payload?.authorization?.validBefore);

// Step 3: Build complete v2 payload
const v2Payload = {
  x402Version: 2,
  accepted: requirements,
  payload: rawPayload.payload
};

const encoded = Buffer.from(JSON.stringify(v2Payload), 'utf8').toString('base64');
console.log('Encoded length:', encoded.length);

// Step 4: Submit
const result = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-PAYMENT': encoded },
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});

console.log('\n=== RESULT ===');
console.log('Status:', result.status);
const body = await result.text();
console.log('Body:', body.slice(0, 600));
const receipt = result.headers.get('x-payment-receipt');
console.log('Receipt header:', receipt ? receipt.slice(0,300) : 'none');
