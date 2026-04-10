#!/usr/bin/env python3
"""
Kalshi Automated Trading Bot
Uses raw HTTP requests to bypass Pydantic model issues
"""
import json
import time
import requests
from datetime import datetime
from pathlib import Path
from urllib.parse import urlencode

API_BASE = "https://api.elections.kalshi.com/trade-api/v2"
CREDS_FILE = Path(__file__).parent / ".credentials/kalshi-api.json"
LOG_FILE = Path(__file__).parent / "kalshi-trading.log"
STATE_FILE = Path(__file__).parent / "kalshi-state.json"

def log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")
    print(line)

def load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except:
        return {"trades": [], "balance": 300.0, "total_pnl": 0.0, "last_scan": 0}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def get_markets(limit=50):
    """Fetch active markets with prices"""
    try:
        resp = requests.get(f"{API_BASE}/markets", params={"limit": limit}, timeout=10)
        
        # Handle rate limiting gracefully
        if resp.status_code == 429:
            log("⚠️ Rate limited (429). Backing off for 30 seconds.")
            time.sleep(30)
            return []
        
        resp.raise_for_status()
        data = resp.json()
        markets = data.get('markets', [])
        
        # Filter for tradeable (has prices)
        tradeable = [m for m in markets if (
            (m.get('yes_bid_dollars') and float(m.get('yes_bid_dollars', 0)) > 0) or
            (m.get('yes_ask_dollars') and float(m.get('yes_ask_dollars', 0)) > 0)
        )]
        
        return tradeable
    except Exception as e:
        log(f"Error fetching markets: {e}")
        return []

def get_orderbook_depth(ticker):
    """Check orderbook depth for a market"""
    try:
        resp = requests.get(f"{API_BASE}/markets/{ticker}", timeout=10)
        if resp.status_code == 200:
            m = resp.json().get('market', {})
            
            # Calculate orderbook depth (ask size available at best ask price)
            # For Kalshi, we estimate from bid/ask spreads
            yes_depth = float(m.get('yes_ask_size_fp', 0.0))  # Contract size at best ask
            no_depth = float(m.get('no_ask_size_fp', 0.0))
            
            return {
                'yes_depth': yes_depth,
                'no_depth': no_depth,
                'yes_ask': float(m.get('yes_ask_dollars', 1.0)),
                'no_ask': float(m.get('no_ask_dollars', 1.0))
            }
    except:
        pass
    
    return None

def find_value_bets(markets):
    """Find markets with positive expected value and sufficient depth"""
    opps = []
    
    for m in markets:
        ticker = m.get('ticker')
        title = m.get('title', '')[:50]
        
        yes_ask = float(m.get('yes_ask_dollars', 1.0))
        no_ask = float(m.get('no_ask_dollars', 1.0))
        yes_bid = float(m.get('yes_bid_dollars', 0.0))
        no_bid = float(m.get('no_bid_dollars', 0.0))
        
        # Check for sum-to-one arbitrage (buy both sides for <$1)
        sum_ask = yes_ask + no_ask
        
        # Threshold: sum < 0.985 to account for taker fees (~0.5% on each side = 1% total)
        # This ensures we profit after fees
        if sum_ask < 0.985 and sum_ask > 0:
            edge = (1.0 - sum_ask) * 100  # edge as percentage
            
            opps.append({
                'ticker': ticker,
                'title': title,
                'yes_ask': yes_ask,
                'no_ask': no_ask,
                'sum': sum_ask,
                'edge': edge,
                'closes': m.get('close_time')
            })
    
    return sorted(opps, key=lambda x: x['edge'], reverse=True)

def place_order(ticker, side, quantity_cents, order_type="limit", limit_price=None):
    """Place an order on Kalshi"""
    try:
        payload = {
            "ticker": ticker,
            "side": side,  # "yes" or "no"
            "action": "buy",
            "quantity_cents": quantity_cents
        }
        
        if order_type == "limit" and limit_price:
            payload["type"] = "limit"
            payload["limit_cents"] = int(limit_price * 100)
        else:
            payload["type"] = "market"
        
        resp = requests.post(
            f"{API_BASE}/orders",
            json=payload,
            timeout=10
        )
        
        if resp.status_code in [200, 201]:
            return resp.json()
        else:
            log(f"Order failed: {resp.status_code} - {resp.text[:200]}")
            return None
            
    except Exception as e:
        log(f"Error placing order: {e}")
        return None

def main():
    log("🦬 Kalshi Trading Bot Started")
    log("Strategy: Value betting on mispriced markets")
    log("Starting balance: $300.00")
    
    state = load_state()
    scan_count = 0
    
    while True:
        try:
            scan_count += 1
            now = time.time()
            
            # Scan every 3 seconds (safe rate: ~20 reads/min, conservative for typical API limits)
            # If we get 429 (rate limited), we'll back off
            if now - state.get('last_scan', 0) < 3:
                time.sleep(0.5)
                continue
            
            state['last_scan'] = now
            
            log(f"\n--- Scan #{scan_count} ---")
            
            # Get markets
            markets = get_markets(limit=100)
            log(f"Fetched {len(markets)} markets")
            
            if not markets:
                time.sleep(10)
                continue
            
            # Find value bets
            opps = find_value_bets(markets)
            log(f"Found {len(opps)} value opportunities")
            
            if opps:
                # Take top opportunity
                best = opps[0]
                
                log(f"🎯 POTENTIAL VALUE BET: {best['ticker']}")
                log(f"   Title: {best['title']}")
                log(f"   Yes Ask: ${best['yes_ask']:.4f} | No Ask: ${best['no_ask']:.4f}")
                log(f"   Sum: ${best['sum']:.4f} | Edge: {best['edge']:.2f}%")
                
                # Check orderbook depth before trading
                depth = get_orderbook_depth(best['ticker'])
                
                if not depth:
                    log(f"   ⚠️ Could not fetch orderbook depth. Skipping.")
                else:
                    yes_depth = depth.get('yes_depth', 0)
                    no_depth = depth.get('no_depth', 0)
                    
                    log(f"   Orderbook depth: YES ${yes_depth:.2f} | NO ${no_depth:.2f}")
                    
                    # Only trade if depth >= $40 on each side (min to avoid slippage)
                    if yes_depth >= 40 and no_depth >= 40:
                        # Dynamic position sizing based on balance
                        if state['balance'] >= 400:
                            trade_size = 3500  # $35 per side when balance >= $400
                        else:
                            trade_size = 2500  # $25 per side (default)
                        
                        # Calculate fee estimate (0.5% taker fee each side)
                        yes_fee = best['yes_ask'] * 0.005
                        no_fee = best['no_ask'] * 0.005
                        total_cost = (best['yes_ask'] + yes_fee) + (best['no_ask'] + no_fee)
                        profit_per_dollar = 1.0 - total_cost
                        total_profit = profit_per_dollar * (trade_size / 100)
                        
                        log(f"   ✅ EXECUTING TRADE")
                        log(f"   Position size: ${trade_size/100:.2f} per side")
                        log(f"   YES cost: ${best['yes_ask']:.4f} + fee ${yes_fee:.4f} = ${best['yes_ask'] + yes_fee:.4f}")
                        log(f"   NO cost: ${best['no_ask']:.4f} + fee ${no_fee:.4f} = ${best['no_ask'] + no_fee:.4f}")
                        log(f"   Total cost: ${total_cost:.4f} | Expected profit: ${total_profit:.2f}")
                        
                        # Place both orders
                        yes_order = place_order(best['ticker'], "yes", trade_size, "limit", best['yes_ask'])
                        time.sleep(2)
                        no_order = place_order(best['ticker'], "no", trade_size, "limit", best['no_ask'])
                        
                        if yes_order and no_order:
                            log(f"   ✅ Hedged position placed")
                            state['trades'].append({
                                'ticker': best['ticker'],
                                'edge': best['edge'],
                                'size': trade_size / 100,
                                'profit_estimate': total_profit,
                                'timestamp': datetime.now().isoformat()
                            })
                            state['balance'] -= (trade_size * 2 / 100)
                            save_state(state)
                        else:
                            log(f"   ❌ Order placement failed")
                    else:
                        log(f"   ⚠️ Insufficient depth (need $40+ each side). Skipping.")
            else:
                log("No value bets found (all markets fairly priced)")
            
            # Check balance periodically
            if scan_count % 10 == 0:
                log(f"Status: Balance ~${state['balance']:.2f} | Trades: {len(state['trades'])}")
            
            time.sleep(60)
            
        except KeyboardInterrupt:
            log("Bot stopped by user")
            save_state(state)
            break
        except Exception as e:
            log(f"Error in main loop: {e}")
            time.sleep(30)

if __name__ == '__main__':
    main()
