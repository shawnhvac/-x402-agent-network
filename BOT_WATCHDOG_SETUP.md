# Bot Watchdog - Automatic Restart System
## April 11, 2026

## ✅ WATCHDOG INSTALLED

**Location:** `/root/.openclaw/workspace/bot-watchdog.sh`  
**Schedule:** Every 5 minutes via crontab  
**Status:** ACTIVE

## What It Does

The watchdog script monitors three critical services:

1. **Grid Trading Bot** (`grid-trading-live.py`)
   - Checks if process is running
   - If crashed: Restarts automatically
   - Logs: `grid-trading-live.log`

2. **Kalshi Bot** (`kalshi-bot.py`)
   - Checks if process is running
   - If crashed: Restarts automatically
   - Logs: `kalshi-trading.log`

3. **AgentPay Server** (Node.js on port 3001)
   - Checks `/health` endpoint
   - If down: Restarts npm
   - Logs: `/tmp/agentpay.log`

## Crontab Entry

```bash
*/5 * * * * /root/.openclaw/workspace/bot-watchdog.sh
```

Runs every 5 minutes. If a bot crashes, it restarts within 5 minutes.

## Log File

All watchdog activity logged to: `bot-watchdog.log`

```bash
tail -f /root/.openclaw/workspace/bot-watchdog.log
```

## Important Note: Bot Files

**Status:** Grid trading and Kalshi bot files were removed from public GitHub repo (correct decision — they're private operations tools).

**When restoring bots:**
1. Recover grid-trading-live.py from backup/private repo
2. Recover kalshi-bot.py from backup/private repo
3. Place in `/root/.openclaw/workspace/`
4. Watchdog will auto-restart them

**Why removed from public:**
- Trading strategies are proprietary
- Private operations, not investor-facing
- Public repo focuses on AgentPay marketplace only
- Bitcoin + Kalshi trading separate from agent commerce business

## Manual Restart (If Needed)

```bash
# Grid trading
cd /root/.openclaw/workspace
nohup python3 grid-trading-live.py > grid-trading-live.log 2>&1 &

# Kalshi
nohup python3 kalshi-bot.py > /dev/null 2>&1 &

# Verify
ps aux | grep -E "grid-trading-live|kalshi-bot" | grep -v grep
```

## Testing Watchdog

```bash
# Kill a bot to test auto-restart
pkill -f "grid-trading-live.py"

# Wait 5 minutes (or run watchdog manually)
/root/.openclaw/workspace/bot-watchdog.sh

# Should restart automatically
ps aux | grep grid-trading
```

## Enhancement Ideas

Could extend watchdog to:
- ✅ Restart on CPU/memory threshold
- ✅ Alert on repeated crashes (>3 in 10 min)
- ✅ Rotate logs (prevent disk fill)
- ✅ Track uptime stats
- ✅ SMS/email alerts on critical failures

For now: Simple, reliable, works.

---

**Status:** ✅ WATCHDOG ACTIVE

Bots will auto-restart if they crash. Check `/root/.openclaw/workspace/bot-watchdog.log` for activity.

🦬 Setup by OX | April 11, 2026
