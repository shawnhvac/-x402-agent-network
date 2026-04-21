# Week 2: Bazaar Registration ($0.001 Payment)

**Objective:** Make a single x402 payment to trigger auto-registration with Bazaar

**Timeline:** 1 day to execute + 5-10 minutes for Bazaar to catalog

---

## WHAT THIS DOES

One x402 payment of **$0.001** to AgentPay triggers:
1. CDP facilitator validates payment
2. Facilitator catalogs AgentPay endpoints
3. AgentPay auto-registers with Bazaar
4. Agents can now discover AgentPay via Bazaar API

---

## PREREQUISITES

**Before you can register, you need:**

1. ✅ x402 middleware live (Week 1 complete)
2. ✅ AgentPay API responding on public URL (agentpay.com)
3. ✅ EVM wallet with ETH for gas fees
4. ✅ x402 client library (for making payments)

**Check your setup:**
```bash
# Verify API is running
curl https://agentpay.com/api/v1/search -X POST \
  -H "Content-Type: application/json" \
  -d '{"category":"test","location":"test"}'

# Should respond with 402 (needs payment) or 200 (if already paid once)
```

---

## REGISTRATION PAYMENT PROCESS

### Step 1: Prepare Environment

Create `.env` in project root with:

```bash
# EVM wallet private key (KEEP SECRET)
EVM_PRIVATE_KEY=0x... (your private key, 64 hex chars)

# AgentPay wallet to receive payment
AGENTPAY_WALLET=0x... (your receiving address)

# API URL
AGENTPAY_API_URL=https://agentpay.com
```

### Step 2: Run Registration Script

```bash
# Install dependencies if needed
npm install ethers node-fetch

# Run registration
npx ts-node scripts/bazaar-register.ts
```

**Expected output:**
```
🔗 BAZAAR REGISTRATION PAYMENT
================================

📝 Configuration:
   API URL: https://agentpay.com
   Recipient: 0x...
   Payer wallet: 0x...

✅ Wallet loaded: 0x...

🔐 Building x402 payment request...
✅ Signature generated: 0x...

💳 Making x402 payment to /api/v1/search...
   Amount: $0.001
   To: 0x...

✅ Payment request accepted
   Status: 402
   Response: {"status": "payment_required", "message": "x402 payment needed"}

🎉 REGISTRATION TRIGGERED!

📋 Next steps:
   1. Wait 5-10 minutes for facilitator to catalog endpoints
   2. Query Bazaar to verify registration...
```

---

## VERIFY REGISTRATION (5-10 minutes later)

After the payment is confirmed, check if AgentPay is registered:

```bash
# Query Bazaar for registered services
curl "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?type=service" | jq

# Look for AgentPay endpoints in response
```

**Expected response:**
```json
{
  "items": [
    {
      "resource": "https://agentpay.com/api/v1/search",
      "type": "http",
      "x402Version": "2",
      "accepts": [
        {
          "scheme": "exact",
          "price": "$0.001",
          "network": "eip155:1"
        }
      ],
      "metadata": {
        "input": {
          "schema": {
            "properties": {
              "category": {"type": "string"},
              "location": {"type": "string"},
              "date": {"type": "string"}
            }
          }
        },
        "output": {
          "schema": {
            "properties": {
              "services": {"type": "array"}
            }
          }
        }
      }
    },
    {
      "resource": "https://agentpay.com/api/v1/book",
      "accepts": [{"scheme": "exact", "price": "$0.002"}],
      ...
    },
    {
      "resource": "https://agentpay.com/api/v1/pay",
      "accepts": [{"scheme": "exact", "price": "$0.001"}],
      ...
    }
  ]
}
```

If you see all 3 endpoints (/search, /book, /pay), registration was successful! ✅

---

## TROUBLESHOOTING

### "Payment request failed" (Status 500+)
- Check AgentPay API is running
- Verify URL is correct and publicly accessible
- Check middleware is loaded in app.ts

### "Endpoints not showing in Bazaar" (after 10+ min)
- Payment may not have been confirmed
- Check transaction hash in facilitator logs
- Try making payment again

### "Transaction reverted" / Gas error
- Ensure wallet has enough ETH for gas fees
- Gas price on Ethereum mainnet may be high
- Wait for lower gas periods or use testnet first

---

## TESTING ON TESTNET (Optional)

Before mainnet registration, test on Ethereum Sepolia testnet:

1. Switch network in middleware:
   ```typescript
   network: "eip155:11155111" // Sepolia
   ```

2. Get testnet ETH from faucet:
   - https://www.alchemy.com/faucets/ethereum-sepolia

3. Make test payment to Sepolia Bazaar:
   ```
   https://api.cdp.coinbase.com/platform/v2/x402/facilitator?network=sepolia
   ```

4. Verify registration on Sepolia:
   ```
   https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?network=sepolia&type=service
   ```

---

## COST BREAKDOWN

**Week 2 Registration Cost:**

| Item | Cost |
|------|------|
| x402 payment to /search | $0.001 |
| Ethereum gas (estimate) | $5-20 (depends on network congestion) |
| **Total** | **~$5-20** |

This is a one-time cost. After this, you earn money on every transaction.

---

## WHAT HAPPENS NEXT (Week 3+)

Once registered with Bazaar:

1. **Agents discover AgentPay** via Bazaar API
2. **Agents make autonomous payments** to your endpoints
3. **You earn per transaction:**
   - $0.0005 per search query (50% of $0.001 fee)
   - $0.002 per booking (100% of $0.002 fee)
   - 2-3% of service price

4. **Scale happens automatically** - no manual integrations needed

---

## CHECKLIST

- [ ] EVM wallet created with ETH balance
- [ ] Private key stored in .env securely
- [ ] AgentPay API deployed and responding
- [ ] x402 middleware verified running
- [ ] Registration script tested
- [ ] Payment made to /api/v1/search
- [ ] Bazaar registration verified (all 3 endpoints visible)
- [ ] Ready for Week 3 (agent SDK integration)

---

**Status:** Ready to execute Week 2

**Next:** Make the $0.001 payment → Wait for Bazaar to catalog → Verify registration
