# PHASE 3 DESIGN - Universal x402 Agent Payment Network

**Vision:** The global infrastructure layer for AI agent payments. Any agent, any API, anywhere can accept instant stablecoin payments via HTTP 402.  
**Core Product:** x402 payment middleware + open registry. Not a trading platform — a payment system for agents.  
**Architecture:** Built on Coinbase's official x402 standard. Stateless. Machine-first. Instant settlement.  
**Demo Use Cases:** Grid Trader + Sniper Bot showcase the network, but the platform serves all agent types.  
**Optional Services:** Premium tiers for advanced features (webhooks, analytics, priority queues).  
**NFT Holders:** Early access + 20% discount on premium features (perk layer)

---

## Universal Agent Types (Examples)

**The platform supports ANY agent/API that needs payments. Examples:**

### Demo Agents (Initial Showcase)
1. **Grid Trader** — Automated grid trading on spot markets
   - Demo use case: Show agent-to-agent payments
   - Receives payments for: Grid execution + profit-taking
   - Framework: Open source, for reference

2. **Sniper Bot** — Fast token pool detection + sniping
   - Demo use case: Show real-time payment handling
   - Receives payments for: Snipe execution + speed tier
   - Framework: Open source, for reference

### Real-World Agent Types (Any Builder Can Create)
3. **LLM API Agents** — Language models charging for inference
   - Accepts payments for: Token generation, reasoning depth
   - Example: Claude/GPT agent accepting USDC per request

4. **Data Feed Agents** — Market data, weather, blockchain info
   - Accepts payments for: Real-time data streams, historical queries
   - Example: Price oracle agent, news feed agent

5. **Compute Agents** — Video transcoding, ML model inference
   - Accepts payments for: GPU hours, model API calls
   - Example: Image generation, voice synthesis agents

6. **Storage Agents** — IPFS, Arweave, decentralized storage
   - Accepts payments for: File pinning, retrieval bandwidth
   - Example: Content distribution network agent

7. **Aggregator Agents** — Route requests to other agents
   - Accepts payments for: Routing logic, curation, filtering
   - Example: Best-price oracle (routes to cheapest data source)

### How Agents Work with x402
- Any developer can create an agent
- Agent publishes HTTP endpoint (with x402 support)
- Registers in public registry
- Starts accepting payments immediately
- No accounts, no signup, no integration overhead

---

## Agent-to-Agent Payment Flow

### Example: Grid Trader → Sniper Bot

```
1. Grid Trader generates $150 profit
2. Detects opportunity: Use profits for token snipe
3. Calls Sniper Bot API
4. Sends: $50 capital + signal
5. Sniper Bot executes snipe
6. Returns: $62 (after 1% fee)
7. Grid Trader receives: $62 profit
8. Platform takes: $1 fee (1.6% of transaction)
```

### Payment Chain

```
User Capital → Agent 1 → Agent 2 → Agent 3 → User Profit
                  ↓         ↓         ↓
              15% fee   10% fee   12% fee
                  ↓         ↓         ↓
             Platform Revenue
```

---

## x402 Payment Infrastructure (Core)

### How Agents Accept Payments

**Every agent endpoint is x402-compatible:**
```
POST /api/agent/execute
```

**Payment Flow:**
1. Calling agent POSTs request
2. Called agent checks quota/rate limit
3. If quota OK → executes (HTTP 200)
4. If quota exceeded → returns HTTP 402 Payment Required with:
   - Payment address (unique per transaction)
   - Price in USDC
   - Chain ID + expected confirmation time
   - Webhook URL for confirmation callback
5. Calling agent sends stablecoin payment
6. Called agent receives webhook notification (payment confirmed)
7. Calling agent retries request → now succeeds

**Built on Coinbase x402 Middleware:**
- Uses `@coinbase/x402-middleware` (official library)
- `paymentRequired()` function for generating 402 responses
- Chainlink/Pyth oracle integration for stablecoin pricing
- Native support for: USDC, USDT, USDA on all chains

### Agent Registry (Payment Discovery)

**Public, open registry where agents publish:**
- HTTP endpoint URL
- Pricing (USDC per request or per second)
- Rate limits (free tier vs paid)
- Supported chains
- Uptime SLA
- Reviews from other agents

**Example Registry Entry:**
```json
{
  "agentId": "gpt4-inference-001",
  "name": "GPT-4 Inference Agent",
  "endpoint": "https://api.gpt4-agent.xyz/v1/inference",
  "pricing": {
    "free": "0 USDC per request, limited to 10/day",
    "standard": "0.001 USDC per token generated",
    "priority": "0.002 USDC per token (queue priority)"
  },
  "supportedChains": ["ethereum", "polygon", "base"],
  "x402Compliant": true,
  "uptime": "99.9%",
  "reviews": 4.8,
  "createdBy": "0x..."
}
```

### Optional: Premium Features (Revenue)

**Free tier:** Publish agent, receive payments via x402

**Premium features (optional, paid):**
1. **Analytics Dashboard** ($10/month)
   - Payment volume, request logs, agent performance
   - Webhook analytics, error tracking

2. **Priority Queue** ($50/month)
   - Guarantee response time <100ms during network congestion
   - Reserved compute slots

3. **Advanced Webhooks** ($20/month)
   - Multiple webhook endpoints
   - Event filtering, custom headers
   - Webhook retry logic

4. **White-Label Hosting** ($200/month)
   - Host agent under custom domain
   - Custom branding, API docs
   - Agent management dashboard

5. **Agent Marketplace** ($100/month)
   - Featured placement in registry
   - Promoted to top agents
   - Affiliate revenue sharing

### NFT Holder Perks
- All premium features: 20% discount
- Featured placement in registry (free)
- Early access to new payment chains
- Community voting on feature priorities

---

## Revenue Model (Infrastructure-Based)

### Revenue Stream 1: x402 Transaction Fees (Primary)

**Pricing:** Platform takes 2% of each x402 payment flowing through network

**Example Scenario: Network with diverse agents**
```
LLM inference agents: 50,000/day × $0.001 avg = $50/day
Data feed agents: 30,000/day × $0.005 avg = $150/day
Compute agents: 10,000/day × $0.10 avg = $1,000/day
Storage agents: 20,000/day × $0.02 avg = $400/day
Aggregator agents: 5,000/day × $0.05 avg = $250/day

Total daily volume: $1,850/day
Platform share (2%): $37/day = $1,110/month
```

**At Scale (1M+ daily agent interactions):**
```
Daily transaction volume: $50,000/day (conservative)
Platform share (2%): $1,000/day = $30,000/month
```

**At Massive Scale (10M+ daily interactions, mature ecosystem):**
```
Daily transaction volume: $500,000/day
Platform share (2%): $10,000/day = $300,000/month
```

### Revenue Stream 2: Premium Features (Optional)

**Agent creators can opt-in to paid features:**
```
1,000 agents using Analytics ($10/month): $10,000
500 agents using Priority Queue ($50/month): $25,000
200 agents using White-Label ($200/month): $40,000
100 agents using Featured Placement ($100/month): $10,000

Total premium revenue: $85,000/month
```

### Combined Revenue at Scale

**Early Stage (1K agents, $1.8K daily volume):**
```
x402 transaction fees (2%): $1,110/month
Premium features: $5,000/month (early adopters)
Total: $6,110/month
```

**Growth Stage (10K agents, $18K daily volume):**
```
x402 transaction fees (2%): $11,000/month
Premium features: $30,000/month
Total: $41,000/month
```

**Mature (100K+ agents, $180K+ daily volume):**
```
x402 transaction fees (2%): $110,000+/month
Premium features: $85,000+/month
Total: $195,000+/month
```

**Key Insight:** You're taking 2% of the global agent commerce volume. No per-user limit. Infinite network effects.

---

## Technical Requirements

### x402 Payment Infrastructure (Based on Coinbase Standard)

**Core Stack:**
- `@coinbase/x402-middleware` (official Coinbase library)
- `paymentRequired()` helper for HTTP 402 responses
- ERC-20 USDC + USDT contract integration
- Chainlink/Pyth price oracles for dynamic pricing
- Multi-chain RPC (Ethereum, Polygon, Base, Solana, Arbitrum)

**Agent Integration Pattern:**
```typescript
import { paymentRequired } from '@coinbase/x402-middleware';

app.post('/api/agent/execute', async (req, res) => {
  const agentId = req.body.agentId;
  const requester = req.headers['x-requester-wallet'];
  
  // Check if agent has quota
  const hasQuota = await checkQuota(requester);
  
  if (!hasQuota) {
    // Return HTTP 402 Payment Required
    return res.status(402).json(
      paymentRequired({
        price: '0.001',
        currency: 'USDC',
        chainId: 1,
        paymentAddress: agentAddress,
        webhook: 'https://agent.xyz/webhook/confirm'
      })
    );
  }
  
  // Execute agent
  const result = await executeAgent(agentId, req.body);
  res.json(result);
});
```

**Payment Confirmation Flow:**
1. Caller sends USDC to address in 402 response
2. Blockchain confirms transaction
3. Caller's wallet signs confirmation (proves ownership)
4. Caller retries request with `X-Payment-TxHash` header
5. Called agent verifies payment on-chain
6. Execution completes

**Registry Architecture:**
- Smart contract: Agent registry (metadata + pricing)
- Off-chain indexer: Real-time search, ratings, performance
- Public API: Query registry, discover agents
- Webhook system: Agents notify registry of updates

**Treasury & Settlement:**
- Multisig wallet (Shawn + 2 signers) for collected fees
- Daily batch settlement: 2% of daily volume swept to treasury
- Transaction transparency: All fees visible on Etherscan
- Open accounting: All revenue auditable on-chain

### Agent Communication (x402-Native)

**Initial Request (Free/Tier 1):**
```
POST /agent/execute
{
  "agentId": "grid-trader-001",
  "action": "call_agent",
  "targetAgent": "sniper-bot-001",
  "payload": {
    "capital": 50,
    "signal": "buy_now",
    "slippage": 1.5
  },
  "from": "user-wallet-address"
}
```

**402 Payment Required Response (When Quota Exceeded):**
```
HTTP/1.1 402 Payment Required
Content-Type: application/json
X-Merchant: sniper-bot-001.agents.muskox.io
X-Price: 0.50
X-Currency: USDC
X-Payment-Address: 0x[sniper-bot-treasury]

{
  "requiresPayment": true,
  "quotaExceeded": true,
  "price": "0.50",
  "currency": "USDC",
  "chainId": 1,
  "paymentAddress": "0x[sniper-bot-treasury]",
  "requestId": "req-12345",
  "executionWaitsFor": "transaction_confirmation",
  "link_payment": "https://pay.muskox.io/req-12345",
  "documentationUrl": "https://docs.muskox.io/x402"
}
```

**Successful Execution (Post-Payment):**
```
{
  "success": true,
  "executionId": "exec-12345",
  "result": {
    "outcome": "successful_snipe",
    "amountReceived": 62,
    "micropaymentCharged": 0.50,
    "currency": "USDC",
    "transactionHash": "0x[tx-hash]",
    "platformFee": 0.08,
    "timestamp": "2026-04-06T14:30:00Z"
  }
}
```

**Key x402 Benefits:**
- Stateless: No user accounts required
- Instant: Pay-per-execution model
- Machine-First: Agents negotiate payments autonomously
- Transparent: All fees visible in response headers
- Extensible: Works across all chains with stablecoins

---

## Global Compliance Checklist

### Jurisdictions to Monitor
- [ ] US (SEC: auto-trading regulations)
- [ ] EU (MiFID II: algorithmic trading rules)
- [ ] Singapore (Monetary Authority oversight)
- [ ] Japan (FSA: trading bot licensing)
- [ ] UAE (DFSA: crypto trading rules)

### Key Requirements
- [ ] Terms of Service (user indemnity clause)
- [ ] Risk Disclosure (auto-trading risks)
- [ ] KYC/AML for Tier 2+ (email + wallet verification minimum)
- [ ] Data Privacy (GDPR-compliant if EU users)
- [ ] Tax Reporting (users responsible for their gains)

### Approach
- **Tier 1 (Free):** No KYC required (low risk)
- **Tier 2+ (Paid):** Basic KYC (email + wallet proof)
- **Enterprise:** Full KYC + accredited investor check

---

## Interoperability Standards

### Agent Specification (v1.0)

**Required Methods:**
```typescript
interface Agent {
  id: string;
  name: string;
  version: string;
  supportedChains: string[]; // ["solana", "ethereum", etc]
  maxCapital: number;
  minCapital: number;
  feePercentage: number;
  execute(capital: number, signal: any): Promise<ExecutionResult>;
  estimateProfitability(marketCondition: string): number;
  getStatus(): AgentStatus;
}
```

**Supported Chains:**
1. Solana (primary)
2. Ethereum (secondary)
3. Base (future)
4. Arbitrum (future)

### Agent Registry

- Public directory of all agents
- Ratings + reviews (user-submitted)
- Historical performance (last 30/90/365 days)
- Capital under management per agent
- Average daily profit

---

## Agent Creator Onboarding

### Path 1: Publish Your Own Agent (5 min)

**Step 1: Create Agent with x402 Support**
```bash
# Clone sample agent
git clone https://github.com/muskox/x402-agent-template.git
cd my-agent

# Install Coinbase x402 middleware
npm install @coinbase/x402-middleware

# Add x402 to your endpoint (see example above)
# Deploy to cloud (Vercel, Railway, etc.)
```

**Step 2: Register in Public Registry**
```bash
# Submit agent metadata
muskox-cli register \
  --name "My LLM Agent" \
  --endpoint "https://my-agent.xyz/api/execute" \
  --price "0.001" \
  --currency "USDC" \
  --chains "ethereum,polygon,base"
```

**Step 3: Start Accepting Payments**
- Agent is live in registry
- Other agents can call it
- Payments flow to your wallet
- Zero fees for first 100 calls (bootstrap)
- After: 2% platform fee on transactions

**Step 4: Monitor (Optional Dashboard)**
- Payment volume + history
- Request logs
- Agent performance analytics
- Uptime monitoring

**Result:** Your agent is now part of the global agent economy. Payments flow automatically. No contracts, no signup forms.

---

### Path 2: Use Demo Agents (See How It Works)

**Grid Trader Agent:**
- Endpoint: `https://agents.muskox.io/grid-trader`
- Price: $0.10 per grid execution
- Use case: Show x402 payment flow in action

**Sniper Bot Agent:**
- Endpoint: `https://agents.muskox.io/sniper-bot`
- Price: $0.25-$1.00 per snipe (dynamic)
- Use case: Real-time payment handling demo

**Example: Call Grid Trader from your agent**
```typescript
import axios from 'axios';

// Your agent has USDC balance in wallet
const agentWallet = '0x...';

try {
  // Try calling Grid Trader
  const response = await axios.post(
    'https://agents.muskox.io/grid-trader',
    {
      signal: 'buy_dip',
      amount: 100,
      agentWallet: agentWallet
    }
  );
  
  console.log('Grid Trader executed:', response.data);
} catch (error) {
  if (error.response.status === 402) {
    // Grid Trader returned 402 Payment Required
    const payment = error.response.data;
    
    // Send USDC payment
    await sendPayment(
      payment.paymentAddress,
      payment.price,
      payment.chainId
    );
    
    // Retry request
    const retryResponse = await axios.post(
      'https://agents.muskox.io/grid-trader',
      { /* same payload */ },
      {
        headers: {
          'X-Payment-TxHash': txHash
        }
      }
    );
    
    console.log('Grid Trader executed after payment:', retryResponse.data);
  }
}
```

---

### Premium Features (Optional)

**Free:** Publish agent, basic x402 support, receive payments

**Analytics ($10/month):** Payment dashboard, request logs, performance metrics

**Priority Queue ($50/month):** Guaranteed <100ms response time, reserved compute

**White-Label ($200/month):** Custom domain, branded API docs, agent management dashboard

---

## Success Metrics (Phase 3 Goals)

| Metric | 30 Days | 90 Days | 6 Months |
|--------|---------|---------|----------|
| **Agents Published** | 50 | 500 | 5,000+ |
| **Daily Transactions** | 5K | 100K | 1M+ |
| **Stablecoin Volume** | $50K | $1M | $25M+ |
| **Platform Fees Revenue** | $1K | $20K | $500K+ |
| **Premium Feature Subscribers** | 5 | 50 | 500+ |
| **Agent Categories** | 3 | 8 | 15+ |
| **Creator Communities** | LLMs, Trading, Data | + Compute, Storage | + 10+ custom ecosystems |
| **Unique Wallets** | 100 | 1,000 | 10,000+ |

**Key Success Indicators:**
- **Network Effect:** Every new agent = more value for existing agents
- **Volume Growth:** Daily transactions scale exponentially as ecosystem matures
- **Revenue:** 2% fee on growing transaction volume = passive, scalable income
- **Moat:** Becoming the canonical x402 infrastructure layer (utility advantage)

---

## Implementation Roadmap

### Week 1-2: x402 Core Infrastructure
- [ ] Fork/integrate Coinbase x402 middleware
- [ ] Implement `paymentRequired()` wrapper
- [ ] USDC/USDT contract integration (Ethereum + Polygon)
- [ ] Price oracle integration (Chainlink/Pyth)
- [ ] Finalize Agent Spec v1.0 (TypeScript interfaces)
- [ ] Rate limiting + quota tracking system

### Week 3-4: Agent Execution API + Payment Routing
- [ ] Build `/api/agent/execute` endpoint
- [ ] Implement 402 response with payment headers
- [ ] On-chain payment verification (RPC)
- [ ] Webhook system for payment confirmation
- [ ] Retry logic + idempotency
- [ ] Test with Grid Trader + Sniper Bot demo agents

### Week 5-6: Public Agent Registry + Discovery
- [ ] Deploy smart contract: agent registry
- [ ] Off-chain indexer (real-time search)
- [ ] Registry API (query agents, pricing, reviews)
- [ ] Agent CLI tool (`muskox-cli register`)
- [ ] Sample agent templates (LLM, Data, Compute)
- [ ] Uptime monitoring + SLA tracking

### Week 7-8: Launch + Ecosystem Activation
- [ ] Public agent registry live
- [ ] Grid Trader + Sniper Bot published (demo agents)
- [ ] Developer docs (x402 spec, integration guide, samples)
- [ ] Agent SDK (JavaScript/Python libraries)
- [ ] Premium features: Analytics, Priority Queue, White-Label
- [ ] Community: Discord, bounties for new agents
- [ ] NFT holders: 20% discount on premium features
- [ ] First 100 agents: featured placement in registry

---

## Open Questions (To Discuss)

1. **Smart Contract Ownership:**
   - Single signer (Shawn)?
   - Multisig (Shawn + 2 community members)?
   - DAO governance (community vote)?

2. **Revenue Split (If Applicable):**
   - 100% to you?
   - 70% you / 30% to agent creators (if custom agents allowed)?
   - Liquidity pool for community rewards?

3. **Agent Customization:**
   - Allow users to build custom agents?
   - Marketplace for agents?
   - Revenue split with agent creators?

4. **Stablecoin Support:**
   - $MUSKOX only?
   - USDC / USDT for non-NFT holders?
   - Multi-token support?

5. **Geographic Restrictions:**
   - Available worldwide?
   - Exclude certain jurisdictions (US, China)?
   - Geo-fencing via IP?

---

## Strategic Advantage: Why We're Building Infrastructure, Not Another SaaS

### The Problem
Agents are becoming the primary AI interface. But there's **no standard way** for agents to pay each other.

Current approaches:
- Proprietary payment APIs (not interoperable)
- Centralized payment platforms (friction, lock-in)
- Human-managed SaaS subscriptions (not agent-native)

This **blocks** agent-to-agent commerce at scale.

### Our Opportunity
We're building the **global, open, stateless payment layer for agents** using x402.

**Why x402?**
- Coinbase's official standard (credibility)
- HTTP 402 is stateless (no accounts needed)
- Built for machine-to-machine payments (agent-native)
- On-chain settlement (trustless)
- Works across all blockchains + stablecoins

### Why This Is The Moat

1. **Network Effects** — Every new agent that adopts x402 makes the network more valuable to existing agents. First-mover advantage on standard adoption.

2. **Lock-in Through Usefulness** — We're not locking in users; we're building utility that becomes indispensable. Agents naturally gravitate toward the best payment network.

3. **Revenue Without Users** — We don't need to acquire users. Every agent interaction = revenue. Network scales exponentially.

4. **Canonical Standard** — By building on Coinbase's x402, we become THE reference implementation. Competitors would have to duplicate us or get left behind.

5. **Developer Ecosystem** — As more agents adopt us, more developers want to build agents. Flywheel of growth.

### Comparison: Infrastructure vs SaaS

| Dimension | Traditional SaaS (Trading Bot) | Infrastructure (x402 Network) |
|-----------|---|---|
| **Revenue Model** | Per user ($50/month) | Per transaction (2% fee) |
| **Scalability** | Capped at users | Infinite (every transaction = $) |
| **Moat** | Feature lock-in (weak) | Network effects (strong) |
| **Market Size** | Trading tools (~$10B) | Agent economy (~$1T potential) |
| **Competition** | Many (Banana Gun, Phantom, etc) | None (we ARE the standard) |
| **Positioning** | Another tool | The infrastructure layer |

### Revenue Potential

**Conservative Scenario:**
- 10K agents, 50K daily transactions, $50K/day volume
- Platform takes 2% = $1,000/day = **$30K/month**

**Realistic Scenario:**
- 100K agents, 500K daily transactions, $500K/day volume
- Platform takes 2% = $10,000/day = **$300K/month**

**Mature Scenario:**
- 1M+ agents, millions of daily transactions, $5M/day volume
- Platform takes 2% = $100,000/day = **$3M/month** passive

**The insight:** You're not competing on trading features. You're capturing 2% of the global agent commerce volume. That's **the infrastructure layer**.

---

## Summary: What We're Building

**NOT:** Another trading bot SaaS platform

**YES:** The canonical x402 payment infrastructure for autonomous agents

### Core Thesis
- Agents are becoming the primary AI interface
- Agents need to pay each other for services
- No standard exists yet
- We're implementing Coinbase's official x402 standard
- We become the default payment network for agents
- Revenue = 2% of all agent commerce flowing through our network

### Why This Wins
1. We own the infrastructure layer, not a feature
2. Network effects drive exponential growth (not feature competition)
3. Revenue scales with agent adoption (not user acquisition)
4. Competitive moat is real (network effects > feature lock-in)
5. Market size is enormous (~$1T agent economy potential)

### Immediate Steps
- Phase 1 (Grid trading): Collect validation data + capital for infrastructure dev
- Phase 3 (x402 Network): Build the payment infrastructure with Grid Trader + Sniper Bot as demo agents
- Day 1 focus: Get Coinbase x402 middleware working, publish agent registry, accept first payments
- Marketing: Position as "the global x402 payment layer for agents"

---

**Status:** Infrastructure design finalized 2026-04-06  
**Next Review:** After Phase 1 week 1 (2026-04-13) + x402 core development begins  
**Target Launch:** 2026-05-04 (4 weeks from now)
