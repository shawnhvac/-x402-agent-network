
import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';

const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';

// Get the confirmed tx
const res = await fetch('https://base.blockscout.com/api/v2/addresses/' + PAYER + '/transactions?filter=to&limit=5');
const data = await res.json();
for (const t of (data.items || [])) {
  console.log('IN tx:', t.hash, '| value:', t.value, '| status:', t.status, '| block:', t.block);
  // Get tx receipt
  const receipt = await pub.getTransactionReceipt({ hash: t.hash });
  console.log('  receipt status:', receipt.status, '| to:', receipt.to, '| from:', receipt.from);
}

// Re-check balance
const bal = await pub.getBalance({ address: PAYER });
console.log('\nBalance right now:', formatEther(bal));
