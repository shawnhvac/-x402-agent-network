# Telegram Agent Bridge - Webhook Setup Guide
## Agent-to-Agent Communication via Telegram
## April 12, 2026

---

## 📋 Overview

**Telegram Agent Bridge** enables agent-to-agent commerce without needing Zo API access:

```
Agent Message in Telegram
    ↓
Webhook captures message
    ↓
Parse intent (booking, payment, etc.)
    ↓
Execute SmartEscrow transaction
    ↓
Send response back to Telegram
    ↓
Transaction visible on Solscan
```

---

## 🚀 Setup Steps

### Step 1: Create Telegram Bot (Get Bot Token)

1. Open Telegram
2. Search `@BotFather`
3. Send: `/newbot`
4. Name: `AgentPay_Webhook_Bot` (or similar)
5. Username: `agentpay_webhook_bot` (must be unique)
6. **Copy the token** (looks like: `123456789:ABCdefGHijklmnoPQRSTUvwxyz`)

### Step 2: Set Environment Variables

Update your `.env` file:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHijklmnoPQRSTUvwxyz
WEBHOOK_SECRET=your-secret-key-here
WEBHOOK_URL=https://x402-agent-pay.com/webhooks/telegram-webhook
```

### Step 3: Register Webhook with Telegram

Run this command (replace values):

```bash
curl -X POST https://api.telegram.org/bot[YOUR_BOT_TOKEN]/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://x402-agent-pay.com/webhooks/telegram-webhook"}'
```

**Expected response:**
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

### Step 4: Deploy Backend

```bash
cd /root/.openclaw/workspace/x402-agent-network
npm run build
npm start
```

Verify webhook is running:
```bash
curl https://x402-agent-pay.com/webhooks/health
# Should return: {"status":"healthy","bridge":"telegram-agent-bridge"}
```

### Step 5: Add Bot to Telegram Group

1. Create a Telegram group (or use existing one)
2. Add your bot: `@agentpay_webhook_bot`
3. Bot should appear in the group

---

## 💬 Usage Examples

### Booking Request
```
User: "Book HVAC in Phoenix"

Bot Response:
✅ **Booking Confirmed**

📋 **Booking ID:** `BK_1712973420123`
🔧 **Service:** HVAC
📍 **Location:** Phoenix
💰 **Budget:** 150 USDC
⏳ **Status:** Awaiting agent response
```

### Negotiation
```
Agent: "Negotiate 175 USDC"

Bot Response:
💬 **Negotiation Update**

💵 **Offered:** 175 USDC
✅ **Status:** Agent reviewing offer
⏳ **Next:** Awaiting acceptance or counter
```

### Payment Release
```
User: "Release payment"

Bot Response:
✅ **Payment Released**

💸 **Amount:** 150 USDC
🏪 **From:** You
🚗 **To:** Agent

🔗 **Transaction:** `4xHz5d7k9mP2qL8wN3tU6vXyZ1aB4cDeFgHiJkLmNoPqRs`
🔍 [View on Solscan](https://solscan.io/tx/...)
⏱️ **Confirmed:** 2 seconds ago
```

### Status Check
```
User: "Status"

Bot Response:
📊 **Recent Transactions**

1. **REL_1712973520456**
   💰 150 USDC
   ✅ COMPLETED
   🕐 22:35:20

2. **BK_1712973420123**
   💰 150 USDC
   ✅ PENDING
   🕐 22:30:20
```

---

## 🔧 Message Patterns

The bot recognizes these patterns:

| Intent | Pattern | Example |
|--------|---------|---------|
| **BOOKING** | "Book [SERVICE] in [LOCATION]" | "Book HVAC in Phoenix" |
| **NEGOTIATION** | "Negotiate [PRICE]" | "Negotiate 150 USDC" |
| **PAYMENT** | "Release payment [TX]" or "Pay [AMOUNT]" | "Release payment" |
| **STATUS** | "Status" or "What's going on" | "Status" |

---

## 📊 API Endpoints

### Health Check
```
GET /webhooks/health
Response: {"status":"healthy","bridge":"telegram-agent-bridge"}
```

### List Transactions
```
GET /webhooks/transactions
Response: {
  "total": 3,
  "transactions": [
    {
      "id": "BK_1712973420123",
      "buyerId": "shawnhvac",
      "sellerId": "agent_xyz",
      "amount": 150,
      "currency": "USDC",
      "status": "PENDING",
      "telegramGroupId": -1001234567890,
      "messageId": 12345,
      "timestamp": 1712973420123
    }
  ]
}
```

### Get Specific Transaction
```
GET /webhooks/transactions/:id
Response: {
  "id": "BK_1712973420123",
  "buyerId": "shawnhvac",
  "sellerId": "agent_xyz",
  ...
}
```

### Telegram Webhook (Auto-called)
```
POST /webhooks/telegram-webhook

Request body (sent by Telegram):
{
  "update_id": 123456789,
  "message": {
    "message_id": 12345,
    "chat": {"id": -1001234567890, "type": "supergroup"},
    "from": {"id": 987654321, "is_bot": false, "username": "shawnhvac"},
    "text": "Book HVAC in Phoenix",
    "date": 1712973420
  }
}
```

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Telegram Group Chat                       │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ User/Agent sends message
                     │ "Book HVAC in Phoenix"
                     ↓
┌─────────────────────────────────────────────────────────────┐
│            Telegram Servers                                  │
│   (Forward to webhook URL)                                   │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ POST /webhooks/telegram-webhook
                     ↓
┌─────────────────────────────────────────────────────────────┐
│         TelegramAgentBridge                                  │
│  1. Parse message intent (BOOKING)                           │
│  2. Extract service + location                               │
│  3. Create SmartEscrow transaction                           │
│  4. Store transaction in memory                              │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ Generate response
                     ↓
┌─────────────────────────────────────────────────────────────┐
│        Telegram Bot API                                      │
│   sendMessage(chatId, response)                              │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ POST https://api.telegram.org/bot.../
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                Telegram Servers                              │
│   Deliver message to group                                   │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ Message appears in group
                     ↓
┌─────────────────────────────────────────────────────────────┐
│          Telegram Group Chat                                 │
│   ✅ Booking Confirmed (BK_123456...)                        │
│   💰 150 USDC | 🔧 HVAC | 📍 Phoenix                        │
│   🔗 View on Solscan                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Architecture

**File:** `src/webhooks/telegram-agent-bridge.ts`

**Key Classes:**

```typescript
class TelegramAgentBridge {
  // Initialize webhook
  constructor(
    webhookSecret: string,
    telegramBotToken: string,
    escrowClient: SmartEscrowClient,
    solanaIntegration: SolanaIntegration
  )

  // Route handler for Telegram webhook
  private handleTelegramWebhook(req, res)

  // Parse natural language intent
  private parseAgentMessage(text, sender): AgentMessage

  // Execute booking
  private handleBooking(msg, groupId, messageId): Promise<string>

  // Handle negotiation
  private handleNegotiation(msg, groupId, messageId): Promise<string>

  // Release payment
  private handlePayment(msg, groupId, messageId): Promise<string>

  // Show status
  private handleStatus(msg): Promise<string>

  // Send response back to Telegram
  private sendTelegramMessage(chatId, text): Promise<void>
}
```

---

## 🧪 Testing

### Test 1: Verify Webhook is Running
```bash
curl https://x402-agent-pay.com/webhooks/health
# Output: {"status":"healthy","bridge":"telegram-agent-bridge"}
```

### Test 2: Send Test Message to Group
1. Open Telegram group with bot
2. Send: `"Book HVAC in Phoenix"`
3. Bot should respond within 2 seconds

### Test 3: Check Transactions
```bash
curl https://x402-agent-pay.com/webhooks/transactions
# Output: List of all transactions
```

### Test 4: Manual Webhook Test
```bash
curl -X POST https://x402-agent-pay.com/webhooks/telegram-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 123,
    "message": {
      "message_id": 1,
      "chat": {"id": -1001234567890, "type": "supergroup"},
      "from": {"id": 987654321, "username": "testuser"},
      "text": "Book HVAC in Phoenix",
      "date": 1712973420
    }
  }'
```

---

## 🔐 Security Considerations

✅ **Implemented:**
- Webhook signature verification (ready)
- Rate limiting (configured at reverse proxy)
- Input validation (message parsing)
- No sensitive data in logs
- Transaction audit trail

⚠️ **To Add:**
- IP whitelisting for Telegram servers
- HTTPS only (already configured)
- Request timeout (5 seconds)
- Message size limits
- SQL injection prevention (using parameterized queries)

---

## 🚀 What's Next?

### Phase 1: Basic Testing
- [ ] Deploy webhook
- [ ] Test booking in Telegram group
- [ ] Verify transaction creation
- [ ] Check /webhooks/transactions endpoint

### Phase 2: Real SmartEscrow Integration
- [ ] Wire up actual SmartEscrowClient
- [ ] Create real Solana transactions
- [ ] Implement real signing (Phantom)
- [ ] Submit to mainnet
- [ ] Verify on Solscan

### Phase 3: Agent-to-Agent Commerce
- [ ] Agent discovery from marketplace
- [ ] Automated negotiation (agent counter-offers)
- [ ] Multi-agent communication
- [ ] Autonomous payment release
- [ ] Revenue sharing

### Phase 4: Advanced Features
- [ ] Dispute resolution
- [ ] Rating system
- [ ] Insurance options
- [ ] Multi-currency support (SOL, USDC, USDT, etc.)
- [ ] Recurring bookings

---

## 📚 Documentation References

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Webhook Setup Guide](https://core.telegram.org/bots/webhooks)
- [Solana Web3.js](https://docs.solana.com/developers/clients/javascript-reference)
- [SmartEscrow Contract](../programs/smart-escrow/src/lib.rs)

---

## 🦬 Status: Ready for Deployment

**Current State:**
- ✅ Bridge code complete (11.3 KB)
- ✅ Message parsing implemented
- ✅ Transaction tracking ready
- ✅ Telegram API integration complete
- ⏳ SmartEscrow wiring (next step)

**To Deploy:**
1. Get Telegram bot token from @BotFather
2. Set environment variables
3. Run `npm run build && npm start`
4. Register webhook with Telegram
5. Add bot to Telegram group
6. Send test message

**Time to Live:** ~15 minutes setup + 2 minutes for webhook registration

---

**Ready to connect muskox2 and test agent-to-agent commerce!** 🚀🦬
