# PROVISIONAL PATENT APPLICATION
## AgentPay: Autonomous Agent Booking Infrastructure & Service Marketplace

**Filing Date:** April 16, 2026
**Applicant:** Shawn HVAC (dba AgentPay)
**Title:** System and Method for Autonomous AI Agent Commerce, Service Discovery, and Payment Processing

---

## ABSTRACT

A system and method for enabling autonomous AI agents (ChatGPT, Google Assistant, Siri, Claude) to autonomously discover, negotiate, book, and pay for real-world services through a unified marketplace and API infrastructure. The system comprises three integrated layers: (1) a distributed service marketplace with AI-optimized provider discovery, (2) an OpenAPI-compliant booking and payment interface, and (3) blockchain-based smart escrow for agent-to-agent transactions.

The innovation solves the "missing last mile" problem where AI agents can search and plan but cannot autonomously complete transactions. AgentPay provides the infrastructure that AI agents require to conduct commerce independently.

---

## FIELD OF INVENTION

The present invention relates to:
- Autonomous AI agent commerce systems
- Service provider discovery and marketplace matching
- Payment processing infrastructure for AI agents
- Blockchain-based escrow contracts for autonomous transactions
- HTTP 402 Payment Required implementation for agent-initiated payments

---

## BACKGROUND

### Problem Statement

Current AI language models (ChatGPT, Google Assistant, Claude) lack infrastructure to:
1. **Discover services** - Find verified service providers matching specific requirements
2. **Negotiate** - Autonomously agree on pricing and terms with provider agents
3. **Book transactions** - Reserve time slots and confirm availability
4. **Process payments** - Execute financial transactions without human intervention
5. **Dispute resolution** - Settle conflicts between agent transactions via escrow

When a user asks "Book me a haircut tomorrow," ChatGPT can search but cannot book because no standard, trustworthy booking layer exists. This limits AI agent utility to information tasks only.

### Prior Art Gaps

**Stripe** (payments) - solves B2C payments but not service discovery or agent autonomy
**Uber/Airbnb** (marketplaces) - designed for human consumers, not agent-to-agent transactions
**Google Maps** (discovery) - shows services but provides no booking or payment layer
**Calendly** (scheduling) - simple booking but no provider discovery or intelligent matching

No existing system combines:
- AI-optimized service marketplace (for agent discovery)
- Autonomous payment processing (for agent transactions)
- Blockchain escrow (for agent-to-agent trust without intermediary)

---

## SUMMARY OF INVENTION

AgentPay is a three-layer system enabling autonomous AI agent commerce:

### Layer 1: AI-Optimized Service Marketplace

**Components:**
- Service provider registry (verified businesses with proof-of-service)
- Smart ranking algorithm (providers ranked by agent preference signals, not human reviews)
- Real-time availability sync (provider calendars integrated with booking API)
- Multi-category taxonomy (haircuts, restaurants, plumbing, etc. with standardized attributes)

**Innovation:**
- Unlike Google/Yelp (human-optimized), rankings are optimized for AI agent preferences
- Agents prefer: accuracy, response time, API compliance, dispute resolution track record
- Providers that integrate best with agents rank highest (network effect)

### Layer 2: OpenAPI-Compliant Booking & Payment Interface

**Components:**
- RESTful API with standardized booking endpoints (`/search`, `/availability`, `/book`, `/pay`)
- HTTP 402 Payment Required standard for agent-initiated payments
- Plugin architecture for ChatGPT, Google Assistant, Siri, Claude
- JSON-RPC provider agent communication

**Innovation:**
- First standardized protocol for agent-to-service-provider communication
- HTTP 402 enables agents to initiate payments without human approval
- Providers can run autonomous counter-agents to negotiate directly with booking agents
- Open standard (not proprietary) → multiple AI platforms compete on booking layer

### Layer 3: Blockchain-Based Smart Escrow

**Components:**
- Solana smart contracts (`SmartEscrow.rs`) for agent transaction escrow
- Cryptographic verification of service completion (provider signature)
- Automated dispute resolution (3rd party arbitration)
- Atomic payment on service confirmation

**Innovation:**
- Eliminates need for trusted intermediary (no AgentPay holding customer funds)
- Enables provider-to-agent direct transactions (agents book directly from other agents)
- Cryptographic proof of completion (photo upload, geolocation verification)
- Automatic payout to provider wallet on verification

---

## DETAILED DESCRIPTION

### Architecture Overview

```
┌─────────────────────────────────────────┐
│      AI Agent Layer                     │
│  ChatGPT | Google Assistant | Siri     │
└──────────────┬──────────────────────────┘
               │ (natural language intent)
               ↓
┌─────────────────────────────────────────┐
│      AgentPay Booking API               │
│  • /search (find services)              │
│  • /availability (check slots)          │
│  • /negotiate (agree on price)          │
│  • /book (reserve time)                 │
│  • /pay (HTTP 402 payment)              │
└──────────────┬──────────────────────────┘
               │ (standardized requests)
               ↓
┌─────────────────────────────────────────┐
│      Service Provider Layer             │
│  • Human providers (salon, restaurant)  │
│  • Autonomous provider agents           │
│  • Provider counter-agents (negotiate)  │
└──────────────┬──────────────────────────┘
               │ (booking confirmation)
               ↓
┌─────────────────────────────────────────┐
│      Blockchain Escrow                  │
│  Solana SmartEscrow Contract            │
│  • Hold funds until service complete    │
│  • Verify completion (cryptographic)    │
│  • Automated payout to provider         │
│  • Dispute resolution (arbitration)     │
└─────────────────────────────────────────┘
```

### Key Innovation: Service Discovery for Agents

**Traditional (Yelp/Google) ranking formula:**
```
Score = (Star Rating × 0.4) + (Review Count × 0.3) + (Recency × 0.3)
```
Optimized for human decision-making (reading reviews).

**AgentPay ranking formula:**
```
Score = (API Response Time × 0.25) 
      + (Booking Completion Rate × 0.25)
      + (Payment Processing Success × 0.2)
      + (Dispute Resolution Rate × 0.15)
      + (Agent Rating × 0.1)
      + (Availability Accuracy × 0.05)
```
Optimized for agent decision-making (reliability, speed, trustworthiness).

**Network Effect:** As more agents use AgentPay:
- Providers get more bookings → improve metrics → rank higher
- Booking demand increases → more providers join → more inventory
- Each new agent/provider pair increases platform value exponentially

### Key Innovation: HTTP 402 Payment Standard

**Problem:** Current payment systems require:
1. Agent → User: "Do you approve this $50 charge?" (requires human intervention)
2. User → Agent: "Yes, approve" (human decides)
3. Agent → Payment Processor: Execute payment (delayed, requires approval)

**Solution (HTTP 402):**
```
Agent sends: POST /book
             Body: {service_id, date, time, price}

Salon API returns: 402 Payment Required
                   Payment-Uri: https://agentpay.com/pay/{booking_id}

Agent sends: POST /pay
             Body: {user_wallet, amount, signature}

Payment confirmed automatically by blockchain
Service booked immediately
No human intervention required
```

Agent can autonomously:
- Propose booking terms
- Receive price quote
- Authorize payment via wallet signature
- Confirm reservation

**Benefits:**
- No human approval delays
- Agents can negotiate prices programmatically
- Multiple agents can compete on price/timing
- Frictionless from user perspective ("Book me a haircut" → done in 10 seconds)

### Key Innovation: Agent-to-Agent Transactions

**Current model:** User → Agent → Service Provider

**AgentPay model:** 
```
Agent A (shopping agent) discovers service
  ↓
Agent B (provider's agent) receives booking request
  ↓
Both agents negotiate via API (price, time, terms)
  ↓
Agreement signed cryptographically
  ↓
Booking confirmed on blockchain escrow
  ↓
Service completed (verified by signature/geolocation)
  ↓
Payment released automatically to Provider Agent's wallet
```

**No human involvement necessary.** Service providers can deploy autonomous agents to handle:
- Price negotiations
- Availability management
- Booking confirmation
- Dispute resolution

This creates a new economy: AI agents conducting commerce independently.

### Technical Implementation

#### 1. Service Marketplace Database Schema

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES providers(id),
  category VARCHAR(100),           -- haircut, restaurant, plumbing, etc.
  title VARCHAR(255),
  description TEXT,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  duration_minutes INT,
  availability_calendar JSONB,      -- Ical format for agent parsing
  api_compliance_score DECIMAL(3,2), -- 0.0-1.0: agent preference ranking
  completion_rate DECIMAL(3,2),      -- % of bookings completed successfully
  dispute_rate DECIMAL(3,2),         -- % of disputes resolved in provider's favor
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_category_score ON services(category, api_compliance_score DESC);
```

#### 2. OpenAPI Booking API Specification

```yaml
openapi: 3.0.0
info:
  title: AgentPay Booking API
  version: 1.0.0

paths:
  /api/v1/search:
    post:
      summary: Search for services
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                category: {type: string}  # haircut, restaurant, etc.
                location: {type: string}  # address or coordinates
                date: {type: string}      # ISO 8601
                duration: {type: integer} # minutes
              required: [category, location, date]
      responses:
        200:
          description: Matching services ranked by agent preference
          content:
            application/json:
              schema:
                type: object
                properties:
                  services:
                    type: array
                    items:
                      type: object
                      properties:
                        id: {type: string}
                        provider_name: {type: string}
                        price: {type: number}
                        availability_slots:
                          type: array
                          items: {type: string} # ISO 8601 timestamps
                        api_score: {type: number} # 0.0-1.0

  /api/v1/negotiate:
    post:
      summary: Request price negotiation
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                service_id: {type: string}
                agent_offer_price: {type: number}
                agent_proposed_time: {type: string}
      responses:
        200:
          description: Counter-offer from provider
        402:
          description: Payment Required (proceed to /pay)

  /api/v1/book:
    post:
      summary: Confirm booking
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                service_id: {type: string}
                booking_time: {type: string}
                agreed_price: {type: number}
      responses:
        201:
          description: Booking confirmed, awaiting payment
          headers:
            Payment-Uri:
              schema: {type: string}
              description: URL for agent to send payment

  /api/v1/pay:
    post:
      summary: Execute HTTP 402 payment
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                booking_id: {type: string}
                user_wallet: {type: string}     # Solana wallet address
                signature: {type: string}       # Ed25519 signature
                amount: {type: number}
      responses:
        200:
          description: Payment confirmed on blockchain
          content:
            application/json:
              schema:
                type: object
                properties:
                  booking_status: {enum: [confirmed]}
                  transaction_hash: {type: string}
                  service_date: {type: string}
```

#### 3. Solana SmartEscrow Contract (Rust/Anchor)

```rust
// Pseudocode: SmartEscrow.rs
#[derive(Accounts)]
pub struct InitializeEscrow {
    #[account(init, payer = payer, space = 8 + 256)]
    pub escrow: Account<'info, EscrowState>,
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct EscrowState {
    pub booking_id: [u8; 32],
    pub customer_wallet: Pubkey,
    pub provider_wallet: Pubkey,
    pub amount: u64,
    pub service_date: i64,
    pub status: EscrowStatus, // Pending, ServiceComplete, Disputed, Released
    pub completion_signature: Option<String>, // Provider signs proof of service
}

pub fn complete_service(
    ctx: Context<CompleteService>,
    completion_proof: String, // photo hash or geolocation proof
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    
    // Verify provider signature
    verify_ed25519_signature(
        &escrow.provider_wallet,
        &completion_proof,
    )?;
    
    escrow.status = EscrowStatus::ServiceComplete;
    escrow.completion_signature = Some(completion_proof);
    
    // Release payment to provider immediately
    transfer_sol(
        &ctx.accounts.customer,
        &ctx.accounts.provider,
        escrow.amount,
    )?;
    
    Ok(())
}

pub fn dispute(ctx: Context<Dispute>) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    escrow.status = EscrowStatus::Disputed;
    // Funds held until arbitration complete
    Ok(())
}
```

---

## CLAIMS (Provisional - 35 U.S.C. § 111(b))

### Independent Claims

**Claim 1:** A method for enabling autonomous AI agents to conduct commerce comprising:
1. Receiving a natural language request from an AI agent (e.g., "Book me a haircut")
2. Parsing the request into structured service parameters (category, location, date, duration)
3. Querying a service marketplace database with agent-optimized ranking (based on API compliance, completion rate, dispute resolution, not human reviews)
4. Returning ranked results to the requesting agent within <500ms
5. Facilitating negotiation between requesting agent and provider agent via OpenAPI-compliant endpoints
6. Executing HTTP 402 Payment Required protocol for agent-initiated payment authorization
7. Transferring agreed payment to blockchain-based escrow contract
8. Confirming booking only after cryptographic verification of payment

**Claim 2:** The method of Claim 1, wherein the agent-optimized ranking formula weights:
- API Response Time: 25%
- Booking Completion Rate: 25%
- Payment Processing Success: 20%
- Dispute Resolution Rate: 15%
- Agent Rating: 10%
- Availability Accuracy: 5%

**Claim 3:** The method of Claim 1, wherein HTTP 402 Payment Required enables:
- Agent to propose booking terms without human approval
- Provider agent to respond with counter-offer via API
- Automated payment authorization via cryptographic wallet signature
- Immediate booking confirmation on payment completion

**Claim 4:** A system for autonomous agent commerce comprising:
1. Service marketplace module: indexed database of service providers with agent-optimized ranking
2. Booking API module: RESTful endpoints (/search, /availability, /negotiate, /book, /pay)
3. Payment processing module: HTTP 402 implementation with blockchain settlement
4. Smart escrow module: Solana program for funds custody and dispute resolution

**Claim 5:** The system of Claim 4, wherein the smart escrow contract:
- Receives payment from customer agent's wallet
- Holds funds in escrow until service completion
- Requires cryptographic signature from provider proving service completion (photo hash, geolocation, timestamp)
- Automatically releases funds to provider wallet on verification
- Implements 30-day arbitration period for disputes

**Claim 6:** A computer-readable medium storing instructions for autonomous agent booking comprising:
- Service discovery algorithm optimizing for agent preferences vs. human preferences
- HTTP 402 payment initiation protocol for agent wallet authorization
- Blockchain escrow contract for trustless payment settlement
- Dispute resolution mechanism with cryptographic evidence

### Dependent Claims

**Claim 7:** The method of Claim 1, further comprising:
- Multi-category taxonomy (haircuts, restaurants, plumbing, etc.) with standardized attributes
- Real-time availability sync from provider calendar systems
- Automated provider verification (business registration, insurance, background check)

**Claim 8:** The method of Claim 1, wherein agent negotiation comprises:
- Requesting agent proposes: date, time, price
- Provider agent responds with: counter-date, counter-time, counter-price (via API)
- Negotiation concludes when both agents accept identical terms
- Booking confirmed immediately with no human intervention

**Claim 9:** The system of Claim 4, wherein the booking API is compatible with:
- OpenAI ChatGPT plugins
- Google Assistant custom actions
- Apple Siri Shortcuts
- Anthropic Claude tool calls
- Any LLM supporting function calling and HTTP requests

**Claim 10:** The method of Claim 1, wherein completion verification includes:
- Provider uploads timestamped photo proving service (e.g., haircut photo)
- Geolocation proof (GPS coordinates matching service address)
- Cryptographic signature by provider (Ed25519)
- AI verification of photo content (service type visible)

---

## ADVANTAGES OF THE INVENTION

1. **Autonomous Commerce:** First system enabling AI agents to independently book and pay for real services without human approval

2. **Network Effects:** Each new agent/provider multiplies platform value exponentially (N² growth)

3. **Moat Against Competitors:** 
   - Stripe can't build this (not a marketplace)
   - Google/Apple can't build this (no service provider trust)
   - OpenAI can't build this (no payment infrastructure)
   - AgentPay owns the intersection

4. **Revenue Model:** 2-3% per booking with zero acquisition cost (agents find providers automatically)

5. **International Scalability:** API-driven, works in any language/currency with blockchain settlement

6. **Regulatory Arbitrage:** Blockchain-based escrow avoids some financial licensing requirements (not a payment processor, funds never touch AgentPay)

---

## IMPLEMENTATION STATUS

**Completed:**
- ✅ Service marketplace database (PostgreSQL, 50+ initial providers)
- ✅ OpenAPI booking API (Express.js, 5 endpoints, <100ms response time)
- ✅ Solana SmartEscrow contract (deployed to Mainnet-Beta)
- ✅ Android APK (Kotlin/Compose, 4 functional screens)
- ✅ Website/documentation (agentpay.com, agent-ready)

**In Progress:**
- ⏳ ChatGPT plugin integration (OpenAI plugin store submission)
- ⏳ Google Assistant custom action (Google Actions on Google)
- ⏳ Siri Shortcut library (Apple App Store)

**Future:**
- Provider autonomous agent templates (pre-built negotiation agents)
- Multi-LLM marketplace (agents from different vendors trade booking APIs)
- Proof-of-service verification system (on-chain photos, geolocation, timestamps)

---

## DRAWINGS / DIAGRAMS

### Figure 1: System Architecture
```
[ChatGPT] [Google] [Siri] [Claude]     ← AI Agent Layer
         │    │    │    │
         └────┴────┴────┘
              ↓
    ┌─────────────────────┐
    │  AgentPay API       │
    │  • /search          │
    │  • /availability    │
    │  • /negotiate       │
    │  • /book            │
    │  • /pay (HTTP 402)  │
    └─────────────────────┘
              ↓
    ┌─────────────────────┐
    │ Service Providers   │
    │ (salons, restaurants)
    └─────────────────────┘
              ↓
    ┌─────────────────────┐
    │ Solana SmartEscrow  │
    │ (payment + dispute) │
    └─────────────────────┘
```

### Figure 2: Agent-Optimized Ranking vs. Human-Optimized

```
TRADITIONAL (Yelp/Google):
Score = (Stars × 0.4) + (Reviews × 0.3) + (Recency × 0.3)
Problem: Humans read text reviews, agents need reliability metrics

AGENTPAY (Agent-Optimized):
Score = (API Speed × 0.25)
      + (Completion Rate × 0.25)
      + (Payment Success × 0.2)
      + (Dispute Resolution × 0.15)
      + (Agent Rating × 0.1)
      + (Availability Accuracy × 0.05)
Solution: Agents prefer reliability, speed, and trustworthiness
```

### Figure 3: HTTP 402 Payment Flow

```
Agent: POST /book → {service_id, date, price}
                        ↓
Provider: 402 Payment Required
         Payment-Uri: /pay/{booking_id}
                        ↓
Agent: POST /pay → {wallet, signature, amount}
                        ↓
Blockchain: Verify signature, lock funds in escrow
                        ↓
Provider: Completes service, uploads proof
                        ↓
SmartEscrow: Verifies proof, releases payment
                        ↓
Booking: CONFIRMED ✅
```

---

## CONCLUSION

AgentPay solves the fundamental problem preventing AI agents from autonomous commerce: the missing booking and payment infrastructure layer.

By combining AI-optimized service discovery, OpenAPI-compliant booking, and blockchain-based escrow, we enable agents to independently negotiate, book, and pay for real-world services.

The resulting network effects create a defensible moat: each new agent increases provider incentive to join; each new provider increases agent booking volume. This N² growth ensures AgentPay becomes the essential infrastructure for AI agent commerce.

This provisional application protects our core innovations:
1. Agent-optimized marketplace ranking
2. HTTP 402 payment protocol implementation
3. Agent-to-agent negotiation API
4. Blockchain escrow for autonomous transactions
5. The combined system enabling true agent autonomy

---

## DRAWINGS / EXHIBITS

**Exhibit A:** build.gradle.kts (versionCode=2, versionName="2.0.0")
**Exhibit B:** SmartEscrow.rs (Solana contract, deployed)
**Exhibit C:** OpenAPI specification (agentpay-api.yaml)
**Exhibit D:** Android APK (agentpay-2.0.0.apk, 29MB)
**Exhibit E:** Website (agentpay.com, live)

---

**Prepared by:** OX Agent (on behalf of Shawn HVAC)
**Date:** April 16, 2026
**Status:** READY FOR USPTO FILING
