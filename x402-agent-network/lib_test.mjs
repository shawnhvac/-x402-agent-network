
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
if (!PAYER_PK) throw new Error('No EVM_PRIVATE_KEY');
const account = privateKeyToAccount(PAYER_PK);
const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') });
console.log('Payer:', account.address);

// Signer interface as expected by x402/evm
const signer = {
  address: account.address,
  signTypedData: (args) => walletClient.signTypedData(args)
};

// Import x402 client
const { createEIP3009Payload } = await import('@x402/evm/dist/cjs/exact/client/index.js');

// Step 1: Probe
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
console.log('Probe status:', probe.status);
if (probe.status !== 402) { console.log('Not 402:', await probe.text()); process.exit(0); }

const payHeader = probe.headers.get('payment-required') || probe.headers.get('x-payment-required');
const payReq = JSON.parse(Buffer.from(payHeader, 'base64').toString('utf8'));
const requirements = payReq.accepts[0];
console.log('Requirements amount:', requirements.amount, '| payTo:', requirements.payTo.slice(0,12));

// Step 2: Use official library to create EIP3009 payload
const eipPayload = await createEIP3009Payload(signer, 2, requirements);
console.log('EIP3009 payload:', JSON.stringify(eipPayload).slice(0, 150));

// Step 3: Build v2 payment payload with 'accepted'
const v2Payload = {
  x402Version: 2,
  accepted: requirements,
  payload: eipPayload.payload
};

const encoded = Buffer.from(JSON.stringify(v2Payload), 'utf8').toString('base64');
console.log('Encoded OK, length:', encoded.length);

// Step 4: Submit
const result = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-PAYMENT': encoded
  },
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});

console.log('\n=== RESULT ===');
console.log('Status:', result.status);
const body = await result.text();
console.log('Body:', body.slice(0, 600));
const receipt = result.headers.get('x-payment-receipt');
console.log('Receipt:', receipt ? receipt.slice(0, 300) : 'none');
