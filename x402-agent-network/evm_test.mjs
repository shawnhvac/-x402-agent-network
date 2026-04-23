
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { ExactEvmScheme, registerExactEvmScheme } from '@x402/evm/exact/client';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PAYER_PK);
const walletClient = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') });
console.log('Payer:', account.address);

const signer = {
  address: account.address,
  signTypedData: (args) => walletClient.signTypedData(args)
};

// Step 1: Probe
const probe = await fetch('http://localhost:3001/api/v1/search', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ category: 'hvac', location: 'Phoenix, AZ' })
});
console.log('Probe status:', probe.status);
if (probe.status !== 402) { console.log('Not 402:', await probe.text()); process.exit(0); }

const payHeader = probe.headers.get('payment-required') || probe.headers.get('x-payment-required');
const payReq = JSON.parse(Buffer.from(payHeader, 'base64').toString('utf8'));
const requirements = payReq.accepts[0];
console.log('Requirements:', requirements.amount, requirements.scheme, requirements.network);

// Step 2: Use ExactEvmScheme client to create payload
const scheme = new ExactEvmScheme();
scheme.register(signer);

// Try using the scheme's createPaymentPayload method
const { createEIP3009Payload } = await import('@x402/evm/exact/client');
console.log('createEIP3009Payload:', typeof createEIP3009Payload);

const rawPayload = await createEIP3009Payload(signer, 2, requirements);
console.log('Raw payload keys:', Object.keys(rawPayload));
console.log('Payload:', JSON.stringify(rawPayload).slice(0, 200));
