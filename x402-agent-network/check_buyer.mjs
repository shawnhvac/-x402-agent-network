
import { createPublicClient, http, parseAbi, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const BUYER_PK = '0xceaccd50ace1289d55cea280c8bde70e930e2d9076745ddbabc7a886c2651fd6';
const AGENTPAY = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const buyer = privateKeyToAccount(BUYER_PK);
console.log('Buyer address:', buyer.address);

const pub = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });

const [buyerUSDC, agentUSDC, buyerETH, agentETH] = await Promise.all([
  pub.readContract({ address: USDC, abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [buyer.address] }),
  pub.readContract({ address: USDC, abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [AGENTPAY] }),
  pub.getBalance({ address: buyer.address }),
  pub.getBalance({ address: AGENTPAY }),
]);

console.log('Buyer USDC:', formatUnits(buyerUSDC, 6));
console.log('Buyer ETH:', formatUnits(buyerETH, 18));
console.log('AgentPay USDC:', formatUnits(agentUSDC, 6));
console.log('AgentPay ETH:', formatUnits(agentETH, 18));
console.log('\nBuyer != AgentPay:', buyer.address.toLowerCase() !== AGENTPAY.toLowerCase());
