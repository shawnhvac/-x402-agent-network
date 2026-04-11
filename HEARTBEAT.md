# Trading Bots Heartbeat Checks

## Checks to run every 30 minutes:

### GRID TRADING BOT (CRITICAL!)
```
ps aux | grep grid-trading-live.py | grep -v grep
```
Should show a running process. If not, restart IMMEDIATELY.

**Recent activity check:**
```
tail -3 grid-trading-live.log
```
Should show timestamps within last 5 minutes. If older, bot has crashed.

**Restart if needed:**
```
cd /root/.openclaw/workspace && nohup python3 grid-trading-live.py > grid-trading-live.log 2>&1 &
```

### 3. DEPENDENCIES CHECK
If grid-trading-live.py fails to start with module errors, run:
```
pip install ccxt pandas numpy requests --break-system-packages -q
```

## Status to report:

**Grid Trading Bot:**
- ✅ Running / ❌ Crashed
- Last scan timestamp
- Capital status
- Grid positions (BTC/ETH)

### 4. AGENTPAY SERVER (CRITICAL!)
```
curl -s http://localhost:3001/health | grep -q healthy
```
Should return `{"status":"healthy","database":"ready"}`. If not, restart immediately.

**Restart if needed:**
```
pkill -f "node dist/app.js"
cd /root/.openclaw/workspace/x402-agent-network && nohup npm start > /tmp/agentpay.log 2>&1 &
```

**Status to check:**
- ✅ Server responding on port 3001
- ✅ Database ready
- ✅ No recent errors in logs

**Alert Rules:**

**Grid Trading Bot (CRITICAL):**
- ⚠️ Down >5 min → Restart + IMMEDIATE ALERT

**AgentPay Server (CRITICAL):**
- ⚠️ Down >2 min → Restart + IMMEDIATE ALERT
- ⚠️ Restart fails >3 times → Manual intervention required
