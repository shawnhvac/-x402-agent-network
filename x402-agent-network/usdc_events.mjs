
import { createPublicClient, http, parseAbi, decodeEventLog } from 'viem';
import { base } from 'viem/chains';

const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';

// Get Transfer events from PAYER in last 200 blocks
const block = await pub.getBlockNumber();
console.log('Current block:', block);

const logs = await pub.getLogs({
  address: USDC,
  event: { type: 'event', name: 'Transfer', inputs: [
    { name: 'from', type: 'address', indexed: true },
    { name: 'to', type: 'address', indexed: true },
    { name: 'value', type: 'uint256', indexed: false }
  ]},
  args: { from: PAYER },
  fromBlock: block - 500n,
  toBlock: block
});

console.log('Transfer events from payer:', logs.length);
for (const log of logs) {
  console.log('  to:', log.args.to, '| value:', Number(log.args.value)/1e6, 'USDC | block:', log.blockNumber, '| tx:', log.transactionHash.slice(0,12));
}

// Current balance
const bal = await pub.readContract({
  address: USDC,
  abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
  functionName: 'balanceOf', args: [PAYER]
});
console.log('Current USDC balance:', Number(bal)/1e6);
