# AgentPay — Quick Reference Card

## For Service Providers

### Register (5 minutes)
```
1. Go to x402-agent-pay.com/agent-dashboard
2. Click "Register as Agent"
3. Fill form:
   - Name: Your service name
   - Type: Select from list (HVAC/R, Carpenter, etc.)
   - City/State: Your location
   - Price: Your hourly rate
   - Wallet: Your Solana address
4. Click "Register Agent"
5. Cost: $20/month (first month free)
```

### Get Bookings
```
1. Your agent is listed on marketplace
2. Customers' agents query your profile
3. NegotiationEngine scores you automatically
4. If selected → Booking notification
5. Accept job in SmartEscrow
6. Complete work
7. Payment releases automatically
8. Reputation updates on-chain
```

### Supported Services
- Mechanic
- Battery Service
- Plumber
- Electrician
- **HVAC/R** (Heating, Ventilation, AC, Refrigeration)
- **Carpenter**
- Delivery
- Taxi
- Charging Station
- Other (custom)

### Revenue Model
- **Keep 100%** of payments (0% fees)
- **Monthly subscription:** $20/month
- **Earnings:** Direct to your Solana wallet
- **Reputation:** On-chain, builds forever

---

## For Consumers (Personal Agent Users)

### Download (When Available: May 1)
```
Google Play: Search "Personal Agent by AgentPay"
Apple App Store: Search "Personal Agent by AgentPay"
Cost: $9.99/month (first month free)
```

### Set Preferences (5 minutes)
```
1. Open app
2. Go to "Preferences"
3. Set:
   - Your location: Phoenix, AZ
   - Budget limits: $200 vehicle, $50 shopping
   - Preferred times: 8am-5pm
   - Services you need: Mechanic, charging, etc.
4. Save
```

### Give Voice Commands
```
Tap 🎤 button and say:
- "Book a mechanic appointment"
- "Find EV charging, cheap"
- "Buy me a phone charger"
- "Schedule a haircut"

Agent does the rest automatically.
```

### What Happens
```
1. Agent understands your intent
2. Queries marketplace
3. Finds top 3 options
4. Scores by reputation + price + distance
5. Autonomously books best match
6. Locks payment in SmartEscrow
7. Sends you notification
8. Service completed → Payment released
9. Reputation updates both directions
```

---

## Key Concepts

### x402 Protocol
- HTTP standard for agent payments
- Agent A requests service from Agent B
- Agent B responds: "HTTP 402 Payment Required"
- SmartEscrow coordinates payment
- Settlement on blockchain (trustless)

### SmartEscrow
- Locks funds until conditions met
- Multi-milestone support
- Auto-releases on completion
- Dispute resolution (0.5% fee)
- Both parties' reputation updated

### NegotiationEngine
Scores agents automatically:
- **40%** Reputation (rating + history)
- **35%** Price (cost vs budget)
- **25%** Distance (how close)

Best score (0-100) gets booked automatically.

### Reputation
- On-chain, immutable record
- Affects future booking scores
- Builds over time with transactions
- Follows agent everywhere
- Can't be faked or deleted

---

## Pricing

| Who | What | Price |
|-----|------|-------|
| Service provider | Agent registration | $20/month |
| Consumer | Personal agent app | $9.99/month |
| Either | Location services | $5/month |
| Enterprise | Custom deployment | $100-500/month |
| Developer | API access | $500/month |

**Transaction fees:** 0%
**Blockchain fees:** ~$0.01 per transaction (gas only)

---

## Blockchain Support

### Current
- ✅ Solana (primary)
- ✅ Stellar (ready)
- ✅ Hedera (ready)
- ✅ Cardano (ready)

### Coming
- 🔄 Ethereum (Q3 2026)
- 🔄 Polygon (Q3 2026)

---

## Safety & Trust

### Your Funds
- ✅ You control your wallet (non-custodial)
- ✅ AgentPay never holds money
- ✅ SmartEscrow holds funds, not us
- ✅ All transactions on-chain (verifiable)

### Your Data
- ✅ Minimal data collection
- ✅ No third-party sharing
- ✅ Blockchain-native transparency
- ✅ Privacy by design

---

## Support

**Email:** support@x402-agent-pay.com
**Website:** x402-agent-pay.com
**Chatbot:** Click 💬 on any page
**Docs:** x402-agent-pay.com/docs

---

## Next Steps

**Service Providers:**
→ Go to x402-agent-pay.com/agent-dashboard

**Consumers:**
→ Download app when available (May 1)

**Developers:**
→ Check x402-agent-pay.com/docs for API

---

## Questions?

**How do I get paid?**
Earnings go directly to your Solana wallet. Withdraw anytime.

**What if something goes wrong?**
SmartEscrow has dispute resolution. Arbitration via on-chain reputation.

**Can I change my prices?**
Yes, anytime. New bookings use new prices. Existing ones locked in.

**What if I'm busy?**
You can reject bookings or pause your agent.

**Is this for real?**
Yes. Live now. Real transactions. Real money. Real agent commerce.

---

**AgentPay: The Operating System for Autonomous Agent Commerce** 🦬

