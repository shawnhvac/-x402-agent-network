
import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

const PK = process.env.EVM_PRIVATE_KEY;
const ENDPOINT = 'https://www.x402-agent-pay.com/api/v1/search';
const BODY = JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' });

const account = privateKeyToAccount(PK);
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http('https://mainnet.base.org'),
}).extend(publicActions);

// The signer needs .address and .signTypedData exposed at top level
// walletClient wraps them but the SDK expects them on the object itself
const signer = {
  address: account.address,
  signTypedData: (args) => walletClient.signTypedData(args),
};

console.log('Signer address:', signer.address);

const buyer = new x402Client();
registerExactEvmScheme(buyer, { signer });

// Probe
const probe = await fetch(ENDPOINT, { method: 'POST', headers: {'Content-Type':'application/json'}, body: BODY });
console.log('402 probe:', probe.status);
const prHeader = probe.headers.get('payment-required');
const payReq = JSON.parse(Buffer.from(prHeader, 'base64').toString());
console.log('Amount:', payReq.accepts[0].amount, 'payTo:', payReq.accepts[0].payTo);

// Sign payment (EIP-3009 TransferWithAuthorization)
console.log('Signing EIP-3009...');
const payment = await buyer.createPaymentPayload(payReq);
console.log('Payment signed:', payment.scheme, payment.network);

// Submit with X-PAYMENT header
const payB64 = Buffer.from(JSON.stringify(payment)).toString('base64');
console.log('Submitting to CDP facilitator for settlement...');
const paid = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-PAYMENT': payB64 },
  body: BODY,
});

console.log('\n=== RESULT:', paid.status, '===');
const receipt = paid.headers.get('x-payment-response');
if (receipt) {
  console.log('CDP Receipt:', JSON.stringify(JSON.parse(Buffer.from(receipt, 'base64').toString()), null, 2));
}
console.log('Body:', (await paid.text()).slice(0, 400));
