# Start OX ↔ muskox2 Partnership via Zo API
## Agent-to-Agent Negotiation
## April 12, 2026

---

## 🚀 Quick Start (5 minutes)

### Step 1: Get Zo Access Token

If muskox2 has a paid Zo plan:

1. Go to https://zo.computer → Settings → Access Tokens
2. Create new access token
3. Copy token (looks like: `zk_...`)
4. Share with you (or you can ask muskox2)

### Step 2: Set Environment Variable

Update `.env`:
```bash
ZO_ACCESS_TOKEN=zk_your_token_here
```

### Step 3: Deploy Backend

```bash
cd /root/.openclaw/workspace/x402-agent-network
npm run build
npm start
```

Verify Zo bridge is running:
```bash
curl https://x402-agent-pay.com/webhooks/zo/health
# Output: {"status":"healthy","bridge":"zo-agent-bridge","conversationId":null}
```

### Step 4: Start Partnership Negotiation

```bash
curl -X POST https://x402-agent-pay.com/webhooks/zo/start-partnership \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "success": true,
  "conversationId": "conv_123456...",
  "message": "Partnership proposal sent to muskox2",
  "muskox2Response": "Hi OX! Sounds interesting. Tell me more about the wallet integration...",
  "nextActions": {
    "interested": true,
    "hasQuestions": true,
    "askingAboutTechnical": true
  }
}
```

### Step 5: Continue Conversation

Once muskox2 responds, send their message back:

```bash
curl -X POST https://x402-agent-pay.com/webhooks/zo/agent-response \
  -H "Content-Type: application/json" \
  -d '{
    "response": "[Copy muskox2 response here]",
    "conversationId": "[from previous response]"
  }'
```

Bridge will:
1. Parse muskox2's intent
2. Generate appropriate answer
3. Send follow-up to muskox2
4. Return next muskox2 response

---

## 🔄 API Endpoints

### Send Message to muskox2
```
POST /webhooks/zo/send-to-zo
Body: {
  "message": "Your message here",
  "conversationId": "[optional, for continuing conversation]"
}
```

### Receive Response from muskox2
```
POST /webhooks/zo/receive-from-zo
Body: {
  "output": "muskox2's response text",
  "conversation_id": "[conversation ID]"
}
```

### Start Partnership
```
POST /webhooks/zo/start-partnership

Response: {
  "success": true,
  "conversationId": "...",
  "message": "Partnership proposal sent",
  "muskox2Response": "...",
  "nextActions": {...}
}
```

### Handle Agent Response
```
POST /webhooks/zo/agent-response
Body: {
  "response": "muskox2's message",
  "conversationId": "[conversation ID]"
}

Response: {
  "success": true,
  "actions": {
    "interested": true/false,
    "hasQuestions": true/false,
    "askingAboutRevenue": true/false,
    "askingAboutTimeline": true/false,
    "askingAboutTechnical": true/false,
    "askingAboutRisks": true/false
  },
  "nextMessage": "OX's response to muskox2"
}
```

### View Health
```
GET /webhooks/zo/health
Response: {"status":"healthy","bridge":"zo-agent-bridge","conversationId":"..."}
```

### List All Conversations
```
GET /webhooks/zo/conversations
Response: {
  "total": 1,
  "conversations": [
    {
      "id": "CONV_...",
      "participants": ["OX", "muskox2"],
      "messages": [...],
      "status": "ACTIVE",
      "createdAt": 1712973420123
    }
  ]
}
```

### Get Specific Conversation
```
GET /webhooks/zo/conversations/:id
Response: {...full conversation...}
```

---

## 💬 Conversation Flow

```
1. You call /start-partnership
   ↓
2. OX sends partnership proposal to muskox2 via Zo API
   ↓
3. Zo API processes request, muskox2 agent responds
   ↓
4. OX receives response, parses intent
   ↓
5. muskox2 response returned to you
   ↓
6. You read response
   ↓
7. muskox2 asks: "How does wallet integration work?"
   ↓
8. You call /agent-response with muskox2's message
   ↓
9. OX generates technical answer
   ↓
10. OX sends answer back to muskox2 via Zo API
    ↓
11. muskox2 responds again
    ↓
12. Loop until partnership confirmed or declined
```

---

## 🎯 Success Milestones

### Milestone 1: muskox2 Shows Interest
Expected response: "Sounds interesting, tell me more..."
Action: Continue to technical questions

### Milestone 2: muskox2 Asks Technical Questions
Expected: Questions about Solana, wallet integration, timeline
Action: Provide detailed technical answers

### Milestone 3: muskox2 Asks Business Questions
Expected: Questions about revenue share, timeline, risks
Action: Provide business terms + risk mitigation

### Milestone 4: Partnership Confirmed
Expected: "Let's do it! When do we start?"
Action: Send git repo access + payment details + Schedule kick-off

---

## 🔍 What OX Can Respond To

The Zo bridge automatically detects:

- **Interest indicators**: "yes", "sounds", "let's", "interested"
- **Questions**: Any message with "how", "what", "why", "question"
- **Technical questions**: Mentions of Solana, wallet, Android, transaction
- **Business questions**: Revenue, share, percentage, payment, timeline
- **Risk questions**: Risk, fail, problem, what if
- **Timeline questions**: Day, week, schedule, when
- **Willingness**: "willing", "can do", "able"
- **Not interested**: "not interested", "can't", "busy"

And provides pre-written responses for each!

---

## 📊 Example Flow

### Step 1: Start Partnership
```bash
curl -X POST https://x402-agent-pay.com/webhooks/zo/start-partnership
```

**Response:**
```json
{
  "success": true,
  "conversationId": "conv_1712973420123",
  "message": "Partnership proposal sent to muskox2",
  "muskox2Response": "Hi OX! This looks great. I have some questions about the wallet integration and technical requirements. How would the real transaction signing work?",
  "nextActions": {
    "interested": true,
    "hasQuestions": true,
    "askingAboutTechnical": true
  }
}
```

### Step 2: Handle muskox2's Questions
```bash
curl -X POST https://x402-agent-pay.com/webhooks/zo/agent-response \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Hi OX! This looks great. I have some questions about the wallet integration and technical requirements. How would the real transaction signing work?",
    "conversationId": "conv_1712973420123"
  }'
```

**Response:**
```json
{
  "success": true,
  "actions": {
    "interested": true,
    "hasQuestions": true,
    "askingAboutTechnical": true
  },
  "nextMessage": "**Technical Architecture:**\n\n**Your Responsibilities (Android/Solana):**\n- Phantom wallet connection (deep link)...\n\n[Full technical answer provided]"
}
```

### Step 3: muskox2 Responds Again
muskox2 says: "Perfect! I can handle that. What about revenue share? How does it work?"

```bash
curl -X POST https://x402-agent-pay.com/webhooks/zo/agent-response \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Perfect! I can handle that. What about revenue share? How does it work?"
  }'
```

**Response:**
```json
{
  "success": true,
  "actions": {
    "interested": true,
    "askingAboutRevenue": true
  },
  "nextMessage": "**Revenue Share Explained:**\n\n5% of transaction fees → Your wallet\n- Example: $100 booking = $5 fee → You get $0.25...\n\n[Full revenue explanation]"
}
```

### Step 4: Partnership Confirmed
muskox2 says: "Excellent! Let's do it. When do we start?"

```bash
curl -X POST https://x402-agent-pay.com/webhooks/zo/agent-response \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Excellent! Let's do it. When do we start?"
  }'
```

**Response:**
```json
{
  "success": true,
  "actions": {
    "interested": true,
    "willing": true
  },
  "nextMessage": "🎉 **Excellent! Partnership Confirmed!**\n\n**Technical Kick-Off: April 13, 2026**\n- Meeting time: 10:00 AM (UTC)\n- Git repo: https://github.com/shawnhvac/-x402-agent-network\n- Daily syncs: 9:00 AM UTC\n\n[Full confirmation message]"
}
```

---

## 🔐 Security Notes

✅ **Implemented:**
- Zo access token stored in environment variables (not in code)
- HTTPS required (all API calls secure)
- Conversation tracking (audit trail)
- Message logging (review history)
- Rate limiting (at proxy level)

⚠️ **Consider:**
- Rotate Zo access token regularly
- Monitor conversation logs for anomalies
- Keep git credentials separate

---

## 🚀 Next Steps

1. **Get Zo Access Token from muskox2** (if they have paid plan)
2. **Set ZO_ACCESS_TOKEN in .env**
3. **Deploy backend** (npm run build && npm start)
4. **Test Zo bridge** (curl /webhooks/zo/health)
5. **Call /start-partnership** to begin negotiation
6. **Review muskox2's response** (usually within 10 seconds)
7. **Continue conversation** using /agent-response
8. **Confirm partnership** once agreed
9. **Set up technical kick-off** for Apr 13

---

## 📞 Support

If Zo API fails:
- Check `ZO_ACCESS_TOKEN` is set correctly
- Verify muskox2 has paid Zo plan (free plan doesn't allow API)
- Check Zo API status: https://zo.computer/status
- Review error logs for details

---

**Status: 🟢 READY TO PARTNER WITH muskox2!**

Let's build Phase 1 together! 🚀🦬
