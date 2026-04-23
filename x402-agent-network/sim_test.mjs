
import { createPublicClient, createWalletClient, http, getAddress, toHex, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PAYER_PK);
const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
const wallet = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') });

const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const PAY_TO = '0x52893C94B03B5c5732c5AE71728cD69E360645Ce';

console.log('ETH balance:', await pub.getBalance({ address: account.address }));
const usdc = await pub.readContract({ address: USDC, abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [account.address] });
console.log('USDC balance:', usdc.toString(), '(' + Number(usdc)/1e6 + ' USDC)');

const now = Math.floor(Date.now() / 1000);
const nonce = toHex(crypto.getRandomValues(new Uint8Array(32)));
const validAfter = BigInt(now - 600);
const validBefore = BigInt(now + 300);
const value = 1000n;

const sig = await wallet.signTypedData({
  domain: { name: 'USD Coin', version: '2', chainId: 8453, verifyingContract: USDC },
  types: { TransferWithAuthorization: [
    { name: 'from', type: 'address' }, { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' }, { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' }, { name: 'nonce', type: 'bytes32' },
  ]},
  primaryType: 'TransferWithAuthorization',
  message: { from: account.address, to: PAY_TO, value, validAfter, validBefore, nonce }
});

console.log('Signature:', sig.slice(0, 20), '...');
const v = parseInt(sig.slice(-2), 16);
const r = sig.slice(0, 66);
const s = '0x' + sig.slice(66, 130);
console.log('v:', v, 'r:', r.slice(0,10), 's:', s.slice(0,10));

// Try calling transferWithAuthorization as eth_call
try {
  const abi = parseAbi(['function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)']);
  const result = await pub.simulateContract({
    address: USDC, abi,
    functionName: 'transferWithAuthorization',
    args: [account.address, PAY_TO, value, validAfter, validBefore, nonce, v, r, s],
    account: account.address
  });
  console.log('✅ Simulation SUCCESS:', result);
} catch(e) {
  console.log('❌ Simulation FAILED:', e.message.slice(0, 300));
  if (e.cause) console.log('Cause:', String(e.cause).slice(0, 200));
}
