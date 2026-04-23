
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
if (!PAYER_PK) throw new Error('No EVM_PRIVATE_KEY');
const account = privateKeyToAccount(PAYER_PK);
console.log('Payer:', account.address);

// Step 1: Probe to get 402 requirements
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
console.log('Probe status:', probe.status);
if (probe.status !== 402) { console.log('Not 402:', await probe.text()); process.exit(0); }

// Step 2: Parse requirements
const payHeader = probe.headers.get('payment-required') || probe.headers.get('x-payment-required');
const payReq = JSON.parse(Buffer.from(payHeader, 'base64').toString('utf8'));
const requirements = payReq.accepts[0]; // exact requirements object to echo back as 'accepted'
console.log('Requirements:', JSON.stringify(requirements));

// Step 3: Sign EIP-3009
const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') });
const USDC = requirements.asset;
const amount = BigInt(requirements.amount);
const payTo = requirements.payTo;
const validAfter = 0n;
const validBefore = BigInt(Math.floor(Date.now() / 1000) + 300);
const nonce = '0x' + Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex');

const sig = await walletClient.signTypedData({
  domain: { name: 'USD Coin', version: '2', chainId: 8453, verifyingContract: USDC },
  types: { TransferWithAuthorization: [
    { name: 'from', type: 'address' }, { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' }, { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' }, { name: 'nonce', type: 'bytes32' },
  ]},
  primaryType: 'TransferWithAuthorization',
  message: { from: account.address, to: payTo, value: amount, validAfter, validBefore, nonce }
});
console.log('Signed! sig:', sig.slice(0, 20), '...');

// Step 4: Build CORRECT v2 payload with 'accepted' mirroring the requirements object
const payload = {
  x402Version: 2,
  accepted: requirements,  // <-- exact copy of accepts[0] for deepEqual match
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

const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
console.log('Encoded length:', encoded.length);
console.log('First 50:', encoded.slice(0, 50));

// Step 5: Submit with correct header
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
