
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';
const RECEIVER = '0x52893C94B03B5c5732c5AE71728cD69E360645Ce';

// Check blacklist status for both wallets
try {
  const payerBlacklisted = await pub.readContract({
    address: USDC,
    abi: parseAbi(['function isBlacklisted(address) view returns (bool)']),
    functionName: 'isBlacklisted',
    args: [PAYER]
  });
  const recvBlacklisted = await pub.readContract({
    address: USDC,
    abi: parseAbi(['function isBlacklisted(address) view returns (bool)']),
    functionName: 'isBlacklisted',
    args: [RECEIVER]
  });
  console.log('Payer blacklisted:', payerBlacklisted);
  console.log('Receiver blacklisted:', recvBlacklisted);
} catch(e) {
  console.log('Blacklist check error:', e.message.slice(0,100));
}

// Check if contract is paused
try {
  const paused = await pub.readContract({
    address: USDC,
    abi: parseAbi(['function paused() view returns (bool)']),
    functionName: 'paused'
  });
  console.log('Contract paused:', paused);
} catch(e) { console.log('pause check error:', e.message.slice(0,50)); }

// USDC balance
try {
  const bal = await pub.readContract({
    address: USDC,
    abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [PAYER]
  });
  console.log('USDC balance:', Number(bal) / 1e6, 'USDC (raw:', bal.toString(), ')');
} catch(e) { console.log('balance error:', e.message); }
