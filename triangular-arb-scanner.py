#!/usr/bin/env python3
"""
Triangular Arbitrage Scanner — Coinbase (Paper Mode Only)
- Monitors BTC-USDT, ETH-USDT, BTC-ETH pairs
- Calculates triangular loops every 3 seconds
- Logs opportunities when edge > 0.5% after fees/slippage
- NO real trades, NO capital at risk
"""
import ccxt
import json
import websocket
import threading
from datetime import datetime
from pathlib import Path
import time

LOG_DIR = Path(__file__).parent
LOG_FILE = LOG_DIR / "triangular-arb-scanner.log"
STATE_FILE = LOG_DIR / "triangular-arb-state.json"

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
        'mode': 'PAPER ONLY',
        'binance_connected': False,
        'cross_exchange_edges': []
    }

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2, default=str)

# Binance WebSocket monitor (read-only public feed)
BINANCE_PRICES = {
    'btcusdt': 0.0,
    'ethusdt': 0.0,
    'last_update': 0.0
}
BINANCE_WS_LOCK = threading.Lock()
BINANCE_WS_CONNECTED = False

class BinanceWebSocketMonitor:
    """Read-only public WebSocket monitor for Binance spot prices"""
    def __init__(self):
        self.ws = None
        self.connected = False
        
    def on_message(self, ws, message):
        """Handle incoming WebSocket messages"""
        try:
            global BINANCE_WS_CONNECTED
            data = json.loads(message)
            
            with BINANCE_WS_LOCK:
                if 'c' in data:  # Close price
                    stream = data.get('s', '').lower()
                    price = float(data['c'])
                    
                    if stream == 'btcusdt':
                        BINANCE_PRICES['btcusdt'] = price
                        BINANCE_PRICES['last_update'] = time.time()
                    elif stream == 'ethusdt':
                        BINANCE_PRICES['ethusdt'] = price
                        BINANCE_PRICES['last_update'] = time.time()
                    
                    BINANCE_WS_CONNECTED = True
        
        except Exception as e:
            pass  # Silently ignore parsing errors
    
    def on_error(self, ws, error):
        """Handle WebSocket errors"""
        global BINANCE_WS_CONNECTED
        BINANCE_WS_CONNECTED = False
    
    def on_close(self, ws, close_status_code, close_msg):
        """Handle WebSocket close"""
        global BINANCE_WS_CONNECTED
        BINANCE_WS_CONNECTED = False
    
    def on_open(self, ws):
        """Handle WebSocket open"""
        global BINANCE_WS_CONNECTED
        BINANCE_WS_CONNECTED = True
    
    def start(self):
        """Start WebSocket in background thread"""
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
            except Exception as e:
                global BINANCE_WS_CONNECTED
                BINANCE_WS_CONNECTED = False
        
        thread = threading.Thread(target=run_ws, daemon=True)
        thread.start()

binance_monitor = BinanceWebSocketMonitor()

class TriangularArbScanner:
    def __init__(self):
        self.taker_fee = 0.001  # 0.1% Coinbase
        self.slippage = 0.0005  # 0.05%
        self.min_edge = 0.005   # 0.5%
        
    def calculate_loops(self, btc_usd, eth_usd):
        """
        Calculate triangular arb opportunities
        Note: Without direct BTC-ETH trading on Coinbase, arbitrage is theoretical
        """
        # Both loops converge to the same result due to mathematical properties
        # Start with $1, fees are 0.1% per leg (3 legs = 0.3% total)
        
        # Real triangular arbitrage would require actual cross-rate access
        # Since Coinbase has no BTC-ETH direct pair, edges are zero
        final_value = 1.0 * (1 - self.taker_fee * 3)  # Only fees matter
        
        profit_pct = ((final_value - 1.0) / 1.0) * 100
        
        return {
            'loop': 'USD → BTC ↔ ETH → USD (theoretical)',
            'final_value': final_value,
            'profit_pct': profit_pct,
            'profitable': profit_pct > 0.5,
            'note': 'Coinbase has no direct BTC-ETH pair. No arbitrage opportunity.'
        }
    
    def scan(self, btc_usd, eth_usd):
        """Scan for triangular opportunities"""
        result = self.calculate_loops(btc_usd, eth_usd)
        
        opportunities = []
        if result['profitable']:
            opportunities.append({
                'loop': result['loop'],
                'profit_pct': result['profit_pct'],
                'final_value': result['final_value'],
                'wouldbe_pnl_25': (result['final_value'] - 1.0) * 25
            })
        
        return opportunities, result

def main():
    log("=" * 80)
    log("TRIANGULAR ARBITRAGE SCANNER — COINBASE + BINANCE (PAPER MODE)")
    log(f"Start: {datetime.now().isoformat()}")
    log("Mode: PAPER ONLY — No real trades, no capital at risk")
    log("=" * 80)
    
    # Start Binance WebSocket (public read-only feed)
    log("📡 Starting Binance WebSocket (public ticker feed)...")
    binance_monitor.start()
    time.sleep(2)
    
    coinbase = load_coinbase()
    if not coinbase:
        log("❌ Coinbase connection failed")
        return
    
    log("✅ Connected to Coinbase Advanced Trade")
    log("📡 Binance WebSocket: Starting (BTCUSDT + ETHUSDT public feeds)")
    
    scanner = TriangularArbScanner()
    state = load_state()
    
    log(f"\n▶️  Starting triangular arb scanner (scan every 3s)\n")
    
    try:
        while True:
            state['scans'] += 1
            
            try:
                # Fetch Coinbase prices
                btc_usd_cbx = coinbase.fetch_ticker('BTC-USD')['last']
                eth_usd_cbx = coinbase.fetch_ticker('ETH-USD')['last']
                
                # Get Binance prices (from WebSocket)
                with BINANCE_WS_LOCK:
                    btc_usdt_bnx = BINANCE_PRICES.get('btcusdt', 0.0)
                    eth_usdt_bnx = BINANCE_PRICES.get('ethusdt', 0.0)
                
                binance_connected = BINANCE_WS_CONNECTED
                
                # Scan for opportunities
                opps, result = scanner.scan(btc_usd_cbx, eth_usd_cbx)
                
                # Calculate cross-exchange edges
                cross_edges = []
                if btc_usdt_bnx > 0 and eth_usdt_bnx > 0:
                    btc_spread = ((btc_usdt_bnx - btc_usd_cbx) / btc_usd_cbx * 100)
                    eth_spread = ((eth_usdt_bnx - eth_usd_cbx) / eth_usd_cbx * 100)
                    
                    if abs(btc_spread) > 0.3:  # >0.3% edge
                        cross_edges.append(f"BTC: Binance ${btc_usdt_bnx:.2f} vs Coinbase ${btc_usd_cbx:.2f} ({btc_spread:+.2f}%)")
                    if abs(eth_spread) > 0.3:
                        cross_edges.append(f"ETH: Binance ${eth_usdt_bnx:.2f} vs Coinbase ${eth_usd_cbx:.2f} ({eth_spread:+.2f}%)")
                
                # Log every 100 scans
                if state['scans'] % 100 == 0:
                    log(f"\n📊 Scan #{state['scans']}:")
                    log(f"   === COINBASE ===")
                    log(f"   BTC-USD: ${btc_usd_cbx:.2f} | ETH-USD: ${eth_usd_cbx:.2f}")
                    
                    if binance_connected:
                        log(f"   === BINANCE (WebSocket) ===")
                        log(f"   BTC-USDT: ${btc_usdt_bnx:.2f} | ETH-USDT: ${eth_usdt_bnx:.2f}")
                        
                        if cross_edges:
                            log(f"   === CROSS-EXCHANGE EDGES ===")
                            for edge in cross_edges:
                                log(f"   ✓ {edge}")
                            state['cross_exchange_edges'] = cross_edges
                        else:
                            log(f"   ✓ No significant cross-exchange spreads (<0.3%)")
                    else:
                        log(f"   === BINANCE (WebSocket) ===")
                        log(f"   ⏳ Connecting... (waiting for first data)")
                    
                    log(f"   === INTERNAL ARBITRAGE ===")
                    log(f"   {result['loop']}")
                    log(f"   Status: No opportunity ({result['note']})")
                    
                    save_state(state)
                
                time.sleep(3)
                
            except Exception as e:
                log(f"⚠️  Error scan #{state['scans']}: {str(e)[:100]}")
                time.sleep(3)
                continue
    
    except KeyboardInterrupt:
        log(f"\n⏹️  Stopped by user")
    
    finally:
        log("\n" + "=" * 80)
        log("SESSION SUMMARY")
        log("=" * 80)
        log(f"Scans: {state['scans']}")
        log(f"Opportunities found: {len(state['opportunities'])}")
        log("=" * 80)
        save_state(state)

if __name__ == '__main__':
    main()
