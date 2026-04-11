#!/bin/bash
# Bot Watchdog - Monitors trading bots and restarts if crashed
# Run via: (crontab -e) → */5 * * * * /root/.openclaw/workspace/bot-watchdog.sh

WORKSPACE="/root/.openclaw/workspace"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Grid Trading Bot
GRID_PID=$(pgrep -f "grid-trading-live.py")
if [ -z "$GRID_PID" ]; then
    echo "[$TIMESTAMP] ALERT: Grid trading bot crashed, restarting..."
    cd $WORKSPACE
    if [ -f "grid-trading-live.py" ]; then
        nohup python3 grid-trading-live.py > grid-trading-live.log 2>&1 &
        echo "[$TIMESTAMP] Grid trading bot restarted (PID: $!)"
    else
        echo "[$TIMESTAMP] ERROR: grid-trading-live.py not found"
    fi
else
    echo "[$TIMESTAMP] ✅ Grid trading bot running (PID: $GRID_PID)"
fi



# AgentPay Server
SERVER_HEALTH=$(curl -s http://localhost:3001/health | grep -o "healthy")
if [ -z "$SERVER_HEALTH" ]; then
    echo "[$TIMESTAMP] ALERT: AgentPay server down, restarting..."
    pkill -f "node dist/app.js"
    cd $WORKSPACE/x402-agent-network
    nohup npm start > /tmp/agentpay.log 2>&1 &
    echo "[$TIMESTAMP] AgentPay server restarted"
else
    echo "[$TIMESTAMP] ✅ AgentPay server healthy"
fi

echo "[$TIMESTAMP] Watchdog check complete" >> $WORKSPACE/bot-watchdog.log
