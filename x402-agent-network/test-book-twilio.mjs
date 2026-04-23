
import { x402Client } from '@x402/core/client';
import { x402HTTPClient } from '@x402/core/http';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const PAYER_PK = '0x4c424f273c98f8dfc5aca6c7adb7493294fed3bedc61b5b38a9fc1422542b0a3';
const TARGET  = 'http://localhost:3001/api/v1/book';
const RPC     = 'https://mainnet.base.org';

const account = privateKeyToAccount(PAYER_PK);
const walletClient = createWalletClient({ account, chain: base, transport: http(RPC) });
const signer = { address: account.address, signTypedData: (args) => walletClient.signTypedData(args) };
const coreClient = new x402Client();
registerExactEvmScheme(coreClient, { signer, schemeOptions: { rpcUrl: RPC } });
const httpClient = new x402HTTPClient(coreClient);

const bookingPayload = {
  service_id: "salon-ny-001",
  service_type: "haircut",
  date: "2026-04-25",
  time: "10:00 AM",
  customer_name: "Test Agent",
  customer_email: "test@agentpay.com",
  estimated_price: 65
};

console.log("Step 1: Triggering 402...");
const res1 = await fetch(TARGET, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(bookingPayload),
});
console.log("402 status:", res1.status);

const paymentRequired = httpClient.getPaymentRequiredResponse((name) => res1.headers.get(name), {});
console.log("Step 2: Signing payment...");
const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
console.log("Signed OK");

console.log("Step 3: Sending paid request...");
const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
const res2 = await fetch(TARGET, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...paymentHeaders },
  body: JSON.stringify(bookingPayload),
});

console.log("Final status:", res2.status);
const body = await res2.json();
console.log(JSON.stringify(body, null, 2));
