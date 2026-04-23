
import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';

const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';

// Use multiple RPC endpoints to verify
const rpcs = [
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
  'https://base-rpc.publicnode.com',
  'https://1rpc.io/base'
];

for (const rpc of rpcs) {
  try {
    const pub = createPublicClient({ chain: base, transport: http(rpc) });
    const bal = await pub.getBalance({ address: PAYER });
    console.log(rpc.split('/')[2], '->', formatEther(bal), 'ETH');
  } catch(e) {
    console.log(rpc.split('/')[2], '-> error:', e.message.slice(0,50));
  }
}
