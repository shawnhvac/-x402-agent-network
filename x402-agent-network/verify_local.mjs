
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PAYER_PK);
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });

// Build a fresh signTypedData signer using just viem
import { createWalletClient } from 'viem';
const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') });
const signer = { address: account.address, signTypedData: (args) => walletClient.signTypedData(args) };

const buyer = new x402Client();
registerExactEvmScheme(buyer, { signer });

// Get probe
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
const payReq = JSON.parse(Buffer.from(probe.headers.get('payment-required'), 'base64').toString());
const rawPayload = await buyer.createPaymentPayload(payReq);
const auth = rawPayload.payload.authorization;

console.log('Auth from:', auth.from, 'to:', auth.to, 'value:', auth.value);
console.log('validAfter:', auth.validAfter, 'validBefore:', auth.validBefore);
const now = Math.floor(Date.now()/1000);
console.log('now:', now);
console.log('Is now > validAfter?', now > Number(auth.validAfter));
console.log('Is now < validBefore?', now < Number(auth.validBefore));

// Simulate
try {
  await pub.simulateContract({
    address: USDC,
    abi: parseAbi(['function transferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce,bytes calldata signature) external']),
    functionName: 'transferWithAuthorization',
    args: [auth.from, auth.to, BigInt(auth.value), BigInt(auth.validAfter), BigInt(auth.validBefore), auth.nonce, auth.signature],
    account: account.address
  });
  console.log('✅ SIMULATE SUCCESS!');
} catch (e) {
  console.log('❌ SIMULATE FAILED:', e.shortMessage || e.message.slice(0, 300));
}
