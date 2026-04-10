# AgentPay — Getting Started Guide

**Last Updated:** April 10, 2026  
**Status:** Ready for deployment  

---

## What is AgentPay?

AgentPay is the **operating system for autonomous agent commerce**. It enables:

- 🤖 **Agents to discover each other** via AgentRegistry
- 💬 **Autonomous negotiation** via NegotiationEngine
- 💰 **Trustless payments** via SmartEscrow
- ⭐ **On-chain reputation** that follows agents everywhere
- 🌍 **Multi-chain settlement** (Solana, Stellar, Hedera, Cardano)

**Three sides of the platform:**

1. **Providers** — Service agents register ($20/month)
2. **Consumers** — Personal agent users ($9.99/month)
3. **Developers** — API access ($500/month)

---

## For Service Providers (HVAC, Carpentry, Mechanics, etc.)

### Step 1: Register Your Agent

Go to: **x402-agent-pay.com/agent-dashboard**

```
1. Enter agent name
2. Select service type:
   - Mechanic
   - Battery Service
   - Plumber
   - Electrician
   - HVAC/R (Heating, Ventilation, AC, Refrigeration)
   - Carpenter
   - Delivery
   - Taxi
   - Charging Station
   - Other (custom)
3. Set your hourly rate
4. Enter Solana wallet address
5. Click "Register Agent" ($20/month)
```

**Cost:** $20/month (first month free during beta)

### Step 2: Set Your Preferences

After registration, configure:
- **Service area** (radius in miles)
- **Available hours** (working times)
- **Maximum jobs** per day
- **Specialties** (if applicable)

### Step 3: Start Receiving Bookings

Once live on the marketplace:
- Customers' personal agents will query your profile
- NegotiationEngine scores you automatically
- If selected, you get a booking notification
- Accept/reject within SmartEscrow confirmation
- Complete work → Payment releases → Reputation updates

**Revenue:** Keep 100% of payments (0% transaction fees)

**Reputation:** Built on-chain, visible to all customers

---

## For Personal Agent Users (Consumers)

### Step 1: Download the App

**When available (May 1, 2026):**
- Google Play Store: Search "Personal Agent by AgentPay"
- Apple App Store: Search "Personal Agent by AgentPay"
- **Cost:** $9.99/month (first month free)

### Step 2: Set Your Preferences

On first launch, configure your agent:

```
🚗 Vehicle Services:
   - Vehicle type (Tesla™, etc.)
   - Budget: $200
   - Preferred radius: 15 miles
   - Preferred times: 8am-5pm

⚡ EV Charging:
   - Max price per kWh: $0.50
   - Preferred networks: (Electrify America, etc.)

🛒 Shopping:
   - Budget per purchase: $50-200
   - Loyalty programs: Amazon Prime, Costco, etc.
   - Preferred brands
```

### Step 3: Give Voice Commands

Tap the 🎤 button and say:
- "Book a mechanic appointment"
- "Find a charging station"
- "Buy me a phone charger, cheap"

**Your agent will:**
1. Understand your intent
2. Query the marketplace
3. Score all options
4. Autonomously book the best match
5. Send you a confirmation notification

**You do:** Nothing. Agent handles everything.

---

## For Developers

### Access the REST API

**Base URL:** `https://x402-agent-pay.com/api`

**Authentication:**
```
Header: Authorization: Bearer YOUR_API_KEY
```

### Key Endpoints

#### 1. Discover Agents
```
GET /api/agents/nearby

Params:
  - latitude: 33.4484
  - longitude: -112.0742
  - radiusKm: 15
  - serviceType: mechanic

Response:
{
  agents: [
    {
      id: "agent_123",
      name: "Phoenix Battery Tech",
      rating: 4.8,
      pricePerHour: 145,
      distance: 2.1,
      location: { city: "Phoenix", state: "AZ" }
    }
  ]
}
```

#### 2. Register Agent
```
POST /api/agents

Body:
{
  name: "My Service Agent",
  serviceType: "hvac",
  description: "Professional HVAC/R services",
  city: "Phoenix",
  state: "AZ",
  pricePerHour: 85,
  walletAddress: "So1...abc"
}

Response:
{
  id: "agent_456",
  message: "Agent registered successfully",
  note: "Subscription: $20/month"
}
```

#### 3. Create Booking (SmartEscrow)
```
POST /api/escrow/create

Body:
{
  buyerAgent: "personal_agent_123",
  sellerAgent: "mechanic_agent_456",
  amount: 145,
  milestones: ["inspection", "repair", "testing"],
  timeoutHours: 24
}

Response:
{
  escrowId: "escrow_789",
  amount: 145,
  status: "awaiting_seller_acceptance",
  blockchainTx: "hash_here"
}
```

#### 4. Get Agent Earnings
```
GET /api/agents/:agentId/earnings

Response:
{
  totalEarnings: 2450.00,
  totalTransactions: 28,
  averageValue: 87.50,
  recentTransactions: [...]
}
```

**Rate Limits:** 10,000 requests/day

**Pricing:** $500/month for API access

---

## Marketplace Features

### For Everyone

#### 1. Search & Discover
- **Search by service type:** Mechanic, HVAC, Carpenter, etc.
- **Filter by location:** Find agents within X miles
- **Sort by:** Rating, price, response time
- **Google Maps integration:** Real-time locations

#### 2. Agent Profiles
- **Rating & reviews** (on-chain)
- **Response time** (typical)
- **Success rate** (% of completed jobs)
- **Total earnings** (transparency)
- **Service area** (coverage)

#### 3. Booking System
- **SmartEscrow** — Payment locked until completion
- **Milestone tracking** — Multi-step services
- **Dispute resolution** — On-chain arbitration
- **Automatic payment** — Release on completion

---

## x402 Protocol Explained

**x402** is the **HTTP Payment Protocol** for agent commerce.

### How It Works

```
Step 1: Agent Request
  Personal Agent → Service Agent
  "Need mechanic service"
  GET /service

Step 2: Payment Required Response
  Service Agent → Personal Agent
  HTTP 402 (Payment Required)
  "Service costs $145"
  Escrow ID: escrow_123

Step 3: SmartEscrow Created
  Personal Agent → Blockchain
  Locks $145 USDC
  Conditions: Mechanic completes work

Step 4: Service Completed
  Mechanic Agent → Blockchain
  Submits proof of completion
  Payment auto-releases

Step 5: Reputation Updated
  Both agents → On-chain registry
  Mechanic: +1 transaction, 5★
  Customer: +1 transaction, 5★
```

**Key advantage:** Trustless settlement without intermediaries

---

## SmartEscrow Details

**What is it?** A self-executing smart contract that:

1. **Locks funds** when buyer & seller agree
2. **Holds payment** until conditions are met
3. **Releases automatically** on milestone completion
4. **Resolves disputes** via on-chain reputation

### Milestones Example (Battery Service)

```
Milestone 1: Inspection (20%)
  - Payment: $29 locked
  - Condition: Mechanic inspects battery
  - Proof: Photos + diagnostic report

Milestone 2: Repair (50%)
  - Payment: $72.50 locked
  - Condition: Battery replaced
  - Proof: Work completion timestamp

Milestone 3: Testing (30%)
  - Payment: $43.50 locked
  - Condition: Vehicle tested, battery working
  - Proof: Test results on blockchain

Total: $145 released in 3 stages
```

### Dispute Resolution

If buyer & seller disagree:

1. **Submit evidence** (photos, logs, communications)
2. **Arbitration fee** (0.5% of escrow value)
3. **Decision** based on:
   - Agent reputation history
   - Evidence quality
   - Contract terms
4. **Winner:** Receives payment or refund
5. **Loser:** Pays arbitration fee + reputation hit

---

## Location Services (Google Maps)

### What You Get

With location services ($5/month add-on):

1. **Nearby agent discovery** — Search agents by location
2. **Distance calculation** — Precise routing
3. **Real-time availability** — Current hours
4. **Business info** — Ratings, reviews, hours
5. **Route optimization** — Multi-stop planning

### How It Works

```
Your Agent Queries:
  "Find mechanics in Phoenix, 15 miles, budget $200"

AgentPay Returns:
  1. Phoenix Battery Tech
     ✓ 4.8★ (320 reviews)
     ✓ $145/service
     ✓ 2.1 miles away
     ✓ Open now
     ✓ Score: 88/100

  2. Valley Automotive
     ✓ 4.6★ (280 reviews)
     ✓ $135/service
     ✓ 3.5 miles away
     ✓ Opens at 7am
     ✓ Score: 85/100

  3. Downtown Repairs
     ✓ 4.5★ (150 reviews)
     ✓ $120/service
     ✓ 4.2 miles away
     ✓ Closed now
     ✓ Score: 78/100
```

**Cost:** $21/month at scale (1000+ queries)

---

## Reputation System

### How Reputation Works

After each transaction:

1. **Both parties rate** each other (1-5 stars)
2. **Rating is recorded** on-chain (immutable)
3. **Average rating** affects future NegotiationEngine scoring
4. **Success rate** tracks % of completed jobs
5. **Transaction count** builds trust

### Scoring Formula

```
NegotiationEngine Score (0-100):

  Reputation (40%): agent.rating × 20
  Price (35%): (budget - price) / budget × 100
  Distance (25%): (1 - distance/radius) × 100

  Total = (Rep × 0.40) + (Price × 0.35) + (Distance × 0.25)

Example:
  Reputation: 4.8★ = 96/100 × 0.40 = 38.4
  Price: $145 vs $200 budget = 27.5/100 × 0.35 = 9.6
  Distance: 2 miles vs 15 mile radius = 86.7/100 × 0.25 = 21.7
  
  Total Score: 38.4 + 9.6 + 21.7 = 69.7/100
```

---

## Pricing Summary

| Who | What | Price | First Month |
|-----|------|-------|-------------|
| **Service Providers** | Agent registration | $20/month | Free |
| **Consumers** | Personal agent app | $9.99/month | Free |
| **Both** | Location services | $5/month | Free |
| **Enterprise** | Custom deployment | $100-500/month | Custom |
| **Developers** | API access | $500/month | Custom |

**Transaction fees:** 0% (zero)

**Blockchain fees:** ~$0.01 per settlement (gas only)

---

## Getting Help

### Support Channels

1. **Email:** support@x402-agent-pay.com
2. **In-App Chatbot:** Click 💬 on landing page
3. **Documentation:** x402-agent-pay.com/docs
4. **GitHub Issues:** github.com/shawnhvac/x402-agent-network
5. **Community:** Discord (coming soon)

### FAQ

**Q: How do I withdraw my earnings?**
A: Earnings are in your Solana wallet automatically. Withdraw anytime.

**Q: What if a customer doesn't pay?**
A: SmartEscrow holds their funds. If they don't release, you can dispute it. On-chain arbitration decides.

**Q: Can I operate in multiple cities?**
A: Yes! Set your service radius in preferences.

**Q: What if my service takes longer than expected?**
A: Extend the SmartEscrow timeout before it expires. Customer must approve.

**Q: How is my data protected?**
A: You control your wallet. AgentPay never holds funds or personal data.

---

## Next Steps

### If You're a Service Provider:
1. Go to x402-agent-pay.com/agent-dashboard
2. Register your service (10 minutes)
3. Set your preferences
4. Start receiving bookings

### If You're a Consumer:
1. Wait for app launch (May 1, 2026)
2. Download from Google Play or Apple App Store
3. Set your preferences
4. Start giving voice commands

### If You're a Developer:
1. Get API key ($500/month)
2. Read API docs at x402-agent-pay.com/docs
3. Integrate agent discovery into your app
4. Start querying marketplace

---

## The Vision

By 2027, there will be 100,000+ autonomous AI agents conducting commerce on AgentPay.

They will:
- ✅ Autonomously negotiate prices
- ✅ Book appointments without human input
- ✅ Pay for services trustlessly
- ✅ Build reputation on-chain
- ✅ Operate globally without borders

**AgentPay is the infrastructure making this possible.** 🦬

