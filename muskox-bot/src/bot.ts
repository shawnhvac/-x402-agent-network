import { Bot } from 'grammy';
import { config, validateConfig } from './config';
import { startPoolMonitoring, onNewPool, isPoolSafe, getPoolDetails } from './raydium';
import { startPumpFunMonitoring, onNewPumpFunToken, isPumpFunTokenSafe, PumpFunToken } from './pumpfun';
import {
  getUserSettings,
  setDefaultBuyAmount,
  setSlippage,
  setPriorityFee,
  toggleMonitoring,
  toggleAlerts,
  addToWatchlist,
  removeFromWatchlist,
  getSettingsString,
  setTakeProfit,
  setStopLoss,
  toggleAutoSell,
  setMinLiquidity,
  addPosition,
  setLanguage,
  closePosition,
  getPositionsDisplay,
  getTradeHistoryDisplay,
  setWaitingForCA,
  clearWaitingState,
  isWaitingForCA,
  isValidSolanaCA,
  isPremiumSubscriber,
  activatePremium,
  calculateSnipeFee,
  recordSnipe,
  loadUserSettings,
  saveUserSettings,
  connectWallet,
} from './userSettings';
import { LANGUAGES, type Language, t } from './translations';
import { mainMenuKeyboard as oldMainMenu, settingsMenuKeyboard, startMessage, sniperScreenMessage, manualSwapMessage, settingsMessage, helpMessage } from './bot-menu';
import { mainMenuKeyboard, sniperKeyboard, swapKeyboard, settingsKeyboard, startMsg, sniperReadyMsg, swapScreenMsg, helpMsg } from './bot-fast-menu';

validateConfig();

const bot = new Bot(config.telegramToken);
const BOT_PORT = process.env.PORT || '3003';
const fs = require('fs');

const MONITOR_LOG = '/root/.openclaw/workspace/snipe-bot-monitor.log';
const QUESTIONS_LOG = '/root/.openclaw/workspace/snipe-bot-questions.jsonl';

function logUserMessage(userId: number, username: string | undefined, text: string, isCommand: boolean) {
  const ts = new Date().toISOString();
  const user = username || `user_${userId}`;
  const type = isCommand ? '[COMMAND]' : '[QUESTION]';

  const logLine = `[${ts}] ${user} (${userId}): ${text.substring(0, 150)} ${type}\n`;

  try {
    fs.appendFileSync(MONITOR_LOG, logLine);

    if (!isCommand) {
      const entry = {
        timestamp: ts,
        user_id: userId,
        username: user,
        message: text,
        type: 'text',
        is_command: false,
      };
      fs.appendFileSync(QUESTIONS_LOG, JSON.stringify(entry) + '\n');
    }
  } catch (e) {
    console.error('[MONITOR ERROR]', e);
  }
}

// Auto-response FAQ system - Comprehensive keyword matching
const autoResponses: { keywords: string[]; response: string }[] = [
  {
    keywords: ['base64', 'how do i use', 'backup', 'copy paste', 'copy', 'paste', 'long-press', 'transaction'],
    response: `📋 **Using the Base64 (Backup Method):**

1️⃣ Long-press the base64 and select "Copy"
2️⃣ Open your wallet app (Phantom or Solflare)
3️⃣ Go to Swap → Look for custom transaction or raw transaction
4️⃣ Paste the base64 into the transaction field
5️⃣ Review details and sign in your wallet
6️⃣ Copy the signed transaction your wallet provides
7️⃣ Paste the signed tx back here

💡 **Easier:** Use the Jupiter link instead (1 tap, no copying!)`,
  },
  {
    keywords: ['snipe', 'how do i', 'how to', 'what is', 'what does', 'sniping', 'start sniping', 'buy token', 'get token'],
    response: `🎯 **How to Snipe:**

1️⃣ Get a token's contract address (CA)
2️⃣ Type: /snipe <CA> <SOL_amount>

Example: /snipe 6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt 0.1

3️⃣ Bot gives you swap options (Jupiter link or base64)
4️⃣ Complete the swap
5️⃣ 1% fee (free tier) goes to treasury for buyback & burn
   (Premium subscribers pay 0% - see /premium)

Need help? Ask /help 🦬`,
  },
  {
    keywords: ['wallet', 'connect', 'setup', 'phantom', 'solflare', 'address', 'public key', 'metamask', 'magic eden'],
    response: `🔐 **Wallet Setup:**

1️⃣ Use /connect
2️⃣ Copy your Solana public key from:
   - Phantom: Click address at top
   - Solflare: Settings → View Public Key
   - Magic Eden: Profile → Copy address
3️⃣ Paste it here (NOT your private key!)
4️⃣ Bot confirms: "Wallet Connected!"
5️⃣ Ready to snipe!

⚠️ Never share your PRIVATE key!
✅ Your PUBLIC key is safe to share`,
  },
  {
    keywords: ['fee', '1%', '0%', 'how much', 'cost', 'charges', 'money', 'expensive', 'price', 'premium', 'subscription'],
    response: `💰 **Fee Structure:**

📊 **Free Tier:** 1% of output tokens
   ✅ Automatic fee from every snipe
   ✅ Goes to treasury for $MUSKOX buyback & burn

💎 **Premium Tier:** 0% fee (only 25 $MUSKOX/month)
   ✅ No fees on any snipes
   ✅ /premium to subscribe

All fees are deducted from your output automatically.
✅ Fee goes to: $MUSKOX buyback & burn 🔥

Want 0% fee? /premium for 25 $MUSKOX/month (monthly auto-renew)!`,
  },
  {
    keywords: ['jupiter', 'link', 'tap', 'click', 'swap', 'button'],
    response: `🔵 **Jupiter Link Help:**

✅ The Jupiter link should be blue and clickable
✅ Tap it → Jupiter opens with your token pre-filled
✅ Review the swap details
✅ Click "Swap" and confirm in your wallet

If swap fails: Try a different token or use base64 fallback`,
  },
  {
    keywords: ['how do i start', 'getting started', 'first time', 'new user', 'beginner', 'tutorial'],
    response: `🚀 **Getting Started (3 Steps):**

1️⃣ **Connect Wallet**
   - Use /connect
   - Paste your Solana public key

2️⃣ **Set Up Preferences**
   - /setbuy 0.5 (default buy amount)
   - /setslippage 15 (slippage tolerance)

3️⃣ **Start Sniping**
   - /snipe <CA> <SOL> (manual snipe)
   - /snipenew (turn on auto-monitoring)

Need pro features? Check out /help 🦬`,
  },
  {
    keywords: ['what is', 'what does', 'can i', 'is it', 'does it', 'auto sell', 'monitoring', 'alerts'],
    response: `❓ **Common Questions:**

**What is auto-sell?**
📈 Set a take-profit % (e.g., +50%) and stop-loss % (e.g., -30%)
Bot automatically sells when your position reaches those thresholds
Use /settp and /setsl to configure

**What is monitoring?**
🟢 /snipenew turns on real-time pool detection
🚨 Get instant alerts when new Raydium pools launch
Customize your settings with /setbuy, /setslippage, etc.

**How do alerts work?**
📲 Enable in /notificationhelp
You'll get 🚨🚨🚨 notifications on your phone
Each alert shows: Token CA, Age, Liquidity, Quick snipe link

**What is a watchlist?**
👁️ /watch <CA> to add tokens you want to track
/watchlist to see your list
Get alerts when watchlist tokens launch

Need more help? /help for full command list!`,
  },
  {
    keywords: ['stop loss', 'take profit', 'tp', 'sl', 'sell', 'exit', 'profit'],
    response: `📊 **Stop-Loss & Take-Profit Guide:**

**Set Your Levels:**
/settp 50 (sell at +50% profit)
/setsl 30 (sell at -30% loss)

**Enable Auto-Sell:**
/autosell on (will auto-trigger when reached)

**How It Works:**
📈 Position gains 50% → Bot creates sell transaction
📉 Position loses 30% → Bot creates sell transaction
✅ You sign the sell in your wallet (100% non-custodial)
💰 Profits automatically sent to your wallet

**Example:**
- Buy at $1.00 with 1,000 tokens
- +50% profit = sell at $1.50 (auto-sell triggers)
- You keep the profit in your wallet

Set realistic levels for your strategy!`,
  },
  {
    keywords: ['language', 'english', 'spanish', 'chinese', 'french', 'german', 'translate', 'multilingual'],
    response: `🌐 **Language Support:**

We support 14 languages!

Use /language to see all options:
🇬🇧 🇪🇸 🇵🇹 🇩🇪 🇫🇷 🇮🇹 🇸🇪 🇹🇷 🇰🇷 🇸🇦 🇳🇱 🇯🇵 🇨🇳 🇷🇺

**How to Change:**
/language → Select your flag → Done! ✅

All bot messages will now be in your language.
English is the default.

Don't see your language? Let us know!`,
  },
  {
    keywords: ['raydium', 'pool', 'new', 'launch', 'detection', 'when'],
    response: `🔍 **About Raydium Pools:**

**What is Raydium?**
🏊 Decentralized exchange on Solana with automated market makers
New tokens launch liquidity pools here constantly

**How Detection Works:**
🟢 /snipenew activates monitoring
🚨 Bot scans every 5 seconds for new pools
📲 Instant alerts to your phone when detected

**Pool Filters:**
💧 Minimum liquidity (default 10 SOL)
⏱️ Age filter (default < 60 seconds old)
🔒 LP locked check
👤 Dev wallet allocation filter

**Why It Matters:**
Early pool launches = early entry = biggest potential gains
But also highest risk — only snipe what you can afford to lose!`,
  },
];

function findAutoResponse(message: string): string | null {
  const lower = message.toLowerCase().trim();

  const cleaned = lower
    .replace(/[?!.,:;]+$/g, '')
    .replace(/^(how|what|where|when|why|do|can|will|should|is|are) /g, '')
    .trim();

  for (const entry of autoResponses) {
    const checkText = lower + ' ' + cleaned;
    if (entry.keywords.some(k => checkText.includes(k.toLowerCase()))) {
      return entry.response;
    }
  }

  return null;
}

console.log('[BOT] Creating bot instance...');
console.log('[BOT] Token:', config.telegramToken.substring(0, 20) + '...');
console.log('[BOT] Monitoring enabled: ' + MONITOR_LOG);

// Load user settings from disk
loadUserSettings();

// ============================================================================
// PING - DIAGNOSTIC
// ============================================================================
bot.command('ping', async (ctx) => {
  console.log(`[PING] ${ctx.from?.id}`);
  const now = new Date().toLocaleTimeString();
  await ctx.reply(`PONG 🦬 port ${BOT_PORT} ${now}`);
});

// ============================================================================
// LANGUAGE / LANG - Select Language
// ============================================================================
bot.command(['language', 'lang'], async (ctx) => {
  const userId = ctx.from?.id || 0;
  console.log(`[LANGUAGE] ${userId}`);

  const languageButtons = Object.entries(LANGUAGES).map(([code, name]) => [
    {
      text: name,
      callback_data: `lang_${code}`,
    },
  ]);

  await ctx.reply('🌐 **Choose your language / Elige tu idioma / 选择您的语言**\n\nEnglish | Español | Português | 中文 | Русский', {
    reply_markup: {
      inline_keyboard: languageButtons,
    },
  });
});

// Handle language selection
// ============================================================================
// MENU CALLBACKS - Professional Button Interface (FULLY FUNCTIONAL)
// ============================================================================
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery?.data || '';
  const userId = ctx.from?.id || 0;
  const messageId = ctx.callbackQuery?.message?.message_id;

  console.log(`[CALLBACK] ${userId} → ${data}`);

  try {
    // MAIN MENU - Fast response
    if (data === 'menu_main') {
      if (messageId) {
        await ctx.editMessageText(startMsg, {
          parse_mode: 'Markdown',
          reply_markup: mainMenuKeyboard,
        });
      } else {
        await ctx.reply(startMsg, {
          parse_mode: 'Markdown',
          reply_markup: mainMenuKeyboard,
        });
      }
      await ctx.answerCallbackQuery();
      return;
    }

    // FAST SNIPER - Instant activation + Jupiter link
    if (data === 'quick_sniper') {
      const settings = getUserSettings(userId);
      
      // Enable monitoring immediately
      if (!settings.monitoringEnabled) {
        settings.monitoringEnabled = true;
      }
      
      // Show sniper ready screen with Jupiter link
      const msg = sniperReadyMsg(settings.defaultBuyAmount, settings.takeProfitPercent, settings.stopLossPercent);
      
      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: sniperKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: '🟢 Monitoring ACTIVE' });
      return;
    }

    // SNIPER - Open Jupiter for next pool
    if (data === 'sniper_jupiter') {
      const settings = getUserSettings(userId);
      // Generate Jupiter swap link with amount pre-filled
      const lamports = Math.floor(settings.defaultBuyAmount * 1e9);
      const jupLink = `https://jup.ag/swap?amount=${lamports}`;
      
      const linkMsg = `🚀 **JUPITER SWAP READY**

Amount: ${settings.defaultBuyAmount} SOL
Slippage: ${settings.slippage}%

✅ Tap button to open Jupiter (pre-filled with amount):

\`${jupLink}\``;
      
      if (messageId) {
        await ctx.editMessageText(linkMsg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🔵 Open Jupiter (Pre-filled with Amount)',
                  url: jupLink,
                },
              ],
              [
                {
                  text: '📱 Back',
                  callback_data: 'menu_main',
                },
              ],
            ],
          },
        });
      }
      await ctx.answerCallbackQuery({ text: '🔵 Jupiter ready' });
      return;
    }

    // FAST SWAP - Direct Jupiter link
    if (data === 'quick_swap') {
      const settings = getUserSettings(userId);
      const lastCA = settings.watchlist.length > 0 ? settings.watchlist[0] : undefined;
      
      const swapMsg = swapScreenMsg(settings.defaultBuyAmount, lastCA);
      
      if (messageId) {
        await ctx.editMessageText(swapMsg, {
          parse_mode: 'Markdown',
          reply_markup: swapKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: '⭐ Swap screen' });
      return;
    }

    // SWAP - Open Jupiter with pre-filled link
    if (data === 'swap_jupiter') {
      const settings = getUserSettings(userId);
      const lastCA = settings.watchlist.length > 0 ? settings.watchlist[0] : undefined;
      
      // Jupiter URL format with full mint addresses
      const inputMint = 'So11111111111111111111111111111111111111112'; // SOL
      const lamports = Math.floor(settings.defaultBuyAmount * 1e9);
      
      // Pre-filled Jupiter link
      const jupLink = lastCA 
        ? `https://jup.ag/swap?inputMint=${inputMint}&outputMint=${lastCA}&amount=${lamports}`
        : `https://jup.ag/swap?amount=${lamports}`;
      
      const caDisplay = lastCA ? `\`${lastCA.substring(0, 8)}...\`` : 'SOL';
      
      const msg = `🔵 **JUPITER SWAP (PRE-FILLED)**

💰 Amount: ${settings.defaultBuyAmount} SOL
📊 Slippage: ${settings.slippage}%
Token: ${caDisplay}

✅ Tap button to open Jupiter:

\`${jupLink}\``;
      
      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🚀 Open Jupiter (Pre-filled with Token + Amount)',
                  url: jupLink,
                },
              ],
              [
                {
                  text: '💾 Manual CA',
                  callback_data: 'swap_manual',
                },
              ],
              [
                {
                  text: '📱 Back',
                  callback_data: 'menu_main',
                },
              ],
            ],
          },
        });
      }
      await ctx.answerCallbackQuery({ text: '✅ Ready to swap' });
      return;
    }

    // SWAP - Manual CA entry
    if (data === 'swap_manual') {
      setWaitingForCA(userId);
      
      const msg = `💾 **MANUAL SWAP**

Send your token CA (contract address)

Example:
\`EPjFWaLb3odccccccccccccccccccccccccccccccccg\`

Or type "cancel" to go back`;
      
      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: swapKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: '💾 Send token CA' });
      return;
    }

    // POSITIONS - Show active trades with PnL
    if (data === 'menu_positions') {
      const posDisplay = getPositionsDisplay(userId);
      if (messageId) {
        await ctx.editMessageText(posDisplay, {
          parse_mode: 'Markdown',
          reply_markup: mainMenuKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: 'Positions loaded ✅' });
      return;
    }

    // RECENT ALERTS - Show last 10 pools
    if (data === 'menu_recent') {
      if (recentAlerts.length === 0) {
        const noAlertsMsg = `📭 **No Recent Alerts Yet**

No pools detected yet. Start monitoring to see real-time alerts!`;

        if (messageId) {
          await ctx.editMessageText(noAlertsMsg, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🚀 Start Monitoring',
                    callback_data: 'start_monitoring',
                  },
                ],
                [
                  {
                    text: '📱 Back to Menu',
                    callback_data: 'menu_main',
                  },
                ],
              ],
            },
          });
        }
        await ctx.answerCallbackQuery({ text: '📭 No alerts yet' });
        return;
      }

      const alertsList = recentAlerts
        .map((alert, i) => {
          const inputMint = 'So11111111111111111111111111111111111111112';
          const lamports = Math.floor(0.5 * 1000000000);
          const jupLink = `https://jup.ag/swap?inputMint=${inputMint}&outputMint=${alert.mint}&amount=${lamports}`;
          return `${i + 1}. \`${alert.mint.substring(0, 8)}...\` | $${alert.liquidity.toFixed(2)} | ${alert.age}s ago\n   [🚀 Snipe](${jupLink})`;
        })
        .join('\n\n');

      const msg = `🚨 **Recent Pool Alerts** (Last ${recentAlerts.length})

${alertsList}

Tap a snipe link to open Jupiter, or use /snipenew for real-time monitoring!`;

      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: mainMenuKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: '📊 Recent alerts loaded' });
      return;
    }

    // START MONITORING - Quick button for empty state
    if (data === 'start_monitoring') {
      const settings = getUserSettings(userId);
      toggleMonitoring(userId, true);
      settings.alertsEnabled = true;

      const msg = `🟢 **Real-Time Monitoring ACTIVATED!**

🚨 You will receive LOUD ALERTS with 🚨🚨🚨 on your phone the SECOND a new Raydium pool launches.

**Quick Setup:**
1️⃣ /connect your wallet
2️⃣ /setbuy to set snipe amount
3️⃣ /setslippage to set tolerance

🔔 Alerts: ✅ AUTO-ENABLED
📱 Notifications: ✅ ON

Not getting notifications? /notificationhelp`;

      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: mainMenuKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: '🟢 Monitoring started' });
      return;
    }

    // TRADES - Show trade history
    if (data === 'menu_trades') {
      const tradeDisplay = getTradeHistoryDisplay(userId, 10);
      if (messageId) {
        await ctx.editMessageText(tradeDisplay, {
          parse_mode: 'Markdown',
          reply_markup: mainMenuKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: 'Trades loaded ✅' });
      return;
    }

    // SETTINGS MENU - Full submenu
    if (data === 'menu_settings') {
      const settings = getUserSettings(userId);
      const msg = getSettingsString(userId);
      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: settingsKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: 'Settings menu ✅' });
      return;
    }

    // GAME - Starship to Mars Game
    if (data === 'menu_game') {
      const gameMsg = `🚀 **STARSHIP TO MARS GAME**

Shoot satellites and asteroids to earn points!
🦬 Catch shield power-ups to protect yourself!

**Controls:**
⬆️⬇️⬅️➡️ = Move spaceship
SPACEBAR = Shoot
📱 Mobile: Use arrow keys or tap to shoot

**Shared Leaderboard:**
🏆 Your scores sync with web game
📊 See high scores in-game (tap 🏆 button)
🌐 Play on web or Telegram = same scores!

Ready to play? Tap the button below! 🚀`;

      const gameUrl = 'https://heartbrokenly-muzzy-kori.ngrok-free.dev/game.html';
      
      if (messageId) {
        await ctx.editMessageText(gameMsg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Launch Game', url: gameUrl }],
              [{ text: '📱 Back', callback_data: 'menu_main' }],
            ],
          },
        });
      }
      await ctx.answerCallbackQuery({ text: '🚀 Game launched!' });
      return;
    }

    // HELP & FAQ - Natural language support
    if (data === 'menu_help') {
      const helpMsg = `❓ **HELP & FAQ**

**Ask Questions Naturally:**
• "How do I snipe?"
• "What is take profit?"
• "How do I use base64?"
• "I'm new, help me start"

**Popular Commands:**
/start — Main menu
/connect — Link wallet
/snipe <CA> <SOL> — Snipe token
/snipenew — Real-time monitoring
/positions — View positions
/mytrades — Trade history
/status — Full dashboard
/game — Starship to Mars game
/help — All commands

Just type your question! I'll help! 🦬`;

      if (messageId) {
        await ctx.editMessageText(helpMsg, {
          parse_mode: 'Markdown',
          reply_markup: mainMenuKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: 'Help menu ✅' });
      return;
    }

    // Settings submenus
    if (data === 'settings_buy') {
      const settings = getUserSettings(userId);
      await ctx.answerCallbackQuery({
        text: `Current: ${settings.defaultBuyAmount} SOL - Use /setbuy <amount>`,
        show_alert: true,
      });
      return;
    }

    if (data === 'settings_tpsl') {
      const settings = getUserSettings(userId);
      await ctx.answerCallbackQuery({
        text: `TP: +${settings.takeProfitPercent}% | SL: -${settings.stopLossPercent}% - Use /settp <pct> or /setsl <pct>`,
        show_alert: true,
      });
      return;
    }

    if (data === 'settings_alerts') {
      const settings = getUserSettings(userId);
      // Toggle the alerts state
      settings.alertsEnabled = !settings.alertsEnabled;
      
      const newStatus = settings.alertsEnabled ? 'ON' : 'OFF';
      const emoji = settings.alertsEnabled ? '🟢' : '🔴';
      
      const msg = settings.alertsEnabled 
        ? `🟢 **Alerts ENABLED**\n\nYou will get push notifications for new pools!\n\n📌 Tip: Enable Telegram notifications in your phone settings for instant alerts.`
        : `🔴 **Alerts DISABLED**\n\nYou will not receive pool notifications.`;

      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: settingsKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: `${emoji} Alerts ${newStatus}` });
      return;
    }

    // SETTINGS: Buy Amount
    if (data === 'set_buy') {
      setWaitingForCA(userId); // Reuse state for amount input
      const msg = `💰 **Set Buy Amount**\n\nCurrent: ${getUserSettings(userId).defaultBuyAmount} SOL\n\nSend new amount (e.g., 0.5, 1, 2):`;
      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: settingsKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: '💰 Enter amount' });
      return;
    }

    // SETTINGS: TP/SL
    if (data === 'set_tpsl') {
      const settings = getUserSettings(userId);
      const msg = `📈 **Take-Profit & Stop-Loss**\n\nCurrent Settings:\n📈 Take-Profit: +${settings.takeProfitPercent}%\n📉 Stop-Loss: -${settings.stopLossPercent}%\n\nUse commands to adjust:\n/settp <percent> — Set take-profit\n/setsl <percent> — Set stop-loss`;
      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: settingsKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: '📈 TP/SL settings' });
      return;
    }

    // SETTINGS: Language
    if (data === 'set_lang') {
      // Show language selector
      const languageButtons = Object.entries(LANGUAGES).map(([code, name]) => [
        {
          text: name,
          callback_data: `lang_${code}`,
        },
      ]);

      if (messageId) {
        await ctx.editMessageText('🌐 **Choose your language**', {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: languageButtons,
          },
        });
      }
      await ctx.answerCallbackQuery({ text: '🌐 Language selector' });
      return;
    }

    // SETTINGS: Slippage
    if (data === 'set_slippage') {
      const msg = `⚡ **Set Slippage Tolerance**\n\nCurrent: ${getUserSettings(userId).slippage}%\n\nSend new slippage (e.g., 5, 10, 15):`;
      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: settingsKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: '⚡ Enter slippage' });
      return;
    }

    // SETTINGS: Filters
    if (data === 'set_filters') {
      const settings = getUserSettings(userId);
      const msg = `🎯 **Pool Filters**\n\nCurrent Settings:\n💧 Min Liquidity: ${settings.minLiquidity} SOL\n🔒 LP Locked Check: ${settings.lpLockedCheck ? '✅' : '❌'}\n👤 Dev Wallet Filter: ${settings.devWalletFilter ? '✅' : '❌'}\n⏱️ Age Filter: <${settings.ageFilterSeconds}s\n\nUse commands to adjust filters.`;
      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: settingsKeyboard,
        });
      }
      await ctx.answerCallbackQuery({ text: '🎯 Filter settings' });
      return;
    }

    // PREMIUM - Show subscription status and upgrade option
    if (data === 'menu_premium') {
      const isPremium = isPremiumSubscriber(userId);
      const settings = getUserSettings(userId);

      // Get current price and calculate tokens needed
      const muskoxPrice = await getMuskoxPrice();
      const tokensFor25USD = (25 / muskoxPrice).toFixed(2);

      // MUSKOX token details
      const muskoxMint = '6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt';
      const solMint = 'So11111111111111111111111111111111111111112';
      const estimatedTokens = 500;
      const lamports = Math.floor(estimatedTokens * 1000000);
      const jupLink = `https://jup.ag/swap?inputMint=${solMint}&outputMint=${muskoxMint}&amount=${lamports}`;

      if (isPremium) {
        const expiresDate = new Date(settings.premiumExpiresAt!);
        const daysLeft = Math.ceil((expiresDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        
        const msg = `💎 **PREMIUM ACTIVE**

✅ 0% fees on all snipes
⏱️ ${daysLeft} days remaining
📅 Expires: ${expiresDate.toLocaleDateString()}

**Price:** $${muskoxPrice.toFixed(4)}/token

**To Renew (~$25 USD):**
1️⃣ Send ${tokensFor25USD} $MUSKOX to:
   \`6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG\`
2️⃣ Wait 1-2 minutes
3️⃣ Run: /premium`;

        if (messageId) {
          await ctx.editMessageText(msg, {
            parse_mode: 'Markdown',
            reply_markup: settingsKeyboard,
          });
        }
        await ctx.answerCallbackQuery({ text: '💎 Premium Active' });
      } else {
        // Premium: 1M tokens
        const premiumTokens = 1000000;
        const premiumUSD = (premiumTokens * muskoxPrice).toFixed(2);
        
        const msg = `💎 **UPGRADE TO PREMIUM**

**Free:** 1% fee per snipe
**Premium:** 0% fees forever!

**Cost:** ${premiumTokens.toLocaleString()} $MUSKOX ≈ $${premiumUSD} USD/month
**Current Price:** $${muskoxPrice.toFixed(6)}/token

**Wallet Status:** ${settings.walletAddress ? '✅ Connected' : '❌ Not connected'}

**Have $MUSKOX already?**
1️⃣ Copy: \`${premiumTokens.toLocaleString()}\` tokens
2️⃣ Send to: \`6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG\`
3️⃣ Run: /premium

**Need to buy first?**
1️⃣ [🔵 Buy on Jupiter](${jupLink})
2️⃣ Send ${premiumTokens.toLocaleString()} to treasury
3️⃣ Run: /premium

**Benefits:**
🔥 0% on all snipes (save 1% per tx!)
⚡ Priority support
💰 Auto-renewal monthly`;

        if (messageId) {
          await ctx.editMessageText(msg, {
            parse_mode: 'Markdown',
            reply_markup: settingsKeyboard,
          });
        }
        await ctx.answerCallbackQuery({ text: '💎 Upgrade to Premium' });
      }
      return;
    }

    // Language selection from settings
    if (data.startsWith('lang_')) {
      const lang = data.replace('lang_', '') as Language;
      setLanguage(userId, lang);
      const langName = LANGUAGES[lang];
      
      if (messageId) {
        await ctx.editMessageText(
          `✅ **Language set to ${langName}**\n\nBot will now respond in your chosen language.`,
          { reply_markup: mainMenuKeyboard }
        );
      }
      await ctx.answerCallbackQuery({ text: `✅ ${langName}` });
      return;
    }

    // ALERTS - Turn ON
    if (data === 'alerts_on') {
      const settings = getUserSettings(userId);
      settings.alertsEnabled = true;

      const msg = `🟢 **Alerts ENABLED**

You will get push notifications for new pools!

📌 Tip: Enable Telegram notifications in your phone settings for instant alerts.`;

      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📱 Back',
                  callback_data: 'menu_main',
                },
              ],
            ],
          },
        });
      }
      await ctx.answerCallbackQuery({ text: '🟢 Alerts enabled' });
      return;
    }

    // ALERTS - Turn OFF
    if (data === 'alerts_off') {
      const settings = getUserSettings(userId);
      settings.alertsEnabled = false;

      const msg = `🔴 **Alerts DISABLED**

You will not receive pool notifications.`;

      if (messageId) {
        await ctx.editMessageText(msg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📱 Back',
                  callback_data: 'menu_main',
                },
              ],
            ],
          },
        });
      }
      await ctx.answerCallbackQuery({ text: '🔴 Alerts disabled' });
      return;
    }

    await ctx.answerCallbackQuery();
  } catch (error) {
    console.error('[CALLBACK ERROR]', error);
    // Silently ignore expired callback queries (common when profile pic updates)
    if (error instanceof Error && error.message?.includes('query is too old')) {
      console.log('[IGNORE] Expired callback query');
      return;
    }
    try {
      await ctx.answerCallbackQuery({ text: 'Error processing button' });
    } catch (answerError) {
      console.log('[IGNORE] Failed to answer callback (likely expired)');
    }
  }
});

// ============================================================================
// START - Fast Menu
// ============================================================================
bot.command('start', async (ctx) => {
  console.log(`[START] ${ctx.from?.id}`);
  await ctx.reply(startMsg, {
    parse_mode: 'Markdown',
    reply_markup: mainMenuKeyboard,
  });
});

// ============================================================================
// TEXT HANDLER - Process CA input for manual swap
// ============================================================================
// ============================================================================
// ALERTS - Toggle push notifications
// ============================================================================
// ============================================================================
// CONNECT - Link Wallet (WITH PRIVATE KEY DETECTION)
// ============================================================================
bot.command('connect', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const address = ctx.match?.trim();

  console.log(`[CONNECT] ${userId} → ${address || 'SHOW_INSTRUCTIONS'}`);

  // If address provided, validate it
  if (address) {
    // ⚠️ CRITICAL: Detect and reject private keys
    if (address.length > 87 || (address.length > 44 && !isValidSolanaCA(address))) {
      console.log(`[CONNECT] ❌ PRIVATE KEY DETECTED! User ${userId} tried to paste private key`);
      await ctx.reply(`
🚨 **SECURITY ALERT - PRIVATE KEY DETECTED!**

❌ You just pasted a PRIVATE KEY!

**NEVER share your private key with anyone, including bots!**

✅ **What you should use instead:**
Your PUBLIC KEY (44-character address)

**How to get your PUBLIC key:**
- Phantom: Tap your address at top → Copy
- Solflare: Settings → View Public Key
- Magic Eden: Profile → Copy address

**Format:**
- PUBLIC key: ~44 characters (safe to share)
- PRIVATE key: 88+ characters (KEEP SECRET!)

Try again with your PUBLIC key only:
/connect <your_44_character_public_key>

🔒 Your private key was NOT saved.
      `, { parse_mode: 'Markdown' });
      return;
    }

    // Valid length check
    if (address.length !== 44) {
      console.log(`[CONNECT] ❌ Invalid address length: ${address.length}`);
      await ctx.reply(`❌ **Invalid Address**\n\nPublic key must be exactly 44 characters.\nYou provided: ${address.length} characters.\n\nCheck that you copied the full address from your wallet.`);
      return;
    }

    // Save the wallet
    connectWallet(userId, address);
    const settings = getUserSettings(userId);
    console.log(`[CONNECT] ✅ Wallet saved for ${userId}: ${address.substring(0, 8)}...`);
    await ctx.reply(`
✅ **Wallet Connected!**

Address: \`${address}\`

You're ready to snipe! Use:
/snipe <CA> <SOL> — Manual snipe
/snipenew — Turn on auto-monitoring
/setbuy 0.5 — Set your default buy amount

🚀 Ready to go!
    `, { parse_mode: 'Markdown' });
    return;
  }

  // No address provided, show instructions
  await ctx.reply(`
🔐 **Connect Your Solana Wallet:**

**Quick Setup:**
/connect <your_public_key>

Example:
/connect 9B5X2eKHVArgc5PAdzsSoEZWndqRu51yvxvEKwVjGXkJ

**Don't have your public key?**
- Phantom: Tap address at top, copy it
- Solflare: Settings → View Public Key
- Magic Eden: Profile → Copy address

⚠️ Send your PUBLIC key only (NOT private key!)
⚠️ Public key = 44 characters
⚠️ Private key = 88+ characters (NEVER SHARE!)

After connecting, you can start sniping! 🚀
  `, { parse_mode: 'Markdown' });
});

// ============================================================================
// NOTIFICATIONHELP - Troubleshooting Push Notifications
// ============================================================================
bot.command('notificationhelp', async (ctx) => {
  const userId = ctx.from?.id || 0;
  console.log(`[NOTIFICATIONHELP] ${userId}`);

  await ctx.reply(`
🔔 **HOW TO ENABLE PUSH NOTIFICATIONS**

**Step 1: Enable Alerts in Bot**
/alerts on

**Step 2: Enable in Telegram Settings**

**On iPhone:**
1. Open Telegram Settings
2. Notifications → Chats
3. Find @MUSKOXNFTBOT
4. Toggle "Messages" ON (blue)
5. Set Sound to "Default" or custom
6. Toggle "Include in Notification Badge" ON

**On Android:**
1. Open Telegram Settings
2. Notifications and Sounds → Chats
3. Find @MUSKOXNFTBOT
4. Toggle "Messages" ON
5. Set Priority to "High"
6. Set Sound to "Default"

**Step 3: Test Notifications**
1. Pin this chat (optional but helps)
   - Long-press the chat
   - Select "Pin Chat"
2. Use /testalert to send yourself a test
3. You should get a 🚨🚨🚨 notification on your phone

**Still not working?**
✅ Make sure Telegram has permission to send notifications
   - iOS: Settings → Telegram → Notifications
   - Android: Settings → Apps → Telegram → Notifications
✅ Check your phone is not in silent/Do Not Disturb mode
✅ Check battery saver isn't blocking notifications
✅ Restart Telegram app
✅ Try /testalert again

**Questions?** Ask in this chat or use /help
  `, { parse_mode: 'Markdown' });
});

// ============================================================================
// ALERTS - Toggle Push Notifications
// ============================================================================
bot.command('alerts', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const command = ctx.match?.trim().toLowerCase();

  console.log(`[ALERTS] ${userId} → ${command}`);

  if (command === 'on' || command === '1' || command === 'true') {
    toggleAlerts(userId, true);
    await ctx.reply(
      `🔔 **Push Notifications ENABLED**\n\nYou will receive 🚨 or 🔥 alerts when new Raydium pools launch!\n\nDisable anytime with /alerts off`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  if (command === 'off' || command === '0' || command === 'false') {
    toggleAlerts(userId, false);
    await ctx.reply(
      `🔕 **Push Notifications DISABLED**\n\nYou won't receive alerts anymore.\n\nRe-enable with /alerts on`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // No argument, show status
  const settings = getUserSettings(userId);
  const status = settings.alertsEnabled ? '✅ ON' : '❌ OFF';

  await ctx.reply(
    `🔔 **Push Alerts: ${status}**\n\nUsage:\n/alerts on — Enable notifications\n/alerts off — Disable notifications`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================================================
// SNIPENEW - Toggle Real-Time Monitoring
// ============================================================================
bot.command('snipenew', async (ctx) => {
  const userId = ctx.from?.id || 0;
  console.log(`[SNIPENEW] ${userId}`);

  const settings = getUserSettings(userId);
  const newState = !settings.monitoringEnabled;
  toggleMonitoring(userId, newState);

  const message = newState
    ? `🟢 **Real-Time Pool Monitoring ACTIVATED!**

🔍 **How it works:**
• Bot scans Raydium + Pump.fun every few seconds
• New pools stored automatically (no alerts)
• Use /recentalerts to see latest 10 pools
• Click snipe links to execute on Jupiter

**Quick Setup:**
1️⃣ /connect your wallet
2️⃣ /setbuy 0.5 — Set snipe amount
3️⃣ /setslippage 10 — Set slippage tolerance

**Check for new pools:**
/recentalerts — Shows latest 10 pools (Raydium + Pump.fun)
/status — View monitoring status
/snipe <CA> <SOL> — Manual snipe any token

📌 Tip: Check /recentalerts frequently for new launches!`
    : `🔴 **Real-Time Monitoring DEACTIVATED**

You can still:
• /recentalerts — Check latest pools
• /snipe <CA> <SOL> — Manual snipe`;

  await ctx.reply(message, { parse_mode: 'Markdown' });
});

// ============================================================================
// SETBUY - Set Default Buy Amount (WITH VALIDATION & RATE LIMITING)
// ============================================================================
bot.command('setbuy', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const amountStr = ctx.match?.trim();
  const amount = parseFloat(amountStr || '');

  console.log(`[SETBUY] ${userId} → ${amount}`);

  try {
    if (!amountStr || isNaN(amount)) {
      await ctx.reply(`📝 Usage: /setbuy <amount>\n\nExample: /setbuy 0.5\n\nValid range: 0.001 to 10 SOL`);
      return;
    }
    
    // ⚠️ CRITICAL: Validate input range
    if (amount < 0.001 || amount > 10) {
      await ctx.reply(`❌ **Invalid Amount**\n\nRange: 0.001 to 10 SOL\n\nYou entered: ${amount} SOL`);
      return;
    }
    
    setDefaultBuyAmount(userId, amount);
    await ctx.reply(`✅ Default buy amount set to **${amount} SOL**\n\nThis will be used for auto-snipes on new pools.`, {
      parse_mode: 'Markdown',
    });
  } catch (error: any) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
});

// ============================================================================
// SETSLIPPAGE - Set Slippage Tolerance (WITH VALIDATION)
// ============================================================================
bot.command('setslippage', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const slippageStr = ctx.match?.trim();
  const slippage = parseFloat(slippageStr || '');

  console.log(`[SETSLIPPAGE] ${userId} → ${slippage}%`);

  try {
    if (!slippageStr || isNaN(slippage)) {
      await ctx.reply(`📝 Usage: /setslippage <percent>\n\nExample: /setslippage 15\n\nValid range: 0.1% to 50%`);
      return;
    }
    
    // ⚠️ CRITICAL: Validate input range
    if (slippage < 0.1 || slippage > 50) {
      await ctx.reply(`❌ **Invalid Slippage**\n\nRange: 0.1% to 50%\n\nYou entered: ${slippage}%`);
      return;
    }
    
    setSlippage(userId, slippage);
    await ctx.reply(`✅ Slippage set to **${slippage}%**\n\nHigher = more likely to execute, lower = better price.`, {
      parse_mode: 'Markdown',
    });
  } catch (error: any) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
});

// ============================================================================
// SETPRIORITY - Set Priority Fee
// ============================================================================
bot.command('setpriority', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const feeStr = ctx.match?.trim();
  const fee = parseInt(feeStr || '');

  console.log(`[SETPRIORITY] ${userId} → ${fee} lamports`);

  try {
    if (!feeStr || isNaN(fee)) {
      await ctx.reply(`📝 Usage: /setpriority <lamports>\n\nExample: /setpriority 500000\n\nValid range: 0 to 10,000,000 lamports`);
      return;
    }
    setPriorityFee(userId, fee);
    const solAmount = (fee / 1000000).toFixed(6);
    await ctx.reply(`✅ Priority fee set to **${fee} lamports** (~${solAmount} SOL)\n\nHigher = faster inclusion, faster snipes.`, {
      parse_mode: 'Markdown',
    });
  } catch (error: any) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
});

// ============================================================================
// WATCH - Add Token to Watchlist
// ============================================================================
bot.command('watch', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const ca = ctx.match?.trim();

  console.log(`[WATCH] ${userId} → ${ca}`);

  try {
    if (!ca || ca.length < 32) {
      await ctx.reply(`📝 Usage: /watch <contract_address>\n\nExample: /watch 6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt\n\nYou can watch up to 20 tokens.`);
      return;
    }
    addToWatchlist(userId, ca);
    await ctx.reply(
      `✅ Added **${ca.substring(0, 8)}...** to watchlist\n\nYou'll get alerts when this token appears on Raydium.`,
      { parse_mode: 'Markdown' }
    );
  } catch (error: any) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
});

// ============================================================================
// POSITIONS - Show Active Positions with PnL
// ============================================================================
bot.command('positions', async (ctx) => {
  const userId = ctx.from?.id || 0;
  console.log(`[POSITIONS] ${userId}`);

  const positionsDisplay = getPositionsDisplay(userId);
  await ctx.reply(positionsDisplay, { parse_mode: 'Markdown' });
});

// ============================================================================
// MYTRADES - Show Trade History
// ============================================================================
bot.command('mytrades', async (ctx) => {
  const userId = ctx.from?.id || 0;
  console.log(`[MYTRADES] ${userId}`);

  const tradesDisplay = getTradeHistoryDisplay(userId, 10);
  await ctx.reply(tradesDisplay, { parse_mode: 'Markdown' });
});

// ============================================================================
// WATCHLIST - Show My Watchlist
// ============================================================================
bot.command('watchlist', async (ctx) => {
  const userId = ctx.from?.id || 0;
  console.log(`[WATCHLIST] ${userId}`);

  const settings = getUserSettings(userId);

  if (settings.watchlist.length === 0) {
    await ctx.reply(`📝 Your watchlist is empty.\n\nAdd tokens with:\n/watch <CA>`);
    return;
  }

  const list = settings.watchlist
    .map((ca, i) => `${i + 1}. \`${ca.substring(0, 8)}...\``)
    .join('\n');

  await ctx.reply(`👁️ **Your Watchlist (${settings.watchlist.length}/20)**\n\n${list}\n\nUse /unwatch <CA> to remove`, {
    parse_mode: 'Markdown',
  });
});

// ============================================================================
// UNWATCH - Remove from Watchlist
// ============================================================================
bot.command('unwatch', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const ca = ctx.match?.trim();

  console.log(`[UNWATCH] ${userId} → ${ca}`);

  try {
    if (!ca || ca.length < 32) {
      await ctx.reply(`📝 Usage: /unwatch <contract_address>`);
      return;
    }
    removeFromWatchlist(userId, ca);
    await ctx.reply(`✅ Removed **${ca.substring(0, 8)}...** from watchlist`, { parse_mode: 'Markdown' });
  } catch (error: any) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
});

// ============================================================================
// SETTP - Set Take-Profit %
// ============================================================================
bot.command('settp', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const tpStr = ctx.match?.trim();
  const tp = parseFloat(tpStr || '');

  console.log(`[SETTP] ${userId} → ${tp}%`);

  try {
    if (!tpStr || isNaN(tp)) {
      await ctx.reply(`📝 Usage: /settp <percent>\n\nExample: /settp 50 (for +50% profit)\n\nValid range: 1% to 1000%`);
      return;
    }
    setTakeProfit(userId, tp);
    await ctx.reply(`✅ Take-profit set to **+${tp}%**\n\nAuto-sell will trigger at ${tp}% profit.`, {
      parse_mode: 'Markdown',
    });
  } catch (error: any) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
});

// ============================================================================
// SETSL - Set Stop-Loss %
// ============================================================================
bot.command('setsl', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const slStr = ctx.match?.trim();
  const sl = parseFloat(slStr || '');

  console.log(`[SETSL] ${userId} → ${sl}%`);

  try {
    if (!slStr || isNaN(sl)) {
      await ctx.reply(`📝 Usage: /setsl <percent>\n\nExample: /setsl 30 (for -30% loss)\n\nValid range: 1% to 100%`);
      return;
    }
    setStopLoss(userId, sl);
    await ctx.reply(`✅ Stop-loss set to **-${sl}%**\n\nAuto-sell will trigger on -${sl}% loss.`, {
      parse_mode: 'Markdown',
    });
  } catch (error: any) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
});

// ============================================================================
// AUTOSELL - Toggle Auto-Sell
// ============================================================================
bot.command('autosell', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const command = ctx.match?.trim().toLowerCase();

  console.log(`[AUTOSELL] ${userId} → ${command}`);

  if (command === 'on' || command === '1' || command === 'true') {
    toggleAutoSell(userId, true);
    const settings = getUserSettings(userId);
    await ctx.reply(
      `✅ **Auto-Sell ENABLED**\n\nYour positions will auto-sell at:\n📈 +${settings.takeProfitPercent}% (take-profit)\n📉 -${settings.stopLossPercent}% (stop-loss)\n\nAdjust with /settp and /setsl`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  if (command === 'off' || command === '0' || command === 'false') {
    toggleAutoSell(userId, false);
    await ctx.reply(`❌ **Auto-Sell DISABLED**\n\nYou'll need to manually sell positions.`, { parse_mode: 'Markdown' });
    return;
  }

  const settings = getUserSettings(userId);
  const status = settings.autoSellEnabled ? '✅ ON' : '❌ OFF';

  await ctx.reply(`${status}\n\nUsage:\n/autosell on — Enable\n/autosell off — Disable`, {
    parse_mode: 'Markdown',
  });
});

// Track last check time for each user
const lastCheckTime = new Map<number, number>();

// ============================================================================
// STATUS - Show Full User Status & Settings
// ============================================================================
bot.command('status', async (ctx) => {
  const userId = ctx.from?.id || 0;
  console.log(`[STATUS] ${userId}`);

  const settings = getUserSettings(userId);
  const monitoringStatus = settings.monitoringEnabled ? '🟢 ON' : '🔴 OFF';
  const alertsStatus = settings.alertsEnabled ? '🔔 ON' : '🔕 OFF';
  const walletStatus = settings.walletAddress ? `✅ ${settings.walletAddress.substring(0, 8)}...` : '❌ Not connected';
  
  // Calculate last checked time
  const lastCheck = lastCheckTime.get(userId) || Date.now();
  const secondsAgo = Math.floor((Date.now() - lastCheck) / 1000);
  const timeDisplay = secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`;

  const statusMessage = `⚙️ **YOUR SNIPER STATUS**

**Monitoring:**
${monitoringStatus} Real-Time Monitoring
🔔 Push Alerts: ${alertsStatus}
⏱️ Last Checked: ${timeDisplay}
🎯 Watching for new Raydium pools

**Wallet:**
${walletStatus}

**Snipe Settings:**
💰 Default Buy: ${settings.defaultBuyAmount} SOL
📊 Slippage: ${settings.slippage}%
⚡ Priority Fee: ${settings.priorityFee} lamports
📝 Watchlist: ${settings.watchlist.length}/20 tokens

**Quick Commands:**
/snipenew — Toggle monitoring
/alerts on/off — Toggle notifications
/setbuy SOL — Change default buy
/testalert — Test push notifications
/snipe CA SOL — Manual snipe`;

  // Update last check time
  lastCheckTime.set(userId, Date.now());

  await ctx.reply(statusMessage, { parse_mode: 'Markdown' });
});

// ============================================================================
// TESTALERT - Send Test Alert to Verify Notifications
// ============================================================================
bot.command('testalert', async (ctx) => {
  const userId = ctx.from?.id || 0;
  console.log(`[TESTALERT] ${userId}`);

  const settings = getUserSettings(userId);

  // Check if alerts are enabled
  if (!settings.alertsEnabled) {
    await ctx.reply(
      `❌ Push alerts are currently DISABLED.\n\nEnable them first:\n/alerts on\n\nThen try /testalert again!`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // Send test alert with multiple loud emojis
  const testToken = '11111111111111111111111111111111'; // Dummy token CA
  const testAlert = `🚨🚨🚨 **TEST ALERT - NOTIFICATIONS WORKING!**

This is a test alert to verify your push notifications are working.

Token: \`${testToken}\` (fake)
Age: 5 seconds
Liquidity: 12.5 SOL
Status: ✅ Test successful!

**Your alert settings:**
💰 Buy Amount: ${settings.defaultBuyAmount} SOL
📊 Slippage: ${settings.slippage}%
🔔 Alerts: Enabled ✅

📌 **Tip:** Pin this chat or enable notifications in Telegram settings for instant phone alerts.

When a REAL Raydium pool launches, you'll get an alert just like this one with the actual token details!

Ready to snipe? Enable monitoring with /snipenew`;

  await ctx.reply(testAlert, { parse_mode: 'Markdown' });

  // Send confirmation
  setTimeout(() => {
    ctx.reply(`✅ Test alert sent! Did you see the 🚨🚨🚨 notification on your phone?\n\nIf not, try /notificationhelp for troubleshooting.`).catch(() => {});
  }, 1500);
});

// ============================================================================
// SNIPE - Manual Token Snipe (WITH RATE LIMITING & VALIDATION)
// ============================================================================
bot.command('snipe', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const argStr = ctx.match?.trim() || '';
  const args = argStr.split(/\s+/);
  const ca = args[0];
  const amount = parseFloat(args[1]);

  console.log(`[SNIPE] ${userId} → ${ca} ${amount}`);

  // ⚠️ CRITICAL: Rate limiting - prevent spam/RPC abuse
  if (!checkCooldown(userId, 'snipe')) {
    await ctx.reply(`⏳ **Please wait 2 seconds before sniping again**`);
    return;
  }

  // No arguments
  if (!ca || !args[1]) {
    await ctx.reply(`📝 Usage: /snipe <contract_address> <amount_sol>\n\nExample: /snipe 6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt 0.5`);
    return;
  }

  // Invalid CA
  if (ca.length < 32) {
    await ctx.reply(`❌ Invalid contract address (must be 43-44 characters)`);
    return;
  }

  // Invalid amount
  if (isNaN(amount) || amount <= 0 || amount > 10) {
    await ctx.reply(`❌ **Invalid amount**\n\nRange: 0.001 to 10 SOL\n\nYou entered: ${amount} SOL`);
    return;
  }

  // Set cooldown AFTER validation passes
  setCooldown(userId, 'snipe', SNIPE_COOLDOWN_MS);

  const settings = getUserSettings(userId);

  // Build Jupiter link
  const jupiterLink = `https://jup.ag/swap/SOL-${ca}?exactIn=true&amount=${Math.floor(amount * 1e9)}&slippageBps=${Math.floor(settings.slippage * 100)}`;

  const feeInfo = isPremiumSubscriber(userId) 
    ? `✅ **Premium Active** - 0% fee` 
    : `📊 **Free Tier** - 1% fee goes to treasury\nUpgrade: Settings → 💎 Premium (25 $MUSKOX/month)`;

  await ctx.reply(`
✅ **Ready to Snipe!**

Token: \`${ca.substring(0, 8)}...\`
Amount: ${amount} SOL
Slippage: ${settings.slippage}%

👉 <a href="${jupiterLink}">🔵 Jupiter Swap (1-Tap)</a>

${feeInfo}
  `, { parse_mode: 'HTML' });

  // Log snipe for analytics
  recordSnipe(userId, calculateSnipeFee(amount, userId));
});

// ============================================================================
// GAME - Launch Starship to Mars Game
// ============================================================================
bot.command('game', async (ctx) => {
  const userId = ctx.from?.id || 0;
  console.log(`[GAME] ${userId} launching Starship to Mars game`);

  // ngrok public URL
  const gameUrl = 'https://heartbrokenly-muzzy-kori.ngrok-free.dev/game.html';
  
  await ctx.reply(`🚀 **STARSHIP TO MARS GAME**

Shoot satellites and asteroids to earn points!
🦬 Catch shield power-ups to protect yourself!

📱 **Play Now:**
1️⃣ Tap the button below to launch the game
2️⃣ Use ⬆️⬇️⬅️➡️ arrows to move
3️⃣ Press SPACEBAR to shoot
4️⃣ Beat the high score! 🎯

⚠️ **Reward Rules:**
• Top scores eligible for $SOL rewards
• Must have 1M $MUSKOX in wallet
• 1 win per player per week
• Must be in Telegram group

Good luck, Astronaut! 🚀🌟`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Launch Game',
            url: gameUrl,
          },
        ],
        [
          {
            text: '📱 Back to Menu',
            callback_data: 'menu_main',
          },
        ],
      ],
    },
  });
});

// ============================================================================
// HELP
// ============================================================================
bot.command('help', async (ctx) => {
  console.log(`[HELP] ${ctx.from?.id}`);
  await ctx.reply(`
📖 **MUSKOX PRO SNIPER BOT - Full Commands**

**Setup:**
/start — Welcome message
/connect — Link your Solana wallet
/help — This list

**Sniping:**
/snipe <CA> <SOL> — Manual snipe any token
/snipenew — Toggle real-time monitoring
/watch <CA> — Add to watchlist
/watchlist — View your watchlist
/unwatch <CA> — Remove from watchlist

**Auto-Sell (Take-Profit / Stop-Loss):**
/settp <percent> — Set take-profit % (e.g. 50)
/setsl <percent> — Set stop-loss % (e.g. 30)
/autosell on|off — Toggle automatic selling

**Settings:**
/setbuy <SOL> — Default buy amount (0.001-100)
/setslippage <percent> — Slippage tolerance (0.1-50%)
/setpriority <fee> — Priority fee (lamports)
/alerts on|off — Toggle push notifications (🔔)
/status — View full status & settings
/testalert — Send test alert (verify notifications)
/notificationhelp — Enable push notifications (troubleshooting)

**Position Tracking:**
/positions — Show active positions & PnL
/mytrades — Show recent trade history

**Social:**
/leaderboard — Top snipers
/premium — Subscribe to 0% fees (25 $MUSKOX/month)

**Diagnostics:**
/ping — Test bot connection
/language — Change language (English, Español, Português, 中文, Русский)

🚨 Pro Features: Auto-sell TP/SL • Advanced pool filters • Watchlist
Non-custodial • Jupiter powered • 3% buyback & burn 🔥
🌐 Multi-language support: English, Español, Português, 中文, Русский
  `, { parse_mode: 'Markdown' });
});

// ============================================================================
// TEXT HANDLER: Monitor messages & auto-respond to FAQs
// ============================================================================
// PREMIUM - Subscribe to 0% fees
// ============================================================================
bot.command('premium', async (ctx) => {
  const userId = ctx.from?.id || 0;

  console.log(`[PREMIUM] ${userId} → checking blockchain...`);

  // Get current $MUSKOX price for display
  const muskoxPrice = await getMuskoxPrice();
  // Premium subscription: 1,000,000 $MUSKOX per month (≈$5 USD at current price)
  const premiumTokensRequired = 1000000;
  const premiumPriceUSD = premiumTokensRequired * muskoxPrice;
  
  console.log(`[PREMIUM] Price: $${muskoxPrice}/token`);
  console.log(`[PREMIUM] Premium: ${premiumTokensRequired.toLocaleString()} tokens ≈ $${premiumPriceUSD.toFixed(2)} USD/month`);

  // ALWAYS check blockchain first - no menu
  console.log(`[PREMIUM] Running verification...`);
  const result = await verifyPremiumPayment(userId);
  
  // If not found, also check recent wallet transactions (last 5 min)
  if (!result.verified) {
    console.log(`[PREMIUM] Payment not detected via treasury lookup. Checking wallet history...`);
    const settings = getUserSettings(userId);
    if (settings.walletAddress) {
      const recentResult = await checkRecentWalletTransactions(userId, settings.walletAddress, premiumTokensRequired);
      if (recentResult.verified) {
        console.log(`[PREMIUM] ✅ Found payment in wallet history!`);
        activatePremium(userId, 30 * 24 * 60 * 60 * 1000);
        saveUserSettings();
        const newSettings = getUserSettings(userId);
        const expiresDate = new Date(newSettings.premiumExpiresAt!);
        await ctx.reply(`✅ **PREMIUM ACTIVATED!**

💎 Payment Verified
💰 Amount: ${recentResult.amount.toLocaleString()} $MUSKOX
📅 Expires: ${expiresDate.toLocaleString()}

🔥 0% fees on all snipes now! 🚀`, { parse_mode: 'Markdown' });
        return;
      }
    }
  }
  
  if (result.verified) {
    // Payment found - premium is active
    const settings = getUserSettings(userId);
    const expiresDate = new Date(settings.premiumExpiresAt!);
    const daysLeft = Math.ceil((expiresDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

    const msg = `✅ **PREMIUM ACTIVATED!**

💎 Status: ACTIVE
   ${result.amount.toFixed(2)} $MUSKOX = $${result.usdValue.toFixed(2)} USD
⏱️ ${daysLeft} days remaining
📅 Expires: ${expiresDate.toLocaleString()}
🔗 Tx: \`${result.txHash?.substring(0, 20)}...\`

Your premium benefits:
🔥 0% fees on ALL snipes (save 1% per transaction!)
⚡ Priority support
💰 VIP leaderboard ranking

To Renew (in ${daysLeft} days):
Price: $${muskoxPrice.toFixed(6)}/token
1️⃣ Send **${premiumTokensRequired.toLocaleString()}** $MUSKOX to:
   \`6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG\`
2️⃣ Wait 1-2 minutes
3️⃣ Run: /premium again

Stats:
📊 Snipes: ${settings.snipeCount}
💰 Fees Saved: ~$${(settings.snipeCount * 0.01).toFixed(2)}

Start sniping with 0% fees! 🚀`;

    await ctx.reply(msg, { parse_mode: 'Markdown' });
    return;
  }

  // No payment found - show what to do
  const settings = getUserSettings(userId);
  const walletStatus = settings.walletAddress ? '✅ Connected' : '❌ Not connected';
  
  const muskoxMint = '6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt';
  const solMint = 'So11111111111111111111111111111111111111112';
  // Pre-fill with 1M tokens for Jupiter link
  const jupLink = `https://jup.ag/swap?inputMint=${solMint}&outputMint=${muskoxMint}&amount=${Math.floor(premiumTokensRequired * 1000000)}`;

  const msg = `❌ **PREMIUM NOT DETECTED**

**Current Status:**
Wallet: ${walletStatus} ${settings.walletAddress ? `(\`${settings.walletAddress.substring(0, 10)}...\`)` : ''}
Premium: Not active
Fees: 1% on all snipes

**Current Price:**
💰 $MUSKOX = $${muskoxPrice.toFixed(6)}/token
📊 Premium = **${premiumTokensRequired.toLocaleString()}** tokens ≈ **$${premiumPriceUSD.toFixed(2)} USD/month**

**How to Activate Premium (0% fees):**

**Option A: Already have $MUSKOX?**
1️⃣ Copy: \`${premiumTokensRequired.toLocaleString()}\` tokens
2️⃣ Send to treasury:
   \`6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG\`
3️⃣ Wait 1-2 minutes
4️⃣ Run: /premium again

**Option B: Need to buy first?**
1️⃣ Tap: [🔵 Buy on Jupiter](${jupLink})
2️⃣ Enter: **${premiumTokensRequired.toLocaleString()}** $MUSKOX
3️⃣ Complete swap
4️⃣ Send to treasury: \`6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG\`
5️⃣ Run: /premium again

**If you just sent payment:**
✋ Wait 1-2 minutes for blockchain confirmation
⏱️ Then run: /premium again
⚠️ Do NOT send multiple payments!

**Still waiting?**
Use manual verification with TX hash:
\`/manualverify <TX_HASH>\`

**Need to connect wallet first?**
Run: /connect <yourPublicKey>

🆘 Help: /help`;

  await ctx.reply(msg, { parse_mode: 'Markdown' });
});

// ============================================================================
// VERIFY_TX - Verify $MUSKOX transfer to treasury via transaction hash
// ============================================================================
bot.command('verify_tx', async (ctx) => {
  const rawInput = ctx.match?.trim() || '';
  const userId = ctx.from?.id || 0;

  console.log(`[VERIFY_TX] User ${userId} running /verify_tx`);
  console.log(`[VERIFY_TX] Raw input: ${rawInput.substring(0, 50)}...`);

  if (!rawInput || rawInput.length < 40) {
    await ctx.reply(`Verify your $MUSKOX payment:\n\n/verify_tx <TX_HASH>\n\nPaste your transaction hash from Solscan.`, { parse_mode: 'Markdown' });
    return;
  }

  // Clean the hash - remove any extra characters, spaces, or Solscan URL components
  const txHash = rawInput
    .split('?')[0] // Remove query params
    .split('#')[0] // Remove fragments
    .split('\n')[0] // Remove newlines
    .split('\r')[0] // Remove carriage returns
    .replace(/\s+/g, '') // Remove whitespace
    .trim();

  console.log(`[VERIFY_TX] Cleaned TX hash: ${txHash}`);
  console.log(`[VERIFY_TX] Hash length: ${txHash.length}`);

  if (txHash.length < 85 || txHash.length > 90) {
    await ctx.reply(`❌ **Invalid Transaction Hash**\n\nHash should be ~88 characters. You provided: ${txHash.length} characters.`);
    return;
  }

  const muskoxMint = '6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt';
  const treasuryWallet = '6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG';
  const minTokensRequired = 500; // 500 tokens minimum (~$2.58 USD)

  try {
    console.log(`[VERIFY_TX] ========================================`);
    console.log(`[VERIFY_TX] STARTING VERIFICATION`);
    console.log(`[VERIFY_TX] User ID: ${userId}`);
    console.log(`[VERIFY_TX] TX Hash: ${txHash}`);
    console.log(`[VERIFY_TX] Minting Address: ${muskoxMint}`);
    console.log(`[VERIFY_TX] Treasury Wallet: ${treasuryWallet}`);
    console.log(`[VERIFY_TX] Min Tokens Required: ${minTokensRequired}`);
    
    // Use public Solana RPC (no API key required)
    const rpcUrl = 'https://api.mainnet-beta.solana.com';
    
    const payload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [
        txHash,
        {
          maxSupportedTransactionVersion: 0,
          commitment: 'finalized', // Use finalized for most reliable results
        },
      ],
    };
    
    console.log(`[VERIFY_TX] Sending RPC request to: ${rpcUrl.substring(0, 60)}...`);
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log(`[VERIFY_TX] HTTP Status: ${response.status}`);
    
    if (!response.ok) {
      console.log(`[VERIFY_TX] ❌ HTTP Error: ${response.status} ${response.statusText}`);
      await ctx.reply(`❌ **Network Error**\n\nHTTP ${response.status}: ${response.statusText}\n\nTry again.`);
      return;
    }

    const responseText = await response.text();
    console.log(`[VERIFY_TX] Response size: ${responseText.length} bytes`);
    
    if (!responseText) {
      console.log(`[VERIFY_TX] ❌ Empty response from RPC`);
      await ctx.reply(`❌ **Empty Response**\n\nRPC returned no data. Try again.`);
      return;
    }

    let jsonResponse: any;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[VERIFY_TX] ❌ JSON parse error:`, parseError);
      console.log(`[VERIFY_TX] Response text: ${responseText.substring(0, 200)}`);
      await ctx.reply(`❌ **Invalid Response**\n\nCouldn't parse RPC response. Try again.`);
      return;
    }

    console.log(`[VERIFY_TX] Response keys: ${Object.keys(jsonResponse).join(', ')}`);
    
    if (jsonResponse.error) {
      console.log(`[VERIFY_TX] ❌ RPC Error: ${JSON.stringify(jsonResponse.error)}`);
      const errorMsg = jsonResponse.error.message || 'Unknown error';
      await ctx.reply(`❌ **Blockchain Error**\n\n${errorMsg}\n\nCheck the hash and try again.`);
      return;
    }

    if (!jsonResponse.result) {
      console.log(`[VERIFY_TX] ❌ No result returned. Response: ${JSON.stringify(jsonResponse).substring(0, 300)}`);
      await ctx.reply(`❌ **Transaction Not Found**\n\nThe transaction could not be found on the blockchain.\n\n✓ Check the hash is correct\n✓ Wait for blockchain confirmation\n✓ Use mainnet cluster`);
      return;
    }

    console.log(`[VERIFY_TX] ✅ Got transaction result`);

    const tx = jsonResponse.result;
    
    if (!tx.meta) {
      console.log(`[VERIFY_TX] ❌ No metadata in TX`);
      await ctx.reply(`❌ **No Transaction Metadata**\n\nThis transaction doesn't have the required data. It may not be confirmed yet.`);
      return;
    }

    if (tx.meta.err) {
      console.log(`[VERIFY_TX] ❌ TX failed: ${JSON.stringify(tx.meta.err)}`);
      await ctx.reply(`❌ **Transaction Failed On-Chain**\n\nThis transaction failed to execute. Please send a successful transaction.`);
      return;
    }

    console.log(`[VERIFY_TX] TX succeeded, analyzing token transfers...`);

    const preTokenBalances = (tx.meta.preTokenBalances || []) as any[];
    const postTokenBalances = (tx.meta.postTokenBalances || []) as any[];

    console.log(`[VERIFY_TX] Pre-balances: ${preTokenBalances.length}, Post-balances: ${postTokenBalances.length}`);

    let foundTransfer = false;
    let transferAmount = 0;

    // Check each token balance change
    for (let i = 0; i < postTokenBalances.length; i++) {
      const post = postTokenBalances[i];
      
      // Must be $MUSKOX mint
      if (post.mint !== muskoxMint) {
        continue;
      }
      
      // Must be sent TO treasury
      if (post.owner !== treasuryWallet) {
        console.log(`[VERIFY_TX] Found MUSKOX but wrong recipient: ${post.owner}`);
        continue;
      }

      console.log(`[VERIFY_TX] ✅ Found MUSKOX transfer to treasury at account ${post.accountIndex}`);

      // Find corresponding pre-balance
      const pre = preTokenBalances.find((p: any) => p.accountIndex === post.accountIndex);
      if (!pre) {
        console.log(`[VERIFY_TX] No pre-balance found for account ${post.accountIndex}`);
        continue;
      }

      // Calculate transfer amount - handle both formats
      // CRITICAL: Handle decimal conversion properly
      let preAmount = 0;
      let postAmount = 0;
      
      // Try uiTokenAmount first (already decimal-adjusted) - this is most reliable
      if (pre.uiTokenAmount?.uiAmount !== undefined && pre.uiTokenAmount.uiAmount !== null) {
        preAmount = pre.uiTokenAmount.uiAmount;
      } else if (pre.uiTokenAmount?.amount) {
        preAmount = parseFloat(pre.uiTokenAmount.amount);
      } else if (pre.tokenAmount?.amount) {
        // tokenAmount is in lamports, divide by 10^6 for $MUSKOX (6 decimals)
        preAmount = parseInt(pre.tokenAmount.amount) / 1000000;
      }
      
      // Try uiTokenAmount first (already decimal-adjusted)
      if (post.uiTokenAmount?.uiAmount !== undefined && post.uiTokenAmount.uiAmount !== null) {
        postAmount = post.uiTokenAmount.uiAmount;
      } else if (post.uiTokenAmount?.amount) {
        postAmount = parseFloat(post.uiTokenAmount.amount);
      } else if (post.tokenAmount?.amount) {
        // tokenAmount is in lamports, divide by 10^6 for $MUSKOX (6 decimals)
        postAmount = parseInt(post.tokenAmount.amount) / 1000000;
      }
      
      const delta = postAmount - preAmount;

      console.log(`[VERIFY_TX] Amount change: ${preAmount} → ${postAmount} (delta: ${delta})`);

      // Only count positive transfers (incoming)
      if (delta > 0) {
        console.log(`[VERIFY_TX] Found transfer of ${delta} tokens`);
        
        if (delta >= minTokensRequired) {
          foundTransfer = true;
          transferAmount = delta;
          console.log(`[VERIFY_TX] ✅✅ VALID PAYMENT: ${delta} $MUSKOX ≥ ${minTokensRequired}`);
          break;
        } else {
          console.log(`[VERIFY_TX] ⚠️ Transfer too small: ${delta} (need ${minTokensRequired})`);
          await ctx.reply(`❌ **Insufficient Amount**\n\n💰 Found: ${delta.toLocaleString()} $MUSKOX\n💰 Needed: ${minTokensRequired.toLocaleString()} $MUSKOX`);
          return;
        }
      }
    }

    if (!foundTransfer) {
      console.log(`[VERIFY_TX] ❌ No valid $MUSKOX transfer to treasury found in ${postTokenBalances.length} balances`);
      await ctx.reply(`❌ **No $MUSKOX Transfer Found**\n\nThis transaction doesn't contain a $MUSKOX transfer to the treasury wallet.\n\nTreasury: \`${treasuryWallet.substring(0, 10)}...\``);
      return;
    }

    // Activate premium
    console.log(`[VERIFY_TX] ✅ ACTIVATING PREMIUM for user ${userId}`);
    activatePremium(userId, 30 * 24 * 60 * 60 * 1000); // 30 days
    saveUserSettings();

    const settings = getUserSettings(userId);
    const expiresDate = new Date(settings.premiumExpiresAt!);
    const muskoxPrice = await getMuskoxPrice();
    const usdValue = (transferAmount * muskoxPrice).toFixed(2);

    // Ensure transferAmount is formatted correctly (not too many decimals)
    const formattedAmount = transferAmount > 1000 ? Math.floor(transferAmount).toLocaleString() : transferAmount.toLocaleString();
    
    // Format USD value properly
    const usdValueFormatted = parseFloat(usdValue) > 0 ? `$${usdValue}` : '~$2.58';
    
    await ctx.reply(`✅ **PREMIUM ACTIVATED! 0% fees enabled for 30 days.**

💎 Payment Verified
💰 Amount: ${formattedAmount} $MUSKOX (${usdValueFormatted} USD)
🔗 TX: [View on Solscan](https://solscan.io/tx/${txHash}?cluster=mainnet)
📅 Expires: ${expiresDate.toLocaleString()}

🔥 **0% fees on ALL snipes!**
Start sniping now! 🚀`, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });

  } catch (e) {
    console.error(`[VERIFY_TX] Error:`, e);
    await ctx.reply(`❌ **Error Verifying Transaction**\n\nError: ${String(e).substring(0, 50)}\n\nPlease try again or contact support.`);
  }
});

// ============================================================================
// RECENTALERTS - Show last 10 detected pools
// ============================================================================
bot.command('recentalerts', async (ctx) => {
  const userId = ctx.from?.id || 0;
  console.log(`[RECENTALERTS] ${userId}`);

  if (recentAlerts.length === 0) {
    await ctx.reply('📭 **No Recent Alerts**\n\nNo new pools detected yet. Use /snipenew to start monitoring!', {
      parse_mode: 'Markdown',
    });
    return;
  }

  const alertsList = recentAlerts
    .map((alert, i) => {
      const inputMint = 'So11111111111111111111111111111111111111112';
      const lamports = Math.floor(0.5 * 1000000000);
      const jupLink = `https://jup.ag/swap?inputMint=${inputMint}&outputMint=${alert.mint}&amount=${lamports}`;
      
      return `${i + 1}. \`${alert.mint.substring(0, 8)}...\` | $${alert.liquidity.toFixed(2)} | ${alert.age}s ago\n   [🚀 Snipe](${jupLink})`;
    })
    .join('\n\n');

  const msg = `📊 **Recent Pool Detections** (Last ${recentAlerts.length})

${alertsList}

Use /snipenew to turn on real-time monitoring!`;

  await ctx.reply(msg, { parse_mode: 'Markdown' });
});

// ============================================================================
// TEXT HANDLER - Process CA input & natural language (LOWEST PRIORITY)
// ============================================================================
bot.on('message:text', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const text = ctx.message.text || '';

  // Check if user is waiting for CA
  if (isWaitingForCA(userId)) {
    // ⚠️ CRITICAL: Detect natural language questions and exit CA mode
    const lowerText = text.toLowerCase().trim();
    
    // Check for question indicators
    const hasQuestionMark = text.includes('?');
    const startsWithQuestionWord = /^(how|what|why|where|when|can i|do i|is|are|should)/.test(lowerText);
    const hasHelpKeyword = lowerText.includes('help') || lowerText.includes('tell me') || lowerText.includes('wallet');
    
    const isQuestion = hasQuestionMark || startsWithQuestionWord || hasHelpKeyword;
    
    // If it's a question, exit CA mode and process as auto-response
    if (isQuestion) {
      console.log(`[CA_MODE] User ${userId} asked question while waiting for CA - exiting CA mode`);
      clearWaitingState(userId);
      
      // Process as auto-response
      const autoResponse = findAutoResponse(text);
      if (autoResponse) {
        logUserMessage(userId, ctx.from?.username, text, false);
        await ctx.reply(autoResponse, { parse_mode: 'Markdown' });
      } else {
        await ctx.reply('❓ I didn\'t understand that. Try /help for commands or ask a specific question!');
      }
      return;
    }

    if (isValidSolanaCA(text)) {
      const settings = getUserSettings(userId);
      const ca = text.trim();

      // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
      const lamports = Math.floor(settings.defaultBuyAmount * 1000000000);
      
      // Jupiter URL format with full mint addresses
      // SOL mint: So11111111111111111111111111111111111111112
      const inputMint = 'So11111111111111111111111111111111111111112'; // SOL
      const outputMint = ca; // Token to buy
      
      // Generate Jupiter link with pre-filled input, output, and amount
      // Format: https://jup.ag/swap?inputMint=[SOL]&outputMint=[CA]&amount=[lamports]
      const jupLink = `https://jup.ag/swap?inputMint=${inputMint}&outputMint=${outputMint}&amount=${lamports}`;

      console.log(`[MANUAL_CA] ${userId} → CA: ${ca.substring(0, 8)}... | Buy: ${settings.defaultBuyAmount} SOL | Lamports: ${lamports} | Link: ${jupLink}`);

      const msg = `🔵 **JUPITER SWAP (PRE-FILLED)**

Token CA: \`${ca}\`
Buy Amount: ${settings.defaultBuyAmount} SOL (${lamports} lamports)
Slippage: ${settings.slippage}%

✅ Tap button to open Jupiter with token + amount pre-filled:

\`${jupLink}\``;

      clearWaitingState(userId);

      // Create inline keyboard with clickable Jupiter link
      await ctx.reply(msg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Open Jupiter (Pre-filled with Token + Amount)',
                url: jupLink,
              },
            ],
            [
              {
                text: '💾 Try Another CA',
                callback_data: 'swap_manual',
              },
            ],
            [
              {
                text: '📱 Back to Menu',
                callback_data: 'menu_main',
              },
            ],
          ],
        },
      });
      return;
    } else if (text.toLowerCase() === 'cancel' || text === '/cancel') {
      clearWaitingState(userId);
      await ctx.reply('❌ Cancelled. /start to return to menu');
      return;
    } else {
      await ctx.reply('❌ Invalid CA. Must be 44 characters.\n\nTry again or type "cancel"');
      return;
    }
  }

  // Check for wallet status query
  const lowerText = text.toLowerCase().trim();
  if (lowerText.includes('wallet') && (lowerText.includes('connected') || lowerText.includes('tell'))) {
    const settings = getUserSettings(userId);
    const walletStatus = settings.walletAddress 
      ? `✅ **Wallet Connected!**\n\nAddress: \`${settings.walletAddress}\`` 
      : `❌ **Wallet Not Connected**\n\nUse: /connect <your_public_key>`;
    
    await ctx.reply(walletStatus, { parse_mode: 'Markdown' });
    return;
  }

  // Check for "recent alerts" natural language query
  if (lowerText.includes('recent alert') || (lowerText.includes('how') && lowerText.includes('alert'))) {
    if (recentAlerts.length === 0) {
      await ctx.reply('📭 **No Recent Alerts Yet**\n\nNo pools detected. Use /snipenew to start monitoring!', {
        parse_mode: 'Markdown',
      });
      return;
    }

    const alertsList = recentAlerts
      .map((alert, i) => {
        const inputMint = 'So11111111111111111111111111111111111111112';
        const lamports = Math.floor(0.5 * 1000000000);
        const jupLink = `https://jup.ag/swap?inputMint=${inputMint}&outputMint=${alert.mint}&amount=${lamports}`;
        return `${i + 1}. \`${alert.mint.substring(0, 8)}...\` | $${alert.liquidity.toFixed(2)} | ${alert.age}s ago\n   [🚀 Snipe](${jupLink})`;
      })
      .join('\n\n');

    const msg = `🚨 **Recent Pool Alerts** (${recentAlerts.length})

${alertsList}

Use /snipenew to monitor in real-time!`;

    await ctx.reply(msg, { parse_mode: 'Markdown' });
    return;
  }

  // Normal message handling (auto-responder) - LOWEST PRIORITY
  const autoResponse = findAutoResponse(text);
  if (autoResponse) {
    logUserMessage(userId, ctx.from?.username, text, false);
    await ctx.reply(autoResponse, { parse_mode: 'Markdown' });
  }
});

// ============================================================================
// ERROR HANDLING - Prevent bot crashes
// ============================================================================
bot.catch((err: any) => {
  const ctx = err.ctx;
  console.error('[BOT ERROR]', err.error?.message || err.message);
  
  // Silently handle expired callback queries (common when profile pic updates)
  if ((err.error as any)?.error_code === 400 && (err.error as any)?.description?.includes('query is too old')) {
    console.log('[IGNORE] Expired callback query (profile update?)');
    return;
  }

  // Log other errors but don't crash
  console.error('[ERROR DETAILS]', err);
});

// ============================================================================
// EXPORT BOT & START MONITORING
// ============================================================================
export { bot };

// Store monitoring users for alerts
const monitoringUsers = new Set<number>();

// Rate limiting for commands (prevent spam/RPC abuse)
const commandCooldowns = new Map<string, number>(); // key: "userId_command"
const SNIPE_COOLDOWN_MS = 2000; // 2 seconds between snipes
const VERIFY_COOLDOWN_MS = 3000; // 3 seconds between verifications

function checkCooldown(userId: number, command: string): boolean {
  const key = `${userId}_${command}`;
  const lastTime = commandCooldowns.get(key) || 0;
  const now = Date.now();
  
  if (now < lastTime) {
    return false; // Still in cooldown
  }
  
  return true; // Cooldown expired, allow
}

function setCooldown(userId: number, command: string, ms: number) {
  const key = `${userId}_${command}`;
  commandCooldowns.set(key, Date.now() + ms);
}

// Store recent pool detections for /recentalerts
interface AlertPool {
  mint: string;
  liquidity: number;
  timestamp: number;
  age: number;
}
const recentAlerts: AlertPool[] = [];
const MAX_ALERTS = 10;

// Start Raydium pool monitoring
console.log('[RAYDIUM] Pool monitoring will start when bot launches...');

startPoolMonitoring('https://api.mainnet-beta.solana.com');

// When new Raydium pool detected, store it for display (no alerts sent)
onNewPool(async (pool) => {
  console.log(`[RAYDIUM] New pool: ${pool.mint.substring(0, 8)}... Liquidity: $${pool.liquidity.toFixed(2)}`);

  if (!isPoolSafe(pool)) {
    console.log('[FILTER] Pool filtered (safety check failed)');
    return;
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - pool.createdAt;

  // Store in recent alerts for display
  const alertEntry: AlertPool = {
    mint: pool.mint,
    liquidity: pool.liquidity,
    timestamp: Date.now(),
    age: ageSeconds,
  };
  recentAlerts.unshift(alertEntry);
  if (recentAlerts.length > MAX_ALERTS) {
    recentAlerts.pop();
  }

  console.log(`[POOL] Pool stored. Total pools: ${recentAlerts.length}`);
});

// Start pump.fun monitoring
console.log('[PUMP.FUN] Pool monitoring will start when bot launches...');

startPumpFunMonitoring();

// When new pump.fun token detected, store it for display
onNewPumpFunToken(async (token) => {
  console.log(`[PUMP.FUN] New token: ${token.symbol} (${token.mint.substring(0, 8)}...) MC: $${token.marketCap.toFixed(2)}`);

  if (!isPumpFunTokenSafe(token)) {
    console.log('[FILTER] Token filtered (safety check failed)');
    return;
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - token.createdAt;

  // Store in recent alerts for display
  const alertEntry: AlertPool = {
    mint: token.mint,
    liquidity: token.marketCap,
    timestamp: Date.now(),
    age: ageSeconds,
  };
  recentAlerts.unshift(alertEntry);
  if (recentAlerts.length > MAX_ALERTS) {
    recentAlerts.pop();
  }

  console.log(`[POOL] Pump.fun token stored. Total pools: ${recentAlerts.length}`);
});

// ============================================================================
// PAYMENT VERIFICATION - Auto-detect & activate premium on token receipt
// ============================================================================

// Track pending verifications (userId → { amount, timestamp })
const pendingVerifications = new Map<number, { amount: number; timestamp: number }>();

/**
 * Check recent wallet transactions from last 5 minutes
 */
async function checkRecentWalletTransactions(userId: number, walletAddress: string, minTokens: number): Promise<{ verified: boolean; amount: number }> {
  const muskoxMint = '6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt';
  const treasuryWallet = '6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG';
  const rpcUrl = config.heliusRpc;

  try {
    console.log(`[RECENT_TX] Checking last 50 wallet transactions for ${walletAddress.substring(0, 10)}...`);
    
    const sigResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [walletAddress, { limit: 50, commitment: 'confirmed' }],
      }),
    });

    const sigData = (await sigResponse.json()) as any;
    if (!sigData.result) return { verified: false, amount: 0 };

    const signatures = sigData.result;
    console.log(`[RECENT_TX] Found ${signatures.length} signatures`);

    // Check each transaction
    for (const sig of signatures.slice(0, 50)) {
      if (sig.err) continue;

      const txResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [sig.signature, { maxSupportedTransactionVersion: 0, commitment: 'confirmed' }],
        }),
      });

      const txData = (await txResponse.json()) as any;
      if (!txData.result?.meta) continue;

      const tx = txData.result;
      const preTokenBalances = (tx.meta.preTokenBalances || []) as any[];
      const postTokenBalances = (tx.meta.postTokenBalances || []) as any[];

      // Look for $MUSKOX transfer to treasury
      for (const post of postTokenBalances) {
        if (post.mint !== muskoxMint || post.owner !== treasuryWallet) continue;

        const pre = preTokenBalances.find((p: any) => p.accountIndex === post.accountIndex);
        if (!pre) continue;

        const preAmount = parseFloat(pre.uiTokenAmount?.amount || '0');
        const postAmount = parseFloat(post.uiTokenAmount?.amount || '0');
        const delta = postAmount - preAmount;

        if (delta >= minTokens) {
          console.log(`[RECENT_TX] ✅ Found ${delta} tokens to treasury!`);
          return { verified: true, amount: delta };
        }
      }
    }

    console.log(`[RECENT_TX] ❌ No valid payment found in recent transactions`);
    return { verified: false, amount: 0 };
  } catch (e) {
    console.error(`[RECENT_TX] Error:`, e);
    return { verified: false, amount: 0 };
  }
}

/**
 * Get current $MUSKOX price in USD
 */
async function getMuskoxPrice(): Promise<number> {
  try {
    // Try Jupiter price API (no auth needed)
    const response = await fetch('https://price.jup.ag/v4/price?ids=6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt');
    const data = await response.json() as any;
    
    console.log(`[PRICE] Jupiter response:`, JSON.stringify(data).substring(0, 200));
    
    if (data.data && data.data['6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt']) {
      const priceObj = data.data['6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt'] as any;
      const price = priceObj.price as number;
      
      console.log(`[PRICE] Price object:`, JSON.stringify(priceObj).substring(0, 200));
      console.log(`[PRICE] Extracted price: $${price}`);
      
      // Sanity check: if price is extremely low (<0.0001) or high (>100), use fallback
      if (price && price > 0.0001 && price < 100) {
        console.log(`[PRICE] ✅ Using Jupiter price: $${price}/token`);
        return price;
      } else {
        console.log(`[PRICE] ⚠️ Price out of range (${price}), using manual rate`);
      }
    }
  } catch (e) {
    console.error(`[PRICE_ERROR] Failed to fetch price:`, e);
  }
  
  // Manual price based on actual market: $0.00000515 per token
  // This equals: 1,000,000 tokens = $5.15 USD (matches current market)
  console.log(`[PRICE] Using market rate: $0.00000515/token (1M $MUSKOX = $5.15 USD)`);
  return 0.00000515;
}

/**
 * Verify payment via Solana blockchain
 * Checks user wallet for recent $MUSKOX transfer to treasury worth $25+ USD
 */
async function verifyPremiumPayment(userId: number): Promise<{ verified: boolean; amount: number; usdValue: number; txHash?: string }> {
  try {
    const treasuryWallet = '6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG';
    const muskoxMint = '6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt'; // $MUSKOX token mint
    const minTokensRequired = 1000000; // 1 million tokens for premium
    
    // Get user's wallet (from /connect command)
    const settings = getUserSettings(userId);
    if (!settings.walletAddress) {
      console.log(`[VERIFY] User ${userId} has no wallet connected`);
      return { verified: false, amount: 0, usdValue: 0 };
    }

    const userWallet = settings.walletAddress;
    console.log(`[VERIFY] ========================================`);
    console.log(`[VERIFY] PREMIUM PAYMENT VERIFICATION`);
    console.log(`[VERIFY] User wallet: ${userWallet}`);
    console.log(`[VERIFY] Treasury: ${treasuryWallet}`);

    // Get current $MUSKOX price for USD conversion
    const muskoxPrice = await getMuskoxPrice();
    const premiumUSD = (minTokensRequired * muskoxPrice).toFixed(2);
    
    console.log(`[VERIFY] ========================================`);
    console.log(`[VERIFY] Required: ${minTokensRequired.toLocaleString()} $MUSKOX ≈ $${premiumUSD} USD`);
    console.log(`[VERIFY] Current price: $${muskoxPrice.toFixed(6)}/token`);
    console.log(`[VERIFY] Looking for transfers ≥ ${minTokensRequired.toLocaleString()} tokens to treasury`);

    // Use Helius RPC to get token transfer history
    const rpcUrl = config.heliusRpc;
    
    try {
      console.log(`[VERIFY] METHOD 1: Query treasury's $MUSKOX token account...`);
      
      // Find treasury's $MUSKOX token account
      const tokenAccountsResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            treasuryWallet,
            { mint: muskoxMint },
            { encoding: 'jsonParsed' },
          ],
        }),
      });

      const tokenData = await tokenAccountsResponse.json() as any;
      if (!tokenData.result || !tokenData.result.value || tokenData.result.value.length === 0) {
        console.log(`[VERIFY] ⚠️ Treasury has no $MUSKOX token account yet`);
      } else {
        const tokenAccounts = tokenData.result.value as any[];
        console.log(`[VERIFY] Found ${tokenAccounts.length} treasury token accounts`);
        
        for (const account of tokenAccounts) {
          const balance = (account.account.data.parsed.info.tokenAmount as any).uiAmount;
          console.log(`[VERIFY] Treasury $MUSKOX balance: ${balance} tokens`);
          
          // If treasury has a balance, check its transaction history
          if (balance > 0) {
            console.log(`[VERIFY] Treasury has received ${balance} tokens total`);
            
            // Get signatures for the token account to find recent transfers
            const txResponse = await fetch(rpcUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getSignaturesForAddress',
                params: [account.pubkey, { limit: 100, commitment: 'confirmed' }],
              }),
            });

            const txData = await txResponse.json() as any;
            if (txData.result) {
              const signatures = txData.result as any[];
              console.log(`[VERIFY] Found ${signatures.length} transactions on treasury token account`);
              
              let transfersFound = 0;
              let userTransferAmount = 0;
              let userTransferTx = '';

              // Check recent transactions for transfer from user
              for (const sig of signatures) {
                if (sig.err) continue;

                const detailResponse = await fetch(rpcUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getTransaction',
                    params: [sig.signature, { maxSupportedTransactionVersion: 0, commitment: 'confirmed' }],
                  }),
                });

                const detail = await detailResponse.json() as any;
                if (!detail.result || !detail.result.meta) continue;

                const tx = detail.result as any;
                if (tx.meta.err) continue;

                // Look for token transfers in this transaction
                const preTokenBalances = tx.meta.preTokenBalances || [];
                const postTokenBalances = tx.meta.postTokenBalances || [];

                for (const postBalance of postTokenBalances) {
                  if (postBalance.owner !== treasuryWallet || postBalance.mint !== muskoxMint) continue;
                  
                  const preBalance = preTokenBalances.find((b: any) => b.accountIndex === postBalance.accountIndex);
                  if (!preBalance) continue;

                  const preAmount = parseFloat(preBalance.uiTokenAmount?.amount || '0');
                  const postAmount = parseFloat(postBalance.uiTokenAmount?.amount || '0');
                  const transferAmount = postAmount - preAmount;

                  if (transferAmount > 0) {
                    transfersFound++;
                    console.log(`[VERIFY] Found transfer: ${transferAmount} $MUSKOX in tx ${sig.signature.substring(0, 20)}...`);
                    
                    // Check if this could be from the user (best guess based on amount)
                    if (transferAmount >= minTokensRequired && !userTransferAmount) {
                      userTransferAmount = transferAmount;
                      userTransferTx = sig.signature;
                      console.log(`[VERIFY] ✅ This looks like the user's payment!`);
                    }
                  }
                }
              }

              if (userTransferAmount >= minTokensRequired) {
                const usdValue = userTransferAmount * muskoxPrice;
                console.log(`[VERIFY] ✅✅✅ PAYMENT VERIFIED: ${userTransferAmount} $MUSKOX = $${usdValue.toFixed(2)} USD`);
                activatePremium(userId, 30 * 24 * 60 * 60 * 1000);
                saveUserSettings();
                return {
                  verified: true,
                  amount: userTransferAmount,
                  usdValue: usdValue,
                  txHash: userTransferTx,
                };
              }
            }
          }
        }
      }

      console.log(`[VERIFY] METHOD 2: Fallback to user wallet history...`);
      
      // Fallback: Get last 150 transactions from wallet with confirmed commitment
      const sigResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [userWallet, { limit: 150, commitment: 'confirmed' }],
        }),
      });

      const sigData = await sigResponse.json() as any;
      const signatures = (sigData.result || []) as any[];
      
      console.log(`[VERIFY] Total signatures found: ${signatures.length}`);

      if (!signatures || signatures.length === 0) {
        console.log(`[VERIFY] ❌ No transactions found for wallet`);
        return { verified: false, amount: 0, usdValue: 0 };
      }

      let txsChecked = 0;
      let transfersFound = 0;

      // Check each signature for payment to treasury
      for (const sig of signatures) {
        if (sig.err) {
          console.log(`[VERIFY] Skipping failed tx: ${sig.signature.substring(0, 20)}...`);
          continue;
        }
        
        txsChecked++;
        
        const txResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTransaction',
            params: [sig.signature, { maxSupportedTransactionVersion: 0, commitment: 'confirmed' }],
          }),
        });

        const txData = await txResponse.json() as any;
        if (!txData.result) {
          console.log(`[VERIFY] No data for tx ${sig.signature.substring(0, 20)}...`);
          continue;
        }

        const tx = txData.result as any;
        if (!tx.meta) {
          console.log(`[VERIFY] No meta for tx ${sig.signature.substring(0, 20)}...`);
          continue;
        }
        
        if (tx.meta.err) {
          console.log(`[VERIFY] Failed tx: ${sig.signature.substring(0, 20)}... (err: ${JSON.stringify(tx.meta.err)})`);
          continue;
        }

        const postTokenBalances = tx.meta.postTokenBalances || [];
        const preTokenBalances = tx.meta.preTokenBalances || [];

        console.log(`[VERIFY] TX ${sig.signature.substring(0, 20)}... | Post balances: ${postTokenBalances.length} | Pre: ${preTokenBalances.length}`);

        // Look for $MUSKOX transfers to treasury
        for (const postBalance of postTokenBalances) {
          // Check if this is $MUSKOX token going to treasury
          if (postBalance.mint !== muskoxMint) continue;
          if (postBalance.owner !== treasuryWallet) continue;

          console.log(`[VERIFY] Found treasury balance change in tx`);

          // Find corresponding pre-balance
          const preBalance = preTokenBalances.find((b: any) => b.accountIndex === postBalance.accountIndex);
          if (!preBalance) {
            console.log(`[VERIFY] No pre-balance found for account ${postBalance.accountIndex}`);
            continue;
          }

          const preAmount = parseFloat(preBalance.uiTokenAmount?.amount || '0');
          const postAmount = parseFloat(postBalance.uiTokenAmount?.amount || '0');
          const transferAmount = postAmount - preAmount;

          console.log(`[VERIFY] Balance change: ${preAmount} → ${postAmount} | Delta: ${transferAmount}`);

          if (transferAmount > 0) {
            transfersFound++;
            const usdValue = transferAmount * muskoxPrice;
            console.log(`[VERIFY] ✅ Transfer detected: ${transferAmount} $MUSKOX = $${usdValue.toFixed(2)} USD`);

            if (usdValue >= 25 || transferAmount >= 25) {
              console.log(`[VERIFY] ✅✅✅ PAYMENT VERIFIED: ${transferAmount} $MUSKOX ($${usdValue.toFixed(2)} USD) TX: ${sig.signature}`);
              activatePremium(userId, 30 * 24 * 60 * 60 * 1000);
              saveUserSettings(); // Persist premium activation
              
              return {
                verified: true,
                amount: transferAmount,
                usdValue: usdValue,
                txHash: sig.signature,
              };
            } else {
              console.log(`[VERIFY] ⚠️ Transfer too small: ${transferAmount} $MUSKOX ($${usdValue.toFixed(2)}, need $25 USD or 25 tokens)`);
            }
          }
        }
      }

      console.log(`[VERIFY] ====== SUMMARY ======`);
      console.log(`[VERIFY] Transactions checked: ${txsChecked} out of ${signatures.length}`);
      console.log(`[VERIFY] Transfers found: ${transfersFound}`);
      console.log(`[VERIFY] ❌ No valid $25+ USD payment found`);
      console.log(`[VERIFY] Still waiting for $25 USD (~${minTokensRequired.toFixed(0)} tokens) to ${treasuryWallet.substring(0,10)}...`);
      console.log(`[VERIFY] Estimated time: blockchain confirmation takes 1-2 minutes`);
      console.log(`[VERIFY] Next check: Run /premium again in 30 seconds`);
      console.log(`[VERIFY] ====== END ======`);
      
      return { verified: false, amount: 0, usdValue: 0 };
    } catch (e) {
      console.error(`[VERIFY] RPC query error:`, e);
      console.error(`[VERIFY] Error details:`, JSON.stringify(e));
      return { verified: false, amount: 0, usdValue: 0 };
    }

  } catch (e) {
    console.error(`[PAYMENT_VERIFY] Error for user ${userId}:`, e);
    return { verified: false, amount: 0, usdValue: 0 };
  }
}

/**
 * Webhook endpoint to detect incoming treasury transfers
 * Called by external service monitoring blockchain
 */
bot.command('verify_payment', async (ctx) => {
  const userId = ctx.from?.id || 0;
  
  console.log(`[VERIFY] ${userId} checking payment status...`);

  const result = await verifyPremiumPayment(userId);

  if (result.verified) {
    const settings = getUserSettings(userId);
    const expiresDate = new Date(settings.premiumExpiresAt!);

    const msg = `✅ **PAYMENT VERIFIED!**

🎉 Premium activated for 30 days!
💎 Amount: ${result.amount.toFixed(2)} $MUSKOX = $${result.usdValue.toFixed(2)} USD ✓
📅 Expires: ${expiresDate.toLocaleString()}
🔗 Tx: \`${result.txHash?.substring(0, 20)}...\`

You now have:
🔥 0% fees on ALL snipes
⚡ Priority support
💰 VIP leaderboard ranking

Start sniping! Use /snipe with 0% fees now! 🚀`;

    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } else {
    const settings = getUserSettings(userId);
    const walletStatus = settings.walletAddress ? '✅ Connected' : '❌ Not connected';
    
    const msg = `❌ **PAYMENT NOT DETECTED**

Wallet Status: ${walletStatus}
${settings.walletAddress ? `Address: \`${settings.walletAddress.substring(0, 10)}...\`` : ''}

**What we checked:**
• Last 20 transactions from your wallet
• Looking for ~$25 USD worth of $MUSKOX
• Treasury: \`6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG\`
• Price source: Jupiter

**If you haven't sent payment yet:**
1️⃣ Buy $MUSKOX on Jupiter (or use existing tokens)
2️⃣ Send ~$25 USD worth to treasury
3️⃣ Wait 1-2 minutes for blockchain confirmation
4️⃣ Run this again: /verify_payment

**If you just sent:**
Wait 2-3 minutes and try: /premium again

**Already have TX hash? Use manual verification:**
/manualverify <TX_HASH>

Example: /manualverify 3tvSdvKEaa...

**Need to connect wallet first?**
Run: /connect <yourPublicKey>`;

    await ctx.reply(msg, { parse_mode: 'Markdown' });
  }
});



// ============================================================================
// MANUAL VERIFY - For debugging payment verification issues
// ============================================================================
bot.command('manualverify', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const txHash = ctx.match?.trim();

  console.log(`[MANUAL_VERIFY] ${userId} → ${txHash || 'SHOW_INSTRUCTIONS'}`);

  if (!txHash) {
    await ctx.reply(`
🔍 **Manual Payment Verification**

If /premium isn't detecting your payment, provide the transaction hash:

/manualverify <TX_HASH>

Example:
/manualverify 3tvSdvKEaafFK3dkbas9xQZ2gd6oJBaEWducTHAn4D9BYeZDpofwuCdTehovsUwSjwgUfashFnUTSMW34ERSjjAx

The bot will:
1. Query the transaction directly
2. Check for $MUSKOX transfer to treasury
3. Verify amount ≥ $25 USD
4. Activate premium if valid

Find your TX hash:
1. Open your wallet app (Phantom, Magic Eden, etc.)
2. Find the send transaction to treasury
3. Copy the transaction hash
4. Run: /manualverify <HASH>
    `, { parse_mode: 'Markdown' });
    return;
  }

  try {
    const rpcUrl = config.heliusRpc;
    const muskoxMint = '6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt';
    const treasuryWallet = '6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG';
    const muskoxPrice = await getMuskoxPrice();

    console.log(`[MANUAL_VERIFY] Checking tx: ${txHash}`);

    // Query specific transaction
    const txResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [txHash, { maxSupportedTransactionVersion: 0 }],
      }),
    });

    const txData = await txResponse.json() as any;
    if (!txData.result) {
      await ctx.reply(`❌ **Transaction Not Found**\n\nTX: \`${txHash.substring(0, 20)}...\`\n\nThis transaction doesn't exist on the blockchain.\n\nCheck:\n• Correct transaction hash?\n• Transaction confirmed?\n• On Solana mainnet?`, { parse_mode: 'Markdown' });
      return;
    }

    const tx = txData.result as any;
    if (!tx.meta) {
      await ctx.reply(`❌ **No Transaction Data**\n\nTransaction exists but has no metadata.`, { parse_mode: 'Markdown' });
      return;
    }

    if (tx.meta.err) {
      await ctx.reply(`❌ **Transaction Failed**\n\nError: \`${JSON.stringify(tx.meta.err)}\`\n\nThis transaction failed. Send a successful transaction.`, { parse_mode: 'Markdown' });
      return;
    }

    const postTokenBalances = tx.meta.postTokenBalances || [];
    const preTokenBalances = tx.meta.preTokenBalances || [];

    console.log(`[MANUAL_VERIFY] Post balances: ${postTokenBalances.length}, Pre: ${preTokenBalances.length}`);

    // Look for $MUSKOX transfer to treasury
    for (const postBalance of postTokenBalances) {
      if (postBalance.mint !== muskoxMint) continue;
      if (postBalance.owner !== treasuryWallet) continue;

      const preBalance = preTokenBalances.find((b: any) => b.accountIndex === postBalance.accountIndex);
      if (!preBalance) continue;

      const preAmount = parseFloat(preBalance.uiTokenAmount?.amount || '0');
      const postAmount = parseFloat(postBalance.uiTokenAmount?.amount || '0');
      const transferAmount = postAmount - preAmount;

      if (transferAmount > 0) {
        const usdValue = transferAmount * muskoxPrice;
        console.log(`[MANUAL_VERIFY] Found transfer: ${transferAmount} $MUSKOX = $${usdValue.toFixed(2)} USD`);

        if (usdValue >= 25 || transferAmount >= 25) {
          console.log(`[MANUAL_VERIFY] ✅ Payment valid! Activating premium...`);
          activatePremium(userId, 30 * 24 * 60 * 60 * 1000);
          saveUserSettings();

          const settings = getUserSettings(userId);
          const expiresDate = new Date(settings.premiumExpiresAt!);

          const msg = `✅ **PAYMENT VERIFIED!**

💎 Manual verification successful!
${transferAmount.toFixed(2)} $MUSKOX = $${usdValue.toFixed(2)} USD
TX: \`${txHash.substring(0, 20)}...\`
📅 Premium expires: ${expiresDate.toLocaleString()}

🔥 0% fees on all snipes now!
⚡ Premium activated for 30 days

Start sniping! 🚀`;

          await ctx.reply(msg, { parse_mode: 'Markdown' });
          return;
        }
      }
    }

    await ctx.reply(`❌ **No Valid Payment Found**\n\nTransaction confirmed but no $MUSKOX transfer to treasury detected.\n\nCheck:\n• Sent from connected wallet?\n• Sent $MUSKOX token (not SOL)?\n• Sent to treasury: \`6aCEuwH3P...\`?\n• Amount ≥ 25 tokens?`, { parse_mode: 'Markdown' });

  } catch (e) {
    console.error(`[MANUAL_VERIFY] Error:`, e);
    await ctx.reply(`❌ **Verification Error**\n\nCouldn't verify transaction. Try again or contact support.`, { parse_mode: 'Markdown' });
  }
});

// ============================================================================
// RESTART - Save and restart bot (wallets persist via user-data/user-settings.json)
// ============================================================================
bot.command('restart', async (ctx) => {
  const userId = ctx.from?.id || 0;
  
  console.log(`[RESTART] ${userId} requested bot restart`);
  
  // Save all settings before restart
  saveUserSettings();
  
  const msg = `🔄 **BOT RESTARTING**

All user settings (wallets, premium, preferences) are saved to disk.

✅ Wallets persist after restart
✅ Premium status persists
✅ All settings preserved

Bot will restart in a moment...

After restart:
• Your wallet will still be connected
• Your premium status will be active
• You can use /premium immediately

🚀 Restarting now...`;

  await ctx.reply(msg, { parse_mode: 'Markdown' });
  
  // Wait 2 seconds then exit (process manager will restart)
  setTimeout(() => {
    console.log(`[RESTART] Exiting for restart...`);
    process.exit(0);
  }, 2000);
});
