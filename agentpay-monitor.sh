#!/bin/bash

# AgentPay Server Monitor & Auto-Restart
# Checks every 30 seconds, auto-restarts if down
# Run with: nohup bash agentpay-monitor.sh > agentpay-monitor.log 2>&1 &

SERVER_DIR="/root/.openclaw/workspace/x402-agent-network"
LOG_FILE="/root/.openclaw/workspace/agentpay-monitor.log"
PORT=3001
MAX_RESTARTS=5
RESTART_COUNT=0

log() {
    echo "[$(date '+%Y-%m-%dT%H:%M:%S.%3NZ')] $1" >> "$LOG_FILE"
}

check_server() {
    # Try to reach health endpoint
    if curl -s http://localhost:$PORT/health | grep -q "healthy"; then
        return 0  # Server is healthy
    else
        return 1  # Server is down
    fi
}

restart_server() {
    log "⚠️  Server down! Attempting restart..."
    
    # Kill any existing processes
    pkill -f "node dist/app.js" 2>/dev/null
    sleep 2
    
    # Start server
    cd "$SERVER_DIR"
    nohup npm start > /tmp/agentpay.log 2>&1 &
    sleep 5
    
    # Verify restart
    if check_server; then
        log "✅ Server restarted successfully"
        RESTART_COUNT=0
        return 0
    else
        RESTART_COUNT=$((RESTART_COUNT + 1))
        log "❌ Restart attempt $RESTART_COUNT failed"
        
        if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
            log "🚨 CRITICAL: Server failed $MAX_RESTARTS times. Manual intervention needed."
            # Send alert (could integrate with telegram here)
            return 1
        fi
        return 1
    fi
}

# Main monitoring loop
log "🚀 AgentPay Monitor started (port $PORT)"

while true; do
    if ! check_server; then
        log "❌ Server health check failed"
        restart_server
    else
        # Silently healthy (log every 10 checks to avoid log spam)
        if [ $(($(date +%s) % 10)) -eq 0 ]; then
            log "✅ Server healthy ($(curl -s http://localhost:$PORT/health | jq -r .status))"
        fi
    fi
    
    # Check every 30 seconds
    sleep 30
done
