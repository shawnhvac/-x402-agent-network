#!/bin/bash

###############################################################################
# AgentPay Watchdog - Auto-restart Service Monitor
# Monitors AgentPay server and restarts if it crashes
# 
# Installation:
#   chmod +x /root/.openclaw/workspace/agentpay-watchdog.sh
#   crontab -e
#   */5 * * * * /root/.openclaw/workspace/agentpay-watchdog.sh
#
# This runs every 5 minutes and restarts AgentPay if it's not running
###############################################################################

LOG_FILE="/tmp/agentpay-watchdog.log"
WORKSPACE="/root/.openclaw/workspace"
APP_DIR="$WORKSPACE/x402-agent-network"
PID_FILE="/tmp/agentpay.pid"
MAX_RESTART_ATTEMPTS=3
RESTART_ATTEMPT_FILE="/tmp/agentpay-restart-attempts"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to get current process count
get_process_count() {
    ps aux | grep -E "node dist/app.js|npm start" | grep -v grep | wc -l
}

# Function to restart AgentPay
restart_agentpay() {
    log_message "⚠️  AgentPay not running. Attempting restart..."
    
    # Kill any lingering processes
    pkill -f "node dist/app.js" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    sleep 2
    
    # Start fresh
    cd "$APP_DIR"
    
    # Rebuild if needed (addresses better-sqlite3 issues)
    if [ ! -d "dist" ] || [ ! -d "node_modules" ]; then
        log_message "Rebuilding node_modules..."
        npm install -q 2>&1 | tail -1 >> "$LOG_FILE"
        npm run build 2>&1 | tail -1 >> "$LOG_FILE"
    fi
    
    # Start the server
    nohup npm start > /tmp/agentpay.log 2>&1 &
    local NEW_PID=$!
    echo $NEW_PID > "$PID_FILE"
    
    log_message "✅ AgentPay restarted (PID: $NEW_PID)"
    sleep 3
    
    # Verify it started
    if get_process_count | grep -q "[1-9]"; then
        log_message "✅ Restart successful"
        # Reset restart counter on successful start
        rm -f "$RESTART_ATTEMPT_FILE"
        return 0
    else
        log_message "❌ Restart failed"
        return 1
    fi
}

# Main logic
PROCESS_COUNT=$(get_process_count)

if [ "$PROCESS_COUNT" -eq 0 ]; then
    # Server is not running
    
    # Check restart attempts
    if [ -f "$RESTART_ATTEMPT_FILE" ]; then
        ATTEMPTS=$(cat "$RESTART_ATTEMPT_FILE")
    else
        ATTEMPTS=0
    fi
    
    if [ "$ATTEMPTS" -lt "$MAX_RESTART_ATTEMPTS" ]; then
        ATTEMPTS=$((ATTEMPTS + 1))
        echo "$ATTEMPTS" > "$RESTART_ATTEMPT_FILE"
        log_message "Restart attempt $ATTEMPTS/$MAX_RESTART_ATTEMPTS"
        restart_agentpay
    else
        log_message "❌ CRITICAL: Max restart attempts exceeded. Manual intervention needed."
        log_message "Recent logs:"
        tail -10 /tmp/agentpay.log >> "$LOG_FILE"
    fi
else
    # Server is running, check if it's responsive
    RESPONSE=$(curl -s -m 2 http://localhost:3001/health 2>/dev/null)
    
    if echo "$RESPONSE" | grep -q "healthy"; then
        # All good
        log_message "✅ AgentPay healthy (PID: $(pgrep -f 'node dist/app.js' | head -1))"
    else
        log_message "⚠️  AgentPay not responding. Attempting restart..."
        restart_agentpay
    fi
fi

# Keep log file manageable (max 1000 lines)
if [ -f "$LOG_FILE" ]; then
    LINES=$(wc -l < "$LOG_FILE")
    if [ "$LINES" -gt 1000 ]; then
        tail -500 "$LOG_FILE" > "${LOG_FILE}.tmp"
        mv "${LOG_FILE}.tmp" "$LOG_FILE"
        log_message "Log rotated (kept last 500 entries)"
    fi
fi

exit 0
