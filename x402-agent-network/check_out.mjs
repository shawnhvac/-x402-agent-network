
import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';

const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';

const bal = await pub.getBalance({ address: PAYER });
console.log('Current ETH balance:', formatEther(bal), 'ETH (raw:', bal.toString(), ')');

// Check outgoing txs too
const res = await fetch('https://base.blockscout.com/api/v2/addresses/' + PAYER + '/transactions?filter=from&limit=5');
const data = await res.json();
if (data.items?.length) {
  data.items.forEach(t => {
    console.log('OUT tx:', t.hash?.slice(0,12), '| value:', BigInt(t.value || 0) / BigInt(1e14), 'x1e14 wei | fee:', t.fee?.value, '| status:', t.status, '| ts:', t.timestamp);
  });
} else {
  console.log('No outgoing txs');
}
