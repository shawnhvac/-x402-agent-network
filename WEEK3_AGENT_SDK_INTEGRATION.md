# Week 3: Agent SDK Integration (ChatGPT + Claude)

**Objective:** Deploy AgentPay to major AI agent platforms for autonomous discovery and booking

**Timeline:** 2-3 weeks total

---

## OVERVIEW

**What this does:**
- Agents (ChatGPT, Claude, Grok, etc.) discover AgentPay via plugin/MCP
- Agents search services autonomously
- Agents book appointments without human intervention
- Agents make payments via x402 protocol

**Result:** Any major LLM can use AgentPay without integration work

---

## CREATED THIS SESSION

### 1. OpenAI ChatGPT Plugin ✅
**File:** `public/.well-known/openai-gpt-plugin.json`

- Plugin manifest for ChatGPT marketplace
- Defines 3 operations: search, book, pay
- Auth: none (x402 handles payment verification)
- Logo, description, contact info included

**To deploy:**
1. Ensure domain is live (agentpay.com)
2. Submit to OpenAI plugin marketplace
3. Wait for approval (~1-2 weeks)

### 2. OpenAPI Specification ✅
**File:** `public/openapi.json`

- Complete API documentation for agents
- 3 endpoints: /search, /book, /pay
- Request/response schemas with examples
- x402 payment requirements documented
- Ready for ChatGPT + Swagger UI

**Features:**
- Consequential operations marked (booking, payment)
- Full error handling (402 payment required)
- Type-safe schemas for agent integration

### 3. Claude MCP Server ✅
**File:** `src/mcp-server.ts`

- Model Context Protocol implementation
- 3 tools: search_services, book_service, pay_for_service
- Stdio transport (Claude Desktop, Cursor compatible)
- Fully async with error handling

**To use:**
```bash
node dist/mcp-server.js
```

**Connect in Claude Desktop:**
```json
{
  "mcpServers": {
    "agentpay": {
      "command": "node",
      "args": ["/path/to/dist/mcp-server.js"],
      "env": {
        "AGENTPAY_API_URL": "https://agentpay.com"
      }
    }
  }
}
```

---

## DEPLOYMENT CHECKLIST

### Phase 1: Foundation (This week)
- [ ] Build AgentPay API to live domain (agentpay.com)
- [ ] Verify endpoints responding:
  - [ ] POST /api/v1/search
  - [ ] POST /api/v1/book
  - [ ] POST /api/v1/pay
- [ ] Verify OpenAPI spec at /openapi.json
- [ ] Test locally with curl

### Phase 2: ChatGPT Plugin (Week 3-4)
- [ ] Deploy to production
- [ ] Test plugin manifest loads correctly
- [ ] Submit to OpenAI plugin marketplace
  - Go to https://platform.openai.com/plugins
  - Create new plugin
  - Submit openapi-gpt-plugin.json manifest
  - Submit openapi.json spec
- [ ] Wait for approval (~1-2 weeks)
- [ ] Publish plugin to ChatGPT store

### Phase 3: Claude MCP (Week 3)
- [ ] Build TypeScript: `npm run build`
- [ ] Start MCP server: `node dist/mcp-server.js`
- [ ] Connect in Claude Desktop settings:
  ```json
  {
    "mcpServers": {
      "agentpay": {
        "command": "node",
        "args": ["/path/to/x402-agent-network/dist/mcp-server.js"]
      }
    }
  }
  ```
- [ ] Test in Claude Desktop
- [ ] Publish to MCP registry (optional)

### Phase 4: Additional Platforms (Week 4+)
- [ ] Gemini (Google) - Similar to ChatGPT plugin
- [ ] Grok (X/xAI) - Custom integration
- [ ] Anthropic Claude (via MCP)
- [ ] Microsoft Copilot - OpenAPI submission

---

## LOCAL TESTING

### Test ChatGPT Plugin Locally

```bash
# 1. Build project
npm run build

# 2. Start server
npm start

# 3. In ChatGPT (if you have plugin developer access):
# - Go to Plugin development
# - Add custom plugin
# - Point to http://localhost:3001/.well-known/openai-gpt-plugin.json
```

### Test Claude MCP Locally

```bash
# 1. Build MCP server
npm run build

# 2. Start server (will print ready message)
node dist/mcp-server.js

# 3. In Claude Desktop:
# - Settings → Developer → Enable Claude Dev
# - Add MCP server to settings
# - Command: node /path/to/dist/mcp-server.js
# - Restart Claude

# 4. In conversation:
# - Type @agentpay
# - Should see 3 tools: search_services, book_service, pay_for_service
```

---

## INTEGRATION EXAMPLES

### ChatGPT User Story
```
User: "Book me a haircut near me for tomorrow afternoon"

ChatGPT:
1. Uses AgentPay plugin
2. Calls search_services("salon", "Current Location")
3. Gets list of salons with prices + availability
4. Presents options to user
5. User: "Sally's Salon, 2pm"
6. Calls book_service() with selected time
7. Calls pay_for_service() with x402 payment
8. Confirmation: "Haircut booked tomorrow at 2pm!"
```

### Claude User Story
```
User: "I need to find and book a restaurant reservation"

Claude:
1. Uses AgentPay MCP tool
2. Calls search_services("restaurant", "San Francisco")
3. Reviews results with agent reasoning
4. Books best match via book_service()
5. Processes payment via pay_for_service()
6. Provides confirmation and next steps

Claude can also:
- Compare prices across providers
- Suggest best options based on preferences
- Check reviews from multiple sources
- Negotiate via agent-to-agent APIs
```

---

## PLUGIN MARKETPLACE SUBMISSION

### OpenAI ChatGPT Plugin Store

1. **Prerequisites:**
   - Live domain (agentpay.com) ✅
   - OpenAI account
   - Plugin published as public

2. **Submission Steps:**
   - Go to https://platform.openai.com/account/plugin-dashboard
   - Click "Create Plugin"
   - Fill in details:
     - Name: "AgentPay"
     - Description: "Autonomous service booking with x402 payments"
     - Plugin URL: https://agentpay.com
   - Upload manifest (openai-gpt-plugin.json)
   - Upload OpenAPI spec (openapi.json)
   - Submit for review

3. **Review Timeline:**
   - Automated checks: 1-2 hours
   - Human review: 5-10 business days
   - Approval notification via email
   - Listed in ChatGPT plugin store

4. **After Approval:**
   - Plugin appears in ChatGPT marketplace
   - Users can install automatically
   - Agents can discover via plugin listing

---

## REVENUE STREAMS (Week 3+)

### Discovery Monetization
```
Scenario: ChatGPT user searches for services

1. User: "Find me a salon"
2. ChatGPT calls /api/v1/search
   - Requires x402 payment: $0.001
   - Paid by: ChatGPT/OpenAI account or user
   
3. AgentPay receives: $0.001
   - 50% to facilitator: $0.0005
   - 50% to AgentPay: $0.0005

Per 1000 searches: $0.50 revenue
```

### Booking Monetization
```
Scenario: ChatGPT user books service

1. ChatGPT calls /api/v1/book
   - x402 payment: $0.002
   
2. ChatGPT calls /api/v1/pay
   - x402 payment: $0.001
   - Service price: $50 (2-3% fee = $1-1.50)

Total per booking: $1.00-1.50

Per 1000 bookings: $1000-1500 revenue
```

---

## SUCCESS METRICS (Week 3)

Track these once deployed:

1. **Plugin Discovery**
   - ChatGPT plugin store listing
   - MCP registry inclusion
   - Total agents with access

2. **API Usage**
   - Searches per day
   - Bookings per day
   - Payment volume

3. **Revenue**
   - x402 fees collected
   - Service fees collected
   - Total MRR

4. **User Acquisition**
   - ChatGPT users discovering AgentPay
   - Claude users using MCP
   - Cross-platform agents

---

## TIMELINE

| Phase | Tasks | Duration |
|-------|-------|----------|
| **1** | Build live API | This week |
| **2** | ChatGPT plugin submission | 1 week |
| **3** | Claude MCP setup | 1 week |
| **4** | Plugin approval + launch | 2-3 weeks |
| **5** | Additional platforms | 2+ weeks |

**Total to full deployment:** 6-8 weeks

---

## FILES CREATED THIS SESSION

1. **public/.well-known/openai-gpt-plugin.json** (984 bytes)
   - ChatGPT plugin manifest

2. **public/openapi.json** (8.5 KB)
   - Complete API specification

3. **src/mcp-server.ts** (7.6 KB)
   - Claude MCP implementation

4. **WEEK3_AGENT_SDK_INTEGRATION.md** (This file)
   - Complete deployment guide

---

## NEXT STEPS

**Immediate (This week):**
1. Deploy API to live domain
2. Verify all 3 endpoints responding
3. Test with curl/Postman

**Next week:**
1. Submit ChatGPT plugin
2. Deploy MCP server
3. Connect in Claude Desktop

**Week after:**
1. Monitor plugin approval
2. Scale infrastructure
3. Start collecting metrics

---

**Status:** Week 3 SDKs ready for deployment

**Blockers:** agentpay.com API must be live and responding

**Next:** Deploy API, then submit plugins
