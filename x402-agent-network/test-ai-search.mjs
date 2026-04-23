
import { x402Client } from '@x402/core/client';
import { x402HTTPClient } from '@x402/core/http';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { createWalletClient, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const PAYER_PK = '0x4c424f273c98f8dfc5aca6c7adb7493294fed3bedc61b5b38a9fc1422542b0a3';
const TARGET  = 'https://www.x402-agent-pay.com/api/v1/ai/search';
const RPC     = 'https://mainnet.base.org';

const account = privateKeyToAccount(PAYER_PK);
console.log('Payer:', account.address);

const walletClient = createWalletClient({ account, chain: base, transport: http(RPC) });

const signer = {
  address: account.address,
  signTypedData: (args) => walletClient.signTypedData(args),
};

const coreClient = new x402Client();
registerExactEvmScheme(coreClient, {
  signer,
  schemeOptions: { rpcUrl: RPC },
});

const httpClient = new x402HTTPClient(coreClient);

// Step 1: trigger 402
const res1 = await fetch(TARGET, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'I need someone to fix my AC before the weekend in Phoenix', max_results: 3 }),
});
console.log('402 status:', res1.status);

const paymentRequired = httpClient.getPaymentRequiredResponse(
  (name) => res1.headers.get(name), {}
);

// Step 2: sign
const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
console.log('Signed OK');

// Step 3: send paid request
const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
const res2 = await fetch(TARGET, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...paymentHeaders },
  body: JSON.stringify({ query: 'I need someone to fix my AC before the weekend in Phoenix', max_results: 3 }),
});

console.log('Final status:', res2.status);
const body = await res2.json();
console.log(JSON.stringify(body, null, 2));
