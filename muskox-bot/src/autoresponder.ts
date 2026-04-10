/**
 * Auto-Responder for MUSKOX Snipe Bot
 * Automatically answers common user questions
 */

export const autoResponses = [
  {
    keywords: ['base64', 'how do i use', 'backup'],
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
    keywords: ['snipe', 'how do i', 'how to use'],
    response: `🎯 **How to Snipe:**

1️⃣ Get a token's contract address (CA)
2️⃣ Type: /snipe <CA> <SOL_amount>

Example: /snipe 6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt 0.1

3️⃣ Bot gives you swap options:
   - Jupiter link (1 tap) ← Easiest
   - Base64 (copy/paste)
4️⃣ Complete the swap
5️⃣ 3% fee goes to treasury for buyback & burn

Need help? Ask /help 🦬`,
  },
  {
    keywords: ['jupiter', 'link', 'not working'],
    response: `🔵 **Jupiter Link Help:**

✅ The Jupiter link should be blue and clickable
✅ Tap it → Jupiter opens with your token pre-filled
✅ Review the swap details
✅ Click "Swap" and confirm in your wallet

If the link isn't showing blue:
• Make sure you're using the latest Telegram
• Try restarting the app
• Tap and hold the link to open manually

If swap fails:
• Check your SOL balance has enough for gas
• Try a different token CA
• Use the base64 fallback instead`,
  },
  {
    keywords: ['fee', 'how much', 'percentage', '3%'],
    response: `💰 **Fee Structure:**

✅ 3% of your output tokens go to the treasury
✅ This happens automatically after your swap
✅ No extra charge — it's deducted from what you get
✅ Fee goes to: $MUSKOX buyback & burn 🔥

Example:
• You swap 0.1 SOL
• Get 10,000 tokens
• 3% (300 tokens) → treasury
• You keep 9,700 tokens

Subscribe for fee removal:
/subscribe for 25 $MUSKOX/month = 0% fees!`,
  },
  {
    keywords: ['wallet', 'connect', 'setup'],
    response: `🔐 **Wallet Setup:**

1️⃣ Use /connect
2️⃣ Copy your Solana public key from:
   - Phantom: Click address at top
   - Solflare: Settings → View Public Key
3️⃣ Paste it here (NOT your private key!)
4️⃣ Bot confirms: "Wallet Connected!"
5️⃣ Ready to snipe!

⚠️ Never share your PRIVATE key!
✅ Your PUBLIC key is safe to share`,
  },
  {
    keywords: ['status', 'balance', 'subscription'],
    response: `📊 **Check Your Status:**

Use /status to see:
✅ Your wallet address
✅ $MUSKOX balance
✅ Subscription status (active/inactive)
✅ Your leaderboard rank
✅ Total tokens sniped

Want to subscribe (remove 3% fee)?
Use /subscribe for details!`,
  },
  {
    keywords: ['subscribe', 'cost', 'monthly', 'fee removal'],
    response: `💎 **Subscription Details:**

**Cost:** 25 $MUSKOX/month

**Benefits:**
✅ 0% fee on all snipes (normally 3%)
✅ Unlimited daily snipes
✅ Priority on new features
✅ Revenue share on buybacks

Use /subscribe for payment instructions!`,
  },
  {
    keywords: ['leaderboard', 'top', 'rank'],
    response: `🏆 **Leaderboard:**

Use /leaderboard to see:
✅ Top 10 snipers this month
✅ Their profit % and SOL sniped
✅ Your own rank (if ranked)

💡 Tip: More snipes = climb the ranks!
Start with /snipe to get on the board 🚀`,
  },
  {
    keywords: ['help', 'commands', 'what can i do'],
    response: `📖 **Available Commands:**

/start — Welcome & overview
/connect — Link your wallet
/snipe <CA> <SOL> — Snipe a token
/status — Check your wallet & subscription
/leaderboard — View top snipers
/subscribe — Remove 3% fee (25 $MUSKOX/month)
/help — This list
/ping — Test if bot is working

👉 Start with /connect to link your wallet!`,
  },
  {
    keywords: ['error', 'failed', 'not working', 'problem'],
    response: `🔧 **Troubleshooting:**

**Bot not responding?**
• Use /ping to test
• Make sure you're using the right bot
• Try again in a few seconds

**Snipe failing?**
• Check token CA is correct
• Make sure you have enough SOL for gas
• Try a different token
• Use base64 fallback if Jupiter fails

**Wallet not connecting?**
• Use your PUBLIC key (not private!)
• Make sure it's exactly 44 characters
• Copy carefully, no extra spaces

Still stuck? Ask a specific question! 🦬`,
  },
];

export function findAutoResponse(userMessage: string): string | null {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const entry of autoResponses) {
    // Check if ANY keyword matches
    const matches = entry.keywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
    
    if (matches) {
      return entry.response;
    }
  }
  
  return null;
}

export function shouldAutoRespond(userMessage: string): boolean {
  // Don't auto-respond to:
  // - Commands (start with /)
  // - Very short messages
  // - Base64 transactions
  // - Public keys (44 chars)
  
  if (userMessage.startsWith('/')) return false;
  if (userMessage.length < 8) return false;
  if (userMessage.startsWith('AQAB') || userMessage.startsWith('AQA')) return false;
  if (userMessage.length === 44) return false;
  
  return true;
}
