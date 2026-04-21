# AgentPay™ Developer Roadmap & Contractor Costs
## What We Need to Build + How Much It Costs
**April 11, 2026** — Research & Planning

---

## 🎯 Current Status

**What we have:**
- ✅ SmartEscrow smart contract deployed ($3 SOL cost)
- ✅ Android app UI (all 4 tabs working)
- ✅ Mock wallet & transaction functions
- ✅ Website + GitHub repo

**What we DON'T have yet:**
- ❌ Real agents (AI/automation agents registered on platform)
- ❌ Real Solana wallet integration (Phantom/Magic Eden)
- ❌ Real transaction signing & blockchain submission
- ❌ Agent marketplace functionality
- ❌ Revenue settlement system

**Why it matters:** Users can't fund wallets or test transactions until agents exist and real blockchain integration works.

---

## 📋 Phase 1: Wallet Integration (CRITICAL)
### Integrate Phantom or Magic Eden Wallet SDK

**What to build:**
- Connect Android app to user's Phantom/Magic Eden wallet
- Import user's existing wallet (no new wallet creation)
- Display real SOL balance from blockchain
- Sign & submit real transactions to SmartEscrow

**Technology Stack:**
- **Phantom Connect React Native SDK** (official, enterprise support)
- **Solana Web3.js** for RPC calls
- **Anchor.rs client generator** for SmartEscrow interaction

**Documentation:**
- Phantom Connect React Native: https://docs.phantom.com/sdks/react-native-sdk
- Solana RPC API: https://docs.solana.com/api
- Anchor Program Client: https://www.anchor-lang.com/docs/client

**Estimated effort:** 80-120 hours
- Wallet connection integration (16-24h)
- Balance queries & real-time updates (12-16h)
- Transaction signing & submission (24-32h)
- Error handling & security review (16-24h)
- Testing on Android device (12-24h)

**Contractor cost:** $3,200 - $7,200 USD
- Upwork Android + Solana dev: $40-60/hour
- Freelancer.com (offshore): $20-35/hour
- US-based Solana specialist: $75-100/hour

**Timeline:** 2-3 weeks with experienced dev

**Deliverables:**
- ✅ Real wallet connect button in app
- ✅ Live SOL balance display
- ✅ Signed transactions on Solana mainnet
- ✅ Test transaction on SmartEscrow

---

## 📊 Phase 2: Agent Infrastructure (CRITICAL)
### Build Agent Registration & Marketplace

**What to build:**
1. **Agent Registration System**
   - Agent profile (name, skills, hourly rate, wallet address)
   - Agent verification (email, ID check if needed)
   - Service categories (HVAC, Mechanic, etc.)
   - Reputation system (ratings, reviews)

2. **Agent Marketplace**
   - Browse agents by location/service
   - Search & filter agents
   - Agent detail page with portfolio
   - One-click booking

3. **Agent Dashboard**
   - View pending jobs
   - Accept/decline jobs
   - Track earnings (real-time USDC settlement)
   - Income history

**Technology Stack:**
- **Backend:** Node.js + Express + PostgreSQL (you have this)
- **Frontend:** React or Vue for agent portal
- **Blockchain:** Solana program for reputation tracking
- **Payments:** SmartEscrow (already deployed)

**Documentation:**
- Solana Agent Kit: https://sendaifun.github.io/solana-agent-kit/
- Solana Web3.js: https://solana-labs.github.io/solana-web3.js/
- Anchor Lang: https://www.anchor-lang.com/

**Estimated effort:** 160-240 hours
- Database schema & API endpoints (24-32h)
- Agent registration flow (24-32h)
- Marketplace UI (32-48h)
- Search & filtering (16-24h)
- Reputation system (24-32h)
- Dashboard (24-32h)
- Testing & deployment (16-24h)

**Contractor cost:** $6,400 - $14,400 USD
- Full-stack dev (Upwork): $40-60/hour
- Offshore team: $15-25/hour
- US dev: $75-100/hour

**Timeline:** 4-6 weeks with 1-2 developers

**Deliverables:**
- ✅ Agent registration page (web + app)
- ✅ Marketplace with search/filter
- ✅ Agent detail pages
- ✅ Agent dashboard (earnings, jobs, history)
- ✅ Reputation stored on-chain

---

## 💰 Phase 3: Payment Settlement (CRITICAL)
### Real USDC Settlement to Agent Wallets

**What to build:**
1. **Payment Flow**
   - User books agent via app
   - SmartEscrow locks USDC
   - Service completed
   - SmartEscrow releases USDC → Agent wallet

2. **Instant Settlement**
   - Real-time USDC transfer
   - Zero fees (competitive advantage)
   - Transaction logging
   - Dispute resolution

**Technology Stack:**
- **SmartEscrow (Rust/Anchor)** — Already deployed, just add release logic
- **Solana SPL Token Program** for USDC transfers
- **Backend** to trigger releases when service complete

**Documentation:**
- Solana SPL Token: https://spl.solana.com/token
- Anchor Lang Program Client: https://www.anchor-lang.com/docs/client
- SmartEscrow Program: Program ID: `6Pi1hfuX8x3vzF3EW1YEN43ZkCdNdQDpHRdzg47CnBED`

**Estimated effort:** 60-100 hours
- SmartEscrow release logic (16-24h)
- Backend settlement service (20-32h)
- Testing on testnet → mainnet (12-20h)
- Dispute resolution UI (12-24h)

**Contractor cost:** $2,400 - $6,000 USD
- Rust + Solana dev: $50-80/hour
- Offshore Solana: $20-35/hour

**Timeline:** 2-3 weeks

**Deliverables:**
- ✅ USDC locked in escrow when booking
- ✅ USDC released to agent wallet on completion
- ✅ Zero fees (users keep 100% of payments)
- ✅ Transaction history on-chain

---

## 📱 Phase 4: Agent Apps (OPTIONAL)
### Build Agent-Side Mobile Apps

**What to build:**
- Android app for agents to manage jobs
- Accept/decline bookings
- Real-time notifications
- Earnings dashboard
- Direct wallet management

**Estimated effort:** 120-180 hours
- Mirror user app UI (32-48h)
- Job management (32-48h)
- Notifications (16-24h)
- Earnings tracking (24-32h)
- Testing (16-28h)

**Contractor cost:** $4,800 - $10,800 USD
- Android dev: $40-60/hour

**Timeline:** 3-4 weeks

**Note:** Can use same codebase as user app, just different flows.

---

## 💵 Cost Summary

| Phase | Task | Hours | Cost Range | Timeline |
|-------|------|-------|------------|----------|
| 1 | Wallet Integration | 80-120h | $3.2K-$7.2K | 2-3 weeks |
| 2 | Agent Infrastructure | 160-240h | $6.4K-$14.4K | 4-6 weeks |
| 3 | Payment Settlement | 60-100h | $2.4K-$6K | 2-3 weeks |
| 4 | Agent Apps | 120-180h | $4.8K-$10.8K | 3-4 weeks |
| **TOTAL** | **MVP** | **300-460h** | **$12K-$38K** | **10-16 weeks** |

**Breakdown:**
- **Minimum MVP (Phases 1-3):** $12K-$28K, 10-12 weeks
- **Full platform (All phases):** $12K-$38K, 10-16 weeks

---

## 🏠 Where to Find Developers

### 1. **Upwork** (Recommended for quick hiring)
- Search: "Solana Android developer" + "Rust smart contract"
- Rate: $40-80/hour
- Filter by: Solana + Rust + Android experience
- Timeline: Can hire in 24 hours, start work immediately

### 2. **Moltbook** (Agent community)
- Post about work needed
- Target: Agents who know both Solana + Android
- Advantage: They understand agent ecosystem
- Rate: Often negotiable (% of revenue vs. hourly)

### 3. **GitHub** (Open source community)
- Post in Solana + Android repositories
- Solana Discord: https://discord.gg/solana
- Anchor Discord: https://discord.gg/anchor
- Phantom Discord: https://discord.gg/phantom

### 4. **Freelancer.com** (Budget option)
- Rate: $15-40/hour (offshore)
- Quality varies, need strong testing
- Good for Phase 2 (backend work)

### 5. **Web3 Agencies**
- Solulab, BlockchainAppsDeveloper
- Cost: $30K-100K (but full-service)
- Quality: Enterprise-grade
- Timeline: 8-12 weeks

---

## 📚 Essential Documentation to Study

**Android + Kotlin:**
- Official Kotlin docs: https://kotlinlang.org/docs/
- Jetpack Compose guide: https://developer.android.com/jetpack/compose
- Android development: https://developer.android.com/

**Solana:**
- Solana docs: https://docs.solana.com
- Web3.js reference: https://solana-labs.github.io/solana-web3.js/
- Anchor Lang: https://www.anchor-lang.com/
- Phantom SDK: https://docs.phantom.com/
- Solana agent toolkit: https://sendaifun.github.io/solana-agent-kit/

**Smart Contracts (Rust/Anchor):**
- Anchor tutorial: https://www.anchor-lang.com/docs/intro
- SmartEscrow code: Already in GitHub repo
- Solana Program Library: https://github.com/solana-labs/solana-program-library

**Payment Systems:**
- SPL Token standard: https://spl.solana.com/token
- Associated Token Account: https://spl.solana.com/associated-token-account
- USDC on Solana: https://www.circle.com/usdc

---

## 🎯 Action Items for Shawn

### Immediate (This week)
1. ✅ Fix app (wallet starts at 0.00, hide real addresses) — **DONE**
2. ⏳ Post on Moltbook: "Looking for Solana + Android devs to help build agent marketplace"
3. ⏳ Create GitHub discussions/issues for contractors to bid on Phases 1-3
4. ⏳ Budget decision: How much willing to spend on contractors? ($12K? $25K?)

### Short-term (Next 2 weeks)
1. Hire Phase 1 dev (Wallet integration) — CRITICAL to unblock testing
2. Create detailed specs from this doc
3. Set up dev environment access (GitHub, Solana devnet)
4. Weekly standups with contractor

### Medium-term (Weeks 3-6)
1. Phase 1 complete → Start Phase 2 (Agent infrastructure)
2. Parallel: Phase 3 (Payment settlement)
3. Begin Phase 4 (Agent apps) when Phase 2 is 50% done

---

## 💡 Smart Approach: Revenue-Share Model

**Instead of paying $25K upfront**, consider:
- $5K cash upfront (helps them get started)
- 2% of every transaction for 12 months (their stake in success)
- Bonus if they help recruit other agents

**Example:**
- You reach $50K/month revenue
- $5K × 2% = $1K/month to developer for 1 year
- Total: $5K + $12K = $17K (way cheaper than $30K)
- Developer is motivated to make the product good

---

## 📄 What to Send Contractors

When hiring, give them:
1. **This document** (roadmap + costs + tech stack)
2. **GitHub repo** (code to review)
3. **SmartEscrow Program ID** (6Pi1hfuX8x3...)
4. **App APK** (current state)
5. **Figma mockups** (if you have UI designs)
6. **Detailed specs** for their phase

---

## Status: 🔴 BLOCKED ON CONTRACTOR

You **cannot test transactions** until Phase 1 (Wallet Integration) is done. Everything else waits on that. Priority: Find 1-2 Solana + Android devs this week.

**Recommendation:** Post on Moltbook + Upwork today. Budget $5K-$8K for Phase 1. Get someone started immediately.

