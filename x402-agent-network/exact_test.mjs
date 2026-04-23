
import { createWalletClient, http, toHex, getAddress } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PAYER_PK);
const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') });
console.log('Payer:', account.address);

// Step 1: Probe
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
if (probe.status !== 402) { console.log('Not 402:', probe.status); process.exit(0); }

const payHeader = probe.headers.get('payment-required') || probe.headers.get('x-payment-required');
const payReq = JSON.parse(Buffer.from(payHeader, 'base64').toString('utf8'));
const requirements = payReq.accepts[0];
console.log('amount:', requirements.amount, '| payTo:', requirements.payTo.slice(0,12));
console.log('extra:', JSON.stringify(requirements.extra));

// Exactly reproduce createEIP3009Payload from library source
const nonce = toHex(crypto.getRandomValues(new Uint8Array(32)));
const now = Math.floor(Date.now() / 1000);
const authorization = {
  from: account.address,
  to: getAddress(requirements.payTo),
  value: requirements.amount,      // string "1000"
  validAfter: (now - 600).toString(),
  validBefore: (now + requirements.maxTimeoutSeconds).toString(),
  nonce
};
console.log('authorization:', JSON.stringify(authorization));

const { name, version } = requirements.extra;
const chainId = 8453;
const domain = { name, version, chainId, verifyingContract: getAddress(requirements.asset) };
const types = { TransferWithAuthorization: [
  { name: 'from', type: 'address' }, { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' }, { name: 'validAfter', type: 'uint256' },
  { name: 'validBefore', type: 'uint256' }, { name: 'nonce', type: 'bytes32' },
]};
const message = {
  from: getAddress(authorization.from),
  to: getAddress(authorization.to),
  value: BigInt(authorization.value),
  validAfter: BigInt(authorization.validAfter),
  validBefore: BigInt(authorization.validBefore),
  nonce: authorization.nonce
};

const signature = await walletClient.signTypedData({ domain, types, primaryType: 'TransferWithAuthorization', message });
console.log('Signature:', signature.slice(0, 20), '...');

const v2Payload = {
  x402Version: 2,
  accepted: requirements,
  payload: { authorization, signature }
};

const encoded = Buffer.from(JSON.stringify(v2Payload), 'utf8').toString('base64');
console.log('Encoded length:', encoded.length);

// Submit
const result = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-PAYMENT': encoded },
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});

console.log('\n=== RESULT ===');
console.log('Status:', result.status);
const body = await result.text();
console.log('Body:', body.slice(0, 600));
const receipt = result.headers.get('x-payment-receipt');
console.log('Receipt:', receipt ? receipt.slice(0,300) : 'none');
