# AgentPay Architecture Decisions - April 14, 2026

**Time:** 21:51 UTC - Critical business model breakthrough

## The Vision Shifts (Multiple Times, Getting Better)

### Version 1: App-based marketplace
- Users download AgentPay Android app
- Browse marketplace
- Book services
- **Problem:** Limited reach, high friction

### Version 2: API-first (ChatGPT/Google/Siri integration)
- ChatGPT plugin integrates AgentPay API
- Google Actions for Google Assistant
- Siri Shortcuts for Apple
- **Advantage:** Millions of users instantly

### Version 3: Own your data (THE ONE)
- Don't pay Google Maps API ($1.8M/year)
- Use OpenStreetMap (FREE)
- Build own database
- Business sign up to enhance listings (optional)
- **Advantage:** ZERO variable costs, unbreakable moat

## Key Insights

1. **Users bring their own AI agents**
   - Siri, ChatGPT, Google Assistant, custom LLMs
   - They don't download AgentPay app
   - They use their existing AI

2. **Payments are credit/debit cards (not crypto)**
   - Siri/ChatGPT users don't have crypto wallets
   - Use OpenAPI for credit card processing (you already signed up!)
   - USDC/Solana for crypto agents (future option)

3. **Business data is already public**
   - Google My Business
   - OpenStreetMap
   - Yelp
   - You can own this data for free (via OpenStreetMap)

4. **Don't need business sign-ups to launch**
   - Can start with free OpenStreetMap data
   - Businesses sign up later to enhance visibility
   - Incentive: Free traffic from ChatGPT users

5. **The real moat is data ownership**
   - Google Maps API = variable cost, locked in
   - Own data = fixed cost, competitive advantage
   - Savings over 3 years: $1.86M
   - Control over destiny: Priceless

## The Business Model (Final Version)

```
Three-sided marketplace:

1. CONSUMERS (ChatGPT, Google, Siri users)
   - Use their existing AI
   - Ask: "Book me a haircut"
   - Never see AgentPay, but it's working behind scenes

2. AGENTPAY (Infrastructure + Data)
   - API: search, book, rate, settle payments
   - Data: OpenStreetMap baseline + business signups
   - Payments: OpenAPI (credit cards)
   - Ranking: Price, geo, ratings, agent preference
   - Fee: 1-3% tiered by transaction value

3. SERVICE PROVIDERS (Salons, mechanics, restaurants)
   - Sign up free (optional - already on Google)
   - Get bookings from agent users
   - Payments via OpenAPI to their bank
   - Dashboard shows live bookings
   - Rating system (unique to AgentPay)
```

## Revenue Projections

- Year 1: $4.2M (10K daily transactions)
- Year 2: $54.75M (100K daily transactions)
- Year 3: $657M (1M daily transactions)

ChatGPT alone = 200M+ users
If AgentPay captures 0.5% of their bookings → 1M daily transactions (Day 1)

## Cost Structure (Why Owning Data Matters)

**Using Google Maps API:**
- Year 1: $20K
- Year 2: $180K
- Year 3: $1.8M/year (+ continues forever)

**Using OpenStreetMap + own data:**
- Year 1: $26K (one-time build)
- Year 2: $34K (maintenance)
- Year 3: $80K (scaling)
- Beyond: $0 variable costs

**Margins:**
- With Google API: 85% → 60% (variable costs destroy margin)
- With own data: 85%+ forever (no variable costs)

## Go-to-Market (Real Plan)

### Immediate (This Week)
- Document REST API (search, book, rate, settle)
- Integrate OpenAPI for credit card payments
- Create ChatGPT plugin manifest
- Load OpenStreetMap data

### Short Term (Next 2 weeks)
- Submit ChatGPT plugin to OpenAI
- Deploy Google Actions
- Get first real bookings through ChatGPT
- Recruit 100 service providers

### Series A (This month)
- Show ChatGPT integration working
- Pitch: "Booking layer for AI assistants"
- Real transaction volume
- Path to $657M revenue

## APK Status (What Changes)

**Old view:** Primary distribution channel
**New view:** Secondary tools

APK can be:
1. Admin dashboard (service providers manage listings)
2. Business tools (invoicing, analytics, ratings)
3. Direct consumer app (optional, branded experience)
4. Development/testing (prototype features)

**But:** Real volume comes from ChatGPT/Google/Siri plugins, not the APK.

## The Moat (What Makes This Defensible)

- Own data (can't be cut off by Google)
- Custom ranking (better results than Google)
- Agent satisfaction ratings (unique to AgentPay)
- Network effect (more bookings → better data → better ranking)
- Can't be commoditized (ratings are specific to AgentPay)

## What's Left to Do

1. Decide: Build fresh or rebuild from existing Android code?
2. Build REST API for ChatGPT/Google integration
3. Integrate OpenAPI payment processing
4. Load OpenStreetMap data into database
5. Create business signup/dashboard form
6. Submit ChatGPT plugin

## Decision Made (First Pass)

✅ **API-first, not app-first**
✅ **Own your data (OpenStreetMap), don't rent (Google Maps API)**
✅ **Credit card payments (OpenAPI), not crypto (yet)**
✅ **Business sign-ups optional, not required**
✅ **Three-sided marketplace (agents + AgentPay + providers)**

## CRITICAL CORRECTION (Second Pass - 22:18 UTC)

**FLAW IDENTIFIED:** Businesses won't pay 5-6% fee with no proof of ROI.

**Problem:** Current model assumes demand. But you can't ask providers to pay without proving the demand works.

**Solution:** Validation-first approach:
1. Build ChatGPT plugin (prove agent demand)
2. Test with 10 salons FREE (prove they get real customers)
3. Measure willingness to pay (only then ask for fee)
4. Series A with proof (not assumptions)

**Result:** Much stronger pitch. Investors prefer "here's what we tested" over "here's what we think will happen."

**Funding:** Reduce to $5M (validation), not $10M (scaling).

## Final Decision

✅ **Validation-first** (test before scale)
✅ **Demand-side first** (prove agents want to book)
✅ **Supply-side second** (test providers with free trial)
✅ **Series A with proof** (real data, not promises)
✅ **Lean budget** ($5M for testing, not $10M for assumptions)

This is the defensible, honest pitch that investors actually want.
