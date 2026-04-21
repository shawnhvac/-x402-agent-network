# Mainnet Testing Execution Plan
## Real USDC Transactions on Solana Mainnet
## April 13, 2026 - 00:37 UTC

---

## 🎯 Mainnet Testing Objective

**Goal:** Execute 5+ real USDC transactions autonomously, verify on Solscan

**Participants:**
- 🤖 **Android App Agent** (in APK on phone)
- 🤖 **OX Agent** (server, coordinator)
- 🤖 **muskox2 Agent** (support/validation)
- 👤 **Shawn** (founder, capital provider)

**Result:** Proof that agent-to-agent commerce works on mainnet

---

## 💰 Wallet Funding Requirements

### **Android Agent Wallet**
- Address: `[To be generated on first run]`
- Fund: **10 USDC + 0.01 SOL** (~$11.50 total)
- Purpose: Pay for test bookings

### **OX Agent Wallet**
- Address: `ox_agent_mainnet_address`
- Fund: **10 USDC + 0.01 SOL** (~$11.50 total)
- Purpose: Counter-bookings, payment validation

### **muskox2 Agent Wallet (Optional)**
- Address: `muskox2_mainnet_address`
- Fund: **5 USDC + 0.005 SOL** (~$5.75 total)
- Purpose: Additional test transactions

**Total Cost:** ~$28.75 USDC + 0.025 SOL (~$38 value)

---

## 📋 Step-by-Step Mainnet Testing

### **Step 1: Get Android Agent Address (Day 1)**

```bash
# When you first run the Android app:
# 1. Open AgentPay app
# 2. Agent initializes
# 3. AgentKeyManager generates keypair
# 4. Public address printed in logs:

adb logcat | grep "AgentKeyManager"
# Output: ✅ Agent keypair generated successfully
#         Address: agent_abc123def456xyz...

# Save this address: agent_abc123def456xyz
```

**Example Output:**
```
[AgentKeyManager] ✅ Agent keypair generated successfully
[AgentKeyManager]    Address: agent_5f3c7e2a9b1d4k6m8n
[AgentKeyManager]    Private key stored in Android Keystore (hardware-backed)
```

### **Step 2: Fund Wallets (Day 1)**

**Method A: Direct Transfer from Your Wallet**
```bash
# Using Phantom or Solflare:

1. Open Phantom wallet
2. Copy Android agent address: agent_5f3c7e2a9b1d4k6m8n
3. Send 10 USDC (EPjFWaLb3oDHxQDkpR7T8Y3a6jRMwKKKKwRMwM8Q5rRb)
4. Confirm transaction
5. Wait for confirmation (~30 seconds)
6. Android agent now has 10 USDC available

# Verify on Solscan:
https://solscan.io/address/agent_5f3c7e2a9b1d4k6m8n
```

**Method B: Using AgentPay Top-Up**
```kotlin
// In Android app:
agent.updateBalance(10.0)  // Tell agent about funded amount
```

### **Step 3: Start Agent (Day 1 Evening)**

```bash
# On Android device:
1. Open AgentPay app
2. Tap "Settings" → "Enable Agent Mode"
3. Agent initializes all components
4. HTTP server starts on port 8000
5. Watch logs for:

[AgentIntegration] 🤖 Initializing autonomous agent...
[AgentKeyManager] ✅ KeyManager initialized
[AgentDecisionEngine] ✅ DecisionEngine initialized
[AgentEscrowBuilder] ✅ EscrowBuilder initialized
[AgentAPIListener] ✅ APIListener initialized
[AgentIntegration] ✅ Agent initialization complete!

[AgentAPIListener] 🌐 Starting agent API listener on port 8000...
[AgentAPIListener] ✅ Agent API listener started successfully
[AgentAPIListener]    Endpoints ready:
[AgentAPIListener]    POST http://localhost:8000/agent/request
[AgentAPIListener]    GET  http://localhost:8000/agent/status
```

### **Step 4: Test 1 - Mock Request (Day 1 Night)**

```bash
# From OX coordinator (can be your laptop):
curl -X POST http://[android-phone-ip]:8000/agent/request \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test_1",
    "from": "ox_test",
    "action": "BOOKING",
    "amount": 0.5,
    "service": "test_service",
    "description": "Mock test transaction",
    "escrowAddress": "6Pi1hfuX8x3vzF3EW1YEN43ZkCdNdQDpHRdzg47CnBED"
  }'

# Expected response:
# {
#   "status": "success",
#   "requestId": "test_1",
#   "decision": "ACCEPT",
#   "reason": "All criteria met - accepting booking for test_service",
#   "timestamp": 1712974200
# }

# Check logs for:
[AgentAPIListener] 📨 Received request: ...
[AgentDecisionEngine] 🤔 Analyzing request test_1...
[AgentDecisionEngine] ✅ Decision made: ACCEPT
```

### **Step 5: Check Status (Day 2 Morning)**

```bash
curl http://[android-phone-ip]:8000/agent/status

# Expected response:
{
  "status": "operational",
  "agentAddress": "agent_5f3c7e2a9b1d4k6m8n",
  "balance": 10.0,
  "totalRequests": 1,
  "acceptedRequests": 1,
  "rejectedRequests": 0,
  "counteredRequests": 0,
  "timestamp": 1712974200
}
```

### **Step 6: Real Test 1 - OX Books Android (Day 2)**

```bash
# OX coordinator sends real booking request:
curl -X POST http://[android-ip]:8000/agent/request \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "real_tx_1",
    "from": "ox_agent",
    "action": "BOOKING",
    "amount": 5.0,
    "service": "blockchain_audit",
    "description": "Code review and security audit",
    "escrowAddress": "6Pi1hfuX8x3vzF3EW1YEN43ZkCdNdQDpHRdzg47CnBED"
  }'

# Android agent responds:
{
  "status": "success",
  "requestId": "real_tx_1",
  "decision": "ACCEPT",
  "reason": "All criteria met",
  "timestamp": 1712974200
}

# Watch logs:
[AgentDecisionEngine] 📋 Handling BOOKING request...
[AgentDecisionEngine] ✅ Decision made: ACCEPT
[AgentAPIListener] ✅ Sent response: {"status":"success",...}
```

### **Step 7: Execute Transaction (Day 2)**

```bash
# OX sends execute request with transaction bytes:
curl -X POST http://[android-ip]:8000/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "real_tx_1",
    "transaction": "hex_encoded_bytes_here..."
  }'

# Android agent:
# 1. EscrowBuilder.buildEscrowLockTransaction()
# 2. AgentKeyManager.signTransaction() (AUTONOMOUS - no human!)
# 3. EscrowBuilder.submitEscrowTransaction() → Solana RPC
# 4. EscrowBuilder.confirmTransaction() → polling
# 5. Returns TX hash when confirmed

# Response:
{
  "status": "executed",
  "requestId": "real_tx_1",
  "transactionHash": "4xHz7k9m2p5q8r1s4t7u0v3w6x9y2z5a8b1c4d7e0f3g6h9i2j5k8l1",
  "timestamp": 1712974200
}

# Watch logs:
[AgentEscrowBuilder] 🔒 Building escrow lock transaction...
[AgentEscrowBuilder] ✅ Escrow built
[AgentEscrowBuilder] ✍️ Signing escrow transaction...
[AgentEscrowBuilder] ✅ Transaction signed successfully
[AgentEscrowBuilder] 📤 Submitting transaction to Solana RPC...
[AgentEscrowBuilder] ✅ Transaction submitted to Solana
[AgentEscrowBuilder]    TX Hash: 4xHz...
[AgentEscrowBuilder] ⏳ Confirming transaction...
[AgentEscrowBuilder] ✅ Transaction confirmed!
[AgentEscrowBuilder] ✅ EXECUTION COMPLETE!
[AgentEscrowBuilder]    Amount locked: 5.0 USDC
```

### **Step 8: Verify on Solscan (Day 2 Afternoon)**

```bash
# Open browser:
https://solscan.io/tx/4xHz7k9m2p5q8r1s4t7u0v3w6x9y2z5a8b1c4d7e0f3g6h9i2j5k8l1

# Verify:
✅ Transaction: CONFIRMED (green checkmark)
✅ Timestamp: 2026-04-13 00:45:30 UTC
✅ From: agent_5f3c7e2a9b1d4k6m8n (Android agent)
✅ Program: SmartEscrow contract
✅ Instruction: InitializeEscrow
✅ Amount: 5 USDC (5000000 lamports)
✅ Status: SUCCESS (100% confirmed blocks)

# Screenshot this for Series A deck!
```

### **Step 9: Real Test 2-5 (Days 2-3)**

Repeat Tests 1-8 with different parameters:

**Test 2: muskox2 Books Android**
```bash
curl -X POST http://[android-ip]:8000/agent/request \
  -d '{
    "from": "muskox2_agent",
    "amount": 3.0,
    "service": "integration_testing"
  }'
# Expect: ACCEPT → Execute → Confirmed on Solscan
# TX: [hash_2]
```

**Test 3: Android Initiates (Auto-Request)**
```bash
# Android agent autonomously sends request to OX
# Android: "I have capacity, offer 2 USDC for work"
# OX: ACCEPT
# Result: 2 USDC locked, TX on Solscan
# TX: [hash_3]
```

**Test 4: Higher Amount**
```bash
# Test with 7.5 USDC (near limits)
# Verify agent counters or accepts
# Confirm on Solscan
# TX: [hash_4]
```

**Test 5: Reject Scenario**
```bash
# Send request for 150 USDC (exceeds max)
# Agent responds: REJECT
# Check /agent/status shows rejection count
# No TX on Solscan (expected - rejected)
```

---

## 📊 Expected Results Summary

| Test | Requester | Amount | Expected | TX Hash | Solscan |
|------|-----------|--------|----------|---------|---------|
| 1 | OX | 5.0 | ACCEPT | 4xHz... | ✅ CONFIRMED |
| 2 | muskox2 | 3.0 | ACCEPT | 5yIa... | ✅ CONFIRMED |
| 3 | Android | 2.0 | ACCEPT | 6zJb... | ✅ CONFIRMED |
| 4 | OX | 7.5 | ACCEPT | 7aKc... | ✅ CONFIRMED |
| 5 | OX | 150 | REJECT | N/A | N/A |

**Total USDC Locked:** 17.5 USDC (all on blockchain)
**Failed Requests:** 1 (150 USDC rejected)
**Success Rate:** 80% (4/5)

---

## 🎥 Series A Documentation

**Screenshots to Collect:**

1. **Android Logs** — Agent initialization
2. **Status Endpoint** — Shows balance + requests
3. **curl Request** — Shows booking request sent
4. **curl Response** — Shows ACCEPT decision
5. **Execute Request** — Shows transaction execution
6. **Solscan TX 1** — First transaction confirmed
7. **Solscan TX 2** — Second transaction confirmed
8. **Solscan TX 3** — Third transaction confirmed
9. **Solscan TX 4** — Fourth transaction confirmed
10. **Solscan Summary** — All 4 TXs on blockchain

**Narrative for Investors:**

"Here's an autonomous agent embedded in an Android app. When it receives a booking request, it:
1. Autonomously makes a decision
2. Autonomously signs a transaction with its private key
3. Autonomously submits to Solana mainnet
4. Autonomously confirms on blockchain

No human touched anything. All verifiable here on Solscan. This is agent-to-agent commerce in production."

---

## ⏰ Timeline

| Date | Task | Status |
|------|------|--------|
| Apr 13 | Wallet funding | ⏳ TODAY |
| Apr 13 | Agent initialization | ⏳ TODAY |
| Apr 13 | Mock testing | ⏳ TONIGHT |
| Apr 14 | Real Test 1-2 | ⏳ TOMORROW |
| Apr 14 | Real Test 3-5 | ⏳ TOMORROW |
| Apr 14 | Solscan verification | ⏳ TOMORROW |
| Apr 15 | Documentation | ⏳ WED |
| Apr 16 | Series A prep | ⏳ THU |
| Apr 18 | Investor demos | ⏳ SAT |

---

## 🚀 What This Proves

✅ **Agent Autonomy** — No human clicks during transaction
✅ **SmartEscrow Works** — USDC locked/released autonomously
✅ **Blockchain Integration** — Real Solana mainnet transactions
✅ **x402 Protocol** — Agent-to-agent negotiation works
✅ **Production Ready** — All on mainnet, immutable
✅ **Scalable** — Multiple agents, multiple transactions
✅ **Verifiable** — All on Solscan, timestamped, signed

**= $5M Series A Series A Proof of Concept**

---

## 💡 Tips for Success

1. **Network:** Ensure Android phone on same WiFi as OX coordinator
2. **Firewall:** Open port 8000 on Android (or use ngrok for tunneling)
3. **Balance:** Update agent.updateBalance() with actual funded amount
4. **Logging:** Enable verbose logging to see all steps
5. **Solscan:** Check real-time, transactions appear within 30 seconds
6. **Screenshots:** Document everything for investor deck
7. **Timing:** Do tests during UTC daytime for support if issues

---

## 🔗 Useful Links

**Solscan:** https://solscan.io
**Phantom Wallet:** https://phantom.app
**Solflare:** https://solflare.com
**SmartEscrow Program:** https://solscan.io/account/6Pi1hfuX8x3vzF3EW1YEN43ZkCdNdQDpHRdzg47CnBED
**AgentPay Repo:** https://github.com/shawnhvac/-x402-agent-network

---

**Status: Ready to begin mainnet testing!** 🚀🦬

Let's prove agent commerce works!
