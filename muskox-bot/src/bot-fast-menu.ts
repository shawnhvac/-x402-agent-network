/**
 * Fast Menu System - Banana Gun Style
 * Instant response, pre-filled Jupiter links, minimal latency
 */

import { InlineKeyboardMarkup } from 'grammy/types';

// Main menu - Clean 2-column grid
export const mainMenuKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '🦬 Sniper', callback_data: 'quick_sniper' },
      { text: '⭐ Swap', callback_data: 'quick_swap' },
    ],
    [
      { text: '🚨 Recent', callback_data: 'menu_recent' },
      { text: '📊 Positions', callback_data: 'menu_positions' },
    ],
    [
      { text: '🚀 Game', callback_data: 'menu_game' },
      { text: '📜 Trades', callback_data: 'menu_trades' },
    ],
    [
      { text: '⚙️ Settings', callback_data: 'menu_settings' },
      { text: '❓ Help', callback_data: 'menu_help' },
    ],
  ],
};

// Sniper screen - Direct action buttons
export const sniperKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: '🚀 Open Jupiter Swap', callback_data: 'sniper_jupiter' }],
    [{ text: '⚙️ Settings', callback_data: 'menu_settings' }],
    [{ text: '📱 Back', callback_data: 'menu_main' }],
  ],
};

// Swap screen - Pre-filled Jupiter link
export const swapKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{ text: '🔵 Open Jupiter', callback_data: 'swap_jupiter' }],
    [{ text: '💾 Manual CA', callback_data: 'swap_manual' }],
    [{ text: '📱 Back', callback_data: 'menu_main' }],
  ],
};

// Settings submenu
export const settingsKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '💰 Buy', callback_data: 'set_buy' },
      { text: '📈 TP/SL', callback_data: 'set_tpsl' },
    ],
    [
      { text: '🌐 Lang', callback_data: 'set_lang' },
      { text: '🔔 Alerts', callback_data: 'set_alerts' },
    ],
    [
      { text: '💎 Premium', callback_data: 'menu_premium' },
      { text: '⚡ Slippage', callback_data: 'set_slippage' },
    ],
    [{ text: '📱 Back', callback_data: 'menu_main' }],
  ],
};

// Start message
export const startMsg = `🦬 **MUSKOX SNIPER BOT**

⚡ Real-time Raydium monitoring
🚀 Fast Jupiter swaps
💰 100% non-custodial

📊 **Fee Structure:**
• Free Tier: 1% per snipe
• Premium: 0% fees (~$25 USD/month)

Tap Settings → 💎 Premium to upgrade!

Tap buttons below to get started!`;

// Sniper ready screen
export function sniperReadyMsg(buyAmount: number, tp: number, sl: number): string {
  return `🚨 **READY TO SNIPE**

Your Settings:
💰 Buy: ${buyAmount} SOL
📈 Take-Profit: +${tp}%
📉 Stop-Loss: -${sl}%

Tap "Open Jupiter" when pool launches!
Monitoring is ACTIVE 🟢`;
}

// Swap screen with Jupiter link
export function swapScreenMsg(buyAmount: number, lastCA?: string): string {
  const link = lastCA 
    ? `https://jup.ag/swap/SOL-${lastCA}?amount=${buyAmount * 1e9}`
    : `https://jup.ag/swap`;
  
  return `⭐ **QUICK SWAP**

💰 Default: ${buyAmount} SOL
${lastCA ? `📌 Last Token: \`${lastCA.substring(0, 8)}...\`` : ''}

One-tap Jupiter link ready:
${link}

Or paste CA for custom token`;
}

// Help message
export const helpMsg = `❓ **HELP & FAQ**

Ask naturally:
• "How do I snipe?"
• "What is TP/SL?"
• "How to connect?"

Or use commands:
/snipe <CA> <SOL>
/status
/positions`;
