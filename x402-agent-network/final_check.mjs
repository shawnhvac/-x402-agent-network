
import { createPublicClient, http, formatEther, parseAbi } from 'viem';
import { base } from 'viem/chains';

const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const eth = await pub.getBalance({ address: PAYER });
const usdc = await pub.readContract({ address: USDC, abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [PAYER] });

console.log('ETH:', formatEther(eth));
console.log('USDC:', Number(usdc)/1e6);

// Check if maybe the problem is validBefore is in the past or validAfter is in future
const block = await pub.getBlock();
console.log('Block timestamp:', block.timestamp, '(now:', Math.floor(Date.now()/1000), ')');
