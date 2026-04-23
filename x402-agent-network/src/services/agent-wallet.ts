import { fileURLToPath as _fup } from 'url';
import { dirname as _dn } from 'path';
const __filename = _fup(import.meta.url);
const __dirname = _dn(__filename);

import { createWalletClient, createPublicClient, http, parseUnits, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

// ============================================================
// AgentPay Headless Wallet Service
// Replaces awal CLI for server-side agent-to-agent payments
// Supports: send USDC, check balance, x402 pay
// ============================================================

const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY as `0x${string}`;
const AGENTPAY_WALLET = process.env.AGENTPAY_WALLET || "";
const CHAIN = process.env.CHAIN === "base-sepolia" ? baseSepolia : base;
const RPC = process.env.EVM_RPC || "https://mainnet.base.org";

// USDC on Base mainnet
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;
const USDC_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export interface WalletStatus {
  address: string;
  chain: string;
  usdcBalance: string;
  ethBalance: string;
  status: "ready" | "error";
}

export interface SendResult {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  chain: string;
  explorerUrl: string;
}

/**
 * Get wallet status + balances (equivalent to: awal status && awal balance)
 */
export async function getWalletStatus(): Promise<WalletStatus> {
  if (!EVM_PRIVATE_KEY) throw new Error("EVM_PRIVATE_KEY not set in .env");
  
  const account = privateKeyToAccount(EVM_PRIVATE_KEY);
  const publicClient = createPublicClient({ chain: CHAIN, transport: http(RPC) });

  const [ethBalance, usdcBalance] = await Promise.all([
    publicClient.getBalance({ address: account.address }),
    publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [account.address],
    }),
  ]);

  return {
    address: account.address,
    chain: CHAIN.name,
    ethBalance: formatUnits(ethBalance, 18) + " ETH",
    usdcBalance: formatUnits(usdcBalance as bigint, 6) + " USDC",
    status: "ready",
  };
}

/**
 * Send USDC to any address (equivalent to: awal send <amount> <recipient>)
 */
export async function sendUSDC(
  amountUSD: string,
  recipient: `0x${string}`
): Promise<SendResult> {
  if (!EVM_PRIVATE_KEY) throw new Error("EVM_PRIVATE_KEY not set in .env");

  const account = privateKeyToAccount(EVM_PRIVATE_KEY);
  const publicClient = createPublicClient({ chain: CHAIN, transport: http(RPC) });
  const walletClient = createWalletClient({ account, chain: CHAIN, transport: http(RPC) });

  // Parse amount — supports "$1.00", "1.00", or atomic units
  const cleanAmount = amountUSD.replace("$", "").trim();
  const atomicAmount = parseUnits(cleanAmount, 6); // USDC = 6 decimals

  const { request } = await publicClient.simulateContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "transfer",
    args: [recipient, atomicAmount],
    account: account.address,
  });

  const txHash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  return {
    txHash,
    from: account.address,
    to: recipient,
    amount: cleanAmount + " USDC",
    chain: CHAIN.name,
    explorerUrl: `https://basescan.org/tx/${txHash}`,
  };
}

/**
 * Get wallet address (equivalent to: awal address)
 */
export function getWalletAddress(): string {
  if (!EVM_PRIVATE_KEY) throw new Error("EVM_PRIVATE_KEY not set in .env");
  const account = privateKeyToAccount(EVM_PRIVATE_KEY);
  return account.address;
}

