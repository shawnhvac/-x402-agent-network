#!/usr/bin/env python3
"""
Polymarket Aggressive Short-Duration Trader
Continuously scans for live Up/Down markets with valid prices
"""
import json
import subprocess
import time
from datetime import datetime
import httpx

GAMMA_API = "https://gamma-api.polymarket.com"
LOG_FILE = "/root/.openclaw/workspace/polymarket-auto.log"
STATE_FILE = "/root/.openclaw/workspace/polymarket-state.json"

def log(msg):
    ts = datetime.now().isoformat()
    with open(LOG_FILE, 'a') as f:
        f.write(f"[{ts}] {msg}\n")

def load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except:
        return {"trades": [], "balance": 60.08, "last_scan": None}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def fetch_live_updown_markets():
    """Fetch markets, filter for live Up/Down crypto markets with valid prices"""
    try:
        resp = httpx.get(
            f"{GAMMA_API}/markets",
            params={"closed": "false", "limit": 1000},
            timeout=30
        )
        resp.raise_for_status()
        all_markets = resp.json()
        
        # Filter criteria
        updown_keywords = ['up or down', 'updown', 'up/down']
        crypto_keywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol']
        
        live_markets = []
        for m in all_markets:
            if m.get('closed', True) or m.get('resolved', False):
                continue
            
            question = m.get('question', '').lower()
            slug = m.get('slug', '').lower()
            
            # Must be crypto AND updown/short-duration
            has_crypto = any(kw in question or kw in slug for kw in crypto_keywords)
            has_updown = any(kw in question or kw in slug for kw in updown_keywords)
            has_short_duration = 'minute' in question or 'hour' in question
            
            if not (has_crypto and (has_updown or has_short_duration)):
                continue
            
            # Must have valid prices
            tokens = m.get('tokens', [])
            if len(tokens) < 2:
                continue
            
            yes_price = float(tokens[0].get('price', 0))
            no_price = float(tokens[1].get('price', 0))
            
            # Skip zero prices (closed/resolved markets)
            if yes_price == 0.0 or no_price == 0.0:
                continue
            
            # Skip obviously priced-in markets
            if (yes_price == 1.0 and no_price == 0.0) or (yes_price == 0.0 and no_price == 1.0):
                continue
            
            live_markets.append({
                'id': m.get('condition_id'),
                'question': m.get('question'),
                'slug': m.get('slug'),
                'yes': yes_price,
                'no': no_price,
                'sum': yes_price + no_price,
                'edge': 1.0 - (yes_price + no_price) - 0.02  # 2% fee
            })
        
        return live_markets
    
    except Exception as e:
        log(f"Error fetching markets: {e}")
        return []

def execute_trade(market_id, side, amount):
    """Execute trade via Polyclaw"""
    try:
        cmd = f"cd ~/.openclaw/skills/polyclaw && uv run python scripts/polyclaw.py buy {market_id} {side} {amount}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        log(f"Trade result: {result.stdout}")
        return result.returncode == 0
    except Exception as e:
        log(f"Trade execution error: {e}")
        return False

def main():
    log("🦬 Polymarket Aggressive Trader Started")
    log("Strategy: Live short-duration crypto Up/Down markets only")
    
    state = load_state()
    
    while True:
        try:
            log("Scanning for live Up/Down markets with valid prices...")
            markets = fetch_live_updown_markets()
            
            log(f"Found {len(markets)} live short-duration crypto markets")
            
            # Find opportunities
            opportunities = [m for m in markets if m['edge'] > 0.005]  # >0.5% edge
            
            if not opportunities:
                log("No opportunities found (all sums >= 0.99)")
                time.sleep(60)
                continue
            
            # Sort by best edge
            opportunities.sort(key=lambda x: x['edge'], reverse=True)
            
            for opp in opportunities[:1]:  # Only trade best opportunity per scan
                log(f"🚨 OPPORTUNITY FOUND!")
                log(f"  ID: {opp['id']}")
                log(f"  Question: {opp['question']}")
                log(f"  YES=${opp['yes']:.4f} NO=${opp['no']:.4f}")
                log(f"  Sum={opp['sum']:.4f} Edge={opp['edge']:.4f}")
                
                # Check balance
                if state['balance'] < 25:
                    log(f"  Balance too low (${state['balance']:.2f}). Stopping.")
                    return
                
                # Trade size
                trade_size = 10  # $10 per side
                
                log(f"  Executing: Buy YES + NO (${trade_size} each)")
                
                # Execute both sides
                yes_ok = execute_trade(opp['id'], 'YES', trade_size)
                time.sleep(2)
                no_ok = execute_trade(opp['id'], 'NO', trade_size)
                
                if yes_ok and no_ok:
                    state['balance'] -= (trade_size * 2)
                    state['trades'].append({
                        'id': opp['id'],
                        'question': opp['question'],
                        'sum': opp['sum'],
                        'edge': opp['edge'],
                        'size': trade_size,
                        'timestamp': datetime.now().isoformat()
                    })
                    save_state(state)
                    log(f"  ✅ Trade complete. New balance: ${state['balance']:.2f}")
                else:
                    log(f"  ❌ Trade failed")
                
                # Only one trade per scan
                break
            
            time.sleep(60)
            
        except KeyboardInterrupt:
            log("Trader stopped by user")
            break
        except Exception as e:
            log(f"Error in main loop: {e}")
            time.sleep(60)

if __name__ == '__main__':
    main()
