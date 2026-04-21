#!/bin/bash
# Polymarket Automated Sum-to-One Trader - Updated for dynamic market detection

export PATH="$HOME/.local/bin:$PATH"
cd ~/.openclaw/skills/polyclaw || exit 1

LOG="/root/.openclaw/workspace/polymarket-auto.log"
STATE="/root/.openclaw/workspace/polymarket-state.json"

log() {
  echo "[$(date -Iseconds)] $*" >> "$LOG"
}

# Initialize state
[ ! -f "$STATE" ] && echo '{"trades":[],"balance":60.08,"last_scan":null}' > "$STATE"

log "🦬 Polymarket Auto-Trader Started (Dynamic Short-Duration Mode)"
log "Strategy: Sum-to-one hedging on ALL short-duration BTC/ETH markets"

while true; do
  log "Scanning for short-duration crypto markets..."
  
  # Get all BTC and ETH markets, look for "Up or Down" patterns (typically hourly/short)
  BTC_MARKETS=$(uv run python scripts/polyclaw.py markets search "Bitcoin" 2>/dev/null | grep -iE "up or down|5 min|15 min|1 hour|2 hour" || true)
  ETH_MARKETS=$(uv run python scripts/polyclaw.py markets search "Ethereum" 2>/dev/null | grep -iE "up or down|5 min|15 min|1 hour|2 hour" || true)
  
  ALL_MARKETS=$(echo -e "$BTC_MARKETS\n$ETH_MARKETS" | grep -v "^$")
  
  if [ -z "$ALL_MARKETS" ]; then
    log "No short-duration markets found. Trying trending..."
    # Fallback: check trending markets for any BTC/ETH
    ALL_MARKETS=$(uv run python scripts/polyclaw.py markets trending 2>/dev/null | grep -iE "bitcoin|btc|ethereum|eth" | head -20 || true)
  fi
  
  COUNT=$(echo "$ALL_MARKETS" | grep -c "^" || echo 0)
  log "Found $COUNT potential markets"
  
  if [ "$COUNT" -eq 0 ]; then
    sleep 60
    continue
  fi
  
  # Parse and check for sum < 0.99
  FOUND_EDGE=0
  while read -r line; do
    [ -z "$line" ] && continue
    
    ID=$(echo "$line" | awk '{print $1}')
    YES=$(echo "$line" | awk '{print $2}' | tr -d '$')
    NO=$(echo "$line" | awk '{print $3}' | tr -d '$')
    
    # Skip if prices are invalid
    [[ "$YES" == "0.00" && "$NO" == "1.00" ]] && continue
    [[ "$YES" == "1.00" && "$NO" == "0.00" ]] && continue
    
    # Calculate sum
    SUM=$(echo "$YES + $NO" | bc 2>/dev/null || echo "2.0")
    
    # Check if sum < 0.99 (allowing for 2% fee)
    if (( $(echo "$SUM < 0.99" | bc -l) )); then
      EDGE=$(echo "1 - $SUM - 0.02" | bc)
      
      if (( $(echo "$EDGE > 0.005" | bc -l) )); then # At least 0.5% edge
        QUESTION=$(echo "$line" | cut -d' ' -f5- | cut -c1-60)
        log "🚨 EDGE FOUND: ID=$ID | YES=$YES NO=$NO | Sum=$SUM | Edge=$EDGE"
        log "   $QUESTION"
        
        # Trade size based on balance
        BALANCE=$(jq -r '.balance' "$STATE")
        TRADE_SIZE=8 # $8 per side (conservative)
        
        if (( $(echo "$BALANCE < 30" | bc -l) )); then
          log "   Balance too low ($BALANCE). Skipping trade."
          continue
        fi
        
        log "   Executing: Buy YES ($TRADE_SIZE) + NO ($TRADE_SIZE)"
        
        # Execute (suppress output, log errors only)
        uv run python scripts/polyclaw.py buy "$ID" YES "$TRADE_SIZE" >> "$LOG" 2>&1 &
        sleep 1
        uv run python scripts/polyclaw.py buy "$ID" NO "$TRADE_SIZE" >> "$LOG" 2>&1 &
        
        # Update state
        NEW_BALANCE=$(echo "$BALANCE - ($TRADE_SIZE * 2)" | bc)
        jq ".trades += [{\"id\":\"$ID\",\"sum\":$SUM,\"edge\":$EDGE,\"size\":$TRADE_SIZE,\"timestamp\":\"$(date -Iseconds)\"}] | .balance = $NEW_BALANCE" "$STATE" > "${STATE}.tmp" && mv "${STATE}.tmp" "$STATE"
        
        log "   Trade submitted. New balance: $NEW_BALANCE"
        FOUND_EDGE=1
        break # Only one trade per scan
      fi
    fi
  done <<< "$ALL_MARKETS"
  
  [ "$FOUND_EDGE" -eq 0 ] && log "No opportunities found (all sums >= 0.99)"
  
  sleep 60
done
