
import { x402Client } from '@x402/core/client';
import { x402HTTPClient } from '@x402/core/http';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { createWalletClient, createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const PAYER_PK = '0x851ae4e2658eba34ca39b7b0725e4a7c0e7d3d108308712b5288870933d1da46';
const TARGET  = 'http://localhost:3001/api/v1/search';
const USDC    = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const RPC     = 'https://mainnet.base.org';

const account = privateKeyToAccount(PAYER_PK);
console.log('🧪 Payer wallet:', account.address);

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(RPC),
});

const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC),
});

// Check balances
const ethBal = await publicClient.getBalance({ address: account.address });
console.log('💰 ETH:', formatUnits(ethBal, 18));

const usdcBal = await publicClient.readContract({
  address: USDC,
  abi: [{ name: 'balanceOf', type: 'function', stateMutability: 'view',
          inputs: [{ name: 'a', type: 'address' }], outputs: [{ type: 'uint256' }] }],
  functionName: 'balanceOf',
  args: [account.address],
});
const usdcFormatted = formatUnits(usdcBal, 6);
console.log('💵 USDC:', usdcFormatted);

if (parseFloat(usdcFormatted) < 0.001) {
  console.error('❌ Not enough USDC. Need at least $0.001 USDC in payer wallet.');
  process.exit(1);
}
console.log('');

// Build x402 client
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

// Step 1: hit the endpoint, expect 402
console.log('📡 Step 1: POST /api/v1/search — expecting 402...');
const res1 = await fetch(TARGET, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'hvac', category: 'hvac', location: 'Phoenix, AZ' }),
});
console.log('   Status:', res1.status);

if (res1.status !== 402) {
  console.log('⚠️  Expected 402, got:', res1.status);
  console.log(await res1.text());
  process.exit(1);
}

// Log the payment header
const payHeader = res1.headers.get('payment-required');
if (payHeader) {
  const decoded = JSON.parse(Buffer.from(payHeader, 'base64').toString('utf8'));
  console.log('   💳 Payment required:');
  console.log('      Amount:', decoded.accepts?.[0]?.amount, 'units (= $', parseInt(decoded.accepts?.[0]?.amount||0)/1e6, ')');
  console.log('      Pay to:', decoded.accepts?.[0]?.payTo);
  console.log('      Asset: USDC on Base');
}

// Step 2: parse payment requirements using header getter
const paymentRequired = httpClient.getPaymentRequiredResponse(
  (name) => res1.headers.get(name),
  {}
);

// Step 3: create signed payment payload
console.log('\n💳 Step 2: Signing EIP-3009 USDC authorization...');
const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
console.log('   Signed ✅');

// Step 4: send with payment header
console.log('\n🚀 Step 3: Sending paid request...');
const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
const res2 = await fetch(TARGET, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...paymentHeaders,
  },
  body: JSON.stringify({ query: 'hvac', category: 'hvac', location: 'Phoenix, AZ' }),
});

console.log('   Response status:', res2.status);
const responseBody = await res2.text();
console.log('   Response body:', responseBody.substring(0, 800));

if (res2.status === 200) {
  console.log('\n🎉🎉🎉 FIRST SUCCESSFUL x402 PAYMENT ON AGENTPAY! 🎉🎉🎉');
  try {
    const settlement = httpClient.getPaymentSettleResponse(
      (name) => res2.headers.get(name)
    );
    console.log('Settlement tx:', JSON.stringify(settlement, null, 2));
  } catch (e) {
    console.log('(No settlement header — payment settled on-chain via facilitator)');
  }
} else {
  console.log('\n⚠️  Response headers:');
  for (const [k,v] of res2.headers.entries()) {
    console.log('  ', k, ':', v.substring(0,100));
  }
}
