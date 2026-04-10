# Bot Monitoring Protocol

**Date Created:** April 6, 2026 (after grid trading bot failure)  
**Purpose:** Prevent future 5-day downtime incidents  
**Responsibility:** Critical monitoring, not optional

---

## Critical Issue Acknowledged

**What happened:**
- Grid trading bot crashed April 2, 03:25 UTC
- Remained down for 5 days (April 2-6)
- Missed significant trading opportunities (BTC/ETH volatility)
- Root cause: Missing Python dependencies + no monitoring

**This will not happen again.**

---

## Heartbeat Monitoring (Every 30 minutes)

### Both Bots Must Be Checked

**Kalshi Bot:**
```bash
ps aux | grep kalshi-bot | grep -v grep
tail -5 kalshi-trading.log
```

**Grid Trading Bot:**
```bash
ps aux | grep grid-trading-live.py | grep -v grep
tail -3 grid-trading-live.log
```

### Alert Thresholds

| Bot | Down Time | Action |
|-----|-----------|--------|
| Kalshi | >10 min | Restart + Report |
| Grid Trading | >5 min | Restart + CRITICAL ALERT |

### Auto-Restart Procedure

**If Grid Trading Bot is down:**
1. Install dependencies: `pip install ccxt pandas numpy requests --break-system-packages -q`
2. Restart bot: `cd /root/.openclaw/workspace && nohup python3 grid-trading-live.py > grid-trading-live.log 2>&1 &`
3. Verify: Wait 10 seconds, check logs for "Starting grid trading loop"
4. Report to Shawn immediately

**If Kalshi Bot is down:**
1. Restart: `cd /root/.openclaw/workspace && nohup python3 kalshi-bot.py > /dev/null 2>&1 &`
2. Verify within 30 seconds
3. Report status

---

## Monitoring Logs

### Grid Trading Bot Log
```
/root/.openclaw/workspace/grid-trading-live.log
```

**What to check:**
- Timestamp should be recent (within 5 min)
- Look for: "📍 BTC/USD approaching" or "📍 ETH/USD approaching"
- If older timestamps → bot crashed

### Kalshi Bot Log
```
/root/.openclaw/workspace/kalshi-trading.log
```

**What to check:**
- Timestamp should be recent (within 5 min)
- Look for: "Fetched N markets" or "Found X opportunities"
- If older timestamps → bot crashed

---

## Immediate Actions on Bot Failure

### Grid Trading Bot Down (CRITICAL)
1. Check logs for errors
2. Install missing dependencies if needed
3. Restart immediately
4. Verify it's scanning (check logs every 3 seconds)
5. **Report to Shawn with:**
   - How long it was down
   - Capital status (should be unchanged)
   - Grid positions status
   - Time to resume trading

### Kalshi Bot Down
1. Check logs for errors
2. Restart immediately
3. Verify it's fetching markets
4. Report status

---

## Monthly Maintenance

**Every week:**
- [ ] Check disk space (logs can grow large)
- [ ] Verify both bots have recent activity
- [ ] Confirm capital/trading status

**Every month:**
- [ ] Clean up old log files (keep last 30 days)
- [ ] Check dependency versions
- [ ] Review trading performance

---

## Never Again

The 5-day downtime on grid trading bot will not happen again because:

✅ Heartbeat now checks BOTH bots  
✅ Grid bot has priority alert (>5 min down)  
✅ Auto-restart procedure documented  
✅ Dependencies pre-installed  
✅ Immediate reporting required  

**Grid trading is too critical to miss.**

---

*Protocol established: April 6, 2026, 11:57 UTC*  
*Status: Active and enforced*
