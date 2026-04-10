/**
 * Pump.fun Token Monitor
 * Detects new token launches on pump.fun in real-time
 */

import axios from 'axios';

export interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  liquidity: number;
  marketCap: number;
  createdAt: number;
  bondingCurveProgress: number;
  txSignature?: string;
}

let lastCheckedTime = Date.now();
const detectedTokens = new Map<string, PumpFunToken>();
const tokenCallbacks: Array<(token: PumpFunToken) => void> = [];

/**
 * Subscribe to new token detections
 */
export function onNewPumpFunToken(callback: (token: PumpFunToken) => void) {
  tokenCallbacks.push(callback);
}

/**
 * Monitor pump.fun for new token launches
 * Polls every 3 seconds for new bonding curves
 */
export async function startPumpFunMonitoring() {
  console.log('[PUMP.FUN] Starting pump.fun monitor...');

  // Poll every 3 seconds for new tokens
  setInterval(() => pollNewTokens(), 3000);
}

/**
 * Poll pump.fun API for new token launches
 * Uses pump.fun's public API to detect new bonding curves
 */
async function pollNewTokens() {
  try {
    console.log('[PUMP.FUN] Polling for new tokens...');

    // Pump.fun API endpoint for recent tokens
    // Returns latest tokens sorted by creation time
    const response = await axios.get('https://api.pump.fun/tokens?limit=50&sort=created_asc', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!response.data?.tokens) {
      console.log('[PUMP.FUN] No tokens in response');
      return;
    }

    const tokens = response.data.tokens || [];
    console.log(`[PUMP.FUN] Received ${tokens.length} tokens from API`);

    for (const tokenData of tokens) {
      if (!tokenData.mint) continue;

      // Skip if already processed
      if (detectedTokens.has(tokenData.mint)) continue;

      // Parse token details
      const token = parsePumpFunToken(tokenData);
      if (!token) continue;

      const ageSeconds = Math.floor(Date.now() / 1000) - token.createdAt;

      // Only notify if token is very new (< 60 seconds)
      if (ageSeconds < 60 && ageSeconds >= 0) {
        console.log(
          `[PUMP.FUN] 🆕 New token: ${token.symbol} (${token.mint.substring(0, 8)}...) | Age: ${ageSeconds}s | MC: $${token.marketCap.toFixed(2)}`
        );

        detectedTokens.set(token.mint, token);

        // Notify all subscribers
        tokenCallbacks.forEach(cb => {
          try {
            cb(token);
          } catch (e) {
            console.error('[PUMP.FUN] Callback error:', e);
          }
        });
      }
    }
  } catch (error) {
    console.error('[PUMP.FUN] Poll error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Parse pump.fun token data
 */
function parsePumpFunToken(tokenData: any): PumpFunToken | null {
  try {
    const mint = tokenData.mint;
    const name = tokenData.name || 'Unknown';
    const symbol = tokenData.symbol || 'UNKNOWN';
    const createdAt = Math.floor(new Date(tokenData.createdAt || Date.now()).getTime() / 1000);
    const marketCap = parseFloat(tokenData.marketCapSol || '0');
    const liquidity = parseFloat(tokenData.liquiditySol || '0');
    const bondingCurveProgress = parseFloat(tokenData.bondingCurveProgress || '0');

    return {
      mint,
      name,
      symbol,
      createdAt,
      marketCap,
      liquidity,
      bondingCurveProgress,
    };
  } catch (e) {
    console.error('[PUMP.FUN] Parse error:', e);
    return null;
  }
}

/**
 * Fetch token details from pump.fun
 */
export async function getPumpFunTokenDetails(mint: string): Promise<Partial<PumpFunToken>> {
  try {
    const response = await axios.get(`https://api.pump.fun/token/${mint}`, {
      timeout: 3000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (response.data?.token) {
      const token = response.data.token;
      return {
        name: token.name,
        symbol: token.symbol,
        marketCap: parseFloat(token.marketCapSol || '0'),
        liquidity: parseFloat(token.liquiditySol || '0'),
        bondingCurveProgress: parseFloat(token.bondingCurveProgress || '0'),
      };
    }
  } catch (e) {
    console.error('[PUMP.FUN] Fetch details error:', e);
  }

  return {};
}

/**
 * Check if token is safe to snipe
 * - Bonding curve progress < 80% (room to grow)
 * - Market cap > $1000 (not pure rug)
 * - Age > 1 second (avoid front-run)
 */
export function isPumpFunTokenSafe(token: PumpFunToken): boolean {
  const ageSeconds = Math.floor(Date.now() / 1000) - token.createdAt;

  // Must be > 1 second old to avoid accidental front-run
  if (ageSeconds < 1) return false;

  // Bonding curve shouldn't be too far along (< 80%)
  if (token.bondingCurveProgress > 0.8) {
    console.log(`[PUMP.FUN] Token ${token.mint.substring(0, 8)}... filtered: bonding curve too far along (${(token.bondingCurveProgress * 100).toFixed(1)}%)`);
    return false;
  }

  // Minimum market cap to avoid pure rugs
  if (token.marketCap < 1000) {
    console.log(`[PUMP.FUN] Token ${token.mint.substring(0, 8)}... filtered: market cap too low ($${token.marketCap.toFixed(2)})`);
    return false;
  }

  return true;
}

/**
 * Get recommended buy amount for pump.fun token
 * Conservative: 0.1-0.5 SOL (these move fast)
 */
export function getRecommendedPumpFunBuyAmount(): number {
  return 0.3; // Default 0.3 SOL for pump.fun (volatile)
}
