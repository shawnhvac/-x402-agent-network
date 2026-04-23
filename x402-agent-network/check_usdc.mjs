
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';
const RECEIVER = '0x52893C94B03B5c5732c5AE71728cD69E360645Ce';
const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });

// Check contract name and version
try {
  const name = await pub.readContract({ address: USDC, abi: parseAbi(['function name() view returns (string)']), functionName: 'name' });
  const version = await pub.readContract({ address: USDC, abi: parseAbi(['function version() view returns (string)']), functionName: 'version' });
  const symbol = await pub.readContract({ address: USDC, abi: parseAbi(['function symbol() view returns (string)']), functionName: 'symbol' });
  console.log('Name:', name, '| Symbol:', symbol, '| Version:', version);
} catch(e) { console.log('name/version error:', e.message); }

// Check if it has DOMAIN_SEPARATOR (EIP-712)
try {
  const domain = await pub.readContract({ address: USDC, abi: parseAbi(['function DOMAIN_SEPARATOR() view returns (bytes32)']), functionName: 'DOMAIN_SEPARATOR' });
  console.log('DOMAIN_SEPARATOR:', domain);
} catch(e) { console.log('DOMAIN_SEPARATOR error:', e.message); }

// Check balanceOf payer
const bal = await pub.readContract({ address: USDC, abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [PAYER] });
console.log('Payer USDC:', Number(bal)/1e6);

// Try calling authorizationState to see if EIP-3009 exists on this contract
try {
  const used = await pub.readContract({ 
    address: USDC, 
    abi: parseAbi(['function authorizationState(address,bytes32) view returns (bool)']), 
    functionName: 'authorizationState', 
    args: [PAYER, '0x0000000000000000000000000000000000000000000000000000000000000001'] 
  });
  console.log('authorizationState exists! result:', used);
} catch(e) { console.log('authorizationState error:', e.message.slice(0,100)); }
