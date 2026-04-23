
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const addr1 = '0x9098632319C07c8200e6B9123dD277D70AeC3333';
const addr2 = '0x4b742ad5Ca91969e82AeFB80072AE59121a3d72A';

// Check what these are
for (const addr of [addr1, addr2]) {
  const bal = await pub.readContract({ address: USDC, abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [addr] });
  const code = await pub.getCode({ address: addr });
  console.log(addr, '| USDC:', Number(bal)/1e6, '| isContract:', code && code !== '0x' ? 'YES ('+code.slice(0,10)+'...)' : 'NO (EOA)');
}

// Also get the full tx details
const tx = await pub.getTransaction({ hash: '0x0e01db8a11fd9ceabb89a6ca41e11d6ccf72c2a5b04acbfa1c45bb4a38d21d4b' });
if (tx) {
  console.log('Tx from:', tx.from, '| to:', tx.to, '| value:', tx.value);
  console.log('Input:', tx.input.slice(0, 10), '(selector)');
} else {
  // Try full hash
  const res = await fetch('https://base.blockscout.com/api/v2/transactions/0x0e01db8a11fd9ceabb89a6ca41e11d6ccf72c2a5b04acbfa1c45bb4a38d21d4b');
  const data = await res.json();
  console.log('Blockscout tx:', JSON.stringify(data).slice(0,300));
}
