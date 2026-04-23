
import { createPublicClient, http, parseAbi, formatUnits } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const AGENTPAY = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';

const eth = await publicClient.getBalance({ address: AGENTPAY });
const usdc = await publicClient.readContract({ address: USDC, abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [AGENTPAY] });
console.log('AgentPay ETH:', formatUnits(eth, 18));
console.log('AgentPay USDC:', formatUnits(usdc, 6));

// CDP exact scheme uses EIP-3009 TransferWithAuthorization
// The FACILITATOR submits the tx on-chain, not the user
// So buyer only needs to SIGN - no ETH needed from buyer!
// But the from != to constraint is the real issue
console.log('\nEIP-3009 is gasless for the buyer - CDP pays gas');
console.log('The real problem: from == to (paying yourself) is rejected by CDP');
