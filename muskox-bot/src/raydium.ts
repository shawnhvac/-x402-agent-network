/**
 * Raydium Pool Monitor
 * Detects new liquidity pools in real-time
 */

import axios from 'axios';

export interface RaydiumPool {
  id: string;
  mint: string;
  baseMint: string;
  quoteMint: string;
  baseVault: string;
  quoteVault: string;
  liquidity: number;
  marketCap?: number;
  createdAt: number;
  txSignature?: string;
}

let lastCheckedSlot = 0;
const detectedPools = new Map<string, RaydiumPool>();
const poolCallbacks: Array<(pool: RaydiumPool) => void> = [];

/**
 * Subscribe to new pool detections
 */
export function onNewPool(callback: (pool: RaydiumPool) => void) {
  poolCallbacks.push(callback);
}

/**
 * Monitor Raydium for new pools via Helius webhook or RPC polling
 * Fallback: Poll latest transactions for pool creation events
 */
export async function startPoolMonitoring(rpcUrl: string) {
  console.log('[RAYDIUM] Starting pool monitor...');

  // Poll every 5 seconds for new pools
  setInterval(() => pollNewPools(rpcUrl), 5000);
}

/**
 * Poll for new Raydium pool creation transactions
 * Looks for RAYDIUM_PROGRAM_ID transfer events
 */
async function pollNewPools(rpcUrl: string) {
  try {
    // Raydium program IDs
    const RAYDIUM_V4 = '675kPX9MHTjS2zt1qrNZM65XgqDLnVAETiLmSfv8Uvt';
    const SOL_MINT = 'So11111111111111111111111111111111111111112';

    // Fetch recent transactions involving Raydium
    const response = await axios.post(
      rpcUrl,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [RAYDIUM_V4, { limit: 10 }],
      },
      { timeout: 5000 }
    );

    if (!response.data?.result) return;

    const signatures = response.data.result;

    for (const sig of signatures) {
      if (!sig.signature) continue;

      // Skip if already processed
      if (detectedPools.has(sig.signature)) continue;

      // Get transaction details
      const txResponse = await axios.post(
        rpcUrl,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [sig.signature, 'jsonParsed'],
        },
        { timeout: 5000 }
      );

      const tx = txResponse.data?.result;
      if (!tx || tx.blockTime === null) continue;

      // Look for pool creation (new account creation + token initialization)
      const pool = parsePoolCreationTx(tx, sig.signature);
      if (pool) {
        const ageSeconds = Math.floor(Date.now() / 1000) - pool.createdAt;

        // Only notify if pool is very new (< 30 seconds)
        if (ageSeconds < 30) {
          console.log(
            `[RAYDIUM] 🆕 New pool detected: ${pool.mint.substring(0, 8)}... (${ageSeconds}s old, $${pool.liquidity.toFixed(2)} liquidity)`
          );

          detectedPools.set(sig.signature, pool);

          // Notify all subscribers
          poolCallbacks.forEach(cb => {
            try {
              cb(pool);
            } catch (e) {
              console.error('[RAYDIUM] Callback error:', e);
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('[RAYDIUM] Poll error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Parse transaction to detect pool creation
 * Returns pool details if this is a new Raydium pool
 */
function parsePoolCreationTx(tx: any, signature: string): RaydiumPool | null {
  try {
    const blockTime = tx.blockTime || Math.floor(Date.now() / 1000);
    const instructions = tx.transaction?.message?.instructions || [];

    // Look for pool creation pattern:
    // 1. Token initialization
    // 2. Account creation
    // 3. Transfer to vaults

    let baseMint = null;
    let quoteMint = 'So11111111111111111111111111111111111111112'; // SOL
    let liquidity = 0;

    // Simple heuristic: Look for non-SOL token being traded
    const postTokenBalances = tx.meta?.postTokenBalances || [];
    const preTokenBalances = tx.meta?.preTokenBalances || [];

    for (const balance of postTokenBalances) {
      if (
        balance.mint &&
        balance.mint !== quoteMint &&
        balance.uiTokenAmount?.uiAmount > 0
      ) {
        baseMint = balance.mint;
      }

      // Estimate liquidity from token balance changes
      if (balance.mint === quoteMint) {
        liquidity = balance.uiTokenAmount?.uiAmount || 0;
      }
    }

    if (!baseMint) return null;

    return {
      id: signature,
      mint: baseMint,
      baseMint,
      quoteMint,
      baseVault: '',
      quoteVault: '',
      liquidity: Math.max(liquidity, 0),
      createdAt: blockTime,
      txSignature: signature,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get pool details (liquidity, market cap, etc.)
 */
export async function getPoolDetails(mint: string): Promise<Partial<RaydiumPool>> {
  try {
    // Try to fetch from DexScreener API
    const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {
      timeout: 3000,
    });

    const pair = response.data?.pairs?.[0];
    if (pair) {
      return {
        liquidity: parseFloat(pair.liquidity?.usd || '0'),
        marketCap: parseFloat(pair.marketCap || '0'),
      };
    }
  } catch (e) {
    // Fallback: return empty
  }

  return {};
}

/**
 * Check if pool has basic safety (not pure rug)
 * - Minimum liquidity > $500
 * - Not freshly created (> 1 second old)
 */
export function isPoolSafe(pool: RaydiumPool): boolean {
  const ageSeconds = Math.floor(Date.now() / 1000) - pool.createdAt;

  // Must be > 1 second old to avoid accidental front-run
  if (ageSeconds < 1) return false;

  // Must have minimum liquidity
  if (pool.liquidity < 500) return false;

  return true;
}

/**
 * Get recommended snipe amount (% of pool liquidity)
 */
export function getRecommendedBuyAmount(poolLiquidity: number): number {
  // Target: 0.5-2% of pool liquidity
  const percentage = poolLiquidity > 10000 ? 0.01 : poolLiquidity > 1000 ? 0.02 : 0.05;
  return Math.min(poolLiquidity * percentage, 5); // Cap at 5 SOL
}
