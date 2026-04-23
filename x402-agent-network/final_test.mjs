
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PAYER_PK);
const wallet = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') });
const signer = { address: account.address, signTypedData: (args) => wallet.signTypedData(args) };

console.log('Payer:', account.address);

const buyer = new x402Client();
registerExactEvmScheme(buyer, { signer });

// Step 1: Probe
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
console.log('Probe status:', probe.status);
if (probe.status !== 402) { console.log('Not 402, body:', await probe.text()); process.exit(0); }

// Step 2: Parse requirements  
const payHeader = probe.headers.get('payment-required') || probe.headers.get('x-payment-required');
const payReq = JSON.parse(Buffer.from(payHeader, 'base64').toString());
console.log('Amount:', payReq.accepts[0].amount, '| payTo:', payReq.accepts[0].payTo.slice(0,12));

// Step 3: Build payment payload
const rawPayload = await buyer.createPaymentPayload(payReq);
console.log('Payload sig:', rawPayload.payload?.signature?.slice(0,20));

// Step 4: Encode and submit
const encoded = btoa(JSON.stringify(rawPayload));
console.log('Encoded length:', encoded.length);

const result = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Payment': encoded
  },
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});

console.log('\n=== RESULT ===');
console.log('Status:', result.status);
const body = await result.text();
console.log('Body:', body.slice(0, 500));
const receipt = result.headers.get('x-payment-receipt') || result.headers.get('payment-receipt');
if (receipt) console.log('Receipt:', receipt.slice(0, 200));
