
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const PAYER_PK = process.env.EVM_PRIVATE_KEY;
const account = privateKeyToAccount(PAYER_PK);
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });

// Check auth state - isValidNonce on USDC
try {
  const nonces = await pub.readContract({
    address: USDC,
    abi: parseAbi(['function authorizationState(address authorizer, bytes32 nonce) view returns (bool)']),
    functionName: 'authorizationState',
    args: [account.address, '0xdc248fc73e46c8f6788031ff40b0cd28effd0af6771fe9e5b3408dec1c711634']
  });
  console.log('Previous nonce used:', nonces, '(true=already used/cancelled)');
} catch(e) { console.log('nonce check error:', e.message); }

// Check balance
const [bal, eth] = await Promise.all([
  pub.readContract({ address: USDC, abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [account.address] }),
  pub.getBalance({ address: account.address })
]);
console.log('USDC balance:', Number(bal)/1e6, '| ETH:', Number(eth)/1e18);
