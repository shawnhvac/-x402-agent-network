#!/usr/bin/env python3
"""
Kalshi Automated Prediction Market Trader
Sum-to-one hedging strategy on short-term events
"""
import json
import time
from datetime import datetime
from pathlib import Path
from kalshi_python import KalshiClient

CREDS_FILE = Path(__file__).parent / ".credentials/kalshi-api.json"
LOG_FILE = Path(__file__).parent / "kalshi-auto.log"
STATE_FILE = Path(__file__).parent / "kalshi-state.json"

def log(msg):
    ts = datetime.now().isoformat()
    with open(LOG_FILE, 'a') as f:
        f.write(f"[{ts}] {msg}\n")
    print(f"[{ts}] {msg}")

def load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except:
        return {"trades": [], "balance": 300.0, "total_pnl": 0.0}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def init_client():
    with open(CREDS_FILE) as f:
        creds = json.load(f)
    
    client = KalshiClient(api_key_id=creds['api_key_id'], private_key=creds['private_key'])
    return client

def get_account_balance(client):
    try:
        account = client.get_account()
        return float(account['balance_cents']) / 100
    except Exception as e:
        log(f"Error fetching balance: {e}")
        return 0.0

def find_arbitrage_opportunities(client):
    """Find markets with sum-to-one hedging opportunities"""
    try:
        # Get trending/active markets
        markets = client.get_markets(limit=50, status='active')
        
        opportunities = []
        
        for market in markets:
            ticker = market.get('ticker')
            title = market.get('title')
            
            # Skip if not short-term (we want events closing within 24h)
            closes_at = market.get('close_time')
            if not closes_at:
                continue
            
            # Get order book for YES/NO
            try:
                orderbook = client.get_orderbook(ticker)
                if not orderbook or 'bids' not in orderbook or 'asks' not in orderbook:
                    continue
                
                # Get best bid/ask for YES
                yes_bids = [float(o['yes']) for o in orderbook.get('bids', [])]
                yes_asks = [float(o['yes']) for o in orderbook.get('asks', [])]
                
                # Get best bid/ask for NO
                no_bids = [float(o['no']) for o in orderbook.get('bids', [])]
                no_asks = [float(o['no']) for o in orderbook.get('asks', [])]
                
                if not (yes_bids and yes_asks and no_bids and no_asks):
                    continue
                
                # Best prices for hedging: ask for YES + ask for NO
                yes_ask = min(yes_asks)
                no_ask = min(no_asks)
                
                sum_price = yes_ask + no_ask
                
                # Check for opportunity (sum < 0.99 = 1% edge before fees)
                if sum_price < 0.99:
                    edge = 1.0 - sum_price - 0.01  # 1% fee estimate
                    
                    opportunities.append({
                        'ticker': ticker,
                        'title': title,
                        'yes_ask': yes_ask,
                        'no_ask': no_ask,
                        'sum': sum_price,
                        'edge': edge,
                        'closes_at': closes_at
                    })
            
            except Exception as e:
                continue
        
        return opportunities
    
    except Exception as e:
        log(f"Error finding opportunities: {e}")
        return []

def execute_hedge(client, opportunity, state, trade_size=20):
    """Execute sum-to-one hedge (buy both YES and NO)"""
    try:
        ticker = opportunity['ticker']
        
        log(f"🚨 HEDGE: {ticker}")
        log(f"   Title: {opportunity['title']}")
        log(f"   YES ask: ${opportunity['yes_ask']:.4f} | NO ask: ${opportunity['no_ask']:.4f}")
        log(f"   Sum: {opportunity['sum']:.4f} | Edge: {opportunity['edge']:.4f}")
        log(f"   Executing: ${trade_size} YES + ${trade_size} NO")
        
        # Place orders
        yes_order = client.create_order(
            ticker=ticker,
            action='BUY',
            count=int(trade_size * 100),  # Convert to cents
            side='yes',
            type='MARKET'
        )
        
        time.sleep(1)
        
        no_order = client.create_order(
            ticker=ticker,
            action='BUY',
            count=int(trade_size * 100),
            side='no',
            type='MARKET'
        )
        
        if yes_order and no_order:
            state['balance'] -= (trade_size * 2)
            state['trades'].append({
                'ticker': ticker,
                'title': opportunity['title'],
                'sum': opportunity['sum'],
                'edge': opportunity['edge'],
                'size': trade_size,
                'timestamp': datetime.now().isoformat()
            })
            save_state(state)
            log(f"   ✅ Orders placed. New balance: ${state['balance']:.2f}")
            return True
        
    except Exception as e:
        log(f"   ❌ Order failed: {e}")
    
    return False

def main():
    log("🦬 Kalshi Automated Trader Started")
    log("Strategy: Sum-to-one hedging on short-term prediction markets")
    log("Starting balance: $300")
    
    state = load_state()
    client = init_client()
    
    while True:
        try:
            # Check balance
            balance = get_account_balance(client)
            if balance > 0:
                state['balance'] = balance
            
            log(f"\nScan | Balance: ${state['balance']:.2f} | Trades: {len(state['trades'])}")
            
            if state['balance'] < 50:
                log("⚠️ Balance too low ($50 minimum). Stopping.")
                break
            
            # Find opportunities
            opps = find_arbitrage_opportunities(client)
            log(f"Found {len(opps)} opportunities")
            
            if not opps:
                time.sleep(60)
                continue
            
            # Sort by best edge
            opps.sort(key=lambda x: x['edge'], reverse=True)
            
            # Execute best opportunity
            best = opps[0]
            execute_hedge(client, best, state, trade_size=25)
            
            time.sleep(60)
            
        except KeyboardInterrupt:
            log("Trader stopped by user")
            break
        except Exception as e:
            log(f"Error in main loop: {e}")
            time.sleep(60)

if __name__ == '__main__':
    main()
