
import { createWalletClient, http, publicActions, parseAbi, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const AGENTPAY = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';
const publicClient = createWalletClient({ chain: base, transport: http('https://mainnet.base.org') }).extend(publicActions);

// Check AgentPay USDC balance
const balance = await publicClient.readContract({
  address: USDC,
  abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
  functionName: 'balanceOf',
  args: [AGENTPAY],
});
console.log('AgentPay USDC balance:', formatUnits(balance, 6), 'USDC');

// Generate buyer wallet
const buyerPK = generatePrivateKey();
const buyerAccount = privateKeyToAccount(buyerPK);
console.log('\nFresh buyer wallet:', buyerAccount.address);
console.log('Buyer PK:', buyerPK);

// Check buyer balance
const buyerBalance = await publicClient.readContract({
  address: USDC,
  abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
  functionName: 'balanceOf',
  args: [buyerAccount.address],
});
console.log('Buyer USDC balance:', formatUnits(buyerBalance, 6), 'USDC');

// ETH balance of agentpay for gas
const ethBal = await publicClient.getBalance({ address: AGENTPAY });
console.log('AgentPay ETH:', formatUnits(ethBal, 18), 'ETH');
