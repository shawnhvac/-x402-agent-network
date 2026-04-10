# AgentPay Test Flow - Data Feed Agent ($1.00 USDC)

**Date:** April 6, 2026, 13:27 UTC  
**Test:** Data Feed Agent payment processing  
**Amount:** $1.00 USDC  
**Wallet:** 6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG

---

## TEST FLOW

### Step 1: Make Request to Data Feed Agent
**Endpoint:** `http://localhost:3001/data-feed`

**Request Headers:**
```
X-Requester-Wallet: 6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG
Content-Type: application/json
```

**Request Body:**
```json
{
  "symbols": ["BTC/USD", "ETH/USD", "SOL/USD"],
  "history_length": 10
}
```

**Expected Response (First attempt - will get HTTP 402):**
```json
{
  "status": 402,
  "message": "Payment Required",
  "cost_usdc": 0.01,
  "quota_remaining": 0,
  "payment_required": true,
  "payment_address": "TREASURY_ADDRESS",
  "agent_id": "data-feed"
}
```

---

### Step 2: You Send Payment ($1.00 USDC to Treasury)

**Treasury Address:** (will be shown in 402 response)

**What to send:**
- Amount: 1.00 USDC
- To: Treasury wallet (from response)
- Network: Solana
- Your wallet: 6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG

**Tools to use:**
- Phantom Wallet (easiest)
- Solflare
- Magic Eden Wallet
- Any Solana wallet

---

### Step 3: Provide Transaction Hash

Once you send USDC, you'll get a transaction hash. Send it to me and I'll:

1. Verify payment on-chain
2. Update your quota (100 free data points)
3. Return your data

---

### Step 4: Execute Agent Request

Once payment is verified, make the same request again:

**Request:**
```bash
curl -X POST http://localhost:3001/data-feed \
  -H "X-Requester-Wallet: 6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG" \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["BTC/USD", "ETH/USD", "SOL/USD"],
    "history_length": 10
  }'
```

**Success Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "BTC/USD": [
      {"timestamp": "2026-04-06T13:20:00Z", "price": 69595.90},
      {"timestamp": "2026-04-06T13:15:00Z", "price": 69450.20},
      ...
    ],
    "ETH/USD": [
      {"timestamp": "2026-04-06T13:20:00Z", "price": 2150.92},
      ...
    ],
    "SOL/USD": [
      ...
    ]
  },
  "cost_usdc": 0.01,
  "quota_remaining": 99
}
```

---

## THE PAYMENT FLOW (What's happening)

1. **Request Made** → Agent checks if you have quota
2. **Quota Check** → You have 0 free calls (new wallet)
3. **Payment Required** → Returns HTTP 402 with cost ($0.01)
4. **You Pay USDC** → Send $1.00 to treasury (100 calls worth)
5. **Payment Verified** → I confirm transaction on-chain
6. **Quota Updated** → Your wallet now has 100 calls
7. **Agent Executes** → Returns real-time data
8. **Quota Decremented** → Now you have 99 calls left

---

## YOUR $1.00 GETS YOU

✅ 100 Data Feed queries  
✅ Each query = BTC/ETH/SOL price history  
✅ Can use all 100, or save for later  
✅ Quota tied to your wallet address

---

## WHAT I NEED FROM YOU

1. ✅ Wallet address: **6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG** (provided)
2. ⏳ Send $1.00 USDC to Treasury (I'll show you the address)
3. ⏳ Provide transaction hash after payment
4. ⏳ I verify payment on-chain
5. ⏳ You execute agent request
6. ⏳ Get real-time data back

---

## WHAT THIS PROVES

✅ HTTP 402 Payment Required works  
✅ On-chain payment verification works  
✅ Quota system works  
✅ Agent executes after payment  
✅ AgentPay infrastructure is production-ready

---

**READY TO TEST?**

Next step: Show you the Treasury address to send the $1.00 USDC to.

---

*Test Setup: April 6, 2026, 13:27 UTC*  
*Status: Ready for payment*
