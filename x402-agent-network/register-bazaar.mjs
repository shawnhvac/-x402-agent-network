
import { x402Client } from '@x402/core/client';
import { x402HTTPClient } from '@x402/core/http';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { createWalletClient, createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const PAYER_PK = '0x851ae4e2658eba34ca39b7b0725e4a7c0e7d3d108308712b5288870933d1da46';
const PUBLIC_URL = 'https://www.x402-agent-pay.com/api/v1/search';
const RPC = 'https://mainnet.base.org';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const account = privateKeyToAccount(PAYER_PK);
console.log('🧪 Payer:', account.address);

const walletClient = createWalletClient({ account, chain: base, transport: http(RPC) });
const publicClient = createPublicClient({ chain: base, transport: http(RPC) });

const usdcBal = await publicClient.readContract({
  address: USDC,
  abi: [{ name: 'balanceOf', type: 'function', stateMutability: 'view',
          inputs: [{ name: 'a', type: 'address' }], outputs: [{ type: 'uint256' }] }],
  functionName: 'balanceOf', args: [account.address],
});
console.log('💵 USDC:', formatUnits(usdcBal, 6));

const signer = {
  address: account.address,
  signTypedData: (args) => walletClient.signTypedData(args),
};
const coreClient = new x402Client();
registerExactEvmScheme(coreClient, { signer, schemeOptions: { rpcUrl: RPC } });
const httpClient = new x402HTTPClient(coreClient);

// Hit the PUBLIC endpoint - this is what Bazaar will index
console.log('\n📡 Hitting PUBLIC endpoint for Bazaar registration...');
const res1 = await fetch(PUBLIC_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'hvac', category: 'hvac', location: 'Phoenix, AZ' }),
});
console.log('402 status:', res1.status);

const payHeader = res1.headers.get('payment-required');
if (!payHeader) { console.error('No payment-required header!'); process.exit(1); }

const decoded = JSON.parse(Buffer.from(payHeader, 'base64').toString());
console.log('Resource URL in 402:', decoded.resource?.url);
console.log('PayTo:', decoded.accepts?.[0]?.payTo);

const paymentRequired = httpClient.getPaymentRequiredResponse(
  (name) => res1.headers.get(name), {}
);
console.log('\n💳 Signing payment...');
const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
console.log('✅ Signed');

console.log('\n🚀 Submitting with payment header...');
const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
const res2 = await fetch(PUBLIC_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...paymentHeaders },
  body: JSON.stringify({ query: 'hvac', category: 'hvac', location: 'Phoenix, AZ' }),
});
console.log('Response status:', res2.status);
const body = await res2.text();
console.log('Body:', body.substring(0, 300));

if (res2.status === 200) {
  const settlement = httpClient.getPaymentSettleResponse((name) => res2.headers.get(name));
  console.log('\n✅ SETTLEMENT:', JSON.stringify(settlement, null, 2));
  console.log('\n🎯 AgentPay now registered on Bazaar/agentic.market with PUBLIC URL!');
} else {
  console.log('\nResponse headers:');
  for (const [k,v] of res2.headers.entries()) console.log(' ', k, ':', v.substring(0, 120));
}
