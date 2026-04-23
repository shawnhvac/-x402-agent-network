
import { createWalletClient, http, parseUnits, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { readFileSync } from 'fs';
import { createPrivateKey } from 'crypto';
import { SignJWT, importPKCS8 } from 'jose';

// AgentPay wallet is also the buyer for this test — it's paying itself
// to trigger a Bazaar registration via a real CDP settlement
const WALLET_PK = process.env.AGENTPAY_PRIVATE_KEY;
if (!WALLET_PK) throw new Error('AGENTPAY_PRIVATE_KEY not set in env');

const CDP_KEY_PATH = process.env.CDP_KEY_PATH || '/root/.openclaw/workspace/cdp_key.json';
const ENDPOINT = 'https://www.x402-agent-pay.com/api/v1/search';
const BODY = JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' });
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Step 1 - Hit endpoint, get 402
console.log('Step 1: Hitting endpoint for 402...');
const r1 = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: BODY,
});
console.log('Status:', r1.status);
if (r1.status !== 402) {
  console.log('Not 402, body:', await r1.text());
  process.exit(1);
}

// Decode payment requirements
const prHeader = r1.headers.get('payment-required');
const payReq = JSON.parse(Buffer.from(prHeader, 'base64').toString());
console.log('PayReq network:', payReq.accepts[0].network);
console.log('PayReq amount:', payReq.accepts[0].amount, 'USDC units');
console.log('PayTo:', payReq.accepts[0].payTo);

// Step 2 - Build ERC-20 transfer payload
const account = privateKeyToAccount(WALLET_PK);
console.log('Buyer address:', account.address);

const client = createWalletClient({ account, chain: base, transport: http() });

const amount = BigInt(payReq.accepts[0].amount);
const payTo = payReq.accepts[0].payTo;
const nonce = await fetch('https://mainnet.base.org', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ jsonrpc:'2.0', id:1, method:'eth_getTransactionCount', params:[account.address,'latest'] })
}).then(r=>r.json()).then(r=>parseInt(r.result,16));

console.log('Nonce:', nonce);

// ERC20 transfer
const transferData = encodeFunctionData({
  abi: [{
    name: 'transfer',
    type: 'function',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  }],
  functionName: 'transfer',
  args: [payTo, amount],
});

console.log('Step 2: Signing & sending USDC transfer...');
const txHash = await client.sendTransaction({
  to: USDC_BASE,
  data: transferData,
  gas: 60000n,
});
console.log('TX Hash:', txHash);

// Step 3 - Build x402 payment payload and retry request
const paymentPayload = {
  x402Version: 2,
  scheme: 'exact',
  network: payReq.accepts[0].network,
  payload: {
    signature: txHash,  // simplified — real x402 needs signed EIP-712
    authorization: {
      from: account.address,
      to: payTo,
      value: amount.toString(),
      validAfter: '0',
      validBefore: Math.floor(Date.now()/1000 + 300).toString(),
      nonce: nonce.toString(),
    }
  }
};

console.log('Step 3: Retrying with X-PAYMENT header...');
const r2 = await fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-PAYMENT': Buffer.from(JSON.stringify(paymentPayload)).toString('base64'),
  },
  body: BODY,
});
console.log('Final status:', r2.status);
console.log('Response:', (await r2.text()).slice(0, 300));
