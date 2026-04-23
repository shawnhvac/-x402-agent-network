
import { createPublicClient, http, parseAbi, recoverTypedDataAddress, parseSignature, keccak256, encodePacked } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient } from 'viem';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PAYER_PK);
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
const wallet = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') });
const signer = { address: account.address, signTypedData: (args) => wallet.signTypedData(args) };

const buyer = new x402Client();
registerExactEvmScheme(buyer, { signer });

const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
const payReq = JSON.parse(Buffer.from(probe.headers.get('payment-required'), 'base64').toString());
const rawPayload = await buyer.createPaymentPayload(payReq);
const auth = rawPayload.payload.authorization;
const sig = auth.signature;

// Types from x402/evm
const authorizationTypes = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ]
};

// Recover signer from EIP-712 data
const recovered = await recoverTypedDataAddress({
  domain: {
    name: 'USD Coin',
    version: '2',
    chainId: 8453,
    verifyingContract: USDC,
  },
  types: authorizationTypes,
  primaryType: 'TransferWithAuthorization',
  message: {
    from: auth.from,
    to: auth.to,
    value: BigInt(auth.value),
    validAfter: BigInt(auth.validAfter),
    validBefore: BigInt(auth.validBefore),
    nonce: auth.nonce
  },
  signature: sig
});
console.log('Recovered signer:', recovered);
console.log('Expected payer:', auth.from);
console.log('Sig matches:', recovered.toLowerCase() === auth.from.toLowerCase());

// Try reading the v/r/s split
const parsed = parseSignature(sig);
console.log('\nSig v:', parsed.v, '| r:', parsed.r.slice(0,10), '| s:', parsed.s.slice(0,10));
console.log('yParity:', parsed.yParity);

// Try readContract with v/r/s directly (static call sim)
try {
  await pub.readContract({
    address: USDC,
    abi: parseAbi(['function transferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce,uint8 v,bytes32 r,bytes32 s) external']),
    functionName: 'transferWithAuthorization',
    args: [auth.from, auth.to, BigInt(auth.value), BigInt(auth.validAfter), BigInt(auth.validBefore), auth.nonce, parsed.v ?? (parsed.yParity + 27), parsed.r, parsed.s]
  });
  console.log('readContract v/r/s: SUCCESS');
} catch(e) {
  console.log('readContract v/r/s error:', e.shortMessage || e.message.slice(0,200));
}
