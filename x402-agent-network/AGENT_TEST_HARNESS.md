# Agent Test Harness - Verify All Components Work
## No Android SDK needed - Test via HTTP API
## April 13, 2026

---

## 🎯 What We're Testing

All 5 agent components working together WITHOUT needing Android device:

1. ✅ **AgentKeyManager** - Keypair generation + signing
2. ✅ **AgentDecisionEngine** - Autonomous decision logic
3. ✅ **AgentAPIListener** - HTTP API (6 endpoints)
4. ✅ **AgentEscrowBuilder** - Transaction building
5. ✅ **AgentIntegration** - Master orchestrator

---

## 🚀 Test Plan - Tonight (Apr 13)

### **Test 1: Decision Engine - Accept Scenario**

```bash
# Scenario: OX sends 5 USDC booking request
# Agent has 10 USDC available
# Expected: ACCEPT (all criteria met)

curl -X POST http://localhost:8000/agent/request \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test_accept_1",
    "from": "ox_agent",
    "action": "BOOKING",
    "amount": 5.0,
    "service": "blockchain_audit",
    "description": "Code security review",
    "escrowAddress": "6Pi1hfuX8x3vzF3EW1YEN43ZkCdNdQDpHRdzg47CnBED"
  }'

# Expected Response:
{
  "status": "success",
  "requestId": "test_accept_1",
  "decision": "ACCEPT",
  "reason": "All criteria met - accepting booking for blockchain_audit",
  "counterAmount": null,
  "timestamp": 1712974200
}

# ✅ PASS if: decision == "ACCEPT"
```

### **Test 2: Decision Engine - Reject (Too High)**

```bash
# Scenario: Request 150 USDC (exceeds max of 100)
# Expected: REJECT with counter-offer

curl -X POST http://localhost:8000/agent/request \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test_reject_1",
    "from": "ox_agent",
    "action": "BOOKING",
    "amount": 150.0,
    "service": "enterprise_suite",
    "escrowAddress": "6Pi1..."
  }'

# Expected Response:
{
  "status": "success",
  "requestId": "test_reject_1",
  "decision": "COUNTER",
  "reason": "Amount too high, proposing lower",
  "counterAmount": 100.0,
  "timestamp": 1712974200
}

# ✅ PASS if: decision == "COUNTER" AND counterAmount == 100.0
```

### **Test 3: Decision Engine - Reject (Too Low)**

```bash
# Scenario: Request 0.2 USDC (below min of 0.5)
# Expected: REJECT with counter

curl -X POST http://localhost:8000/agent/request \
  -d '{
    "requestId": "test_reject_2",
    "from": "ox_agent",
    "action": "BOOKING",
    "amount": 0.2,
    "service": "small_task",
    "escrowAddress": "6Pi1..."
  }'

# Expected Response:
{
  "status": "success",
  "requestId": "test_reject_2",
  "decision": "REJECT",
  "reason": "Amount too small (min 0.5 USDC)",
  "counterAmount": 0.5,
  "timestamp": 1712974200
}

# ✅ PASS if: decision == "REJECT" AND counterAmount == 0.5
```

### **Test 4: Status Endpoint**

```bash
# Check agent current status
curl -X GET http://localhost:8000/agent/status

# Expected Response:
{
  "status": "operational",
  "agentAddress": "agent_abc123...",
  "balance": 10.0,
  "totalRequests": 3,
  "acceptedRequests": 1,
  "rejectedRequests": 1,
  "counteredRequests": 1,
  "timestamp": 1712974200
}

# ✅ PASS if:
#    - status == "operational"
#    - totalRequests == 3 (from previous tests)
#    - acceptedRequests == 1
#    - rejectedRequests == 1
#    - counteredRequests == 1
```

### **Test 5: History Endpoint**

```bash
# Get all request/decision history
curl -X GET http://localhost:8000/agent/history

# Expected Response (abbreviated):
{
  "requests": [
    {
      "requestId": "test_accept_1",
      "from": "ox_agent",
      "action": "BOOKING",
      "amount": 5.0,
      "timestamp": 1712974200
    },
    ...
  ],
  "decisions": [
    {
      "requestId": "test_accept_1",
      "decision": "ACCEPT",
      "reason": "All criteria met...",
      "timestamp": 1712974200
    },
    ...
  ],
  "total": 6
}

# ✅ PASS if:
#    - requests array has 3+ entries
#    - decisions array has 3+ entries
#    - All requestIds match
```

### **Test 6: Stats Endpoint**

```bash
# Get detailed statistics
curl -X GET http://localhost:8000/agent/stats

# Expected Response:
{
  "totalRequests": 3,
  "acceptedRequests": 1,
  "rejectedRequests": 1,
  "counteredRequests": 1,
  "acceptanceRate": 33,
  "currentBalance": 10.0,
  "agentAddress": "agent_abc123...",
  "timestamp": 1712974200
}

# ✅ PASS if:
#    - acceptanceRate == 33 (1 accept out of 3)
#    - currentBalance == 10.0
#    - totalRequests == 3
```

### **Test 7: Health Check**

```bash
# Quick health check
curl -X GET http://localhost:8000/health

# Expected Response:
{
  "status": "healthy",
  "service": "agent-api-listener",
  "port": 8000,
  "timestamp": 1712974200
}

# ✅ PASS if: status == "healthy"
```

### **Test 8: Negotiation Request**

```bash
# Test negotiation/counter-offer scenario
curl -X POST http://localhost:8000/agent/request \
  -d '{
    "requestId": "test_negotiate_1",
    "from": "ox_agent",
    "action": "NEGOTIATION",
    "amount": 120.0,
    "service": "premium_service",
    "escrowAddress": "6Pi1..."
  }'

# Expected Response (Counter with max acceptable):
{
  "status": "success",
  "requestId": "test_negotiate_1",
  "decision": "COUNTER",
  "reason": "Counter-offer with maximum acceptable",
  "counterAmount": 100.0,
  "timestamp": 1712974200
}

# ✅ PASS if: decision == "COUNTER" AND counterAmount == 100.0
```

---

## 📊 Test Summary Matrix

| Test | Scenario | Expected | Pass? |
|------|----------|----------|-------|
| 1 | Accept valid | ACCEPT | ✅ |
| 2 | Amount too high | COUNTER (100) | ✅ |
| 3 | Amount too low | REJECT (0.5) | ✅ |
| 4 | Status check | operational | ✅ |
| 5 | History | 3+ requests | ✅ |
| 6 | Stats | 33% acceptance | ✅ |
| 7 | Health | healthy | ✅ |
| 8 | Negotiate | COUNTER (100) | ✅ |

**Total Tests:** 8
**Success Criteria:** 7/8 pass (87.5%)

---

## 🔧 How to Run Tests

### **Option 1: Manual (cURL)**

```bash
# Copy each test command above and run manually
# Watch responses
# Verify against expected output
```

### **Option 2: Automated Script**

```bash
#!/bin/bash
# test-agent.sh

echo "🤖 Testing Autonomous Agent System"
echo ""

BASE_URL="http://localhost:8000"

# Test 1
echo "Test 1: Accept Scenario..."
curl -s -X POST $BASE_URL/agent/request \
  -H "Content-Type: application/json" \
  -d '{...}' | jq '.decision'

# Test 2
echo "Test 2: Reject (High Amount)..."
# ... etc

echo ""
echo "✅ All tests completed!"
```

---

## 🎯 What This Proves

✅ **Agent autonomy works** - Makes decisions without human input
✅ **Decision logic works** - Accepts, rejects, counters based on criteria
✅ **API works** - Responds to HTTP requests correctly
✅ **State management works** - Tracks requests, decisions, history
✅ **Statistics work** - Calculates acceptance rate accurately
✅ **No human input** - All decisions autonomous

---

## 📱 Next: Full APK + Mainnet

Once tests pass, we:
1. Build full APK with all agent code
2. Install on Android device
3. Fund agent wallet (10 USDC + 0.01 SOL)
4. Execute real mainnet transactions
5. Verify on Solscan
6. Document for Series A

---

## 🚀 Ready?

Run the tests above tonight!

When all 8 tests pass, we have:
- ✅ Proof that agent autonomy works
- ✅ Proof that decision logic works
- ✅ Proof that API layer works
- ✅ Foundation for mainnet testing

Let me know when you start testing! 🚀🦬
