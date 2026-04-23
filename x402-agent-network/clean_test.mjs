
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
if (!PAYER_PK) throw new Error('No EVM_PRIVATE_KEY');
const account = privateKeyToAccount(PAYER_PK);
console.log('Payer:', account.address);

// Step 1: Probe to get payment-required
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
console.log('Probe status:', probe.status);
if (probe.status !== 402) { 
  const b = await probe.text();
  console.log('Not 402:', b.slice(0,300)); 
  process.exit(0); 
}

// Step 2: Parse the payment requirements
const payHeader = probe.headers.get('payment-required') || probe.headers.get('x-payment-required');
if (!payHeader) { console.log('No payment header!'); process.exit(1); }

const payReq = JSON.parse(Buffer.from(payHeader, 'base64').toString('utf8'));
console.log('Payment required for:', payReq.accepts[0].amount, 'USDC to', payReq.accepts[0].payTo.slice(0,12), '...');
console.log('Version:', payReq.x402Version, '| Scheme:', payReq.accepts[0].scheme);

// Step 3: Manually sign EIP-3009 transferWithAuthorization
import { parseAbi, encodeFunctionData } from 'viem';

const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const amount = BigInt(payReq.accepts[0].amount); // 1000 = $0.001
const payTo = payReq.accepts[0].payTo;
const validAfter = 0n;
const validBefore = BigInt(Math.floor(Date.now() / 1000) + 300);
const nonce32 = crypto.getRandomValues(new Uint8Array(32));
const nonce = '0x' + Buffer.from(nonce32).toString('hex');

const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') });

const sig = await walletClient.signTypedData({
  domain: {
    name: 'USD Coin', version: '2',
    chainId: 8453,
    verifyingContract: USDC
  },
  types: {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  },
  primaryType: 'TransferWithAuthorization',
  message: {
    from: account.address,
    to: payTo,
    value: amount,
    validAfter,
    validBefore,
    nonce,
  }
});

console.log('Signature:', sig.slice(0, 20), '...');

// Step 4: Build x402 payment payload
const payload = {
  x402Version: 2,
  scheme: 'exact',
  network: 'eip155:8453',
  payload: {
    signature: sig,
    authorization: {
      from: account.address,
      to: payTo,
      value: amount.toString(),
      validAfter: validAfter.toString(),
      validBefore: validBefore.toString(),
      nonce
    }
  }
};

const payloadStr = JSON.stringify(payload);
// Use Buffer to properly base64 encode (no btoa issue)
const encoded = Buffer.from(payloadStr, 'utf8').toString('base64');
console.log('Encoded length:', encoded.length);

// Step 5: Submit
const result = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-PAYMENT': encoded
  },
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});

console.log('\n=== RESULT ===');
console.log('Status:', result.status);
const body = await result.text();
console.log('Body:', body.slice(0, 500));
const receipt = result.headers.get('x-payment-receipt');
console.log('Receipt:', receipt?.slice(0, 200) || 'none');
