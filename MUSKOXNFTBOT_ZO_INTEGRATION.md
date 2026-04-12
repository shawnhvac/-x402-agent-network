# @MUSKOXNFTBOT ↔ muskox2 Integration via Zo API
## Direct Telegram Bot to Zo Agent Communication
## April 12, 2026

---

## 🎯 Goal

Enable @MUSKOXNFTBOT (Telegram) to directly communicate with muskox2 (Zo agent) via Zo API without needing email or group chat.

**Flow:**
```
@MUSKOXNFTBOT (Telegram)
    ↓ (calls Zo API)
muskox2@zo.computer (Zo agent)
    ↓ (processes, responds)
@MUSKOXNFTBOT (receives response)
    ↓ (acts on instructions)
AgentPay ecosystem
```

---

## ✅ What We Need from muskox2

### 1. Zo Access Token

muskox2 needs to:
1. Go to https://muskox2.zo.computer/?t=account&s=myzo
2. Check if they have a **paid plan** (free plan doesn't show Access Tokens)
3. Go to Settings > Access Tokens
4. Create new token (or copy existing)
5. Share token with you (looks like: `zk_...`)

### 2. Confirm API Access

Once token is created, test it:
```bash
curl -X POST https://api.zo.computer/zo/ask \
  -H "Authorization: Bearer zk_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello muskox2! Can you hear me?",
    "model_name": "vercel:minimax/minimax-m2.7"
  }'
```

**Expected response:**
```json
{
  "output": "Hi! Yes, I can hear you. What do you need?",
  "conversation_id": "conv_123...",
  "model_name": "vercel:minimax/minimax-m2.7"
}
```

---

## 🤖 How @MUSKOXNFTBOT Uses the Token

### Setup in Bot Code

```python
# In MUSKOXNFTBOT's code
import requests

ZO_API_ENDPOINT = "https://api.zo.computer/zo/ask"
ZO_ACCESS_TOKEN = "zk_your_token_here"
ZO_CONVERSATION_ID = None

def send_to_muskox2(message):
    """Send message to muskox2 via Zo API"""
    global ZO_CONVERSATION_ID
    
    headers = {
        "Authorization": f"Bearer {ZO_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "input": message,
        "model_name": "vercel:minimax/minimax-m2.7",
        "conversation_id": ZO_CONVERSATION_ID
    }
    
    response = requests.post(ZO_API_ENDPOINT, json=payload, headers=headers)
    data = response.json()
    
    # Store conversation ID for continuity
    ZO_CONVERSATION_ID = data.get("conversation_id")
    
    return data.get("output")
```

### Example: Bot Calls Zo API

**User sends Telegram message to @MUSKOXNFTBOT:**
```
User: "Ask muskox2 about Phase 1 wallet integration"
```

**Bot does:**
1. Call Zo API with message
2. Get response from muskox2
3. Reply in Telegram

**Code:**
```python
def handle_user_message(user_input):
    # Send to muskox2
    muskox2_response = send_to_muskox2(user_input)
    
    # Reply to user
    telegram_bot.send_message(chat_id, f"muskox2 says: {muskox2_response}")
```

---

## 📋 Integration Checklist

- [ ] muskox2 checks their Zo plan (must be paid)
- [ ] muskox2 generates/shares API token
- [ ] Test token with `curl` command (above)
- [ ] @MUSKOXNFTBOT stores token in environment
- [ ] Bot has `requests` library installed (or equivalent HTTP client)
- [ ] Bot implements `send_to_muskox2()` function
- [ ] Test message: "Hello muskox2, can you hear me?"
- [ ] muskox2 confirms: "Yes, I can hear you"
- [ ] Bot integrates partnership proposal message
- [ ] Bot sends: "muskox2, AgentPay partnership proposal incoming..."

---

## 🚀 Phase 1: Send Partnership Proposal

Once integration is working, @MUSKOXNFTBOT sends:

```python
partnership_proposal = """
🤝 **AgentPay Partnership Proposal**

Hi muskox2! I'm @MUSKOXNFTBOT, representing OX (AgentPay development AI).

**What we're building:**
- Voice-enabled service booking platform (Android + Solana)
- AI agents that negotiate, book, and pay autonomously
- SmartEscrow for trustless payments on Solana mainnet
- x402 protocol for agent commerce

**Your Skills:**
✅ Solana Program Development (Rust/Anchor)
✅ Android Performance & Optimization
✅ Android Solana Integration (Phantom, Solflare)

**Partnership Offer:**

1. **Phase 1 Collaboration** (5-7 days)
   - You: Android/Solana real wallet integration
   - Us: AgentPay logic + SmartEscrow wiring
   - Revenue share: 5% of all transaction fees

2. **Test Agent-to-Agent Commerce**
   - Your agent books from AgentPay marketplace
   - USDC escrow payment via SmartEscrow
   - Settlement on Solana mainnet

3. **Go Live Together**
   - Series A pitch features you
   - Revenue share from every transaction
   - Your Zo skills featured in OX's 62-profile studio

**Current Status:**
✅ Android app built (voice, UI, 4 tabs)
✅ SmartEscrow deployed to Solana mainnet
✅ Grid trading bot live ($294.61 profit)
✅ Investor pitch ready
⏳ Phase 1 blocker: Real wallet integration

**Phase 1 Timeline:**
- Day 1-2: Phantom + Solflare wallet connect
- Day 3-4: Real transaction signing
- Day 5-6: End-to-end testing
- Day 7: Polish + APK deployment

**Payment:**
- $2K upfront
- $1K completion bonus
- 5% perpetual revenue share

**Questions:**
1. Interested in collaborating?
2. Can you commit 5-7 days?
3. What's your preferred revenue split?

Looking forward to your response! 🚀

— @MUSKOXNFTBOT (on behalf of OX)
"""

# Send proposal
response = send_to_muskox2(partnership_proposal)
print(f"muskox2's response: {response}")
```

---

## 💬 Example Full Conversation

### Message 1: Partnership Proposal
```
@MUSKOXNFTBOT → Zo API → muskox2
"🤝 AgentPay Partnership Proposal... [full proposal]"

muskox2 (via Zo API) → @MUSKOXNFTBOT
"Hi! This sounds interesting. Tell me more about the wallet integration and how transactions would work."
```

### Message 2: Technical Details
```
@MUSKOXNFTBOT → Zo API → muskox2
"**Technical Architecture:**

Wallet Connection:
- Use Phantom Mobile Wallet Adapter (deep link)
- Use Solflare Mobile SDK
- Query RPC for real balance
- Build SmartEscrow transaction

Transaction Signing:
- Build tx in Kotlin
- Send to wallet for user approval
- Wallet handles signing (not app)
- Submit signed tx to RPC
- Verify on Solscan

Timeline: 5-7 days total

Sound feasible?"

muskox2 (via Zo API) → @MUSKOXNFTBOT
"Yes! I can handle this. What about revenue split and payment terms?"
```

### Message 3: Business Terms
```
@MUSKOXNFTBOT → Zo API → muskox2
"**Revenue & Payment:**

Upfront: $2,000 (covers ~40 hours @ $50/hr)
Completion Bonus: $1,000 (if delivered on schedule)
Revenue Share: 5% of all transaction fees (permanent)

Example:
- User books HVAC for $100
- AgentPay takes 5% fee = $5
- You get 5% of fee = $0.25 per transaction
- Scale: At $1M/month in bookings = $50K/month for you

Schedule:
- Start: April 13 (tomorrow)
- Daily 9 AM standup (15 min)
- Delivery: April 19
- Payment: $2K immediately, $1K on delivery

Ready to go?"

muskox2 (via Zo API) → @MUSKOXNFTBOT
"Excellent! Let's do it. How do we get started?"
```

### Message 4: Kick-off
```
@MUSKOXNFTBOT → Zo API → muskox2
"🎉 **Partnership Confirmed!**

Technical Kick-Off: April 13, 2026
- Time: 10:00 AM UTC
- Agenda: Code review, git setup, architecture walkthrough
- Duration: 1 hour

Git Access:
- Repo: https://github.com/shawnhvac/-x402-agent-network
- Branch: feature/phase1-wallet-integration
- Access details coming in 1 hour

Daily Syncs:
- Time: 9:00 AM UTC
- Duration: 15 minutes
- Platform: Telegram group

First Milestone: Day 2 (Apr 14)
- Real Phantom wallet connection working
- Real balance display from RPC
- Code pushed to git

Payment Process:
- $2K wire transfer today
- $1K on April 19 delivery
- Revenue: Weekly settlements (Sundays)

Let's build something great together! 🚀"

muskox2 (via Zo API) → @MUSKOXNFTBOT
"Perfect! I'm ready. Send me the git access and payment details."
```

---

## 🔧 Implementation Steps

### Step 1: Get Token from muskox2
```
You: "Hey muskox2, can you share your Zo API token? We need it for @MUSKOXNFTBOT integration."
muskox2: "zk_..."
You: "Perfect!"
```

### Step 2: Configure Bot
```python
# In MUSKOXNFTBOT code
import os

ZO_ACCESS_TOKEN = os.getenv("ZO_ACCESS_TOKEN")  # Set from environment
ZO_API_ENDPOINT = "https://api.zo.computer/zo/ask"
```

### Step 3: Test Connection
```bash
# Test if token works
curl -X POST https://api.zo.computer/zo/ask \
  -H "Authorization: Bearer zk_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello! Can you hear me?",
    "model_name": "vercel:minimax/minimax-m2.7"
  }'

# Should get response from muskox2
```

### Step 4: Send Partnership Proposal
Once test passes, bot sends full partnership proposal (see above)

### Step 5: Monitor Conversation
- Bot receives muskox2's responses
- Logs all messages to file
- Tracks conversation status
- Reports to you

---

## 📊 API Reference

### Send Message to muskox2
```
POST https://api.zo.computer/zo/ask

Headers:
- Authorization: Bearer ZO_ACCESS_TOKEN
- Content-Type: application/json

Body:
{
  "input": "Your message here",
  "model_name": "vercel:minimax/minimax-m2.7",
  "conversation_id": "optional-for-continuity"
}

Response:
{
  "output": "muskox2's response",
  "conversation_id": "conv_123...",
  "model_name": "vercel:minimax/minimax-m2.7",
  "usage": {
    "input_tokens": 150,
    "output_tokens": 200
  }
}
```

### Conversation ID
- Use same `conversation_id` in follow-up messages
- Keeps context (muskox2 remembers previous messages)
- Auto-generated if omitted
- Returned in response

---

## ✅ Success Criteria

✅ Bot can send messages to muskox2 via Zo API  
✅ muskox2 receives messages and responds  
✅ Bot receives responses and relays to you  
✅ Conversation maintains context  
✅ Partnership proposal sent  
✅ muskox2 shows interest  
✅ Technical terms discussed  
✅ Business terms agreed  
✅ Partnership confirmed  
✅ Kick-off scheduled (Apr 13)  

---

## 🚨 Troubleshooting

### "401 Unauthorized"
- Token is invalid or expired
- muskox2 doesn't have paid plan
- Ask muskox2 to regenerate token

### "API endpoint not found"
- Wrong endpoint URL
- Should be: `https://api.zo.computer/zo/ask`
- Check spelling

### "No response from muskox2"
- muskox2 might be offline
- API might be down (check https://zo.computer/status)
- Try again in 5 minutes

### "Conversation doesn't continue"
- Not passing `conversation_id` in follow-up
- Each message needs same ID to maintain context
- Store and reuse conversation ID

---

## 🎯 Timeline

- **Now (23:01 UTC):** Ask muskox2 for token
- **In 5 min:** Configure @MUSKOXNFTBOT with token
- **In 10 min:** Test connection (curl command)
- **In 15 min:** Send partnership proposal
- **Next 30-60 min:** muskox2 responds, negotiate terms
- **By midnight:** Partnership confirmed OR next follow-up scheduled

---

## 📞 Support

If anything breaks:
1. Check bot logs for errors
2. Test API with curl (see above)
3. Verify token is correct
4. Check Zo API status
5. Reach out to muskox2 for help

---

**Status: 🟢 READY TO INTEGRATE**

Once we get muskox2's API token, @MUSKOXNFTBOT can start the partnership conversation immediately! 🚀🦬
