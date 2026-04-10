/**
 * User Settings Manager
 * Stores snipe preferences (default buy amount, slippage, priority fee, etc.)
 * Persists to disk for data preservation across restarts
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Language } from './translations';

const SETTINGS_DIR = path.join(process.cwd(), 'user-data');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'user-settings.json');

export interface UserSettings {
  userId: number;
  walletAddress?: string;
  defaultBuyAmount: number; // SOL
  slippage: number; // percentage
  priorityFee: number; // lamports
  monitoringEnabled: boolean;
  alertsEnabled: boolean; // Push notifications on/off
  watchlist: string[]; // List of token CAs to watch
  takeProfitPercent: number; // Auto-sell TP %
  stopLossPercent: number; // Auto-sell SL %
  autoSellEnabled: boolean; // Auto-sell on/off
  minLiquidity: number; // Min liquidity in SOL for pool alerts
  maxLiquidity?: number; // Max liquidity (optional)
  lpLockedCheck: boolean; // Filter pools without locked LP
  devWalletFilter: boolean; // Filter out high dev allocation
  ageFilterSeconds: number; // Only show pools < X seconds old
  language: Language; // User's preferred language
  waitingForCA?: boolean; // State: waiting for token CA input
  // Subscription fields
  isPremium: boolean; // Premium subscriber (0% fee)
  premiumExpiresAt?: number; // Premium expiration timestamp
  snipeCount: number; // Total snipes executed
  feePaid: number; // Total fees paid (in output tokens)
  activePositions: Array<{
    tokenCA: string;
    entryPrice: number;
    amount: number;
    currentPrice?: number;
    timestamp: number;
    pnlPercent?: number;
  }>;
  tradeHistory: Array<{
    tokenCA: string;
    entryPrice: number;
    exitPrice: number;
    amount: number;
    pnlPercent: number;
    timestamp: number;
    status: 'profit' | 'loss' | 'closed';
  }>;
  lastUpdated: number;
}

const userSettings = new Map<number, UserSettings>();

const DEFAULT_SETTINGS: Omit<UserSettings, 'userId' | 'lastUpdated'> = {
  walletAddress: undefined,
  defaultBuyAmount: 0.5,
  slippage: 15,
  priorityFee: 500000, // 0.5 lamports
  monitoringEnabled: false,
  alertsEnabled: false,
  watchlist: [],
  takeProfitPercent: 100, // 2x default
  stopLossPercent: 50, // -50% default
  autoSellEnabled: false,
  minLiquidity: 10, // Minimum 10 SOL liquidity
  maxLiquidity: undefined,
  lpLockedCheck: true,
  devWalletFilter: true,
  ageFilterSeconds: 60, // Only pools < 60 seconds old
  language: 'en' as Language,
  isPremium: false, // Default to free tier
  premiumExpiresAt: undefined,
  snipeCount: 0,
  feePaid: 0,
  activePositions: [],
  tradeHistory: [],
};

/**
 * Get user settings (create if not exists)
 */
export function getUserSettings(userId: number): UserSettings {
  if (!userSettings.has(userId)) {
    userSettings.set(userId, {
      userId,
      ...DEFAULT_SETTINGS,
      lastUpdated: Date.now(),
    });
  }
  return userSettings.get(userId)!;
}

/**
 * Set default buy amount
 */
export function setDefaultBuyAmount(userId: number, amount: number): UserSettings {
  const settings = getUserSettings(userId);
  if (amount <= 0 || amount > 100) {
    throw new Error('Buy amount must be between 0.001 and 100 SOL');
  }
  settings.defaultBuyAmount = amount;
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Set slippage tolerance
 */
export function setSlippage(userId: number, slippage: number): UserSettings {
  const settings = getUserSettings(userId);
  if (slippage < 0.1 || slippage > 50) {
    throw new Error('Slippage must be between 0.1% and 50%');
  }
  settings.slippage = slippage;
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Set priority fee (in lamports)
 */
export function setPriorityFee(userId: number, fee: number): UserSettings {
  const settings = getUserSettings(userId);
  if (fee < 0 || fee > 10000000) {
    throw new Error('Priority fee must be between 0 and 10,000,000 lamports');
  }
  settings.priorityFee = fee;
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Toggle monitoring
 */
export function toggleMonitoring(userId: number, enabled: boolean): UserSettings {
  const settings = getUserSettings(userId);
  settings.monitoringEnabled = enabled;
  // Auto-enable alerts when monitoring is turned on
  if (enabled) {
    settings.alertsEnabled = true;
  }
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Toggle alerts
 */
export function toggleAlerts(userId: number, enabled: boolean): UserSettings {
  const settings = getUserSettings(userId);
  settings.alertsEnabled = enabled;
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Add token to watchlist
 */
export function addToWatchlist(userId: number, tokenCA: string): UserSettings {
  const settings = getUserSettings(userId);
  if (settings.watchlist.length >= 20) {
    throw new Error('Maximum 20 tokens in watchlist');
  }
  if (!settings.watchlist.includes(tokenCA)) {
    settings.watchlist.push(tokenCA);
  }
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Remove token from watchlist
 */
export function removeFromWatchlist(userId: number, tokenCA: string): UserSettings {
  const settings = getUserSettings(userId);
  settings.watchlist = settings.watchlist.filter(ca => ca !== tokenCA);
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Set user language preference
 */
export function setLanguage(userId: number, lang: Language): UserSettings {
  const settings = getUserSettings(userId);
  settings.language = lang;
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Set take-profit percentage
 */
export function setTakeProfit(userId: number, percent: number): UserSettings {
  const settings = getUserSettings(userId);
  if (percent < 1 || percent > 1000) {
    throw new Error('Take-profit must be between 1% and 1000%');
  }
  settings.takeProfitPercent = percent;
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Set stop-loss percentage
 */
export function setStopLoss(userId: number, percent: number): UserSettings {
  const settings = getUserSettings(userId);
  if (percent < 1 || percent > 100) {
    throw new Error('Stop-loss must be between 1% and 100%');
  }
  settings.stopLossPercent = percent;
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Toggle auto-sell
 */
export function toggleAutoSell(userId: number, enabled: boolean): UserSettings {
  const settings = getUserSettings(userId);
  settings.autoSellEnabled = enabled;
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Set minimum liquidity filter
 */
export function setMinLiquidity(userId: number, amount: number): UserSettings {
  const settings = getUserSettings(userId);
  if (amount < 0.1 || amount > 10000) {
    throw new Error('Min liquidity must be between 0.1 and 10000 SOL');
  }
  settings.minLiquidity = amount;
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Add active position
 */
export function addPosition(userId: number, tokenCA: string, entryPrice: number, amount: number): UserSettings {
  const settings = getUserSettings(userId);
  settings.activePositions.push({
    tokenCA,
    entryPrice,
    amount,
    timestamp: Date.now(),
    pnlPercent: 0,
  });
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Update position with current price
 */
export function updatePosition(userId: number, tokenCA: string, currentPrice: number): UserSettings {
  const settings = getUserSettings(userId);
  const position = settings.activePositions.find(p => p.tokenCA === tokenCA);
  if (position) {
    position.currentPrice = currentPrice;
    position.pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
  }
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Close position and add to trade history
 */
export function closePosition(userId: number, tokenCA: string, exitPrice: number): UserSettings {
  const settings = getUserSettings(userId);
  const posIndex = settings.activePositions.findIndex(p => p.tokenCA === tokenCA);
  
  if (posIndex >= 0) {
    const position = settings.activePositions[posIndex];
    const pnlPercent = ((exitPrice - position.entryPrice) / position.entryPrice) * 100;
    
    settings.tradeHistory.push({
      tokenCA,
      entryPrice: position.entryPrice,
      exitPrice,
      amount: position.amount,
      pnlPercent,
      timestamp: Date.now(),
      status: pnlPercent > 0 ? 'profit' : 'loss',
    });
    
    settings.activePositions.splice(posIndex, 1);
  }
  
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Get all positions with formatting
 */
export function getPositionsDisplay(userId: number): string {
  const settings = getUserSettings(userId);
  
  if (settings.activePositions.length === 0) {
    return '📍 **No Active Positions**\n\nStart sniping to open positions!';
  }
  
  const positions = settings.activePositions
    .map((pos, i) => {
      const pnlColor = pos.pnlPercent! > 0 ? '📈' : '📉';
      const pnlText = pos.pnlPercent?.toFixed(2) || '0.00';
      return `${i + 1}. \`${pos.tokenCA.substring(0, 8)}...\`\n   Entry: $${pos.entryPrice.toFixed(6)} | Amount: ${pos.amount}\n   ${pnlColor} PnL: ${pnlText}%`;
    })
    .join('\n\n');
  
  return `📍 **Active Positions (${settings.activePositions.length})**\n\n${positions}`;
}

/**
 * Get trade history
 */
export function getTradeHistoryDisplay(userId: number, limit: number = 10): string {
  const settings = getUserSettings(userId);
  const trades = settings.tradeHistory.slice(-limit).reverse();
  
  if (trades.length === 0) {
    return '📊 **No Trade History**\n\nYour closed trades will appear here.';
  }
  
  const tradeText = trades
    .map((trade, i) => {
      const status = trade.status === 'profit' ? '✅' : '❌';
      const pnlText = trade.pnlPercent.toFixed(2);
      return `${i + 1}. ${status} \`${trade.tokenCA.substring(0, 8)}...\`\n   Entry: $${trade.entryPrice.toFixed(6)} → Exit: $${trade.exitPrice.toFixed(6)}\n   PnL: ${pnlText}%`;
    })
    .join('\n\n');
  
  return `📊 **Recent Trades (Last ${Math.min(limit, trades.length)})**\n\n${tradeText}`;
}

/**
 * Set waiting for CA state
 */
export function setWaitingForCA(userId: number): UserSettings {
  const settings = getUserSettings(userId);
  settings.waitingForCA = true;
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Clear waiting state
 */
export function clearWaitingState(userId: number): UserSettings {
  const settings = getUserSettings(userId);
  settings.waitingForCA = false;
  settings.lastUpdated = Date.now();
  return settings;
}

/**
 * Check if user is waiting for CA
 */
export function isWaitingForCA(userId: number): boolean {
  const settings = getUserSettings(userId);
  return settings.waitingForCA === true;
}

/**
 * Validate Solana contract address (44 characters)
 * Solana CAs are always exactly 44 characters long
 */
export function isValidSolanaCA(text: string): boolean {
  const cleaned = text.trim();
  // Simple: just check if it's exactly 44 characters (covers all valid Solana CAs)
  return cleaned.length === 44 && cleaned.length > 0;
}

/**
 * Get all settings as readable string
 */
export function getSettingsString(userId: number): string {
  const s = getUserSettings(userId);
  const monitoringStatus = s.monitoringEnabled ? '🟢 ON' : '🔴 OFF';
  const alertsStatus = s.alertsEnabled ? '🔔 ON' : '🔕 OFF';
  const autoSellStatus = s.autoSellEnabled ? '✅ ON' : '❌ OFF';

  return `⚙️ **YOUR PROFESSIONAL SNIPER SETTINGS**

**Monitoring:**
${monitoringStatus} Real-Time Monitoring
🔔 Push Alerts: ${alertsStatus}

**Buy Settings:**
💰 Default Buy: ${s.defaultBuyAmount} SOL
📊 Slippage: ${s.slippage}%
⚡ Priority Fee: ${s.priorityFee} lamports

**Auto-Sell (Take-Profit / Stop-Loss):**
${autoSellStatus} Auto-Sell
📈 Take-Profit: +${s.takeProfitPercent}%
📉 Stop-Loss: -${s.stopLossPercent}%

**Pool Filters:**
💧 Min Liquidity: ${s.minLiquidity} SOL
⏱️ Age Filter: < ${s.ageFilterSeconds}s
🔒 LP Locked Check: ${s.lpLockedCheck ? '✅' : '❌'}
👤 Dev Wallet Filter: ${s.devWalletFilter ? '✅' : '❌'}

**Positions & Watchlist:**
📍 Active Positions: ${s.activePositions.length}
👁️ Watchlist: ${s.watchlist.length}/20 tokens

**Quick Commands:**
/settp <percent> — Set take-profit %
/setsl <percent> — Set stop-loss %
/autosell on/off — Toggle auto-sell
/watch <CA> — Add to watchlist
/watchlist — View watchlist
/unwatch <CA> — Remove from watchlist
/status — View this screen`;
}

/**
 * Premium subscription functions
 */
export function isPremiumSubscriber(userId: number): boolean {
  const settings = getUserSettings(userId);
  if (!settings.isPremium) return false;
  
  // Check if premium has expired
  if (settings.premiumExpiresAt && settings.premiumExpiresAt < Date.now()) {
    settings.isPremium = false;
    settings.premiumExpiresAt = undefined;
    return false;
  }
  
  return true;
}

export function activatePremium(userId: number, durationMs: number = 30 * 24 * 60 * 60 * 1000): void {
  const settings = getUserSettings(userId);
  settings.isPremium = true;
  settings.premiumExpiresAt = Date.now() + durationMs; // Default 30 days
}

export function calculateSnipeFee(outputAmount: number, userId: number): number {
  // Premium users pay 0%
  if (isPremiumSubscriber(userId)) {
    return 0;
  }
  
  // Free users pay 1%
  return Math.floor(outputAmount * 0.01);
}

export function recordSnipe(userId: number, outputTokensFee: number): void {
  const settings = getUserSettings(userId);
  settings.snipeCount += 1;
  settings.feePaid += outputTokensFee;
  saveUserSettings(); // Auto-save on snipe
}

/**
 * Save all user settings to disk
 */
export function saveUserSettings(): void {
  try {
    // Create directory if needed
    if (!fs.existsSync(SETTINGS_DIR)) {
      fs.mkdirSync(SETTINGS_DIR, { recursive: true });
    }

    // Convert Map to object
    const data: Record<string, UserSettings> = {};
    for (const [userId, settings] of userSettings.entries()) {
      data[userId.toString()] = settings;
    }

    // Write to file
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
    console.log(`[SETTINGS] Saved ${userSettings.size} users to disk`);
  } catch (e) {
    console.error(`[SETTINGS] Error saving to disk:`, e);
  }
}

/**
 * Load user settings from disk
 */
export function loadUserSettings(): void {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      console.log(`[SETTINGS] No saved settings found (first run)`);
      return;
    }

    const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    for (const [userIdStr, settings] of Object.entries(data)) {
      const userId = parseInt(userIdStr);
      userSettings.set(userId, settings as UserSettings);
    }

    console.log(`[SETTINGS] Loaded ${userSettings.size} users from disk`);
  } catch (e) {
    console.error(`[SETTINGS] Error loading from disk:`, e);
  }
}

/**
 * Auto-save on wallet connect
 */
export function connectWallet(userId: number, address: string): void {
  const settings = getUserSettings(userId);
  settings.walletAddress = address;
  saveUserSettings();
  console.log(`[SETTINGS] Wallet saved for user ${userId}`);
}
