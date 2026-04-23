
import { createPublicClient, http, parseAbi, encodeFunctionData, parseSignature, toHex } from 'viem';
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
const parsedSig = parseSignature(sig);

console.log('sig:', sig.slice(0,20), '... len:', sig.length);
console.log('v:', Number(parsedSig.v), 'yParity:', parsedSig.yParity);

const vValue = parsedSig.v !== undefined ? Number(parsedSig.v) : (Number(parsedSig.yParity) + 27);
console.log('using v:', vValue);

// eth_call with v/r/s - this will give us the actual revert reason
try {
  const result = await pub.call({
    to: USDC,
    data: encodeFunctionData({
      abi: parseAbi(['function transferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce,uint8 v,bytes32 r,bytes32 s)']),
      functionName: 'transferWithAuthorization',
      args: [auth.from, auth.to, BigInt(auth.value), BigInt(auth.validAfter), BigInt(auth.validBefore), auth.nonce, vValue, parsedSig.r, parsedSig.s]
    })
  });
  console.log('CALL SUCCESS, result:', result);
} catch(e) {
  // Get revert message
  const msg = e.shortMessage || e.message;
  console.log('REVERT:', msg.slice(0, 400));
  if (e.cause) console.log('CAUSE:', String(e.cause).slice(0,300));
}
