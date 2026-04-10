#!/usr/bin/env python3
"""
Cross-Exchange Arbitrage Scanner — Coinbase ↔ Binance (Paper Mode Only)
- Monitors BTC and ETH spot prices across exchanges
- Detects profitable spreads >0.4% after fees/slippage
- Paper mode: log only, no real trades
"""
import ccxt
import json
import websocket
import threading
from datetime import datetime
from pathlib import Path
import time

LOG_DIR = Path(__file__).parent
LOG_FILE = LOG_DIR / "cross-exchange-arb-scanner.log"
STATE_FILE = LOG_DIR / "cross-exchange-arb-state.json"

def log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")
    print(line)

def load_coinbase():
    creds_file = Path('.credentials/coinbase-api.json')
    if creds_file.exists():
        with open(creds_file) as f:
            creds = json.load(f)
        return ccxt.coinbase({
            'apiKey': creds['api_key_id'],
            'secret': creds['api_secret'],
            'enableRateLimit': True
        })
    return None

def load_state():
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {
        'session_start': datetime.now().isoformat(),
        'scans': 0,
        'opportunities': [],
        'mode': 'PAPER ONLY'
    }

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2, default=str)

# Binance WebSocket monitor
BINANCE_PRICES = {
    'btcusdt': 0.0,
    'ethusdt': 0.0,
    'last_update': 0.0
}
BINANCE_WS_LOCK = threading.Lock()
BINANCE_WS_CONNECTED = False

class BinanceWebSocketMonitor:
    """Real-time public feed from Binance"""
    def __init__(self):
        self.ws = None
        self.connected = False
        
    def on_message(self, ws, message):
        try:
            global BINANCE_WS_CONNECTED
            data = json.loads(message)
            
            with BINANCE_WS_LOCK:
                if 'c' in data:
                    stream = data.get('s', '').lower()
                    price = float(data['c'])
                    
                    if stream == 'btcusdt':
                        BINANCE_PRICES['btcusdt'] = price
                    elif stream == 'ethusdt':
                        BINANCE_PRICES['ethusdt'] = price
                    
                    BINANCE_PRICES['last_update'] = time.time()
                    BINANCE_WS_CONNECTED = True
        except:
            pass
    
    def on_error(self, ws, error):
        global BINANCE_WS_CONNECTED
        BINANCE_WS_CONNECTED = False
    
    def on_close(self, ws, close_status_code, close_msg):
        global BINANCE_WS_CONNECTED
        BINANCE_WS_CONNECTED = False
    
    def on_open(self, ws):
        global BINANCE_WS_CONNECTED
        BINANCE_WS_CONNECTED = True
    
    def start(self):
        def run_ws():
            try:
                self.ws = websocket.WebSocketApp(
                    "wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker",
                    on_message=self.on_message,
                    on_error=self.on_error,
                    on_close=self.on_close,
                    on_open=self.on_open
                )
                self.ws.run_forever()
            except:
                global BINANCE_WS_CONNECTED
                BINANCE_WS_CONNECTED = False
        
        thread = threading.Thread(target=run_ws, daemon=True)
        thread.start()

binance_monitor = BinanceWebSocketMonitor()

class CrossExchangeArbScanner:
    """Scan for arbitrage opportunities between Coinbase and Binance"""
    def __init__(self):
        self.coinbase_fee = 0.001  # 0.1%
        self.binance_fee = 0.001   # 0.1%
        self.slippage = 0.0005     # 0.05%
        self.min_edge = 0.004      # 0.4%
    
    def calculate_edge(self, cbx_price, bnx_price, direction):
        """
        Calculate arbitrage edge
        direction: 'buy_bnx_sell_cbx' or 'buy_cbx_sell_bnx'
        """
        if direction == 'buy_bnx_sell_cbx':
            # Buy on Binance, sell on Coinbase
            buy_cost = bnx_price * (1 + self.binance_fee + self.slippage)
            sell_proceeds = cbx_price * (1 - self.coinbase_fee - self.slippage)
            edge = (sell_proceeds - buy_cost) / buy_cost
            return {
                'edge_pct': edge * 100,
                'buy_exchange': 'Binance',
                'sell_exchange': 'Coinbase',
                'buy_price': bnx_price,
                'sell_price': cbx_price,
                'profitable': edge > self.min_edge
            }
        else:  # buy_cbx_sell_bnx
            # Buy on Coinbase, sell on Binance
            buy_cost = cbx_price * (1 + self.coinbase_fee + self.slippage)
            sell_proceeds = bnx_price * (1 - self.binance_fee - self.slippage)
            edge = (sell_proceeds - buy_cost) / buy_cost
            return {
                'edge_pct': edge * 100,
                'buy_exchange': 'Coinbase',
                'sell_exchange': 'Binance',
                'buy_price': cbx_price,
                'sell_price': bnx_price,
                'profitable': edge > self.min_edge
            }
    
    def scan_btc(self, cbx_price, bnx_price):
        """Scan BTC for arbitrage"""
        opportunities = []
        
        edge1 = self.calculate_edge(cbx_price, bnx_price, 'buy_bnx_sell_cbx')
        if edge1['profitable']:
            opportunities.append({
                'asset': 'BTC',
                **edge1,
                'wouldbe_pnl_25': (edge1['edge_pct'] / 100) * 25
            })
        
        edge2 = self.calculate_edge(cbx_price, bnx_price, 'buy_cbx_sell_bnx')
        if edge2['profitable']:
            opportunities.append({
                'asset': 'BTC',
                **edge2,
                'wouldbe_pnl_25': (edge2['edge_pct'] / 100) * 25
            })
        
        return opportunities
    
    def scan_eth(self, cbx_price, bnx_price):
        """Scan ETH for arbitrage"""
        opportunities = []
        
        edge1 = self.calculate_edge(cbx_price, bnx_price, 'buy_bnx_sell_cbx')
        if edge1['profitable']:
            opportunities.append({
                'asset': 'ETH',
                **edge1,
                'wouldbe_pnl_25': (edge1['edge_pct'] / 100) * 25
            })
        
        edge2 = self.calculate_edge(cbx_price, bnx_price, 'buy_cbx_sell_bnx')
        if edge2['profitable']:
            opportunities.append({
                'asset': 'ETH',
                **edge2,
                'wouldbe_pnl_25': (edge2['edge_pct'] / 100) * 25
            })
        
        return opportunities

def main():
    log("=" * 100)
    log("CROSS-EXCHANGE ARBITRAGE SCANNER — COINBASE ↔ BINANCE (PAPER MODE)")
    log(f"Start: {datetime.now().isoformat()}")
    log("Mode: PAPER ONLY — No real trades, no capital at risk")
    log("=" * 100)
    
    # Start Binance WebSocket
    log("📡 Starting Binance WebSocket (public ticker feed)...")
    binance_monitor.start()
    time.sleep(2)
    
    # Connect to Coinbase
    coinbase = load_coinbase()
    if not coinbase:
        log("❌ Coinbase connection failed")
        return
    
    log("✅ Connected to Coinbase Advanced Trade")
    log("📡 Binance WebSocket: Starting (BTCUSDT + ETHUSDT public feeds)")
    
    scanner = CrossExchangeArbScanner()
    state = load_state()
    
    log(f"\n▶️  Starting cross-exchange arb scanner (scan every 3s)\n")
    
    try:
        while True:
            state['scans'] += 1
            
            try:
                # Fetch Coinbase prices
                btc_cbx = coinbase.fetch_ticker('BTC-USD')['last']
                eth_cbx = coinbase.fetch_ticker('ETH-USD')['last']
                
                # Get Binance prices
                with BINANCE_WS_LOCK:
                    btc_bnx = BINANCE_PRICES.get('btcusdt', 0.0)
                    eth_bnx = BINANCE_PRICES.get('ethusdt', 0.0)
                
                binance_connected = BINANCE_WS_CONNECTED
                
                # Scan if Binance connected
                opportunities = []
                if binance_connected and btc_bnx > 0:
                    opportunities.extend(scanner.scan_btc(btc_cbx, btc_bnx))
                if binance_connected and eth_bnx > 0:
                    opportunities.extend(scanner.scan_eth(eth_cbx, eth_bnx))
                
                # Log every 100 scans
                if state['scans'] % 100 == 0:
                    log(f"\n📊 Scan #{state['scans']}:")
                    log(f"   === PRICE FEEDS ===")
                    log(f"   BTC Coinbase: ${btc_cbx:.2f} | Binance: ${btc_bnx:.2f}" if binance_connected else f"   BTC Coinbase: ${btc_cbx:.2f} | Binance: (connecting...)")
                    log(f"   ETH Coinbase: ${eth_cbx:.2f} | Binance: ${eth_bnx:.2f}" if binance_connected else f"   ETH Coinbase: ${eth_cbx:.2f} | Binance: (connecting...)")
                    
                    if opportunities:
                        log(f"   === OPPORTUNITIES DETECTED ===")
                        for opp in opportunities:
                            log(f"   ✓ {opp['asset']}: Buy {opp['buy_exchange']} (${opp['buy_price']:.2f}) → Sell {opp['sell_exchange']} (${opp['sell_price']:.2f})")
                            log(f"      Edge: {opp['edge_pct']:+.2f}% | Would-be P&L on $25: ${opp['wouldbe_pnl_25']:+.2f}")
                        state['opportunities'].extend(opportunities)
                    else:
                        log(f"   ✓ No profitable spreads (threshold: >{scanner.min_edge*100:.1f}%)")
                    
                    save_state(state)
                
                time.sleep(3)
                
            except Exception as e:
                log(f"⚠️  Error scan #{state['scans']}: {str(e)[:100]}")
                time.sleep(3)
                continue
    
    except KeyboardInterrupt:
        log(f"\n⏹️  Stopped by user")
    
    finally:
        log("\n" + "=" * 100)
        log("SESSION SUMMARY")
        log("=" * 100)
        log(f"Scans: {state['scans']}")
        log(f"Opportunities found: {len(state['opportunities'])}")
        log("=" * 100)
        save_state(state)

if __name__ == '__main__':
    main()
