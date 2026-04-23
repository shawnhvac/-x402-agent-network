
import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';

const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';

for (let i = 0; i < 30; i++) {
  const bal = await pub.getBalance({ address: PAYER });
  const eth = Number(formatEther(bal));
  console.log(`[${i+1}] ETH balance: ${eth}`);
  if (eth > 0.0001) {
    console.log('✅ ETH received! Balance:', eth);
    break;
  }
  await new Promise(r => setTimeout(r, 10000));
}
