#!/usr/bin/env python3
"""
Kalshi REST API Trader with RSA-PSS Authentication
"""
import json
import time
import requests
from datetime import datetime
from pathlib import Path
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
import base64

API_BASE = "https://trading-api.kalshi.com/trade-api/v2"
CREDS_FILE = Path(__file__).parent / ".credentials/kalshi-api.json"
LOG_FILE = Path(__file__).parent / "kalshi-auto.log"
STATE_FILE = Path(__file__).parent / "kalshi-state.json"

def log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")
    print(line)

def load_credentials():
    with open(CREDS_FILE) as f:
        return json.load(f)

def load_private_key(pem_string):
    """Load RSA private key from PEM string"""
    return serialization.load_pem_private_key(
        pem_string.encode(),
        password=None,
        backend=default_backend()
    )

def sign_request(private_key, timestamp_ms, method, path):
    """Create RSA-PSS signature for Kalshi API"""
    message = f"{timestamp_ms}{method}{path}"
    signature = private_key.sign(
        message.encode(),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode()

def make_request(method, path, private_key, api_key_id, data=None):
    """Make authenticated Kalshi API request"""
    timestamp_ms = int(time.time() * 1000)
    signature = sign_request(private_key, timestamp_ms, method, path)
    
    headers = {
        "KALSHI-ACCESS-KEY": api_key_id,
        "KALSHI-ACCESS-TIMESTAMP": str(timestamp_ms),
        "KALSHI-ACCESS-SIGNATURE": signature,
        "Content-Type": "application/json"
    }
    
    url = API_BASE + path
    
    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            resp = requests.post(url, headers=headers, json=data, timeout=30)
        else:
            return None
        
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        log(f"API Error: {e}")
        return None

def test_auth(private_key, api_key_id):
    """Test authentication with a simple API call"""
    log("Testing authentication...")
    
    # Try to get portfolio (simple auth test)
    result = make_request("GET", "/portfolio", private_key, api_key_id)
    
    if result and 'balance_cents' in result:
        balance = float(result['balance_cents']) / 100
        log(f"✅ Auth successful | Balance: ${balance:.2f}")
        return True, balance
    else:
        log(f"❌ Auth failed: {result}")
        return False, 0.0

def get_markets(private_key, api_key_id, limit=50):
    """Get active markets"""
    return make_request("GET", f"/markets?limit={limit}&status=active", private_key, api_key_id)

def find_value_bets(private_key, api_key_id):
    """Find underpriced markets (value bets)"""
    markets = get_markets(private_key, api_key_id)
    
    if not markets:
        return []
    
    opportunities = []
    
    for market in markets.get('markets', []):
        ticker = market.get('ticker')
        title = market.get('title')
        last_price = float(market.get('last_price', 0.5))
        volume = market.get('volume_cents', 0) / 100
        
        # Look for high-volume markets
        if volume < 1000:  # Min $1000 volume
            continue
        
        # Simple value detection: prices near 0.5 with high volume = fair
        # Prices far from 0.5 = potential value
        # YES near 0.2-0.3 = potential value on YES if fundamentals support it
        # YES near 0.7-0.8 = potential value on NO
        
        if last_price < 0.35 or last_price > 0.65:
            opportunities.append({
                'ticker': ticker,
                'title': title,
                'price': last_price,
                'volume': volume
            })
    
    return opportunities

def place_order(private_key, api_key_id, ticker, side, quantity_cents):
    """Place an order"""
    data = {
        "ticker": ticker,
        "side": side,  # "yes" or "no"
        "action": "buy",
        "quantity_cents": quantity_cents
    }
    
    return make_request("POST", "/orders", private_key, api_key_id, data)

def load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except:
        return {"trades": [], "balance": 300.0, "total_pnl": 0.0}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def main():
    creds = load_credentials()
    private_key = load_private_key(creds['private_key'])
    api_key_id = creds['api_key_id']
    
    log("🦬 Kalshi REST API Trader Started")
    log("Strategy: Value betting on high-volume markets")
    
    # Test auth first
    auth_ok, balance = test_auth(private_key, api_key_id)
    if not auth_ok:
        log("❌ Authentication failed. Exiting.")
        return
    
    state = load_state()
    state['balance'] = balance
    save_state(state)
    
    scan_count = 0
    
    while True:
        try:
            scan_count += 1
            log(f"\n--- Scan #{scan_count} | Balance: ${state['balance']:.2f} ---")
            
            if state['balance'] < 50:
                log("⚠️ Balance below minimum ($50). Pausing.")
                time.sleep(300)
                continue
            
            # Find value bets
            opps = find_value_bets(private_key, api_key_id)
            log(f"Found {len(opps)} potential value bets")
            
            if opps:
                # Take the best opportunity (highest volume)
                best = max(opps, key=lambda x: x['volume'])
                
                log(f"🎯 Value Bet: {best['ticker']}")
                log(f"   Title: {best['title']}")
                log(f"   Price: {best['price']:.2f} | Volume: ${best['volume']:.0f}")
                
                # Determine side based on price
                side = "no" if best['price'] < 0.4 else "yes"
                trade_size = 1500  # $15 in cents
                
                log(f"   Action: Buy {side.upper()} for ${trade_size/100:.2f}")
                
                # Place order
                result = place_order(private_key, api_key_id, best['ticker'], side, trade_size)
                
                if result and 'order_id' in result:
                    log(f"   ✅ Order placed: {result['order_id']}")
                    state['trades'].append({
                        'ticker': best['ticker'],
                        'side': side,
                        'size': trade_size / 100,
                        'price': best['price'],
                        'timestamp': datetime.now().isoformat()
                    })
                    state['balance'] -= (trade_size / 100)
                    save_state(state)
                else:
                    log(f"   ❌ Order failed: {result}")
            
            # Wait before next scan
            time.sleep(120)
            
        except KeyboardInterrupt:
            log("Trader stopped")
            break
        except Exception as e:
            log(f"Error: {e}")
            time.sleep(60)

if __name__ == '__main__':
    main()
