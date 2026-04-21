# Zo Space API Key Configuration
## Getting muskox2's Endpoint Working
## April 12, 2026

---

## 🔧 Error: "Zo API key not configured"

This means muskox2's Zo Space endpoint needs the Zo API key set in environment variables.

---

## ✅ Solution (For muskox2)

### Step 1: Go to Zo Settings

1. Open https://muskox2.zo.computer
2. Go to Settings (gear icon)
3. Look for **"API Keys"** or **"Access Tokens"**

### Step 2: Create/Copy API Key

- If API Keys don't exist, create one
- Copy the key (should look like: `zk_...`)
- This is the **Zo API key**, not the access token

### Step 3: Set Environment Variable in Zo Space

In muskox2's Zo Space (at https://muskox2.zo.space), they need to set:

**Option A: In .env file**
```bash
# .env (in Zo Space root)
ZO_API_KEY=zk_their_key_here
```

**Option B: In environment settings**
```bash
export ZO_API_KEY=zk_their_key_here
```

**Option C: In code (if using Hono)**
```typescript
// src/index.ts
const ZO_API_KEY = process.env.ZO_API_KEY || ''

if (!ZO_API_KEY) {
  throw new Error('Zo API key not configured - set ZO_API_KEY env var')
}
```

### Step 4: Verify in Zo Space Settings

muskox2 should go to their Zo Space settings and make sure:
- Environment variables are set
- Server is restarted (usually auto-restarts on code change)
- Logs show "API key loaded" or similar

### Step 5: Test Again

```bash
curl -X POST https://muskox2.zo.space/api/agentpay \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello muskox2! Can you hear me?",
    "conversationId": null
  }'
```

**Should now return:**
```json
{
  "output": "Hi! Yes, I can hear me. What do you need?",
  "conversationId": "conv_123...",
  "timestamp": 1712973420123,
  "status": "success"
}
```

---

## 📋 Message to Send muskox2

```
Hey! We tested the endpoint but got: "Zo API key not configured"

Here's what you need to do:

1. Go to your Zo settings: https://muskox2.zo.computer/settings
2. Find "API Keys" or "Access Tokens"
3. Copy your API key (starts with zk_)
4. Add to your Zo Space environment:
   - Either: Create .env file with ZO_API_KEY=zk_...
   - Or: Set in environment variables
5. Restart your Zo Space
6. Test with:
   
   curl -X POST https://muskox2.zo.space/api/agentpay \
     -H "Content-Type: application/json" \
     -d '{"input": "Hello!", "conversationId": null}'

Once that works, @MUSKOXNFTBOT can start the partnership conversation!
```

---

## 🎯 What muskox2 Should See

Once configured correctly:

1. **Endpoint accepts requests**
   ```
   Status: 200 OK
   Response: {"output": "...", "conversationId": "..."}
   ```

2. **Logs show success**
   ```
   [INFO] POST /api/agentpay
   [INFO] Processing input: "Hello muskox2!"
   [INFO] Calling Zo agent...
   [INFO] Response sent successfully
   ```

3. **Conversation_id is maintained**
   ```
   Request 1: conversationId = null
   Response 1: conversationId = "conv_abc123"
   
   Request 2: conversationId = "conv_abc123"
   Response 2: Same conversationId (context preserved)
   ```

---

## 🔍 Debugging

If it's still not working:

### Check 1: Zo Space is Running
```bash
curl https://muskox2.zo.space/health

# Should return something like:
# {"status": "ok", "version": "..."}
```

### Check 2: API Key Exists
muskox2 should verify in Zo settings that they have an API key created.

### Check 3: Environment Variable is Set
In Zo Space settings, confirm `ZO_API_KEY` is set:
```bash
# In Zo Space terminal
echo $ZO_API_KEY
# Should print: zk_...
```

### Check 4: Endpoint Code is Correct
muskox2's `/api/agentpay` endpoint should:
- Accept POST requests
- Read `ZO_API_KEY` from environment
- Call Zo's internal API with the key
- Return response

**Example (if missing):**
```typescript
// src/api/agentpay.ts
import { Hono } from 'hono'

const app = new Hono()

app.post('/api/agentpay', async (c) => {
  const ZO_API_KEY = process.env.ZO_API_KEY
  
  if (!ZO_API_KEY) {
    return c.json({ error: 'Zo API key not configured' }, 500)
  }
  
  const { input, conversationId } = await c.req.json()
  
  // Call Zo's internal API with the key
  const response = await fetch('https://api.zo.computer/zo/ask', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ZO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: input,
      model_name: 'vercel:minimax/minimax-m2.7',
      conversation_id: conversationId
    })
  })
  
  const data = await response.json()
  
  return c.json({
    output: data.output,
    conversationId: data.conversation_id,
    timestamp: Date.now(),
    status: 'success'
  })
})

export default app
```

### Check 5: muskox2's Zo Plan
- Zo Space should be available on their current plan
- API access should be included (it is on all plans for Zo Space)
- If still stuck, they might need to contact Zo support

---

## ✅ Success Checklist

- [ ] muskox2 has Zo API key (from settings)
- [ ] muskox2 set `ZO_API_KEY` environment variable
- [ ] muskox2 restarted Zo Space (or code auto-restarted)
- [ ] Health check passes: `curl https://muskox2.zo.space/health`
- [ ] API endpoint responds: `curl -X POST https://muskox2.zo.space/api/agentpay`
- [ ] Response includes `output` field
- [ ] Response includes `conversationId` field
- [ ] @MUSKOXNFTBOT can call endpoint successfully

---

## 🚀 Once Endpoint Works

1. @MUSKOXNFTBOT sends partnership proposal
2. muskox2's Zo agent receives it
3. Auto-responds with interest/questions
4. Negotiation loop continues
5. Partnership confirmed within 1 hour

---

**Status: ⏳ WAITING FOR muskox2 TO CONFIGURE API KEY**

Once they do, we're live! 🚀🦬
