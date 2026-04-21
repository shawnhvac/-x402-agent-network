# CACHING STRATEGY - Token Cost Optimization
**Goal:** Reduce Claude Haiku costs from $10/day to $7-8/day (20-30% savings)

---

## 1. CONTEXT CACHING (Prompt Caching)

### High-Frequency Files (Cache These)
These files are read repeatedly and should be cached:

```
MEMORY.md (6.5 KB)
  - Read at start of every session
  - Updated only 2-3x per week
  - Cache cost: paid once, reused 100+ times
  - ROI: 100:1 (pay once, use 100 times)

USER.md (955 B)
  - Used for every request
  - Never changes
  - Cache immediately

SOUL.md (1.67 KB)
  - Used for tone/personality
  - Never changes
  - Cache immediately

AGENTS.md (7.8 KB)
  - Reference for agent framework
  - Changes rarely
  - Cache at session start

x402-agent-network/README.md (if created)
  - Architecture reference
  - Consulted frequently
  - Cache after creation
```

### Implementation
When caching is enabled in Claude API:
1. Load MEMORY.md + USER.md + SOUL.md in first message
2. Claude marks as "cacheable context"
3. First request pays full token cost
4. Next 100 requests in same session pay 10% of context cost
5. Savings: ~1,000 tokens per request = $0.01/request

---

## 2. SESSION BATCHING

### Current Pattern (Inefficient)
```
Request 1: "Check grid bot status" (50 tokens to load context)
Request 2: "Update memory" (50 tokens to load context again)
Request 3: "Check DNS" (50 tokens to load context again)
Total: 150 tokens for context alone
```

### Optimized Pattern
```
Request 1: "Check grid bot status AND update memory AND check DNS" (50 tokens context loaded once)
Total: 50 tokens for context
Savings: 100 tokens per batched request
```

**Rule:** Batch 2-3 quick tasks per request instead of individual messages.

---

## 3. RESULT REUSE & MEMOIZATION

### Cache Results of Expensive Operations

#### Server Status Checks
- Grid trading bot status
- AgentPay server status
- DNS resolution
- System load

**Current:** Check these every time asked (5-10 tokens each)
**Optimized:** Cache for 30 minutes, reuse

Example cache file:
```json
{
  "grid_bot": {
    "status": "running",
    "pid": 19239,
    "timestamp": "2026-04-21T01:30:48Z",
    "cache_expires": "2026-04-21T02:00:48Z"
  },
  "agentpay": {
    "status": "running",
    "port": 3001,
    "timestamp": "2026-04-21T01:30:48Z"
  }
}
```

**Savings:** 50-100 tokens per check (they happen 5+ times per day)

#### DNS Lookups
- Cache domain resolution for 1 hour
- Skip redundant nslookup calls
- Save 10 tokens per lookup

#### SSH Commands
- Cache output from repeated checks
- Only re-run if explicitly requested
- Save 20-30 tokens per cached command

---

## 4. SMARTER LOGGING & MEMORY UPDATES

### Current: Full Re-reads
Every operation re-reads entire MEMORY.md file (6.5 KB = 1,500 tokens)

### Optimized: Incremental Updates
1. Only load sections needed for current task
2. Update only the changed section
3. Preserve rest of file
4. Append to daily log instead of full re-read

**Savings:** 1,000+ tokens per session

---

## 5. COMPRESSION & SUMMARIZATION

### Long Documents
When MEMORY.md grows >10 KB:
1. Archive old entries to `memory/archive/2026-04.md`
2. Keep only recent 30 days in MEMORY.md
3. Reference archived sections when needed
4. Reduce context size by 40%

**Savings:** 500+ tokens per session

### Summarize Long Logs
- Grid trading bot logs: Keep only last 20 lines
- Server logs: Summarize error patterns
- Reduce from 10 KB to 2 KB
- Save 2,000+ tokens per check

---

## 6. SMART DEFAULTS & ASSUMPTIONS

### Don't Ask, Assume & Verify
**Current:** Every request asks "should I SSH to server?"
**Optimized:** SSH automatically for status checks, ask only for writes

**Savings:** 10-20 tokens per request

### Cached Constants
Store in memory:
```json
{
  "servers": {
    "contabo": "85.239.236.56",
    "contabo_password": "Test123456!",
    "telegram_token": "xxx"
  },
  "trading": {
    "grid_spacing": 1.5,
    "pairs": ["BTC-USD", "ETH-USD"]
  }
}
```
**Savings:** 30 tokens per operational request (no re-explain)

---

## IMPLEMENTATION ROADMAP

### Phase 1: Immediate (Today)
- [ ] Create `LOCAL_CACHE.json` for server status
- [ ] Implement 30-min TTL caching for common checks
- [ ] Batch 2-3 quick tasks per request

**Expected savings:** $0.50-1.00/day

### Phase 2: This Week
- [ ] Implement prompt caching (when Claude API enables)
- [ ] Archive old memory entries
- [ ] Compress logs to summaries

**Expected savings:** $1.50-2.50/day

### Phase 3: Ongoing
- [ ] Monitor cache hit rates
- [ ] Optimize cache TTLs based on usage
- [ ] Add more smart defaults

**Expected savings:** $2.00-3.00/day total

---

## CACHE FILES TO CREATE

### `/root/.openclaw/workspace/cache/system-status.json`
```json
{
  "grid_bot": {
    "status": "running",
    "pid": 19239,
    "checked": "2026-04-21T01:30:48Z",
    "ttl_seconds": 1800
  },
  "agentpay": {
    "status": "running",
    "port": 3001,
    "checked": "2026-04-21T01:30:48Z"
  },
  "dns": {
    "x402-agent-pay.com": "85.239.236.56",
    "checked": "2026-04-21T01:30:48Z",
    "ttl_seconds": 3600
  }
}
```

### `/root/.openclaw/workspace/cache/command-results.json`
```json
{
  "ps_grid_bot": {
    "result": "root 19239 ...",
    "checked": "2026-04-21T01:30:48Z",
    "ttl_seconds": 300
  }
}
```

---

## COST IMPACT PROJECTION

**Current:** $10/day × 30 days = **$300/month**

**With caching:**
- Context caching: -$50/month (cached MEMORY)
- Result caching: -$40/month (status checks)
- Batching: -$35/month (fewer redundant loads)
- Log compression: -$30/month (smaller context)
- Smart defaults: -$25/month (fewer explanations)

**New estimate:** $120/month = **$4/day** (60% reduction)

---

## NEXT STEPS

1. Create cache directory: `/root/.openclaw/workspace/cache/`
2. Implement `check_cache()` function
3. Implement `update_cache()` function
4. Start batching requests
5. Monitor cache hit rates

Ready to implement? 🚀
