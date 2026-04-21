#!/bin/bash
################################################################################
# Grid Trading Bot Watchdog
# Purpose: Monitor grid-trading-live.py and auto-restart if it crashes
# Run: Every 5 minutes via crontab
# Log: /root/.openclaw/workspace/bot-watchdog.log
################################################################################

LOG_FILE="/root/.openclaw/workspace/bot-watchdog.log"
BOT_FILE="/root/.openclaw/workspace/grid-trading-live.py"
BOT_LOG="/root/.openclaw/workspace/grid-trading-live.log"
WORKSPACE="/root/.openclaw/workspace"

log() {
    echo "[$(date +'%Y-%m-%dT%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if bot process is running
check_bot() {
    ps aux | grep -v grep | grep "python3 grid-trading-live.py" > /dev/null
    return $?
}

# Check if bot log has recent activity (within last 5 minutes)
check_bot_activity() {
    if [ ! -f "$BOT_LOG" ]; then
        return 1
    fi
    
    # Get last log timestamp
    LAST_TIMESTAMP=$(tail -1 "$BOT_LOG" | grep -oP '\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}' | tail -1)
    
    if [ -z "$LAST_TIMESTAMP" ]; then
        return 1
    fi
    
    # Compare with current time (allow 5 min staleness)
    LAST_EPOCH=$(date -d "$LAST_TIMESTAMP" +%s 2>/dev/null || echo 0)
    CURRENT_EPOCH=$(date +%s)
    DIFF=$((CURRENT_EPOCH - LAST_EPOCH))
    
    # If log is stale (>5 min old), bot might be stuck
    if [ "$DIFF" -gt 300 ]; then
        return 1
    fi
    
    return 0
}

# Restart bot
restart_bot() {
    log "🔴 BOT DOWN! Restarting..."
    
    # Kill any existing processes
    pkill -f "python3 grid-trading-live.py" 2>/dev/null
    sleep 1
    
    # Start bot
    cd "$WORKSPACE"
    nohup python3 grid-trading-live.py > "$BOT_LOG" 2>&1 &
    BOT_PID=$!
    
    sleep 2
    
    # Verify it started
    if check_bot; then
        log "✅ BOT RESTARTED (PID: $BOT_PID)"
        return 0
    else
        log "❌ BOT RESTART FAILED - Manual intervention required!"
        return 1
    fi
}

# Main watchdog logic
main() {
    # Check if bot is running
    if ! check_bot; then
        log "⚠️  Bot process not found"
        restart_bot
        return $?
    fi
    
    # Check if bot has recent activity
    if ! check_bot_activity; then
        log "⚠️  Bot activity stale (>5 minutes)"
        restart_bot
        return $?
    fi
    
    # Bot is healthy
    log "✅ Bot healthy ($(ps aux | grep -v grep | grep 'python3 grid-trading-live.py' | awk '{print "PID:" $2}'))"
    return 0
}

# Run watchdog
main
exit $?
