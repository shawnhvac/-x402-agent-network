
import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

const PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PK);
const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') }).extend(publicActions);
const signer = { address: account.address, signTypedData: (args) => walletClient.signTypedData(args) };
const buyer = new x402Client();
registerExactEvmScheme(buyer, { signer });

// Hit localhost:3001 directly (bypass nginx)
const ENDPOINT = 'http://localhost:3001/api/v1/search';
const BODY = JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' });

const probe = await fetch(ENDPOINT, { method: 'POST', headers: {'Content-Type':'application/json'}, body: BODY });
console.log('Direct probe:', probe.status);
const prHeader = probe.headers.get('payment-required');
const payReq = JSON.parse(Buffer.from(prHeader, 'base64').toString());
const req = payReq.accepts[0];
console.log('Amount:', req.amount, '| payTo:', req.payTo);

const rawPayment = await buyer.createPaymentPayload(payReq);
const payment = { ...rawPayment, scheme: req.scheme, network: req.network };

const payB64 = Buffer.from(JSON.stringify(payment)).toString('base64');
const paid = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-PAYMENT': payB64 },
  body: BODY,
});
console.log('\n🎯 Direct result:', paid.status);
const receipt = paid.headers.get('x-payment-response');
if (receipt) console.log('Receipt:', JSON.stringify(JSON.parse(Buffer.from(receipt,'base64').toString()), null, 2));
console.log('Body:', (await paid.text()).slice(0, 400));
