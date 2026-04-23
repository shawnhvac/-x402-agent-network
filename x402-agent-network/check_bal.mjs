
import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';

const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';

const bal = await pub.getBalance({ address: PAYER });
console.log('ETH balance:', formatEther(bal), 'ETH');

// Get recent txs via eth_getLogs won't work for ETH transfers - use block
const block = await pub.getBlockNumber();
console.log('Current block:', block);

// Check last 10 transactions to this address using blockscout API
const res = await fetch('https://base.blockscout.com/api/v2/addresses/' + PAYER + '/transactions?filter=to');
const data = await res.json();
if (data.items?.length) {
  console.log('Recent incoming txs:', data.items.slice(0,3).map(t => ({ hash: t.hash?.slice(0,10), value: t.value, status: t.status, ts: t.timestamp })));
} else {
  console.log('No incoming txs found on blockscout yet');
}
