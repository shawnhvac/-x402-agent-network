# Prediction Market Arbitrage Research - March 2026

## Executive Summary

Based on comprehensive research, prediction market arbitrage is a proven strategy with documented profits exceeding $40M+ extracted from Polymarket alone (April 2024-April 2025). However, success requires:

1. **Automated execution** (opportunities close in milliseconds)
2. **Fee-aware strategy** (5%+ combined fees make many spreads unprofitable)
3. **Robust infrastructure** (VPS, low-latency, 24/7 monitoring)
4. **Settlement risk management** (platforms may resolve identical events differently)

## Arbitrage Strategy Types

### 1. Cross-Platform Arbitrage (Primary Focus)
**Strategy:** Buy opposite positions on different platforms when combined cost < $1.00

**Example:**
- Kalshi "Yes" = $0.35
- Polymarket "No" = $0.63
- Combined cost = $0.98
- Guaranteed payout = $1.00
- **Gross profit = $0.02 (2%)**

**After Fees:**
- Kalshi taker fee: ~$0.007 (formula: 0.07 × P × (1-P), peaks at 50¢)
- Polymarket winner fee: 2% of $1.00 = $0.02
- Polygon gas: ~$0.01
- **Net profit = -$0.008 (UNPROFITABLE)**

### 2. Same-Market Rebalancing
**Strategy:** YES + NO prices on single platform don't sum to $1.00

**Reality Check:**
- These opportunities last 200-500 milliseconds
- Requires sub-second automated execution
- Not viable for manual trading
- Polymarket has no trading fees (only 2% winner fee)

### 3. Combinatorial Arbitrage
**Strategy:** Exploit logical inconsistencies across related markets

**Example:**
- "Trump wins presidency" = 55%
- "Republican wins presidency" = 50%
- Logical impossibility (if Trump wins, Republican must win)
- Top 3 wallets earned $4.2M using this strategy

**Complexity:** High (requires identifying logical relationships + multi-leg execution)

## Platform Deep Dive

### Kalshi (US-Only, CFTC-Regulated)

**Fee Structure:**
- **Taker fee:** 0.07 × P × (1-P) where P = contract price
  - Maximum fee: 1.75¢ per contract (at 50¢ price)
  - Lower fees near 0¢ and $1.00
- **Maker fee:** Varies by market (sometimes negative = rebate)
- **Settlement:** Fiat (USD), no gas fees
- **Withdrawal:** ACH = free, Wire = $10-25

**Pros:**
- Legal for US residents
- Fiat-based (no crypto volatility risk)
- Fast settlement (centralized)

**Cons:**
- Higher fees than Polymarket
- Lower liquidity on most markets
- Limited market selection

### Polymarket (Crypto-Based, Not Available in US)

**Fee Structure:**
- **Trading fees:** 0% on most markets
- **Winner fee:** 2% on winning positions
- **Gas fees:** $0.01-0.05 per transaction (Polygon)
- **Settlement:** USDC (crypto stablecoin)

**Pros:**
- Zero trading fees
- Higher liquidity
- More market variety

**Cons:**
- Blocked for US users (VPN use = TOS violation risk)
- Requires crypto wallet + USDC
- On-chain execution = MEV risk (see below)

## MEV & Front-Running Risk Assessment

### What is MEV?
Maximal Extractable Value = bots can see your pending transaction and:
1. **Front-run:** Execute before you at better price
2. **Sandwich attack:** Execute before + after to profit from your slippage
3. **Back-run:** Copy your trade immediately after

### Polymarket MEV Risk: MODERATE

**Why it exists:**
- All trades are on-chain (Polygon)
- Transactions sit in public mempool before execution
- Bots scan mempool for profitable trades to front-run

**Mitigation strategies:**
- Use private RPC endpoints (Flashbots, Eden Network)
- Set max slippage limits
- Break large orders into smaller chunks
- Execute during low-traffic periods

**Reality:** Polymarket's low gas fees + fast block times (2s on Polygon) reduce MEV window. Most arbitrage traders report minimal MEV impact in practice.

### Kalshi MEV Risk: ZERO

**Why:**
- Centralized exchange (off-chain order matching)
- Orders don't sit in public mempool
- No blockchain-based front-running possible

**Other risks:**
- **Latency arbitrage:** HFT bots with co-located servers can still front-run via speed
- **Order book sniping:** Bots react faster to price changes

## Critical Constraint: The "YES + NO < $1" Rule

### ❌ Why This Doesn't Work on Kalshi Alone

You mentioned: *"No automatic YES + NO under $1 arb (it's fiat-based)"*

**Correct.** Here's why:

On a single platform (Kalshi), if YES = $0.52 and NO = $0.46:
- Combined cost = $0.98
- Potential profit = $0.02 (2%)

**But after fees:**
- Kalshi taker fee on YES: ~$0.0091 (0.07 × 0.52 × 0.48)
- Kalshi taker fee on NO: ~$0.0091
- **Total fees: ~$0.018 (1.8%)**
- **Net profit: $0.02 - $0.018 = $0.002 (0.2%)**

**Minimum profitable spread:** ~5-6% to overcome fees

### ✅ Cross-Platform Arbitrage (Kalshi + Crypto)

**This is where profit exists:**
- Buy YES on Kalshi ($0.35)
- Buy NO on Polymarket ($0.63) using crypto wallet
- Combined cost = $0.98
- Fees = ~$0.03-0.05
- Net profit = -$0.01 to $0.01 (marginal)

**Realistic minimum spread needed: 6-8%**

## Fee Calculation Framework

### Formula for Profitability
```
Net Profit = $1.00 - (Price_Platform_A + Price_Platform_B) - Total_Fees

Where Total_Fees =
  + Kalshi_taker_fee (0.07 × P × (1-P))
  + Polymarket_winner_fee (2% × $1.00 = $0.02)
  + Gas_fees ($0.01-0.05)
  + Withdrawal_fees (if applicable)
```

### Breakeven Analysis

| Spread | Kalshi Fee | Polymarket Fee | Gas | Total Fees | Net Profit |
|--------|------------|----------------|-----|------------|------------|
| 2%     | ~$0.01     | $0.02          | $0.01 | $0.04    | **-$0.02** ❌ |
| 5%     | ~$0.01     | $0.02          | $0.01 | $0.04    | **+$0.01** ✅ |
| 8%     | ~$0.01     | $0.02          | $0.01 | $0.04    | **+$0.04** ✅ |

**Takeaway:** Target spreads ≥6% for consistent profitability

## Infrastructure Requirements

### 1. VPS / Cloud Server
**Why:** Arbitrage windows close in <1 second. Home internet adds 50-200ms latency.

**Specs:**
- Location: New York (Kalshi proximity) + Polygon node access
- Network: 1Gbps, <10ms latency
- CPU: 2+ cores
- RAM: 4GB+
- OS: Linux (for Python bots) or Windows (GUI tools)

**Cost:** $25-50/month

### 2. Automated Monitoring System
**Required capabilities:**
- Real-time price feeds from Kalshi + Polymarket
- Spread calculation engine
- Fee-aware profit calculator
- Automated execution or instant alerts

**Options:**
- Custom Python bot (Kalshi API + py-clob-client for Polymarket)
- Open-source: [Polymarket-Kalshi-Arb-Bot](https://github.com/terauss/Polymarket-Kalshi-Arbitrage-bot)
- Commercial: EventArb.com, GetArbitrageBets.com

### 3. Capital Requirements
**Minimum:** $5,000-10,000 split across platforms

**Why:**
- Need funds on both platforms simultaneously
- Can't wait for transfers (opportunities close instantly)
- Larger positions = better absolute profits (% gains are small)

## Recommended Arbitrage Workflow

### Phase 1: Setup (Week 1)
1. ✅ Create Kalshi account (wait 24h for approval)
2. ✅ Set up crypto wallet (MetaMask/Rainbow)
3. ✅ Fund wallet with USDC on Polygon
4. ⚠️ **Decision:** Polymarket access via:
   - VPN + proxy (TOS violation risk)
   - Non-US friend's account (risky)
   - Wait for regulatory clarity
5. Deploy monitoring on VPS

### Phase 2: Manual Testing (Week 2-3)
1. Use EventArb.com calculator
2. Track spreads manually (no execution)
3. Document:
   - How often spreads exceed 6%
   - How fast they close
   - Which market categories are most profitable
4. Calculate realistic opportunity frequency

### Phase 3: Automation (Week 4+)
1. Deploy Python bot on VPS
2. Start with $500-1000 position sizes
3. Log every trade:
   - Entry prices
   - Fees paid
   - Execution time
   - Net profit
4. Optimize based on data

## Risk Management Checklist

### Before Every Trade:
- [ ] Verify resolution criteria match across platforms
- [ ] Calculate total fees (don't assume 2%)
- [ ] Check liquidity (can you execute full size?)
- [ ] Confirm spread still exists (refresh prices)
- [ ] Set max slippage tolerance

### Settlement Risk Mitigation:
- [ ] Read official resolution rules
- [ ] Check if platforms use same data source
- [ ] Avoid markets with ambiguous criteria
- [ ] Document resolution logic before executing

### Example of Settlement Mismatch:
**2024 Government Shutdown Case:**
- Polymarket: "OPM issues shutdown announcement" → Resolved YES
- Kalshi: "Actual shutdown exceeding 24 hours" → Resolved NO
- Traders with cross-platform arb positions → **LOST ON BOTH SIDES**

## Realistic Profit Projections

### Conservative Scenario (Manual + Semi-Automated)
- Capital: $5,000 per platform ($10k total)
- Opportunities captured: 5-10/month
- Average spread: 6%
- Position size: $500-1000
- Profit per trade: $20-40
- **Monthly profit: $100-400**
- **Annual return: ~12-48%** (on deployed capital)

### Aggressive Scenario (Fully Automated Bot)
- Capital: $25,000 per platform ($50k total)
- Opportunities captured: 50-100/month
- Average spread: 5%
- Position size: $2,000-5,000
- Profit per trade: $50-100
- **Monthly profit: $2,500-10,000**
- **Annual return: ~60-240%** (on deployed capital)

**Reality check:** Top 3 wallets in academic study earned $4.2M over 12 months with 10,200+ trades = $400/trade average. They were highly sophisticated with likely $1M+ deployed capital.

## Regulatory Considerations

### Kalshi Legal Status
- ✅ CFTC-regulated DCM (legal for US residents)
- ✅ Fiat settlement (no crypto compliance issues)
- ⚠️ Facing state-level challenges (MA lawsuit for sports betting)

### Polymarket Legal Status
- ❌ Not available to US users (geo-blocked)
- ⚠️ Using VPN = TOS violation → account freeze risk
- ⚠️ CFTC settlement in 2022 ($1.4M fine)

### Tax Implications
- Arbitrage profits = short-term capital gains
- Each leg is a separate taxable event
- Keep detailed trade logs for IRS reporting
- Consider working with crypto-savvy tax accountant

## Next Steps After Kalshi Approval

### Immediate (Day 1-7):
1. Fund Kalshi account ($5,000 recommended)
2. Set up crypto wallet + fund with USDC
3. Deploy monitoring system on VPS
4. Begin manual spread tracking

### Short-term (Week 2-4):
1. Identify 10+ high-volume markets
2. Track spread frequency/duration
3. Calculate realistic profit after fees
4. Test execution speed manually

### Long-term (Month 2+):
1. Build or deploy automated bot
2. Scale capital gradually
3. Optimize for specific market types
4. Monitor for regulatory changes

## Resources & Tools

### APIs & Documentation
- [Kalshi API Docs](https://kalshi.com/docs)
- [Polymarket CLOB API](https://docs.polymarket.com)
- [py-clob-client](https://github.com/Polymarket/py-clob-client) (Python)

### Calculators
- [EventArb.com](https://www.eventarb.com/) - Real-time cross-platform arb calculator
- [ArbCalculator.cc](https://arbcalculator.cc/) - Fee-inclusive profit calculator

### Open-Source Bots
- [Polymarket-Kalshi-Arbitrage-bot](https://github.com/terauss/Polymarket-Kalshi-Arbitrage-bot)
- [NautilusTrader](https://nautilustrader.io/) - Institutional-grade trading framework

### Research Papers
- ["Unravelling the Probabilistic Forest: Arbitrage in Prediction Markets"](https://arxiv.org/abs/2508.03474) (arXiv:2508.03474)
- $40M profit study, 86M bets analyzed

## Key Takeaways

### ✅ DO:
- Focus on cross-platform arbitrage (Kalshi + crypto markets)
- Target spreads ≥6% for profitability
- Automate monitoring and execution
- Verify resolution criteria always match
- Use VPS for low-latency execution
- Start small and scale based on results

### ❌ DON'T:
- Try manual arbitrage (too slow)
- Execute spreads <5% (fees will eat profits)
- Assume same-event markets resolve identically
- Use VPN for Polymarket (TOS violation risk)
- Trade on margin (these are binary outcomes)
- Ignore gas fees in profit calculations

### 🎯 Optimal Strategy:
**"Fee-Aware Cross-Platform Arbitrage with Automated Execution"**

Target 8-12 opportunities/month at 6-10% spreads with full automation. This balances:
- Realistic capture rate
- Profitable spreads after fees
- Manageable capital requirements
- Lower settlement risk (fewer trades)

---

**Status:** Waiting for Kalshi approval (24h expected)  
**Next Action:** Set up monitoring infrastructure while account processes  
**Updated:** 2026-03-24 04:26 UTC
