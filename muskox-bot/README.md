# 🦬 $MUSKOX Custody-Free Telegram Snipe + Locker Bot

**Non-custodial Solana token sniping bot for Telegram. Users control their keys. You control the fees.**

---

## **Features**

✅ **Non-Custodial** — Users never paste private keys  
✅ **Phantom/Solflare Integration** — Sign transactions in user's own wallet  
✅ **Jupiter Swaps** — Best prices on Solana DEX aggregator  
✅ **Fee Collection** — 3% of snipes → Treasury for buybacks & burns  
✅ **Leaderboard** — Top snipers ranked by profit  
✅ **Subscription** — Optional 25 $MUSKOX/month removes fees  
✅ **Docker Ready** — Deploy in 1 command  

---

## **Quick Start (5 Minutes)**

### **1. Clone & Setup**

```bash
git clone <your-repo>
cd muskox-bot
cp .env.example .env
```

### **2. Edit `.env`**

```bash
# Get your bot token from BotFather on Telegram
TELEGRAM_BOT_TOKEN=your_token_here

# Get Helius RPC key (free tier: https://www.helius.dev)
HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Your treasury wallet (receives fees)
TREASURY_WALLET=YourSolanaPublicKeyHere

# $MUSKOX token settings (pre-filled)
MUSKOX_MINT=6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt
MIN_HOLD_FOR_REVENUE_SHARE=5000000
SUBSCRIPTION_FEE_MUSKOX=25
```

### **3. Deploy with Docker**

```bash
docker-compose up -d
```

**That's it!** Your bot is now live.

---

## **Commands**

| Command | Usage | Description |
|---------|-------|-------------|
| `/start` | `/start` | Welcome message |
| `/connect` | `/connect` | Link Phantom/Solflare wallet |
| `/snipe` | `/snipe <token_ca> <sol_amount>` | Create snipe tx |
| `/status` | `/status` | Check wallet & subscription |
| `/leaderboard` | `/leaderboard` | View top 10 snipers |
| `/subscribe` | `/subscribe` | Buy monthly subscription |
| `/help` | `/help` | Show all commands |

---

## **How It Works**

### **User Flow**

1. **Connect Wallet**
   ```
   User: /connect
   Bot: "Send me your public key"
   User: "PasteTheirPublicKeyHere"
   ```

2. **Request Snipe**
   ```
   User: /snipe TokenCAhere 0.5
   Bot: Creates unsigned Jupiter swap tx (base64)
   ```

3. **User Signs in Wallet**
   - Copy the base64 transaction
   - Open Phantom Wallet app
   - Settings → Custom Transaction → Paste base64
   - Sign and copy the SIGNED version

4. **Bot Broadcasts**
   ```
   User: [Pastes signed base64]
   Bot: Broadcasts to Solana
   Bot: Takes 3% fee from output
   Bot: Returns tx signature
   ```

### **No Keys Ever Stored**

- ✅ Bot only stores PUBLIC keys (address, not secret)
- ✅ Users sign in their own wallet app
- ✅ Bot never has access to private keys
- ✅ Fully non-custodial

---

## **Architecture**

```
muskox-bot/
├── src/
│   ├── index.ts          # Entry point
│   ├── bot.ts            # Telegram bot commands
│   ├── config.ts         # Configuration
│   ├── database.ts       # In-memory user sessions & history
│   ├── solana.ts         # Solana RPC calls (Jupiter, validation)
│   └── types.ts          # TypeScript interfaces
├── Dockerfile            # Docker image
├── docker-compose.yml    # Run locally or on server
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── .env.example          # Environment variables template
└── README.md             # This file
```

---

## **Environment Variables**

```bash
# Required
TELEGRAM_BOT_TOKEN      # From BotFather
HELIUS_RPC              # RPC endpoint
TREASURY_WALLET         # Your Solana address (receives fees)

# Optional (pre-filled)
MUSKOX_MINT             # Token address
MIN_HOLD_FOR_REVENUE_SHARE # Min balance for eligibility
SUBSCRIPTION_FEE_MUSKOX # Monthly subscription cost
SNIPE_FEE_PERCENT       # Default 3%
LOCK_FEE_PERCENT        # Default 2%
MAX_SLIPPAGE_BPS        # Default 50 (0.5%)
```

---

## **Deployment Options**

### **Option 1: Docker (Recommended)**

```bash
docker-compose up -d
# Bot runs 24/7 on your server
```

### **Option 2: Node.js Direct**

```bash
npm install
npm run build
npm start
```

### **Option 3: PM2 (Production)**

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name "muskox-bot"
pm2 save
```

---

## **Revenue Model**

### **Snipe Fees**
- 3% of token output → Treasury
- Example: User swaps 1 SOL for 1,000 tokens
  - 30 tokens go to Treasury
  - 970 tokens go to user

### **Subscription**
- 25 $MUSKOX/month removes snipe fees
- Unlimited snipes for subscribers

### **Buyback & Burn**
- All fees collected in Treasury
- Execute buybacks on regular schedule
- Burn tokens to increase scarcity
- Holders benefit from burning

---

## **Roadmap**

- [ ] Token locker (PDA-based escrow)
- [ ] Volume trading bot
- [ ] Multi-wallet support (users manage multiple addresses)
- [ ] DCA (Dollar-Cost Averaging) bot
- [ ] Advanced charting in Telegram
- [ ] Database migration (MongoDB/PostgreSQL)
- [ ] Webhook callbacks for auto-broadcast
- [ ] Paid API tier for power users

---

## **Safety & Compliance**

✅ **Non-Custodial** — No key storage  
✅ **Open Source** — Code is auditable  
✅ **No KYC** — Self-hosted, no data collection  
✅ **Reversible** — Users can cancel anytime  

**Your Responsibility:**
- ⚠️ Users understand risks of token trading
- ⚠️ Clear disclaimers in bot messages
- ⚠️ No investment advice given
- ⚠️ Comply with your local regulations

---

## **Troubleshooting**

### **Bot not responding**
```bash
# Check logs
docker-compose logs -f muskox-bot

# Restart
docker-compose restart muskox-bot
```

### **Invalid RPC endpoint**
- Verify Helius API key is correct
- Test: `curl https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

### **Transaction fails to broadcast**
- Check slippage (MAX_SLIPPAGE_BPS)
- Verify token address is valid
- Check SOL amount isn't too small

### **User can't connect wallet**
- Make sure public key is exactly 44 characters
- Verify it starts with a letter/number
- Check base58 format

---

## **Costs**

- **Hosting:** $5-20/month (basic VPS)
- **Helius RPC:** Free (50k requests/month)
- **Telegram:** Free
- **Solana fees:** ~0.00025 SOL per tx (~$0.01)

---

## **Support**

- 📖 Full documentation: See README
- 💬 Community: @MUSKOXcommunity on Telegram
- 🐛 Issues: Create GitHub issue
- 💡 Feature requests: Telegram group

---

## **License**

MIT — Use as you like!

---

**Built for $MUSKOX community. Non-custodial. Fully yours.**

🚀 **Let's ship!**
