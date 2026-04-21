# WEEK 1: x402 Agent Network - Foundation Build

## Status: DAYS 1-2 COMPLETE ✅

### What's Ready

- ✅ Express app setup
- ✅ x402 middleware (HTTP 402 Payment Required implementation)
- ✅ AgentSpec.ts interface
- ✅ Basic quota system
- ✅ Project structure

### Deliverables This Session

```
x402-agent-network/
├── src/
│   ├── app.ts                 (Main Express app)
│   ├── AgentSpec.ts          (Universal agent interface)
│   ├── middleware/
│   │   └── x402.ts          (HTTP 402 middleware)
│   ├── routes/              (Coming Days 3-4)
│   ├── agents/              (Coming Days 5-7)
│   └── treasury/            (Coming Days 5-7)
├── .env.example
├── package.json
├── tsconfig.json
└── WEEK1_README.md
```

### Test Basic 402 Flow

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Test basic endpoint (in another terminal)
curl -X POST http://localhost:3001/api/agent/execute \
  -H "Content-Type: application/json" \
  -H "X-Requester-Wallet: 0x1234567890123456789012345678901234567890" \
  -d '{"agentId": "test"}'

# Expected response (first 10 calls are free):
# {
#   "success": true,
#   "executionId": "exec-1234567890",
#   "outcome": "quota_available",
#   "remaining": 9,
#   "timestamp": "2026-04-06T00:35:00Z"
# }

# 4. Use up quota (call 11th time to trigger 402)
curl -X POST http://localhost:3001/api/agent/execute \
  -H "Content-Type: application/json" \
  -H "X-Requester-Wallet: 0x1111111111111111111111111111111111111111" \
  -d '{"agentId": "test"}' \
  --repeat 11 # Call 11 times from different wallet

# Last call should return HTTP 402:
# {
#   "requiresPayment": true,
#   "requestId": "req-1234...",
#   "price": "0.10",
#   "currency": "USDC",
#   "chainId": 1,
#   "paymentAddress": "0x...",
#   "merchantName": "MUSKOX Agent Network",
#   "reason": "quota_exceeded",
#   "nextSteps": "Send 0.10 USDC to 0x... then retry with X-Payment-TxHash header",
#   "expectedConfirmationTime": 30,
#   "docLink": "https://docs.agents.muskox.io/x402"
# }
```

### Next: DAYS 3-4 (Agent Registry)

- [ ] Set up PostgreSQL database
- [ ] Create agents + payments tables
- [ ] Build `/agents/register` endpoint
- [ ] Build `/agents` query endpoints
- [ ] Move quota system to database

### Then: DAYS 5-7 (Demo Agents)

- [ ] Grid Trader agent (x402-protected)
- [ ] Sniper Bot agent (x402-protected)
- [ ] Register both in repository
- [ ] Full end-to-end test

---

**Status:** Foundation laid. Ready to continue!

🦬 Let's build the infrastructure layer.
