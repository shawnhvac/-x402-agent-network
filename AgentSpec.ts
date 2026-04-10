/**
 * AgentSpec.ts - Universal x402 Agent Interface (v1.0)
 * 
 * Every agent on the network implements this interface to ensure:
 * - Standardized payment handling (x402 compatible)
 * - Transparent cost estimation
 * - Status + availability reporting
 * - Chain compatibility declaration
 */

export interface Agent {
  /**
   * Unique identifier for this agent
   * Format: lowercase-alphanumeric-with-hyphens
   * Example: "grid-trader-001", "gpt4-inference-main"
   */
  id: string;

  /**
   * Human-readable agent name
   * Example: "Grid Trader", "GPT-4 Inference Agent"
   */
  name: string;

  /**
   * Semantic version following semver
   * Example: "1.0.0", "2.3.1"
   */
  version: string;

  /**
   * Description of what this agent does
   * Used in registry + UI
   */
  description: string;

  /**
   * Blockchain networks this agent supports
   * Must include at least one
   */
  supportedChains: ("ethereum" | "polygon" | "base" | "solana" | "arbitrum")[];

  /**
   * Minimum payment required per execution (in USDC)
   * Used for quota checking + 402 response generation
   * Example: 0.001 (for "free tier with micropayment")
   *          0.10 (for "standard execution")
   *          1.00 (for "priority/fast execution")
   */
  minPayment: number;

  /**
   * Maximum payment this agent will accept per request
   * Prevents accidental overpayment
   * Example: 100 (max $100 per request)
   */
  maxPayment: number;

  /**
   * HTTP endpoint URL where this agent listens
   * Must be publicly accessible + x402-compliant
   * Example: "https://grid-trader.agents.muskox.io/api/execute"
   */
  endpoint: string;

  /**
   * Owner's Solana/Ethereum wallet address
   * Receives all payments (minus platform fee)
   * Example: "0x1234...abcd" or "So11111111..."
   */
  ownerWallet: string;

  /**
   * Main execution method - core agent logic
   * 
   * @param payload - Agent-specific execution parameters
   * @param requester - Wallet address of the calling agent/user
   * @param chain - Blockchain network to execute on
   * 
   * @returns ExecutionResult with outcome details
   * 
   * @throws Error if execution fails (will trigger HTTP 500 response)
   * 
   * Example:
   *   await agent.execute(
   *     { signal: "buy_dip", amount: 100 },
   *     "0x...",
   *     "ethereum"
   *   )
   *   // Returns: { success: true, outcome: "filled_order", amountExecuted: 100.5 }
   */
  execute(
    payload: Record<string, unknown>,
    requester: string,
    chain: string
  ): Promise<ExecutionResult>;

  /**
   * Estimate the cost of an execution BEFORE payment
   * Used for transparent pricing + quota management
   * 
   * @param payload - Same payload structure as execute()
   * @param chain - Blockchain network
   * 
   * @returns Cost estimate in USDC (must be >= minPayment)
   * 
   * Example:
   *   const cost = await agent.estimateCost(
   *     { signal: "buy_dip", amount: 100 },
   *     "ethereum"
   *   )
   *   // Returns: 0.10 (cost is $0.10 USDC)
   */
  estimateCost(
    payload: Record<string, unknown>,
    chain: string
  ): Promise<number>;

  /**
   * Get current status + health of the agent
   * Called periodically by registry to verify uptime/SLA
   * 
   * @returns AgentStatus with uptime + resource info
   * 
   * Example:
   *   const status = await agent.getStatus()
   *   // Returns: { healthy: true, uptime: 99.9, responseTime: 45ms }
   */
  getStatus(): Promise<AgentStatus>;

  /**
   * Optional: Estimate profitability given market conditions
   * Used by caller agents to decide if execution is worthwhile
   * 
   * @param marketCondition - Market state ("sideways" | "trending_up" | "trending_down" | "volatile")
   * 
   * @returns Estimated profit as percentage (e.g., 2.5 = +2.5%)
   * Return null if profitability cannot be estimated
   * 
   * Example (for Grid Trader):
   *   const profit = await agent.estimateProfitability("sideways")
   *   // Returns: 1.5 (expects +1.5% profit in sideways market)
   */
  estimateProfitability?(marketCondition: string): Promise<number | null>;
}

/**
 * Result of a successful agent execution
 */
export interface ExecutionResult {
  /** True if execution succeeded, false otherwise */
  success: boolean;

  /** Human-readable outcome ("filled_order", "executed_snipe", "data_retrieved", etc) */
  outcome: string;

  /** Unique execution ID for tracking + auditing */
  executionId: string;

  /** Actual amount received/processed */
  amountExecuted?: number;

  /** Profit/loss if applicable */
  profit?: number;

  /** Raw transaction data for verification */
  transactionHash?: string;

  /** Any additional result data (agent-specific) */
  data?: Record<string, unknown>;

  /** Timestamp of execution */
  timestamp: string;

  /** Error message if success=false */
  error?: string;
}

/**
 * Agent health + availability status
 */
export interface AgentStatus {
  /** Is agent currently healthy + accepting requests? */
  healthy: boolean;

  /** Uptime percentage (e.g., 99.9 = 99.9% uptime) */
  uptime: number;

  /** Average response time in milliseconds */
  responseTime: number;

  /** Number of successful executions */
  successCount: number;

  /** Number of failed executions */
  failureCount: number;

  /** Total requests processed */
  totalRequests: number;

  /** Last update timestamp */
  lastUpdated: string;
}

/**
 * Agent registry entry (stored in Postgres)
 * Published by agent creators, searchable by other agents
 */
export interface AgentRegistryEntry {
  /** Unique agent identifier */
  agentId: string;

  /** Human-readable name */
  name: string;

  /** What this agent does */
  description: string;

  /** HTTP endpoint URL */
  endpoint: string;

  /** Supported blockchain networks */
  supportedChains: string[];

  /** Minimum payment per request */
  minPayment: number;

  /** Maximum payment per request */
  maxPayment: number;

  /** Owner's wallet */
  ownerWallet: string;

  /** Agent version */
  version: string;

  /** x402 compliant? */
  x402Compliant: boolean;

  /** Uptime SLA (e.g., 99.9) */
  uptimeSLA: number;

  /** Average response time (ms) */
  avgResponseTime: number;

  /** Number of successful executions */
  successCount: number;

  /** Success rate (0-100) */
  successRate: number;

  /** User reviews + rating (1-5 stars) */
  rating: number;

  /** Created timestamp */
  createdAt: string;

  /** Last updated timestamp */
  updatedAt: string;

  /** Public on registry? */
  published: boolean;
}

/**
 * x402 Payment Response (HTTP 402 Payment Required)
 * Sent by agents when quota exceeded or payment required
 */
export interface PaymentRequired402 {
  requiresPayment: true;

  /** Unique request ID for tracking */
  requestId: string;

  /** Price to pay in USDC */
  price: string;

  /** Currency (always "USDC" for now) */
  currency: "USDC";

  /** Blockchain network ID for payment */
  chainId: number;

  /** Where to send the payment */
  paymentAddress: string;

  /** Agent's name (for confirmation) */
  merchantName: string;

  /** Why payment is required */
  reason: "quota_exceeded" | "payment_required" | "premium_feature";

  /** What to do next */
  nextSteps: string;

  /** Link to pay (optional, for UX) */
  paymentLink?: string;

  /** Webhook URL to confirm payment when detected */
  webhookUrl?: string;

  /** Expected confirmation time (seconds) */
  expectedConfirmationTime: number;

  /** Documentation link */
  docLink: string;
}

/**
 * x402 Payment Confirmation (proof of payment)
 * Sent by caller in retry request after payment
 */
export interface PaymentConfirmation {
  /** Transaction hash proving payment */
  txHash: string;

  /** Blockchain network ID */
  chainId: number;

  /** Requester's wallet */
  payer: string;

  /** Amount paid */
  amountPaid: string;

  /** Currency */
  currency: "USDC";

  /** Timestamp of transaction */
  timestamp: string;
}

/**
 * Agent SDK Helper - generates proper 402 responses
 * Usage:
 *   import { paymentRequired } from '@coinbase/x402-middleware';
 *   
 *   if (!hasQuota) {
 *     return res.status(402).json(
 *       paymentRequired({
 *         price: "0.10",
 *         paymentAddress: agent.ownerWallet,
 *         merchantName: agent.name,
 *         reason: "quota_exceeded"
 *       })
 *     );
 *   }
 */
export function createPaymentRequired402(options: {
  price: string;
  paymentAddress: string;
  merchantName: string;
  reason: "quota_exceeded" | "payment_required" | "premium_feature";
  chainId?: number;
  webhookUrl?: string;
}): PaymentRequired402 {
  return {
    requiresPayment: true,
    requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    price: options.price,
    currency: "USDC",
    chainId: options.chainId || 1, // Default: Ethereum
    paymentAddress: options.paymentAddress,
    merchantName: options.merchantName,
    reason: options.reason,
    nextSteps: `Send ${options.price} USDC to ${options.paymentAddress} on chain ${options.chainId || 1}, then retry with X-Payment-TxHash header`,
    expectedConfirmationTime: 30,
    webhookUrl: options.webhookUrl,
    docLink: "https://docs.agents.muskox.io/x402"
  };
}
