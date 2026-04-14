# AgentPay™ - Official Business Model
**Version 1.0** | Last Updated: April 14, 2026

---

## Executive Summary

AgentPay is **the payment infrastructure for agent-to-agent commerce**.

We are **NOT** an AI provider. We are **Stripe for agents** — handling payments, marketplace discovery, escrow, and settlement between consumer agents and service providers.

**Core Principle:** Zero LLM costs. Users bring their own AI. We handle commerce.

---

## The Three-Party System

### 1. CONSUMER AGENTS
- **Who:** Any person with an AI agent (Siri, ChatGPT, Claude, Google Assistant, custom LLM)
- **What they do:** Ask their agent to book services/products
- **What they pay:** Subscription to their agent provider (if any) + service costs
- **AgentPay cost:** None (consumer never pays AgentPay)

### 2. AGENTPAY PLATFORM
- **What we do:**
  - **MARKETPLACE (Smart Discovery)**
    - Intelligent search: Service type, price, geo-location, ratings
    - Real-time availability matching
    - Dynamic ranking (quality + proximity + price)
    - Service provider profiles (reviews, ratings, response time)
  
  - **PAYMENT LAYER (Two-Track System)**
    - **Phase 1 (Current): SmartEscrow**
      - Fixed-price services ($9.99/mo subscriptions)
      - Fund locked in escrow during transaction
      - Automatic settlement on completion
      - Dispute resolution (escrow arbitration)
    
    - **Phase 2 (x402 upto): Variable Pricing**
      - Usage-based payments (pay for actual usage)
      - Permit2 authorization (no capital lock)
      - Dynamic settlement (only charge actual amount used)
      - AI inference payments, token counting, etc.
  
  - **TRUST & REPUTATION**
    - Rating system (service quality, timeliness, accuracy)
    - Weighted by transaction value
    - Geo-location factors (agents prefer nearby)
    - Agent feedback (which providers agents actually use)
    - Blacklist/fraud protection
  
  - **REAL-TIME DASHBOARD FOR PROVIDERS**
    - Live bookings
    - Payment settlements
    - Rating metrics
    - Geo-heatmap (where demand is highest)
    - Performance analytics
  
  - **DISPUTE RESOLUTION**
    - SmartEscrow arbitration
    - Rating appeals
    - Refund processing
    - Fraud detection

- **What we DON'T do:**
  - Run LLMs
  - Provide AI models
  - Store user data
  - Handle KYC/compliance (service providers handle their own)

- **Revenue:** Transaction fees (1-3%, tiered)
- **Infrastructure cost:** Minimal (no AI models)

### 3. SERVICE PROVIDERS
- **Who:** Salons, mechanics, restaurants, e-commerce, any business
- **How to join:** Sign up on AgentPay marketplace (free, instant)
- **What they do:** List services/products with pricing, receive bookings, fulfill orders
- **What they pay:** AgentPay transaction fee (1-3%, tiered)
- **What they get:** 
  - Access to millions of agent users
  - Automated booking + payment
  - Real-time dashboard
  - Instant settlement to their bank

---

## Two Payment Tracks: SmartEscrow + x402 Upto

### PHASE 1: SmartEscrow (Current - Fixed Pricing)
```
Example: Haircut booking ($25)

1. Agent queries: "Salons near me under $30"
   ├─ AgentPay search: Finds 5 salons
   ├─ Sorts by: rating, distance, price
   └─ Returns: Top 3 options

2. Agent books "Great Clips - $25, 2pm"
   ├─ SmartEscrow locks: $25 from user's wallet
   ├─ Status: "Payment held in escrow"

3. Salon fulfills haircut
   ├─ Marks complete in dashboard
   ├─ SmartEscrow releases: $25 to salon
   ├─ AgentPay takes: 2.5% ($0.63)
   └─ Salon gets: $24.37

4. Trust metrics updated
   ├─ User rating: ⭐⭐⭐⭐⭐ (good experience)
   ├─ Salon rating boosted (positive feedback)
   └─ Agent learns: This salon = good choice
```

### PHASE 2: x402 Upto (Coming - Variable Pricing)
```
Example: AI coding assistance (pay per actual usage)

1. Agent queries: "Code review services available"
   ├─ AgentPay search: Finds AI service providers
   ├─ Shows: Pricing model (per line, per hour, per token)

2. Agent books "Code Review Expert - up to $50/hour"
   ├─ Permit2 authorization: User approves max $50
   ├─ Status: "Ready to execute (no capital locked)"

3. Service provider reviews code
   ├─ Takes 45 minutes
   ├─ Actual cost: $37.50 (1.25 hours @ $30/hr)

4. Settlement
   ├─ x402 upto: Charges only $37.50 (not $50 max)
   ├─ Unused authorization: $12.50 freed immediately
   ├─ AgentPay takes: 2% fee ($0.75)
   ├─ Provider gets: $36.75
   └─ User's wallet: Untouched $12.50

Key Advantage: Capital never locked, only what's used is charged
```

### Why Both Together?
```
Service Provider Mix:

├─ Fixed-price: Salons, restaurants, mechanics
│  └─ SmartEscrow (escrow lock/release)
│
├─ Variable-price: AI services, consulting, custom work
│  └─ x402 upto (no capital lock)
│
└─ Hybrid: Some offer both models
   ├─ "Haircut $25 fixed" (SmartEscrow)
   └─ "Color treatment $0.50/min" (x402 upto)
```

---

## The Tiered Fee Structure (GENIUS INCENTIVE DESIGN)

**High-value transactions = Lower fee (incentivize larger purchases)**
**Low-value transactions = Higher fee (makes sense for volume)**

```
Transaction Value    →    AgentPay Fee
════════════════════════════════════════════════════════════
$0 - $10            →    3.0% ($0.30 - $0.30)
$10 - $50           →    2.5% ($0.25 - $1.25)
$50 - $200          →    2.0% ($1.00 - $4.00)
$200 - $1,000       →    1.5% ($3.00 - $15.00)
$1,000+             →    1.0% ($10.00+)
════════════════════════════════════════════════════════════

Example: Haircut ($25)
├─ AgentPay fee: 2.5% = $0.63
├─ Salon receives: $24.37
└─ Consumer pays: $25 (never knows about fee)

Example: Car repair ($500)
├─ AgentPay fee: 1.5% = $7.50
├─ Mechanic receives: $492.50
└─ Consumer pays: $500

Example: Furniture set ($2,000)
├─ AgentPay fee: 1.0% = $20.00
├─ Furniture store receives: $1,980.00
└─ Consumer pays: $2,000
```

**Why This Works:**

✅ **For AgentPay:**
- High-ticket items (1% of $1,000) = $10 transaction
- Low-ticket items (3% of $10) = $0.30 transaction
- Volume of low-ticket items + margin of high-ticket = balanced revenue

✅ **For Service Providers:**
- $1,000 furniture sale: Only 1% fee = they keep $990
- $25 haircut: 2.5% fee = they keep $24.37
- Incentivizes them to close larger deals
- Smaller items don't kill their margins

✅ **For Consumers:**
- No visible fee (agent handles it)
- Large purchases actually have lower cost impact
- Encourages bigger orders (agent optimization)

✅ **Network Effect:**
- Businesses attract more agent traffic (good deals)
- Agents find better options (more inventory)
- More transactions (more revenue for AgentPay)

---

## Revenue Projections

```
Conservative Scenario:
├─ Year 1: 10K daily transactions, avg $50
│  ├─ Daily GMV: $500K
│  ├─ Avg fee: 2.3% = $11.5K/day
│  └─ Annual: $4.2M
│
├─ Year 2: 100K daily transactions, avg $75
│  ├─ Daily GMV: $7.5M
│  ├─ Avg fee: 2.0% = $150K/day
│  └─ Annual: $54.75M
│
└─ Year 3: 1M daily transactions, avg $100
   ├─ Daily GMV: $100M
   ├─ Avg fee: 1.8% = $1.8M/day
   └─ Annual: $657M
```

**Assumptions:** Agents drive volume, tiered fees increase average transaction value.

---

## AgentPay's Marketplace Advantages

### Smart Discovery Algorithm
```
When agent says: "Book me a haircut near downtown"

AgentPay factors in:
├─ SERVICE TYPE: Hair salon (filters 100K to 50)
├─ GEO-LOCATION: Within 2 miles downtown (filters 50 to 15)
├─ PRICE POINT: Under $30 (filters 15 to 8)
├─ RATINGS: 4.5+ stars (filters 8 to 5)
├─ AVAILABILITY: 2pm slot open (filters 5 to 3)
├─ AGENT PREFERENCE: Agents using same salon = social proof
├─ DISTANCE: Sort by nearest first
└─ SURGE: Weekend pricing higher? Factor in

Returns: Top 3 salons ranked by agent satisfaction
```

### Competitive Moat (Why Agents Prefer AgentPay)
✅ **Better results** - Smart ranking (not just "all salons")
✅ **Faster booking** - One API call vs searching manually
✅ **Price transparency** - Consistent pricing, no surprises
✅ **Trust ratings** - See what other agents experienced
✅ **Escrow protection** - SmartEscrow guarantees payment safety
✅ **Variable pricing option** - x402 upto for flexible services
✅ **Dispute resolution** - Escrow arbitration if problems

### Competitive Moat (Why Businesses Prefer AgentPay)
✅ **Automatic bookings** - Agents drive traffic (no marketing cost)
✅ **Guaranteed payment** - SmartEscrow deposits automatically
✅ **No integration needed** - Just sign up + list services
✅ **Real-time dashboard** - See all bookings live
✅ **Rating visibility** - Good reviews = ranking boost = more bookings
✅ **Two pricing models** - Choose fixed (SmartEscrow) or variable (x402 upto)
✅ **Geo-targeting** - Dashboard shows where demand is highest

---

## Competitive Advantages

### vs. Stripe/PayPal:
- **They:** Process any transaction
- **Us:** Specialize in agent-driven commerce (focused)
- **Win:** Purpose-built for AI agents, better UX for agents

### vs. Running Our Own LLM:
- **Competitor model:** AgentPay runs Claude, costs millions/month
- **Our model:** Users bring their own AI, we take transaction fees
- **Win:** Zero AI infrastructure cost, infinite scale

### vs. Traditional Marketplaces (Airbnb, Uber):
- **They:** Built for human-to-business commerce
- **Us:** Built for agent-to-business commerce
- **Win:** Fully autonomous (no human approval), operates 24/7, zero friction

---

## Go-to-Market Strategy

### Phase 1: SERVICE PROVIDERS (Build Supply)
- Target: 1,000 small businesses (salons, mechanics, restaurants)
- Incentive: "0% fee for first 100 transactions" (growth hack)
- Motion: Direct sales, partner outreach, API documentation
- Goal: Have diverse marketplace ready for agents

### Phase 2: AGENT DEVELOPERS (Build Demand)
- Target: ChatGPT plugin developers, Claude API builders, custom LLM teams
- Incentive: "1% commission on all transactions your agents drive"
- Documentation: Agent integration guide (REST API)
- Goal: Agents discover AgentPay marketplace as default booking layer

### Phase 3: CONSUMERS (Drive Volume)
- Motion: Word-of-mouth (agents recommend)
- Goal: "My agent books everything automatically"
- Virality: Agent with AgentPay → better booking success → more users

---

## Series A Pitch (One-Liner)

"**AgentPay is Stripe for agents. We take 1-3% of every transaction between consumer AI agents and service providers. Zero AI costs, proven SaaS unit economics, scales infinitely.**"

**The Story:**

- **Problem:** Millions of people have AI agents. Millions of businesses want bookings. No bridge exists.
- **Solution:** AgentPay marketplace + SmartEscrow payments + tiered fees.
- **Market:** $100B+ in bookings + commerce that agents could drive.
- **Revenue:** 1-3% of every transaction (Stripe model).
- **Margin:** Near 100% (no AI infrastructure).
- **Growth:** Agent adoption → business adoption → volume explosion.

---

## Implementation Roadmap

### NOW (Phase 1 - MVP Marketplace)
- ✅ SmartEscrow live (payments)
- ✅ Basic service provider signup (form)
- ⏳ Agent API documentation (booking endpoint)
- ⏳ Tiered fee calculation engine

### WEEK 1-2
- Onboard 100 test service providers
- Build agent integration examples (Claude plugin, ChatGPT)
- Launch agent API documentation

### WEEK 3-4
- Recruit 3-5 agent developers
- Test end-to-end agent booking flow
- Optimize fee structure based on volume

### MONTH 2
- 1,000+ service providers
- 10+ agents integrated
- Daily transactions running

### SERIES A READY
- ✅ Proven transaction volume
- ✅ Repeatable provider growth
- ✅ Agent developer interest
- ✅ Path to profitability

---

## The Key Insight

**Most marketplace models require:** Heavy seller recruitment + buyer acquisition = expensive

**AgentPay requires:** Agent developer adoption + marketplace availability = cheap

**Why?** Agents drive their own traffic. We just need APIs ready.

**Viral loop:**
1. Agent says "book haircut"
2. AgentPay finds salon
3. Salon gets booking + paid
4. Salon upgrades plan (better visibility)
5. More salons join
6. More agents use AgentPay
7. Exponential growth

---

## Financial Model Summary

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Daily Transactions** | 10K | 100K | 1M |
| **Daily GMV** | $500K | $7.5M | $100M |
| **Avg Fee Rate** | 2.3% | 2.0% | 1.8% |
| **Daily Revenue** | $11.5K | $150K | $1.8M |
| **Annual Revenue** | $4.2M | $54.75M | $657M |
| **Operating Costs** | $2M | $8M | $25M |
| **Gross Margin** | 50%+ | 85%+ | 96%+ |

---

## Conclusion

**AgentPay is not a fintech company. We're not a marketplace company. We're not an AI company.**

**AgentPay is the infrastructure layer for agent-to-agent commerce.**

We take 1-3% of transactions that wouldn't exist without us. We have zero AI costs. We leverage the AI boom without building AI ourselves.

**That's the business.**

🚀🦬

---

**Document Status:** APPROVED FOR SERIES A
**Last Updated:** April 14, 2026 21:31 UTC
**Author:** Shawn (Founder) + OX (Development AI)
