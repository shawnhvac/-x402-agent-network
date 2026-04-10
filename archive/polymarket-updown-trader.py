#!/usr/bin/env python3
"""
Polymarket Up/Down Trader - Targets 5m/15m rolling markets
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
        return {"trades": [], "balance": 60.08}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def get_current_market_slugs():
    """Generate slugs for current 5m and 15m windows"""
    now = int(time.time())
    floor_5m = (now // 300) * 300
    floor_15m = (now // 900) * 900
    
    slugs = []
    # Current windows
    for coin in ['btc', 'eth', 'sol']:
        slugs.append(f'{coin}-updown-5m-{floor_5m}')
        slugs.append(f'{coin}-updown-15m-{floor_15m}')
    
    # Also check next windows (markets may open early)
    floor_5m_next = floor_5m + 300
    floor_15m_next = floor_15m + 900
    for coin in ['btc', 'eth']:  # Just BTC/ETH for next
        slugs.append(f'{coin}-updown-5m-{floor_5m_next}')
        slugs.append(f'{coin}-updown-15m-{floor_15m_next}')
    
    return slugs

def fetch_market_by_slug(slug):
    """Fetch specific market by slug"""
    try:
        resp = httpx.get(
            f"{GAMMA_API}/markets",
            params={"slug": slug},
            timeout=10
        )
        resp.raise_for_status()
        markets = resp.json()
        if markets:
            return markets[0]
    except:
        pass
    return None

def get_live_updown_markets():
    """Fetch all current 5m/15m Up/Down markets"""
    slugs = get_current_market_slugs()
    live_markets = []
    
    for slug in slugs:
        market = fetch_market_by_slug(slug)
        if not market:
            continue
        
        if market.get('closed', True) or market.get('resolved', False):
            continue
        
        tokens = market.get('tokens', [])
        if len(tokens) < 2:
            continue
        
        yes_price = float(tokens[0].get('price', 0))
        no_price = float(tokens[1].get('price', 0))
        
        # Skip zero prices
        if yes_price == 0.0 or no_price == 0.0:
            continue
        
        # Skip resolved markets
        if (yes_price == 1.0 and no_price == 0.0) or (yes_price == 0.0 and no_price == 1.0):
            continue
        
        live_markets.append({
            'id': market.get('condition_id'),
            'question': market.get('question'),
            'slug': slug,
            'yes': yes_price,
            'no': no_price,
            'sum': yes_price + no_price,
            'edge': 1.0 - (yes_price + no_price) - 0.02
        })
    
    return live_markets

def execute_trade(market_id, side, amount):
    """Execute trade via Polyclaw"""
    try:
        cmd = f"cd ~/.openclaw/skills/polyclaw && uv run python scripts/polyclaw.py buy {market_id} {side} {amount}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
        return result.returncode == 0
    except Exception as e:
        log(f"Trade error: {e}")
        return False

def main():
    log("🦬 Polymarket Up/Down Trader Started")
    log("Target: 5m/15m BTC/ETH/SOL rolling markets")
    
    state = load_state()
    
    while True:
        try:
            markets = get_live_updown_markets()
            log(f"Scan: {len(markets)} live 5m/15m markets")
            
            # Find opportunities
            opps = [m for m in markets if m['edge'] > 0.005]
            
            if not opps:
                time.sleep(30)  # Check every 30s (markets rotate quickly)
                continue
            
            # Best edge first
            opps.sort(key=lambda x: x['edge'], reverse=True)
            best = opps[0]
            
            log(f"🚨 EDGE: {best['slug']}")
            log(f"  YES={best['yes']:.4f} NO={best['no']:.4f} Sum={best['sum']:.4f} Edge={best['edge']:.4f}")
            
            if state['balance'] < 20:
                log("  Balance too low. Stopping.")
                return
            
            size = 10
            log(f"  Executing: ${size} YES + ${size} NO")
            
            yes_ok = execute_trade(best['id'], 'YES', size)
            time.sleep(1)
            no_ok = execute_trade(best['id'], 'NO', size)
            
            if yes_ok and no_ok:
                state['balance'] -= (size * 2)
                state['trades'].append({
                    'slug': best['slug'],
                    'edge': best['edge'],
                    'size': size,
                    'timestamp': datetime.now().isoformat()
                })
                save_state(state)
                log(f"  ✅ Complete. Balance: ${state['balance']:.2f}")
            
            time.sleep(30)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            log(f"Error: {e}")
            time.sleep(30)

if __name__ == '__main__':
    main()
