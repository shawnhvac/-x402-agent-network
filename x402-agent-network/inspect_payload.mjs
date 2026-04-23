
import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PAYER_PK);

const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') }).extend(publicActions);
const signer = { address: account.address, signTypedData: (args) => walletClient.signTypedData(args) };

const buyer = new x402Client();
registerExactEvmScheme(buyer, { signer });

const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
const prHeaderRaw = probe.headers.get('payment-required');
const payReq = JSON.parse(Buffer.from(prHeaderRaw, 'base64').toString());

const rawPayload = await buyer.createPaymentPayload(payReq);
console.log('FULL PAYLOAD:');
console.log(JSON.stringify(rawPayload, null, 2));
