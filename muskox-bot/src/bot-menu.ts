/**
 * MUSKOX Sniper Bot - Professional Menu System (Banana Gun Style)
 * Clean inline keyboard layout with 2-column button grid
 */

import { InlineKeyboardMarkup } from 'grammy/types';

export const mainMenuKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '🦬 Sniper', callback_data: 'menu_sniper' },
      { text: '⭐ Manual Swap', callback_data: 'menu_swap' },
    ],
    [
      { text: '📊 Positions', callback_data: 'menu_positions' },
      { text: '📜 My Trades', callback_data: 'menu_trades' },
    ],
    [
      { text: '⚙️ Settings', callback_data: 'menu_settings' },
      { text: '❓ Help & FAQ', callback_data: 'menu_help' },
    ],
    [{ text: '📱 Menu', callback_data: 'menu_main' }],
  ],
};

export const settingsMenuKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      { text: '💰 Buy Amount', callback_data: 'settings_buy' },
      { text: '📈 TP/SL', callback_data: 'settings_tpsl' },
    ],
    [
      { text: '🔔 Alerts', callback_data: 'settings_alerts' },
      { text: '🌐 Language', callback_data: 'settings_lang' },
    ],
    [
      { text: '⚡ Slippage', callback_data: 'settings_slippage' },
      { text: '🎯 Filters', callback_data: 'settings_filters' },
    ],
    [{ text: '📱 Menu', callback_data: 'menu_main' }],
  ],
};

export const startMessage = `
🦬 **MUSKOX SNIPER BOT** — Professional Edition

⚡ Real-time Raydium pool detection & sniping
🚀 14 languages · 23+ commands · Enterprise-grade filters
💰 100% non-custodial · User controls all funds

**Quick Start:**
1️⃣ /connect — Link your Solana wallet
2️⃣ /snipenew — Turn on real-time monitoring
3️⃣ Get instant 🚨 alerts when pools launch

Use the menu below to explore features!
`;

export const sniperScreenMessage = `
🎯 **SNIPER SCREEN**

**Real-Time Monitoring:**
Turn on with /snipenew to get instant alerts for new Raydium pools

**Manual Snipe:**
/snipe <CA> <SOL_amount>

Example:
/snipe 6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt 0.5

**Watchlist:**
/watch <CA> — Add token to monitor
/watchlist — View all watched tokens
/unwatch <CA> — Remove token

🚨 You'll get instant alerts when watched tokens launch!
`;

export const manualSwapMessage = `
⭐ **MANUAL SWAP**

Swap any token manually on Jupiter:

/swap <CA> <SOL_amount>

Or use /snipe with same syntax — both work!

Features:
✅ 1-tap Jupiter links (easiest on mobile)
✅ Base64 fallback for advanced users
✅ Real-time price quotes
✅ Configurable slippage & priority fee

Set your defaults:
/setslippage <percent> — e.g., /setslippage 15
/setpriority <fee> — Priority fee in lamports
`;

export const settingsMessage = (buyAmount: number, tp: number, sl: number, slippage: number, alerts: boolean, lang: string) => `
⚙️ **SETTINGS**

**Current Configuration:**
💰 Default Buy: ${buyAmount} SOL
📈 Take-Profit: +${tp}%
📉 Stop-Loss: -${sl}%
📊 Slippage: ${slippage}%
🔔 Alerts: ${alerts ? '✅ ON' : '❌ OFF'}
🌐 Language: ${lang.toUpperCase()}

**Quick Commands:**
/setbuy <SOL> — Change buy amount
/settp <pct> — Set take-profit %
/setsl <pct> — Set stop-loss %
/setslippage <pct> — Set slippage tolerance
/alerts on|off — Toggle alerts
/language — Change language
/autosell on|off — Toggle auto-sell

Tap buttons above to update!
`;

export const helpMessage = `
❓ **HELP & FAQ**

**Common Questions:**
Just ask naturally! Examples:
• "How do I snipe?"
• "What is take profit?"
• "How do I use base64?"
• "I'm new, help me start"

**All Commands:**
/start — Welcome menu
/connect — Link wallet
/snipe <CA> <SOL> — Manual snipe
/snipenew — Toggle monitoring
/watch <CA> — Add to watchlist
/positions — View active positions
/mytrades — View trade history
/status — Full dashboard
/help — This message

**Need More?**
Type any question naturally and I'll help! 🦬
`;
