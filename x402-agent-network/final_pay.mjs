
import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

const PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PK);
const walletClient = createWalletClient({
  account, chain: base, transport: http('https://mainnet.base.org')
}).extend(publicActions);

// Signer object with required fields
const signer = {
  address: account.address,
  signTypedData: (args) => walletClient.signTypedData(args),
};

const buyer = new x402Client();
registerExactEvmScheme(buyer, { signer });

const ENDPOINT = 'http://localhost:3001/api/v1/search';
const BODY = JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' });

// Step 1: Get 402 + payment requirements
console.log('Probing for payment requirements...');
const probe = await fetch(ENDPOINT, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: BODY
});
console.log('Probe status:', probe.status);
const prHeader = probe.headers.get('payment-required');
const payReq = JSON.parse(Buffer.from(prHeader, 'base64').toString());
const req = payReq.accepts[0]; // chosen requirement
console.log('Chosen: scheme=%s network=%s amount=%s payTo=%s', req.scheme, req.network, req.amount, req.payTo);

// Step 2: Build raw payload (signs EIP-3009)
console.log('Signing EIP-3009 authorization...');
const rawPayload = await buyer.createPaymentPayload(payReq);
console.log('Raw payload keys:', Object.keys(rawPayload));

// Step 3: Build correct v2 PaymentPayload — schema requires `accepted` field
const payment = {
  x402Version: 2,
  accepted: req,            // <-- the chosen PaymentRequirementsV2
  payload: rawPayload.payload,
  extensions: rawPayload.extensions || undefined,
};
console.log('Payment v2 object built. accepted.scheme:', payment.accepted.scheme);

// Step 4: Base64-encode and submit with correct header name
// Server reads: 'payment-signature' OR 'x-payment' (from express adapter line 151)
const payB64 = Buffer.from(JSON.stringify(payment)).toString('base64');
console.log('Submitting payment...');
const paid = await fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-PAYMENT': payB64,
  },
  body: BODY,
});

console.log('\n=== FINAL STATUS:', paid.status, '===');
const receiptHdr = paid.headers.get('x-payment-response') || paid.headers.get('PAYMENT-RESPONSE');
if (receiptHdr) {
  const receipt = JSON.parse(Buffer.from(receiptHdr, 'base64').toString());
  console.log('\n🎯 CDP Settlement Receipt:');
  console.log(JSON.stringify(receipt, null, 2));
} else {
  console.log('(no settlement receipt header)');
}
const body = await paid.text();
console.log('Body:', body.slice(0, 400));
