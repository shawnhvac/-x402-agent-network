
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PAYER_PK);
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

console.log('payload.signature:', rawPayload.payload?.signature);
console.log('payload.authorization.signature:', rawPayload.payload?.authorization?.signature);
console.log('payload type:', rawPayload.payload?.authorization?.from ? 'EIP3009' : 'unknown');
console.log('Full payload.payload:', JSON.stringify(rawPayload.payload));
