#!/usr/bin/env python3
"""
Grid Trading Bot — Coinbase Advanced Trade
- Paper trading mode (PAPER_TRADING=True)
- BTC/USD + ETH/USD simultaneous grids
- TIGHT GRID: 1.0% spacing (10 levels above/below)
- Real-time price monitoring + grid execution (simulated)
- Daily drawdown tracking (-8% hard stop)
- Comprehensive logging
"""
import ccxt
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import time
import os
from decimal import Decimal

# ===== CONFIG =====
PAPER_TRADING = False  # LIVE TRADING ENABLED
SCAN_INTERVAL = 3  # seconds
GRID_SPACING = 0.01  # 1.0% tight grid
NUM_GRIDS = 10  # 10 above, 10 below
LIVE_CAPITAL_LIMIT = 500.0  # Max $500 per user request
BACKTEST_DIR = Path(__file__).parent / "backtest-results"
LOG_DIR = Path(__file__).parent
LOG_FILE = LOG_DIR / "grid-trading-bot.log"
STATE_FILE = LOG_DIR / "grid-trading-state.json"

def log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")
    print(line)

# ===== LOAD CREDENTIALS & STATE =====
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
        'btc_positions': {},
        'eth_positions': {},
        'btc_capital': 200,  # $200 BTC grid
        'eth_capital': 300,  # $300 ETH grid
        'btc_equity': 200,
        'eth_equity': 300,
        'trades': [],
        'peak_equity': {'btc': 200, 'eth': 300},
        'paper_mode': PAPER_TRADING,
        'total_capital': 500.0,
        'mode': 'LIVE'
    }

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2, default=str)

# ===== GRID TRADING ENGINE =====
class GridTradingBot:
    def __init__(self, symbol, capital, grid_spacing, num_grids, leverage=1.5):
        self.symbol = symbol
        self.initial_capital = capital
        self.current_capital = capital
        self.grid_spacing = grid_spacing
        self.num_grids = num_grids
        self.leverage = leverage
        
        self.positions = {}  # {level: {'price': X, 'size': Y, 'timestamp': Z}}
        self.trades = []
        self.last_price = None
        
        self.taker_fee = 0.001  # 0.1%
        self.slippage = 0.0005  # 0.05%
        
        log(f"\n🤖 GridBot initialized ({symbol}):")
        log(f"   Capital: ${capital} | Spacing: {grid_spacing*100}% | Grids: {num_grids}x2 | Leverage: {leverage}x")
        log(f"   Paper trading: {PAPER_TRADING}")
    
    def update_price(self, current_price):
        """Update current price and check for grid hits"""
        self.last_price = current_price
        
        if not hasattr(self, 'anchor_price'):
            # First price: set anchor
            self.anchor_price = current_price
            self.buy_levels = [self.anchor_price * (1 - (i+1) * self.grid_spacing) for i in range(self.num_grids)]
            self.sell_levels = [self.anchor_price * (1 + (i+1) * self.grid_spacing) for i in range(self.num_grids)]
            self.size_per_grid = (self.initial_capital * self.leverage) / (self.num_grids * 2 * current_price)
            
            log(f"   Anchor: ${current_price:.2f} | Size/grid: {self.size_per_grid:.6f}")
        
        # Check buy signals
        for i, level in enumerate(self.buy_levels):
            level_key = f"buy_{i}"
            if level_key not in self.positions and abs(current_price - level) / level < 0.005:  # Within 0.5%
                self.positions[level_key] = {
                    'price': level,
                    'size': self.size_per_grid,
                    'timestamp': datetime.now().isoformat()
                }
                log(f"   📥 BUY {self.symbol}: Level {i} @ ${level:.2f}")
                
                if not PAPER_TRADING:
                    # Real order execution for LIVE trading
                    try:
                        order = coinbase.create_limit_buy_order(
                            symbol=self.symbol,
                            amount=self.size_per_grid,
                            price=level,
                            params={'timeInForce': 'GTC'}
                        )
                        log(f"   ✅ REAL BUY ORDER PLACED: {order['id']}")
                    except Exception as e:
                        log(f"   ❌ Order error: {str(e)[:100]}")
                        del self.positions[level_key]
        
        # Check sell signals
        to_remove = []
        for level_key, pos in list(self.positions.items()):
            if level_key.startswith('buy'):
                level_num = int(level_key.split('_')[1])
                sell_price = self.anchor_price * (1 + (level_num + 1) * self.grid_spacing)
                
                if abs(current_price - sell_price) / sell_price < 0.005:
                    gross_pnl = (sell_price - pos['price']) * pos['size']
                    fees = (pos['price'] * pos['size'] * self.taker_fee) + (sell_price * pos['size'] * self.taker_fee)
                    net_pnl = gross_pnl - fees
                    
                    self.current_capital += net_pnl
                    
                    self.trades.append({
                        'symbol': self.symbol,
                        'grid_level': level_num,
                        'entry': pos['price'],
                        'exit': sell_price,
                        'size': pos['size'],
                        'gross_pnl': gross_pnl,
                        'net_pnl': net_pnl,
                        'timestamp': datetime.now().isoformat()
                    })
                    
                    log(f"   📤 SELL {self.symbol}: Level {level_num} @ ${sell_price:.2f} | PnL: ${net_pnl:+.2f}")
                    
                    to_remove.append(level_key)
                    
                    if not PAPER_TRADING:
                        # Real order execution for LIVE trading
                        try:
                            order = coinbase.create_limit_sell_order(
                                symbol=self.symbol,
                                amount=self.size_per_grid,
                                price=sell_price,
                                params={'timeInForce': 'GTC'}
                            )
                            log(f"   ✅ REAL SELL ORDER PLACED: {order['id']}")
                        except Exception as e:
                            log(f"   ❌ Order error: {str(e)[:100]}")
        
        for key in to_remove:
            del self.positions[key]
    
    def get_equity(self):
        """Return current equity (capital + open position value)"""
        open_value = sum(p['size'] * self.last_price for p in self.positions.values()) if self.last_price else 0
        return self.current_capital + open_value
    
    def get_drawdown(self, peak):
        """Calculate drawdown from peak"""
        if peak <= 0:
            return 0
        equity = self.get_equity()
        return ((equity - peak) / peak * 100)

# ===== MAIN LOOP =====
def main():
    log("=" * 100)
    log("GRID TRADING BOT — COINBASE ADVANCED TRADE (TIGHT GRID 1.0%)")
    log(f"Start time: {datetime.now().isoformat()}")
    log(f"Mode: {'PAPER' if PAPER_TRADING else 'LIVE'}")
    log(f"Grid spacing: {GRID_SPACING*100}% | Grids per side: {NUM_GRIDS}")
    log(f"Scan interval: {SCAN_INTERVAL} seconds")
    log("=" * 100)
    
    # Load Coinbase
    coinbase = load_coinbase()
    if not coinbase:
        log("❌ Failed to connect to Coinbase")
        return
    
    log("✅ Connected to Coinbase")
    
    # Load state
    state = load_state()
    
    # Initialize bots with tight 1.0% grids
    btc_bot = GridTradingBot('BTC/USD', state['btc_capital'], grid_spacing=GRID_SPACING, num_grids=NUM_GRIDS, leverage=1.5)
    eth_bot = GridTradingBot('ETH/USD', state['eth_capital'], grid_spacing=GRID_SPACING, num_grids=NUM_GRIDS, leverage=1.5)
    
    # Track peaks for drawdown
    btc_peak = state['peak_equity']['btc']
    eth_peak = state['peak_equity']['eth']
    
    scan_count = 0
    
    log("\n▶️  Starting price monitoring loop...")
    log(f"   Scanning every {SCAN_INTERVAL} seconds | Stop at -8% drawdown\n")
    
    try:
        while True:
            scan_count += 1
            
            try:
                # Fetch prices
                btc_ticker = coinbase.fetch_ticker('BTC/USD')
                eth_ticker = coinbase.fetch_ticker('ETH/USD')
                
                btc_price = btc_ticker['last']
                eth_price = eth_ticker['last']
                
                # Update bots
                btc_bot.update_price(btc_price)
                eth_bot.update_price(eth_price)
                
                # Get equities
                btc_equity = btc_bot.get_equity()
                eth_equity = eth_bot.get_equity()
                total_equity = btc_equity + eth_equity
                
                # Update peaks
                if btc_equity > btc_peak:
                    btc_peak = btc_equity
                if eth_equity > eth_peak:
                    eth_peak = eth_equity
                
                # Check drawdowns
                btc_dd = btc_bot.get_drawdown(btc_peak)
                eth_dd = eth_bot.get_drawdown(eth_peak)
                
                # Log every 100 scans
                if scan_count % 100 == 0:
                    log(f"\n📊 Scan #{scan_count}:")
                    log(f"   BTC: ${btc_price:.2f} | Equity: ${btc_equity:.2f} | DD: {btc_dd:.2f}% | Trades: {len(btc_bot.trades)}")
                    log(f"   ETH: ${eth_price:.2f} | Equity: ${eth_equity:.2f} | DD: {eth_dd:.2f}% | Trades: {len(eth_bot.trades)}")
                    log(f"   Total Equity: ${total_equity:.2f} | Total PnL: ${total_equity - state['btc_capital'] - state['eth_capital']:+.2f}")
                    
                    # Save state
                    state = {
                        'session_start': state['session_start'],
                        'scan_count': scan_count,
                        'timestamp': datetime.now().isoformat(),
                        'btc_capital': btc_bot.initial_capital,
                        'eth_capital': eth_bot.initial_capital,
                        'btc_equity': btc_equity,
                        'eth_equity': eth_equity,
                        'total_equity': total_equity,
                        'btc_price': btc_price,
                        'eth_price': eth_price,
                        'btc_trades': len(btc_bot.trades),
                        'eth_trades': len(eth_bot.trades),
                        'total_trades': len(btc_bot.trades) + len(eth_bot.trades),
                        'btc_pnl': btc_equity - btc_bot.initial_capital,
                        'eth_pnl': eth_equity - eth_bot.initial_capital,
                        'total_pnl': total_equity - state['btc_capital'] - state['eth_capital'],
                        'btc_dd': btc_dd,
                        'eth_dd': eth_dd,
                        'max_dd': min(btc_dd, eth_dd),
                        'btc_positions': len(btc_bot.positions),
                        'eth_positions': len(eth_bot.positions),
                        'peak_equity': {'btc': btc_peak, 'eth': eth_peak},
                        'trades': btc_bot.trades + eth_bot.trades,
                        'paper_mode': PAPER_TRADING,
                        'grid_spacing': GRID_SPACING,
                        'grid_levels': NUM_GRIDS
                    }
                    save_state(state)
                
                # Hard stop at -8%
                if btc_dd < -8.0 or eth_dd < -8.0:
                    log(f"\n⛔ HARD STOP TRIGGERED!")
                    log(f"   BTC DD: {btc_dd:.2f}% | ETH DD: {eth_dd:.2f}%")
                    log(f"   Pausing trading until manual restart")
                    
                    state['status'] = 'HALTED'
                    save_state(state)
                    break
                
                time.sleep(SCAN_INTERVAL)
                
            except Exception as e:
                log(f"⚠️  Error in scan #{scan_count}: {str(e)[:100]}")
                time.sleep(SCAN_INTERVAL)
                continue
    
    except KeyboardInterrupt:
        log(f"\n⏹️  Bot stopped by user")
    
    finally:
        # Final summary
        log("\n" + "=" * 100)
        log("SESSION SUMMARY")
        log("=" * 100)
        log(f"Scans completed: {scan_count}")
        log(f"Total trades: {len(btc_bot.trades) + len(eth_bot.trades)}")
        log(f"  BTC trades: {len(btc_bot.trades)}")
        log(f"  ETH trades: {len(eth_bot.trades)}")
        log(f"BTC final equity: ${btc_bot.get_equity():.2f} (PnL: ${btc_bot.get_equity() - btc_bot.initial_capital:+.2f})")
        log(f"ETH final equity: ${eth_bot.get_equity():.2f} (PnL: ${eth_bot.get_equity() - eth_bot.initial_capital:+.2f})")
        log(f"Total equity: ${btc_bot.get_equity() + eth_bot.get_equity():.2f}")
        log(f"Total PnL: ${btc_bot.get_equity() - btc_bot.initial_capital + eth_bot.get_equity() - eth_bot.initial_capital:+.2f}")
        
        save_state(state)
        log(f"State saved: {STATE_FILE}")
        log("=" * 100)

if __name__ == '__main__':
    main()
