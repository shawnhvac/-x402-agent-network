
import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';

const PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PK);
const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') }).extend(publicActions);
const signer = { address: account.address, signTypedData: (args) => walletClient.signTypedData(args) };

const buyer = new x402Client();
registerExactEvmScheme(buyer, { signer });

const probe = await fetch('https://www.x402-agent-pay.com/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
const prHeader = probe.headers.get('payment-required');
const payReq = JSON.parse(Buffer.from(prHeader, 'base64').toString());
console.log('payReq:', JSON.stringify(payReq, null, 2));

const payment = await buyer.createPaymentPayload(payReq);
console.log('\nPayment object:', JSON.stringify(payment, null, 2));
