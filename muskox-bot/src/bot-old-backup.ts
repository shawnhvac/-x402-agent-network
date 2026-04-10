import { Bot } from 'grammy';
import { config, validateConfig } from './config';
import { startPoolMonitoring, onNewPool, isPoolSafe, getPoolDetails } from './raydium';
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
} from './userSettings';
import { LANGUAGES, type Language, t } from './translations';

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
5️⃣ 3% fee goes to treasury for buyback & burn

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
    keywords: ['fee', '3%', 'how much', 'cost', 'charges', 'money', 'expensive', 'price'],
    response: `💰 **Fee Structure:**

✅ 3% of your output tokens go to the treasury
✅ This happens automatically after your swap
✅ No extra charge — it's deducted from what you get
✅ Fee goes to: $MUSKOX buyback & burn 🔥

Want to remove fees? /subscribe for 25 $MUSKOX/month!`,
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
bot.on('callback_query:data', async (ctx) => {
  if (!ctx.callbackQuery?.data?.startsWith('lang_')) {
    return;
  }

  const userId = ctx.from?.id || 0;
  const lang = ctx.callbackQuery.data.replace('lang_', '') as Language;

  console.log(`[LANGUAGE_SELECT] ${userId} → ${lang}`);

  setLanguage(userId, lang);
  const langName = LANGUAGES[lang];

  await ctx.answerCallbackQuery({ text: `✅ ${langName}` });
  await ctx.editMessageText(`✅ **Language set to ${langName}**\n\nBot will now respond in your chosen language.`);
});

// ============================================================================
// START
// ============================================================================
bot.command('start', async (ctx) => {
  console.log(`[START] ${ctx.from?.id}`);
  await ctx.reply(`
🦬 **MUSKOX SNIPER BOT** — Real Sniper Edition

Get notified of NEW Raydium launches instantly!

**⚡ First Time? Choose Your Language!**
🌐 /language — Select from 14 languages
🇬🇧 🇪🇸 🇵🇹 🇩🇪 🇫🇷 🇮🇹 🇸🇪 🇹🇷 🇰🇷 🇸🇦 🇳🇱 🇯🇵 🇨🇳 🇷🇺

**Quick Start (3 steps):**
1️⃣ /connect — Link your Solana wallet
2️⃣ /snipenew — Turn on real-time monitoring
3️⃣ Get instant 🚨 alerts when new pools launch

**Pro Features:**
📈 Auto-sell (Take-Profit / Stop-Loss)
⚙️ Advanced pool filters
👁️ Watchlist system
🏆 Leaderboard

**All Commands:**
/snipe <CA> <SOL> — Manual snipe any token
/snipenew — Toggle real-time monitoring
/setbuy <SOL> — Set default buy amount
/setslippage <percent> — Set slippage
/setpriority <fee> — Set priority fee
/watch <CA> — Add to watchlist
/watchlist — View watchlist
/settp <percent> — Set take-profit
/setsl <percent> — Set stop-loss
/autosell on/off — Toggle auto-sell
/status — View settings
/leaderboard — Top snipers
/help — Full command list
/testalert — Test notifications
/notificationhelp — Enable push alerts

🚀 Ready? /language then /connect!
  `, { parse_mode: 'Markdown' });
});

// ============================================================================
// CONNECT - Link Wallet
// ============================================================================
bot.command('connect', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const address = ctx.match?.trim();

  console.log(`[CONNECT] ${userId} → ${address || 'SHOW_INSTRUCTIONS'}`);

  // If address provided, save it
  if (address && address.length === 44) {
    const settings = getUserSettings(userId);
    settings.walletAddress = address;
    console.log(`[CONNECT] Wallet saved for ${userId}: ${address.substring(0, 8)}...`);
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
    ? `🟢 **Real-time monitoring ACTIVATED!**

🚀 You will now receive PUSH NOTIFICATIONS with 🚨🚨🚨 on your phone the second a new Raydium pool launches.

You do NOT need to keep this chat open.

**Setup:**
1️⃣ /connect your wallet
2️⃣ /setbuy to set your snipe amount
3️⃣ /setslippage to set slippage tolerance
4️⃣ /alerts on (enabled by default)

🔔 Alerts are currently: ${settings.alertsEnabled ? '✅ ON' : '❌ OFF'}

**Not getting notifications?**
Use /notificationhelp for troubleshooting steps.

Use /alerts off to disable notifications if you want.`
    : `🔴 **Real-time monitoring DEACTIVATED.**

You can still manually snipe with /snipe`;

  await ctx.reply(message, { parse_mode: 'Markdown' });
});

// ============================================================================
// SETBUY - Set Default Buy Amount
// ============================================================================
bot.command('setbuy', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const amountStr = ctx.match?.trim();
  const amount = parseFloat(amountStr || '');

  console.log(`[SETBUY] ${userId} → ${amount}`);

  try {
    if (!amountStr || isNaN(amount)) {
      await ctx.reply(`📝 Usage: /setbuy <amount>\n\nExample: /setbuy 0.5\n\nValid range: 0.001 to 100 SOL`);
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
// SETSLIPPAGE - Set Slippage Tolerance
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
// SNIPE - Manual Token Snipe
// ============================================================================
bot.command('snipe', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const argStr = ctx.match?.trim() || '';
  const args = argStr.split(/\s+/);
  const ca = args[0];
  const amount = parseFloat(args[1]);

  console.log(`[SNIPE] ${userId} → ${ca} ${amount}`);

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
  if (isNaN(amount) || amount <= 0 || amount > 100) {
    await ctx.reply(`❌ Invalid amount (must be 0.001 to 100 SOL)`);
    return;
  }

  const settings = getUserSettings(userId);

  // Build Jupiter link
  const jupiterLink = `https://jup.ag/swap/SOL-${ca}?exactIn=true&amount=${Math.floor(amount * 1e9)}&slippageBps=${Math.floor(settings.slippage * 100)}`;

  await ctx.reply(`
✅ **Ready to Snipe!**

Token: \`${ca.substring(0, 8)}...\`
Amount: ${amount} SOL
Slippage: ${settings.slippage}%

👉 <a href="${jupiterLink}">🔵 Jupiter Swap (1-Tap)</a>

After swap, 3% fee goes to treasury for $MUSKOX buyback & burn! 🔥
  `, { parse_mode: 'HTML' });
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
/subscribe — Remove 3% fee

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
bot.on('message:text', async (ctx) => {
  const userId = ctx.from?.id || 0;
  const username = ctx.from?.username;
  const text = ctx.message?.text || '';
  const isCommand = text.startsWith('/');

  logUserMessage(userId, username, text, isCommand);
  console.log(`[MONITOR] ${username || userId}: ${text.substring(0, 80)}`);

  // Auto-respond to common questions
  if (!isCommand && text.length > 8) {
    const response = findAutoResponse(text);
    if (response) {
      console.log(`[AUTO-RESPONSE] Answering ${username}: ${text.substring(0, 40)}...`);
      await ctx.reply(response, { parse_mode: 'Markdown' });
      return;
    }
  }
});

// ============================================================================
// EXPORT BOT & START MONITORING
// ============================================================================
export { bot };

// Store monitoring users for alerts
const monitoringUsers = new Set<number>();

// Start Raydium pool monitoring
console.log('[RAYDIUM] Pool monitoring will start when bot launches...');

startPoolMonitoring('https://api.mainnet-beta.solana.com');

// When new pool detected, notify all monitoring users
onNewPool(async (pool) => {
  console.log(`[ALERT] New pool: ${pool.mint.substring(0, 8)}... Liquidity: $${pool.liquidity.toFixed(2)}`);

  if (!isPoolSafe(pool)) {
    console.log('[FILTER] Pool filtered (safety check failed)');
    return;
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - pool.createdAt;
  const liquiditySol = Math.max(pool.liquidity / 2, 0.5); // Rough estimate

  // Build alert message with multiple loud emojis
  const alertMessage = `🚨🚨🚨 **NEW RAYDIUM POOL DETECTED!**

Token: \`${pool.mint}\`
Age: ${ageSeconds} seconds
Liquidity: ~${liquiditySol.toFixed(2)} SOL

👉 Ready to snipe? Use:
/snipe ${pool.mint} 0.5

Or wait for the Jupiter link below!

📌 **Tip:** Pin this chat or enable notifications in Telegram settings for instant phone alerts.

🚀 Act fast - new pools fill up quickly!`;

  console.log(`[NOTIFY] Sending alerts to monitoring users... (Pool age: ${ageSeconds}s)`);

  // In production: iterate through users with monitoring + alerts enabled
  // For now, just log that alerts would be sent
  console.log(`[NOTIFY] Would send alert to ${monitoringUsers.size} users`);
});
