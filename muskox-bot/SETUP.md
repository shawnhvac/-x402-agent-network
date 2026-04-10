# 🦬 $MUSKOX Bot Setup Instructions

## Step 1: Get Your Telegram Bot Token

1. Open Telegram and search for **@BotFather**
2. Send `/start`
3. Send `/newbot`
4. Follow the prompts:
   - Name: `$MUSKOX Snipe Bot` (or whatever you want)
   - Username: `muskox_snipe_bot` (must be unique, ends with `_bot`)
5. BotFather will give you a token like:
   ```
   7482906748:AAGb5vqJ3t-8xF8q7xJ9mK1L2wQ9rP6sT3u
   ```
6. **Copy this token** — you'll need it next

---

## Step 2: Get Helius RPC Key (Optional but Recommended)

1. Go to https://www.helius.dev
2. Sign up (free)
3. Create a new API key
4. Copy your RPC URL: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

*(Or use public RPC: `https://api.mainnet-beta.solana.com` — free but slower)*

---

## Step 3: Update Your .env File

Edit `/root/.openclaw/workspace/muskox-bot/.env`:

```bash
# Your Telegram bot token from BotFather
TELEGRAM_BOT_TOKEN=7482906748:AAGb5vqJ3t-8xF8q7xJ9mK1L2wQ9rP6sT3u

# Your Helius RPC endpoint
HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY

# Your Solana wallet that receives snipe fees (for buyback & burn)
TREASURY_WALLET=YourSolanaPublicKeyHere

# Rest is pre-filled
MUSKOX_MINT=6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt
MIN_HOLD_FOR_REVENUE_SHARE=5000000
SUBSCRIPTION_FEE_MUSKOX=25
```

---

## Step 4: Restart the Bot

```bash
# Kill the old process
pkill -f "muskox-telegram-bot"

# Restart with new .env
cd /root/.openclaw/workspace/muskox-bot
nohup npm start >> muskox-bot.log 2>&1 &

# Check if it started
sleep 5
tail -20 muskox-bot.log
```

**Success looks like:**
```
🦬 Starting $MUSKOX Telegram Bot...
🟢 Health check server running on port 3000
✅ $MUSKOX Bot is LIVE and listening for messages
📱 Bot Token: 7482906748...
💰 Treasury: YourTreasuryWalletHere
🌐 RPC: https://mainnet.helius-rpc.com...

🚀 Bot is ready! Users can find it on Telegram and start sniping.
```

---

## Step 5: Test the Bot

1. Open Telegram
2. Search for your bot by username (e.g., `@muskox_snipe_bot`)
3. Send `/start`
4. You should see the welcome message

---

## Troubleshooting

### "Unauthorized" Error in Logs

This means your `TELEGRAM_BOT_TOKEN` is wrong or not set.

**Fix:**
1. Double-check the token from BotFather
2. Make sure it's in `.env` file exactly as: `TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE`
3. Restart the bot

### Bot doesn't respond to commands

1. Make sure you sent `/start` first
2. Check the logs: `tail -50 /root/.openclaw/workspace/muskox-bot.log`
3. Verify bot is running: `ps aux | grep npm`

### "Connection refused" when sniping

1. Make sure your RPC endpoint is valid
2. Test it: `curl https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
3. Check your Helius API key is correct

---

## Configuration Summary

| Setting | Purpose | Example |
|---------|---------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot authentication | From @BotFather |
| `HELIUS_RPC` | Blockchain access | Helius or Solana public RPC |
| `TREASURY_WALLET` | Fee collection | Your Solana address (44 chars) |
| `MUSKOX_MINT` | Token address | Already filled in |
| `SUBSCRIPTION_FEE_MUSKOX` | Monthly cost | 25 (can change) |
| `SNIPE_FEE_PERCENT` | Fee from trades | 3% (can change) |

---

## Next: Monitoring the Bot

Keep the bot running in background:

```bash
# Option 1: nohup (already running)
nohup npm start >> /root/.openclaw/workspace/muskox-bot.log 2>&1 &

# Option 2: PM2 (persistent across restarts)
npm install -g pm2
pm2 start dist/index.js --name "muskox-bot"
pm2 save
pm2 startup

# Option 3: Docker (if docker-compose is available)
docker-compose up -d
```

Check logs anytime:
```bash
tail -f /root/.openclaw/workspace/muskox-bot.log
```

---

## You're Done! 🚀

Your bot is now live and ready for users to snipe tokens.

**Share the bot handle:** `@yourbot_username`

Users can now:
- `/connect` their wallet (no keys needed!)
- `/snipe <token> <sol>` to create swap transactions
- Sign in their own Phantom/Solflare wallet
- Get 3% fee from profits for your treasury

Enjoy! 🦬
