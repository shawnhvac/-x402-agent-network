#!/usr/bin/env python3
"""
ClawdBot: Disciplined Kalshi-Only Trading Agent
Strategies: Sum-to-One Arb + Correlated Arb + Liquidity Value Trading
Risk-managed, Kalshi-data-only, MAKER-only orders
"""
import json
import time
import requests
import websocket
import threading
from datetime import datetime
from pathlib import Path

API_BASE = "https://api.elections.kalshi.com/trade-api/v2"
LOG_FILE = Path(__file__).parent / "kalshi-disciplined.log"
STATE_FILE = Path(__file__).parent / "kalshi-disciplined-state.json"

# === PAPER TRADING MODE (Dry-Run / Simulation Only) ===
PAPER_TRADING = True  # Set to False to enable real execution (after validation)
PAPER_TRADES = []  # Log all simulated trades for later analysis

# === BTC SPOT FEED (CoinGecko REST) ===
BTC_FEED_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
BTC_STATE = {
    'price': 0.0,
    'price_prev': 0.0,
    'change_1s': 0.0,
    'last_fetch': 0.0,
    'ws_latency_ms': 0.0,
    'ws_last_update': 0.0,
    'ws_connected': False
}

# WebSocket monitoring for real-time BTC markets
WS_MARKETS = {}  # {ticker: {yes_ask, no_ask, bid_ask_spread, timestamp}}
WS_LOCK = threading.Lock()

class KalshiBTCWebSocket:
    """Real-time WebSocket monitor for KXBTC15M markets"""
    def __init__(self):
        self.ws = None
        self.connected = False
        self.subscribed_tickers = set()
        self.last_update_time = 0
        
    def on_message(self, ws, message):
        """Handle incoming WebSocket messages"""
        try:
            ts_received = time.time() * 1000  # ms
            data = json.loads(message)
            
            # Track latency
            if 'timestamp' in data:
                ts_sent = data['timestamp']
                latency = ts_received - ts_sent
                BTC_STATE['ws_latency_ms'] = latency
            
            msg_type = data.get('type', '')
            
            # Handle orderbook delta updates
            if msg_type == 'orderbook_delta':
                ticker = data.get('ticker', '')
                if 'KXBTC' in ticker.upper():
                    with WS_LOCK:
                        if ticker not in WS_MARKETS:
                            WS_MARKETS[ticker] = {}
                        
                        # Update with latest prices
                        if 'yes_ask' in data:
                            WS_MARKETS[ticker]['yes_ask'] = float(data['yes_ask'])
                        if 'no_ask' in data:
                            WS_MARKETS[ticker]['no_ask'] = float(data['no_ask'])
                        if 'yes_bid' in data:
                            WS_MARKETS[ticker]['yes_bid'] = float(data['yes_bid'])
                        if 'no_bid' in data:
                            WS_MARKETS[ticker]['no_bid'] = float(data['no_bid'])
                        
                        WS_MARKETS[ticker]['timestamp'] = ts_received
                        self.last_update_time = ts_received
            
            # Handle ticker updates
            elif msg_type == 'ticker':
                ticker = data.get('ticker', '')
                if 'KXBTC' in ticker.upper():
                    with WS_LOCK:
                        if ticker not in WS_MARKETS:
                            WS_MARKETS[ticker] = {}
                        
                        WS_MARKETS[ticker]['yes_ask'] = float(data.get('yes_ask_dollars', 0.5))
                        WS_MARKETS[ticker]['no_ask'] = float(data.get('no_ask_dollars', 0.5))
                        WS_MARKETS[ticker]['volume'] = float(data.get('volume_fp', 0.0))
                        WS_MARKETS[ticker]['timestamp'] = ts_received
                        self.last_update_time = ts_received
        
        except Exception as e:
            log(f"⚠️ WebSocket message error: {str(e)[:100]}")
    
    def on_error(self, ws, error):
        """Handle WebSocket errors"""
        log(f"⚠️ WebSocket error: {error}")
        self.connected = False
        BTC_STATE['ws_connected'] = False
    
    def on_close(self, ws, close_status_code, close_msg):
        """Handle WebSocket close"""
        log(f"⚠️ WebSocket closed (code {close_status_code})")
        self.connected = False
        BTC_STATE['ws_connected'] = False
    
    def on_open(self, ws):
        """Handle WebSocket open and subscribe to channels"""
        log(f"✅ WebSocket connected to Kalshi")
        self.connected = True
        BTC_STATE['ws_connected'] = True
        
        # Subscribe to orderbook_delta for all KXBTC15M markets
        subscribe_msg = {
            "type": "subscribe",
            "channels": [
                {"name": "orderbook_delta", "series_ticker": "KXBTC15M"},
                {"name": "ticker", "series_ticker": "KXBTC15M"}
            ]
        }
        
        ws.send(json.dumps(subscribe_msg))
        log(f"📡 Subscribed to orderbook_delta + ticker for KXBTC15M series")
    
    def start(self):
        """Start WebSocket connection in background thread"""
        def run_ws():
            try:
                self.ws = websocket.WebSocketApp(
                    "wss://api.elections.kalshi.com/trade-api/ws/v2",
                    on_message=self.on_message,
                    on_error=self.on_error,
                    on_close=self.on_close,
                    on_open=self.on_open
                )
                self.ws.run_forever()
            except Exception as e:
                log(f"❌ WebSocket startup failed: {str(e)[:100]}")
                self.connected = False
                BTC_STATE['ws_connected'] = False
        
        thread = threading.Thread(target=run_ws, daemon=True)
        thread.start()
        log(f"🔌 WebSocket thread started (background)")
        time.sleep(2)  # Give connection time to establish
    
    def get_markets(self):
        """Return current BTC markets from WebSocket"""
        with WS_LOCK:
            return dict(WS_MARKETS)

# Initialize WebSocket monitor
btc_ws_monitor = KalshiBTCWebSocket()

def log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")
    print(line)

def fetch_btc_spot():
    """Fetch BTC-USD spot price from CoinGecko (free, no auth required)"""
    try:
        resp = requests.get(BTC_FEED_URL, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        new_price = float(data.get('bitcoin', {}).get('usd', 0.0))
        
        if new_price > 0:
            # Calculate 1-second momentum (approximate based on fetch interval)
            old_price = BTC_STATE['price']
            if old_price > 0:
                change_pct = ((new_price - old_price) / old_price) * 100
                BTC_STATE['change_1s'] = change_pct
            
            BTC_STATE['price_prev'] = old_price
            BTC_STATE['price'] = new_price
            BTC_STATE['last_fetch'] = time.time()
            return new_price
    except Exception as e:
        log(f"⚠️ BTC spot fetch failed: {e}")
    
    return BTC_STATE['price']  # Return cached price on error

def load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except:
        return {
            "bankroll": 300.0,
            "starting_bankroll": 300.0,
            "daily_loss": 0.0,
            "trades": [],
            "total_pnl": 0.0,
            "win_count": 0,
            "loss_count": 0,
            "last_scan": 0
        }

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

# === HARD-CODED SWEET 16 TICKERS (Priority Monitoring - Confirmed from Live Pages) ===
SWEET16_TICKERS = {
    'Duke vs St. John\'s': [
        'KXNCAAMBGAME-26MAR27SJUDUKE-DUKE',
        'KXNCAAMBGAME-26MAR27SJUDUKE-STJOHNS',
        'KXNCAAMBTOTAL-26MAR27SJUDUKE-125',
        'KXNCAAMBTOTAL-26MAR27SJUDUKE',
        'KXNCAAMB1HWINNER-26MAR27SJUDUKE-DUKE',
        'KXNCAAMB1HWINNER-26MAR27SJUDUKE-STJOHNS'
    ],
    'Michigan vs Alabama': [
        'KXNCAAMBGAME-26MAR27ALAMICH-MICHIGAN',
        'KXNCAAMBGAME-26MAR27ALAMICH-ALABAMA',
        'KXNCAAMBTOTAL-26MAR27ALAMICH',
        'KXNCAAMB1HWINNER-26MAR27ALAMICH'
    ],
    'UConn vs Michigan State': [
        'KXNCAAMBGAME-26MAR27UCONNMSU-UCONN',
        'KXNCAAMBGAME-26MAR27UCONNMSU-MSU',
        'KXNCAAMBTOTAL-26MAR27UCONNMSU',
        'KXNCAAMB1HWINNER-26MAR27UCONNMSU'
    ],
    'Iowa State vs Tennessee': [
        'KXNCAAMBGAME-26MAR27IOWATENN-IOWASTATE',
        'KXNCAAMBGAME-26MAR27IOWATENN-TENNESSEE',
        'KXNCAAMBTOTAL-26MAR27IOWATENN',
        'KXNCAAMB1HWINNER-26MAR27IOWATENN'
    ]
}

# === SERIES/EVENT LEVEL QUERIES ===
SWEET16_SERIES = ['KXNCAAMBGAME', 'KXNCAAMBTOTAL', 'KXNCAAMB1HWINNER']
SWEET16_EVENTS = [
    'KXNCAAMBGAME-26MAR27SJUDUKE',
    'KXNCAAMBTOTAL-26MAR27SJUDUKE',
    'KXNCAAMB1HWINNER-26MAR27SJUDUKE',
    'KXNCAAMBGAME-26MAR27ALAMICH',
    'KXNCAAMBTOTAL-26MAR27ALAMICH',
    'KXNCAAMB1HWINNER-26MAR27ALAMICH',
    'KXNCAAMBGAME-26MAR27UCONNMSU',
    'KXNCAAMBTOTAL-26MAR27UCONNMSU',
    'KXNCAAMB1HWINNER-26MAR27UCONNMSU',
    'KXNCAAMBGAME-26MAR27IOWATENN',
    'KXNCAAMBTOTAL-26MAR27IOWATENN',
    'KXNCAAMB1HWINNER-26MAR27IOWATENN'
]

def get_markets(limit=100):
    """Fetch all active markets from Kalshi"""
    try:
        resp = requests.get(f"{API_BASE}/markets", params={"limit": limit}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get('markets', [])
    except Exception as e:
        log(f"Error fetching markets: {e}")
        return []

def get_market_detail(ticker):
    """Get detailed market info (order book, volumes, etc.)"""
    try:
        resp = requests.get(f"{API_BASE}/markets/{ticker}", timeout=10)
        if resp.status_code == 200:
            return resp.json().get('market', {})
    except:
        pass
    return None

def fetch_market_by_ticker(ticker):
    """Fetch a single market by ticker using direct query"""
    try:
        resp = requests.get(f"{API_BASE}/markets", params={"ticker": ticker}, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        markets = data.get('markets', [])
        return markets[0] if markets else None
    except:
        pass
    return None

def fetch_markets_by_series(series_ticker):
    """Fetch all markets in a series"""
    try:
        resp = requests.get(f"{API_BASE}/markets", params={"series_ticker": series_ticker, "limit": 100}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get('markets', [])
    except:
        pass
    return []

def fetch_btc_series_markets():
    """Fetch BTC markets from KXBTC15M series (filtered by status=open)"""
    try:
        resp = requests.get(f"{API_BASE}/markets", 
                           params={"series_ticker": "KXBTC15M", "status": "open", "limit": 100}, 
                           timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get('markets', [])
    except Exception as e:
        log(f"⚠️ BTC series fetch failed: {e}")
    return []

def fetch_markets_by_event(event_ticker):
    """Fetch all markets in an event"""
    try:
        resp = requests.get(f"{API_BASE}/markets", params={"event_ticker": event_ticker, "limit": 100}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get('markets', [])
    except:
        pass
    return []

def check_daily_loss(state):
    """Check if daily drawdown limit hit (-10% = $30)"""
    daily_loss = state['starting_bankroll'] - state['bankroll']
    if daily_loss >= 30:
        return True
    return False

def simulate_trade(ticker, action, size, yes_price, no_price, reason, edge_pct):
    """Simulate a trade (paper trading mode) and log it"""
    if not PAPER_TRADING:
        return False  # In live mode, actual execution happens elsewhere
    
    # Determine which side we're trading
    side = "Yes" if "Yes" in action else "No"
    fill_price = yes_price if side == "Yes" else no_price
    
    # Apply realistic slippage (0.5-1% buffer)
    slippage_pct = 0.75  # Conservative estimate
    fill_price_with_slippage = fill_price * (1 + slippage_pct / 100)
    
    # Calculate projected P&L if held to expiry
    # If we buy Yes at 0.60, it expires worth 1.00 (win) or 0.00 (loss)
    # Expected value = side_prob * 1.00 + (1 - side_prob) * 0.00
    side_prob = yes_price if side == "Yes" else no_price
    expected_value = side_prob * 1.0 + (1 - side_prob) * 0.0
    
    # Projected P&L: (expected_value - fill_price_with_slippage) * size
    projected_pnl = (expected_value - fill_price_with_slippage) * size
    
    trade = {
        'timestamp': datetime.now().isoformat(),
        'ticker': ticker,
        'action': action,
        'side': side,
        'size': size,
        'ask_price': fill_price,
        'fill_price_with_slippage': fill_price_with_slippage,
        'reason': reason,
        'edge_pct': edge_pct,
        'projected_pnl': projected_pnl,
        'paper_only': True
    }
    
    PAPER_TRADES.append(trade)
    
    log(f"📄 PAPER TRADE: {action} {size} @ ${fill_price_with_slippage:.2f} | Edge: {edge_pct:+.2f}% | Reason: {reason}")
    log(f"   Projected P&L: ${projected_pnl:+.2f} | DRY-RUN ONLY — no real order placed")
    
    return True

def max_risk_size(state):
    """Max risk per trade: 3-5% of current bankroll"""
    return state['bankroll'] * 0.04  # 4% as baseline

def kelly_size(edge_pct, bankroll):
    """0.5x Kelly sizing"""
    if edge_pct <= 0:
        return 0
    kelly_fraction = (edge_pct / 100) / 2  # 0.5x Kelly
    return max(0, min(bankroll * kelly_fraction, bankroll * 0.25))  # Cap at 25% exposure

def scan_hard_coded_sweet16(markets):
    """Scan for Sweet 16 using direct queries, series/event, and fallback search"""
    opps = []
    found_tickers = []
    fallback_found = []
    
    # Build lookup maps
    market_by_ticker = {m.get('ticker', '').lower(): m for m in markets}
    
    log(f"\n🏀 SWEET 16 TICKER SCAN (Total markets fetched from API: {len(markets)})")
    log(f"   Checking {sum(len(t) for t in SWEET16_TICKERS.values())} hard-coded tickers + direct queries + series/event + fallback:")
    
    # === PART 0: DIRECT SERIES/EVENT QUERIES ===
    log(f"\n   Part 0: Series-level queries:")
    series_markets = []
    for series in SWEET16_SERIES:
        series_result = fetch_markets_by_series(series)
        if series_result:
            log(f"    Fetching via series_ticker={series} → {len(series_result)} markets returned")
            series_markets.extend(series_result)
        else:
            log(f"    Fetching via series_ticker={series} → 0 markets returned")
    
    log(f"\n   Part 0b: Event-level queries:")
    event_markets = []
    for event in SWEET16_EVENTS:
        event_result = fetch_markets_by_event(event)
        if event_result:
            log(f"    Fetching via event_ticker={event} → {len(event_result)} markets returned")
            event_markets.extend(event_result)
        else:
            log(f"    Fetching via event_ticker={event} → 0 markets returned")
    
    # === PART 1: CHECK HARD-CODED TICKERS (Direct + Fallback) ===
    log(f"\n   Part 1: Direct ticker queries:")
    for game_name, tickers in SWEET16_TICKERS.items():
        for ticker in tickers:
            ticker_lower = ticker.lower()
            m = None
            
            # First try in the bulk list
            if ticker_lower in market_by_ticker:
                m = market_by_ticker[ticker_lower]
            # Then try direct query
            else:
                m = fetch_market_by_ticker(ticker)
            
            if not m:
                log(f"    Direct query for {ticker} → Found: No")
                continue
            
            yes_ask = float(m.get('yes_ask_dollars', 0.5))
            no_ask = float(m.get('no_ask_dollars', 0.5))
            volume = float(m.get('volume_fp', 0.0))
            sum_price = yes_ask + no_ask
            status = m.get('status', 'unknown')
            
            # Format volume
            if volume >= 1000:
                vol_str = f"${volume/1000:.1f}M"
            else:
                vol_str = f"${volume:.1f}k"
            
            log(f"    Direct query for {ticker} → Found: Yes | Volume: {vol_str} | Sum: {sum_price:.4f} | Status: {status}")
            
            found_tickers.append({
                'ticker': ticker,
                'game': game_name,
                'yes_ask': yes_ask,
                'no_ask': no_ask,
                'sum': sum_price,
                'volume': volume
            })
            
            # Trigger if sum < 0.970 AND volume >= $10k
            if sum_price < 0.970 and volume >= 10:
                edge = (1.0 - sum_price) * 100 - 1.0
                log(f"      ⚡ EDGE DETECTED: {edge:.2f}% (vol ${volume:.1f}k, sum {sum_price:.4f})")
                
                opps.append({
                    'strategy': 'SWEET16-SUM-TO-ONE',
                    'game': game_name,
                    'ticker': m.get('ticker'),
                    'title': m.get('title', '')[:50],
                    'yes_ask': yes_ask,
                    'no_ask': no_ask,
                    'sum': sum_price,
                    'edge_pct': edge,
                    'volume': volume,
                    'type': 'sweet16'
                })
    
    # === PART 2: SERIES/EVENT LEVEL CHECKS ===
    log(f"\n   Checking series/event level patterns:")
    sweet16_series = ['KXNCAAMBGAME', 'KXNCAAMBTOTAL', 'KXNCAAMB1HWINNER']
    sweet16_events = ['26MAR27SJUDUKE', '26MAR27ALAMICH', '26MAR27MSUCONN', '26MAR27UCONNMSU', '26MAR27IOWATENN']
    sweet16_teams = ['DUKE', 'ST. JOHN', 'STJOHN', 'MICHIGAN', 'ALABAMA', 'UCONN', 'MSU', 'IOWA STATE', 'TENNESSEE', 'TENN']
    
    for m in markets:
        series_lower = m.get('series', '').lower()
        event_slug_lower = m.get('event_slug', '').lower()
        title_lower = m.get('title', '').lower()
        ticker_lower = m.get('ticker', '').lower()
        
        # Check if it matches series pattern
        is_sweet16_series = any(s.lower() in series_lower for s in sweet16_series)
        
        # Check if it matches event pattern
        is_sweet16_event = any(e.lower() in event_slug_lower or e.lower() in ticker_lower for e in sweet16_events)
        
        # Check fallback: any 26MAR27 + team pair pattern
        is_fallback = any(f"26mar27{pattern}" in ticker_lower or f"26MAR27{pattern}" in ticker_lower 
                         for pattern in ['sjuduke', 'alamich', 'msuconn', 'uconnmsu', 'iowatenn'])
        
        # Check if series + team pattern
        is_series_team = is_sweet16_series and any(team.lower() in title_lower for team in sweet16_teams) and '26' in ticker_lower
        
        # If matched via any method and not already in hard-coded found list
        if (is_sweet16_series or is_sweet16_event or is_fallback or is_series_team) and ticker_lower not in market_by_ticker:
            volume = float(m.get('volume_fp', 0.0))
            yes_ask = float(m.get('yes_ask_dollars', 0.5))
            no_ask = float(m.get('no_ask_dollars', 0.5))
            sum_price = yes_ask + no_ask
            
            if volume >= 1000:
                vol_str = f"${volume/1000:.1f}M"
            else:
                vol_str = f"${volume:.1f}k"
            
            log(f"    Fallback found: {m.get('ticker')} | Volume: {vol_str} | Sum: {sum_price:.4f}")
            
            fallback_found.append({
                'ticker': m.get('ticker'),
                'yes_ask': yes_ask,
                'no_ask': no_ask,
                'sum': sum_price,
                'volume': volume,
                'source': 'fallback'
            })
            
            # Check for edge
            if sum_price < 0.970 and volume >= 10:
                edge = (1.0 - sum_price) * 100 - 1.0
                log(f"      ⚡ EDGE DETECTED: {edge:.2f}%")
                
                opps.append({
                    'strategy': 'SWEET16-SUM-TO-ONE',
                    'game': 'Sweet 16 (fallback)',
                    'ticker': m.get('ticker'),
                    'title': m.get('title', '')[:50],
                    'yes_ask': yes_ask,
                    'no_ask': no_ask,
                    'sum': sum_price,
                    'edge_pct': edge,
                    'volume': volume,
                    'type': 'sweet16'
                })
    
    # === SUMMARY ===
    total_found = len(found_tickers) + len(fallback_found)
    
    if total_found > 0:
        log(f"\n✅ Found {total_found} Sweet 16 markets in API ({len(found_tickers)} hard-coded, {len(fallback_found)} fallback) | {len(opps)} with profitable edges")
    else:
        log(f"\n⏳ No 26MAR27 or KXNCAAMB* game markets in current API response")
    
    return sorted(opps, key=lambda x: x['edge_pct'], reverse=True)

def strategy_1_sum_to_one(markets):
    """STRATEGY 1: Sum-to-One & Multi-Outcome Arbitrage"""
    opps = []
    
    for m in markets:
        ticker = m.get('ticker')
        yes_ask = float(m.get('yes_ask_dollars', 1.0))
        no_ask = float(m.get('no_ask_dollars', 1.0))
        
        sum_price = yes_ask + no_ask
        
        # Look for sum < 0.97 (0.03 edge before fees)
        if sum_price < 0.97 and sum_price > 0:
            edge = (1.0 - sum_price) * 100  # as percentage
            volume = float(m.get('volume_fp', 0.0))
            
            opps.append({
                'strategy': 'SUM-TO-ONE',
                'ticker': ticker,
                'title': m.get('title', '')[:40],
                'yes_ask': yes_ask,
                'no_ask': no_ask,
                'sum': sum_price,
                'edge_pct': edge,
                'volume': volume,
                'type': 'arb'
            })
    
    return sorted(opps, key=lambda x: x['edge_pct'], reverse=True)

def strategy_2_correlated_arb(markets):
    """STRATEGY 2: Correlated Intra-Kalshi Arbitrage"""
    opps = []
    
    # Group markets by category/ticker prefix
    categories = {}
    for m in markets:
        cat = m.get('category', 'other')
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(m)
    
    # Look for inconsistent implied probabilities within same category
    for cat, cat_markets in categories.items():
        if len(cat_markets) < 2:
            continue
        
        for i, m1 in enumerate(cat_markets):
            for m2 in cat_markets[i+1:]:
                # Simple correlation check: if two related markets have divergent prices
                # This is crude but uses only Kalshi data
                yes1 = float(m1.get('yes_ask_dollars', 0.5))
                yes2 = float(m2.get('yes_ask_dollars', 0.5))
                
                # If prices diverge by >10%, potential edge
                if yes1 > 0 and yes2 > 0:
                    divergence = abs(yes1 - yes2) / max(yes1, yes2)
                    
                    if divergence > 0.15 and yes1 > 0.1 and yes2 > 0.1:  # 15% divergence, avoid near-zero prices
                        opps.append({
                            'strategy': 'CORRELATED-ARB',
                            'ticker1': m1.get('ticker'),
                            'ticker2': m2.get('ticker'),
                            'title1': m1.get('title', '')[:30],
                            'title2': m2.get('title', '')[:30],
                            'price1': yes1,
                            'price2': yes2,
                            'divergence': divergence * 100,
                            'type': 'corr'
                        })
    
    return sorted(opps, key=lambda x: x.get('divergence', 0), reverse=True)

def strategy_3_liquidity_value(markets):
    """STRATEGY 3: Liquidity & Depth-Aware Value Trading"""
    opps = []
    
    for m in markets:
        ticker = m.get('ticker')
        volume = float(m.get('volume_fp', 0.0))
        
        # Only high-liquidity markets (>$50k volume in 24h)
        if volume < 50:  # volume_fp is in thousands
            continue
        
        yes_ask = float(m.get('yes_ask_dollars', 0.5))
        yes_mid = (float(m.get('yes_bid_dollars', 0.0)) + yes_ask) / 2
        
        # Your internal probability (very conservative: just use mid-price as baseline)
        # This is minimal but we have no external data
        internal_prob = yes_mid
        market_prob = yes_ask
        
        # Only trade if 10%+ divergence
        if market_prob > 0:
            divergence = abs(internal_prob - market_prob) / market_prob
            
            if divergence > 0.10:
                opps.append({
                    'strategy': 'LIQUIDITY-VALUE',
                    'ticker': ticker,
                    'title': m.get('title', '')[:40],
                    'yes_ask': yes_ask,
                    'yes_bid': float(m.get('yes_bid_dollars', 0.0)),
                    'yes_mid': yes_mid,
                    'volume': volume,
                    'divergence': divergence * 100,
                    'type': 'value'
                })
    
    return sorted(opps, key=lambda x: x.get('divergence', 0), reverse=True)

def main():
    log("🦬 ClawdBot Disciplined Kalshi Trader Started")
    log("Capital: $300 | Risk per trade: 3-5% | Strategies: Sum-to-One, Correlated Arb, Liquidity Value")
    log("Data source: Kalshi only | Orders: MAKER LIMIT only")
    log("📡 WebSocket monitoring: ENABLED for real-time BTC market data")
    
    # Start WebSocket monitoring for real-time BTC markets
    btc_ws_monitor.start()
    
    state = load_state()
    scan_count = 0
    
    while True:
        try:
            scan_count += 1
            now = time.time()
            
            # Scan every 3 seconds (ultra-fast mode for Sweet 16)
            if now - state.get('last_scan', 0) < 3:
                time.sleep(0.5)
                continue
            
            state['last_scan'] = now
            
            # Check daily loss limit
            if check_daily_loss(state):
                log("⛔ DAILY LOSS LIMIT HIT (-$30). Trading paused.")
                time.sleep(60)
                continue
            
            log(f"\n=== SCAN #{scan_count} | Bankroll: ${state['bankroll']:.2f} ===")
            
            # Fetch all markets
            markets = get_markets(limit=150)
            if not markets:
                log("No markets available.")
                time.sleep(30)
                continue
            
            log(f"Fetched {len(markets)} markets")
            
            # Fetch BTC spot price for monitoring
            btc_price = fetch_btc_spot()
            btc_change = BTC_STATE.get('change_1s', 0.0)
            log(f"\n💰 EXTERNAL BTC SPOT: ${btc_price:.2f} | 1s Δ: {btc_change:+.2f}%")
            
            # Get BTC series markets from WebSocket (real-time)
            ws_latency = BTC_STATE.get('ws_latency_ms', 0.0)
            ws_connected = BTC_STATE.get('ws_connected', False)
            
            # Fallback to REST if WebSocket not connected
            btc_series_markets = []
            if ws_connected:
                ws_markets = btc_ws_monitor.get_markets()
                # Convert WebSocket format to REST format for compatibility
                for ticker, data in ws_markets.items():
                    m = {
                        'ticker': ticker,
                        'yes_ask_dollars': data.get('yes_ask', 0.5),
                        'no_ask_dollars': data.get('no_ask', 0.5),
                        'yes_bid_dollars': data.get('yes_bid', 0.0),
                        'no_bid_dollars': data.get('no_bid', 0.0),
                        'volume_fp': data.get('volume', 0.0)
                    }
                    btc_series_markets.append(m)
                
                log(f"🔗 BTC Series Filter: KXBTC15M (WebSocket real-time) → {len(btc_series_markets)} markets | Latency: {ws_latency:.1f}ms")
            else:
                # Fallback to REST polling
                btc_series_markets = fetch_btc_series_markets()
                log(f"🔗 BTC Series Filter: KXBTC15M (REST fallback) → {len(btc_series_markets)} markets (WebSocket not connected)")
            
            # Run strategies in priority order: SWEET16 FIRST, then standard strategies
            s_sweet16 = scan_hard_coded_sweet16(markets)
            s1_opps = strategy_1_sum_to_one(markets)
            s2_opps = strategy_2_correlated_arb(markets)
            s3_opps = strategy_3_liquidity_value(markets)
            
            total_opps = len(s_sweet16) + len(s1_opps) + len(s2_opps) + len(s3_opps)
            log(f"Found {len(s_sweet16)} SWEET16 + {len(s1_opps)} sum-to-one + {len(s2_opps)} correlated + {len(s3_opps)} liquidity = {total_opps} total")
            
            # Count BTC vs Kalshi edges (for monitoring only)
            btc_kalshi_edges = len([m for m in s2_opps if 'btc' in m.get('title', '').lower() or 'bitcoin' in m.get('title', '').lower()])
            log(f"📊 REST BTC vs Kalshi Edges Detected: {btc_kalshi_edges} (logged only — no auto-trade)")
            
            # === TOP BTC NEAR-MISS EDGES (BTC Focus Filter) ===
            log(f"\n📊 TOP BTC NEAR-MISS EDGES (BTC tickers only — logged only — no auto-trade):")
            
            # Combine all opportunities and sort by edge
            all_edges = s1_opps + s2_opps + s3_opps
            btc_near_misses = []
            
            for opp in all_edges:
                ticker = opp.get('ticker', opp.get('ticker1', 'N/A')).upper()
                
                # Filter for BTC only: ticker contains "BTC" or starts with "KXBTC"
                if 'BTC' not in ticker and not ticker.startswith('KXBTC'):
                    continue
                
                edge = opp.get('edge_pct', opp.get('divergence', 0))
                
                # Near-miss: edge > 0.1% but doesn't qualify for auto-trade
                if edge > 0.1:
                    yes_price = opp.get('yes_ask', 0.5)
                    no_price = opp.get('no_ask', 0.5)
                    implied_prob = yes_price * 100  # simplified: YES price as prob %
                    volume = opp.get('volume', 0)
                    
                    btc_near_misses.append({
                        'ticker': ticker,
                        'type': opp.get('strategy', 'unknown'),
                        'yes_price': yes_price,
                        'no_price': no_price,
                        'implied_prob': implied_prob,
                        'edge': edge,
                        'volume': volume,
                        'full_opp': opp
                    })
            
            # Sort by edge and show top 3
            btc_near_misses = sorted(btc_near_misses, key=lambda x: -x['edge'])[:3]
            
            if btc_near_misses:
                for i, nm in enumerate(btc_near_misses, 1):
                    edge = nm['edge']
                    ticker = nm['ticker']
                    type_ = nm['type']
                    yes_price = nm['yes_price']
                    no_price = nm['no_price']
                    implied_prob = nm['implied_prob']
                    volume = nm['volume']
                    
                    # Determine reason not qualified
                    reason = "volume < $10k"
                    if volume >= 10:
                        reason = "spread/slippage risk"
                    if type_ == 'CORRELATED-ARB':
                        reason = "divergence below execution threshold (15%+)"
                    elif type_ == 'SUM-TO-ONE':
                        reason = "volume insufficient or sum too high"
                    
                    log(f"  #{i} Ticker: {ticker}")
                    log(f"      Type: {type_}")
                    log(f"      Yes Price: ${yes_price:.2f} | No Price: ${no_price:.2f}")
                    log(f"      Implied Prob: {implied_prob:.1f}% (vs spot momentum)")
                    log(f"      Calculated Edge: +{edge:.2f}%")
                    log(f"      Reason Not Qualified: {reason}")
            else:
                log(f"  No BTC near-misses above 0.1% edge this scan")
            
            # === ACTIVE BTC MARKETS SNAPSHOT ===
            log(f"\n📡 ACTIVE BTC MARKETS SNAPSHOT (all detected BTC tickers — logged only):")
            
            # Scan BTC series markets (from KXBTC15M series fetch)
            btc_active = []
            for m in btc_series_markets:
                ticker = m.get('ticker', '').upper()
                
                # All markets from btc_series_markets should be BTC, but double-check
                if 'BTC' not in ticker and not ticker.startswith('KXBTC'):
                    continue
                
                yes_price = float(m.get('yes_ask_dollars', 0.5))
                no_price = float(m.get('no_ask_dollars', 0.5))
                volume = float(m.get('volume_fp', 0.0))
                
                if volume > 0 or (yes_price > 0 and no_price > 0):
                    implied_prob = yes_price * 100
                    
                    # Calculate vs spot delta (simplified)
                    # Kalshi implied prob vs external BTC momentum
                    spot_delta = BTC_STATE.get('change_1s', 0.0)
                    
                    # If BTC spot is up, YES should be slightly higher prob
                    # This is a rough approximation
                    vs_spot = implied_prob - 50.0 + (spot_delta * 10)  # adjusted for momentum
                    
                    btc_active.append({
                        'ticker': ticker,
                        'yes_price': yes_price,
                        'no_price': no_price,
                        'volume': volume,
                        'implied_prob': implied_prob,
                        'vs_spot': vs_spot
                    })
            
            # Sort by volume descending and show all
            btc_active = sorted(btc_active, key=lambda x: -x['volume'])
            
            if btc_active:
                log(f"  Found {len(btc_active)} active BTC ticker(s):\n")
                for i, m in enumerate(btc_active[:10], 1):  # Show top 10
                    ticker = m['ticker']
                    yes_price = m['yes_price']
                    no_price = m['no_price']
                    volume = m['volume']
                    implied_prob = m['implied_prob']
                    vs_spot = m['vs_spot']
                    
                    log(f"  #{i} Ticker: {ticker}")
                    log(f"      Yes Price: ${yes_price:.2f} | No Price: ${no_price:.2f}")
                    log(f"      Volume: ${volume:.1f}k")
                    log(f"      Implied Prob (Yes): {implied_prob:.1f}%")
                    log(f"      Vs Spot Delta: {vs_spot:+.2f}%")
                
                if len(btc_active) > 10:
                    log(f"\n  ... and {len(btc_active) - 10} more BTC tickers (showing top 10 by volume)")
            else:
                log(f"  No active BTC tickers detected in this scan")
            
            # === SUM-TO-ONE EDGE CALCULATOR (Diagnostic - BTC Markets Only) ===
            log(f"\n💰 SUM-TO-ONE EDGE CALCULATOR (for active BTC markets — logged only):")
            
            if btc_series_markets:
                log(f"  Analyzing {len(btc_series_markets)} BTC market(s) for sum-to-one edges:\n")
                
                for m in btc_series_markets:
                    ticker = m.get('ticker', 'N/A')
                    yes_price = float(m.get('yes_ask_dollars', 0.5))
                    no_price = float(m.get('no_ask_dollars', 0.5))
                    volume = float(m.get('volume_fp', 0.0))
                    
                    # Calculate sum and raw edge
                    sum_price = yes_price + no_price
                    raw_edge_pct = (1.0 - sum_price) * 100 if sum_price > 0 else 0.0
                    
                    # Fee-adjusted edge (Kalshi taker fee ~1% per side, so ~2% total)
                    # Conservative: assume 1% total slippage/fees
                    fee_adjusted_edge_pct = raw_edge_pct - 1.0
                    
                    # Determine reason not qualified
                    reason = "below 0.5% threshold"
                    if fee_adjusted_edge_pct >= 0.5:
                        reason = "qualifies for execution"
                    elif raw_edge_pct < 0.1:
                        reason = "raw edge too low"
                    elif fee_adjusted_edge_pct < 0:
                        reason = "fees erase edge"
                    elif volume < 10:
                        reason = "insufficient volume"
                    
                    log(f"  Ticker: {ticker}")
                    log(f"      Yes + No Sum: ${sum_price:.2f}")
                    log(f"      Raw Edge %: {raw_edge_pct:+.2f}% (before fees)")
                    log(f"      Fee-Adjusted Edge %: {fee_adjusted_edge_pct:+.2f}% (after 1% slippage buffer)")
                    log(f"      Volume: ${volume:.1f}k")
                    log(f"      Reason Not Qualified: {reason}\n")
            else:
                log(f"  No BTC markets detected — awaiting KXBTC15M series data")
            
            # === SPOT MOMENTUM MISPRICING LOGGER (Diagnostic - Spot vs Kalshi Implied) ===
            log(f"\n📊 SPOT MOMENTUM MISPRICING LOGGER (BTC spot vs Kalshi implied — logged only):")
            
            if btc_series_markets:
                for m in btc_series_markets:
                    ticker = m.get('ticker', 'N/A')
                    yes_price = float(m.get('yes_ask_dollars', 0.5))
                    
                    # Kalshi implied probability (YES price)
                    kalshi_implied_prob = yes_price * 100
                    
                    # External BTC momentum (30s or 1s change, we're tracking 1s)
                    btc_momentum = BTC_STATE.get('change_1s', 0.0)
                    
                    # If BTC spot is moving up, YES should be slightly higher
                    # Mispricing delta: how much Kalshi prob differs from what spot momentum suggests
                    # Rough model: if BTC +1%, YES prob should be ~51% (neutral would be 50%)
                    expected_prob = 50.0 + (btc_momentum * 10)  # rough sensitivity
                    mispricing_delta = kalshi_implied_prob - expected_prob
                    
                    # Potential latency edge: if Kalshi is lagging spot
                    potential_edge = abs(mispricing_delta)
                    
                    # Determine reason
                    reason = "efficient pricing"
                    watch_status = ""
                    if potential_edge > 0.5:
                        watch_status = " ⚠️ WATCH — possible micro-edge"
                        reason = "Kalshi lagging spot momentum"
                    elif btc_momentum > 0 and mispricing_delta < -0.5:
                        reason = "BTC rallying but Kalshi YES lagging upside"
                    elif btc_momentum < 0 and mispricing_delta > 0.5:
                        reason = "BTC selling but Kalshi YES too high"
                    
                    log(f"  Ticker: {ticker}")
                    log(f"      Kalshi Implied Yes Prob: {kalshi_implied_prob:.1f}%")
                    log(f"      External BTC 30s Momentum: {btc_momentum:+.2f}%")
                    log(f"      Mispricing Delta: {mispricing_delta:+.2f}% (Kalshi prob vs spot momentum)")
                    log(f"      Potential Latency Edge %: {potential_edge:.2f}%{watch_status}")
                    log(f"      Reason: {reason}\n")
            else:
                log(f"  No BTC markets detected — awaiting KXBTC15M series data")
            
            # === PAPER TRADING LOG (Simulated Execution) ===
            log(f"\n📄 PAPER TRADING LOG (simulated trades this scan — NO real money used):")
            
            # Check for qualifying sum-to-one edges on BTC markets
            paper_trades_this_scan = 0
            if btc_series_markets:
                for m in btc_series_markets:
                    ticker = m.get('ticker', 'N/A')
                    yes_price = float(m.get('yes_ask_dollars', 0.5))
                    no_price = float(m.get('no_ask_dollars', 0.5))
                    volume = float(m.get('volume_fp', 0.0))
                    
                    # Calculate sum-to-one edge
                    sum_price = yes_price + no_price
                    raw_edge_pct = (1.0 - sum_price) * 100 if sum_price > 0 else 0.0
                    fee_adjusted_edge_pct = raw_edge_pct - 1.0  # Conservative 1% fee buffer
                    
                    # Trigger: Fee-adjusted edge > 0.8% AND sum < 0.98
                    if fee_adjusted_edge_pct > 0.8 and sum_price < 0.98 and volume >= 10:
                        # Simulate buying both sides (arb strategy)
                        size = 5  # 5 contracts per side ($25 on $500 bankroll = 5%)
                        simulate_trade(ticker, f"Buy {size} Yes", size, yes_price, no_price, 
                                     f"sum-to-one edge {fee_adjusted_edge_pct:.2f}%", fee_adjusted_edge_pct)
                        paper_trades_this_scan += 1
                    
                    # Also check mispricing edge (if momentum delta > 8%)
                    btc_momentum = BTC_STATE.get('change_1s', 0.0)
                    expected_prob = 50.0 + (btc_momentum * 10)
                    mispricing_delta = (yes_price * 100) - expected_prob
                    potential_edge = abs(mispricing_delta)
                    
                    if potential_edge > 8.0 and abs(btc_momentum) > 0.1:  # Momentum confirmed
                        size = 3  # Smaller size for momentum trades (higher risk)
                        action = f"Buy {size} Yes" if btc_momentum > 0 else f"Buy {size} No"
                        simulate_trade(ticker, action, size, yes_price, no_price,
                                     f"momentum mispricing {potential_edge:.2f}%", potential_edge)
                        paper_trades_this_scan += 1
            
            if paper_trades_this_scan == 0:
                log(f"  No qualifying edges detected this scan (sum-to-one >0.8% AND sum <0.98, or momentum >8%)")
            
            # === RAW CRYPTO TICKERS DISCOVERY (Diagnostic) ===
            log(f"\n🔍 RAW CRYPTO TICKERS DISCOVERY (BTC series + keyword search from API — logged only):")
            
            # Extract all raw crypto tickers: first from BTC series, then from general search
            crypto_tickers_raw = []
            
            # Add BTC series tickers first (these are the real ones we want)
            for m in btc_series_markets:
                ticker = m.get('ticker', '')
                category = m.get('category', 'N/A')
                crypto_tickers_raw.append({
                    'ticker': ticker,
                    'category': category,
                    'type': 'KXBTC15M (series filtered)',
                    'source': 'BTC series fetch'
                })
            
            # Also search general markets for other crypto keywords (fallback)
            for m in markets:
                ticker = m.get('ticker', '')
                # Skip if already in BTC series
                if any(t['ticker'] == ticker for t in crypto_tickers_raw):
                    continue
                category = m.get('category', 'N/A')
                
                # Detect crypto tickers: any containing crypto keywords
                if any(word in ticker.lower() for word in ['btc', 'eth', 'sol', 'doge', 'xrp', 'ada', 'crypto', 'kxcrypto']):
                    crypto_tickers_raw.append({
                        'ticker': ticker,
                        'category': category,
                        'type': m.get('series', 'N/A'),
                        'source': 'keyword search'
                    })
            
            # Show first 10
            if crypto_tickers_raw:
                log(f"  Found {len(crypto_tickers_raw)} raw crypto ticker(s) in API:\n")
                for i, t in enumerate(crypto_tickers_raw[:10], 1):
                    log(f"  #{i} Ticker: {t['ticker']}")
                    log(f"      Source: {t['source']}")
                    log(f"      Category: {t['category']}\n")
                
                if len(crypto_tickers_raw) > 10:
                    log(f"  ... and {len(crypto_tickers_raw) - 10} more raw crypto tickers (showing first 10)")
            else:
                log(f"  Zero raw crypto tickers returned from API this scan")
            
            # Process opportunities in priority order: SWEET16 FIRST
            best_opp = None
            if s_sweet16:
                best_opp = s_sweet16[0]
            elif s1_opps:
                best_opp = s1_opps[0]
            elif s2_opps:
                best_opp = s2_opps[0]
            elif s3_opps:
                best_opp = s3_opps[0]
            
            if best_opp:
                log(f"\n🎯 TOP OPPORTUNITY: {best_opp['strategy']}")
                log(f"   Ticker: {best_opp.get('ticker', 'N/A')}")
                log(f"   Title: {best_opp.get('title', 'N/A')}")
                log(f"   Edge: {best_opp.get('edge_pct', best_opp.get('divergence', 0)):.2f}%")
                
                # Calculate position size (Kelly-based)
                max_risk = max_risk_size(state)
                edge_pct = best_opp.get('edge_pct', best_opp.get('divergence', 0))
                position_size = kelly_size(edge_pct, state['bankroll'])
                position_size = min(position_size, max_risk)
                
                log(f"   Max risk allowed: ${max_risk:.2f}")
                log(f"   Recommended position: ${position_size:.2f} (0.5x Kelly)")
                
                # Check exposure
                log(f"   ✓ Position is {(position_size * 2 / state['bankroll'] * 100):.1f}% of bankroll (max 25%)")
                log(f"   ✓ MAKER LIMIT orders only (no taker orders)")
                log(f"   ⏳ Ready to execute when order-book depth confirmed")
            else:
                log("No high-conviction opportunities. Markets are fairly priced.")
            
            # Summary every 10 scans
            if scan_count % 10 == 0:
                win_rate = (state['win_count'] / (state['win_count'] + state['loss_count']) * 100) if (state['win_count'] + state['loss_count']) > 0 else 0
                log(f"\n=== 10-SCAN SUMMARY ===")
                log(f"Trades: {len(state['trades'])} | W: {state['win_count']} | L: {state['loss_count']} | Win rate: {win_rate:.1f}%")
                log(f"Total P&L: ${state['total_pnl']:.2f} | Bankroll: ${state['bankroll']:.2f}")
            
            time.sleep(30)
            
        except KeyboardInterrupt:
            log("🛑 Trader stopped by user")
            save_state(state)
            break
        except Exception as e:
            log(f"❌ Error in main loop: {e}")
            time.sleep(30)

if __name__ == '__main__':
    main()
