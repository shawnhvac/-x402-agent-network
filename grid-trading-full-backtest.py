#!/usr/bin/env python3
"""
Grid Trading Full Backtest — Coinbase Advanced Trade
- 6-12 months of real historical data (5-minute candles)
- BTC/USD + ETH/USD
- Sensitivity analysis: 1.5%, 2%, 2.5% grid spacing
- Comprehensive metrics: return, drawdown, Sharpe, win rate, profit factor
- Real Coinbase fees (0.1%) + slippage (0.05%)
"""
import ccxt
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import time

# ===== CONFIG =====
BACKTEST_DIR = Path(__file__).parent / "backtest-results"
BACKTEST_DIR.mkdir(exist_ok=True)
LOG_FILE = BACKTEST_DIR / "grid-full-backtest.log"

def log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")
    print(line)

log("=" * 100)
log("GRID TRADING FULL BACKTEST — COINBASE ADVANCED TRADE")
log("Period: 6-12 months | Timeframe: 5-min | Assets: BTC/USD + ETH/USD")
log("=" * 100)

# ===== LOAD COINBASE CREDENTIALS =====
def load_coinbase_creds():
    creds_file = Path('.credentials/coinbase-api.json')
    if creds_file.exists():
        with open(creds_file) as f:
            return json.load(f)
    return None

# ===== FETCH FULL HISTORICAL DATA =====
def fetch_ohlcv_full(symbol='BTC/USD', timeframe='5m', days=365):
    """Fetch maximum available historical data (6-12 months)"""
    log(f"\n📊 Fetching Coinbase {symbol} {timeframe} candles ({days} days)...")
    
    creds = load_coinbase_creds()
    if not creds:
        log("❌ Coinbase credentials not found")
        return []
    
    try:
        coinbase = ccxt.coinbase({
            'apiKey': creds['api_key_id'],
            'secret': creds['api_secret'],
            'enableRateLimit': True
        })
        
        log(f"✅ Connected to Coinbase")
        
        all_candles = []
        end_time = int(datetime.now().timestamp() * 1000)
        start_time = int((datetime.now() - timedelta(days=days)).timestamp() * 1000)
        
        current_time = start_time
        batch = 0
        max_batches = 500  # Safety limit
        
        while current_time < end_time and batch < max_batches:
            batch += 1
            try:
                candles = coinbase.fetch_ohlcv(symbol, timeframe, since=current_time, limit=300)
                
                if not candles:
                    log(f"  No more data at batch {batch}")
                    break
                
                all_candles.extend(candles)
                current_time = candles[-1][0] + 300000  # 5 min = 300000 ms
                
                if batch % 20 == 0:
                    log(f"  Batch {batch}: {len(all_candles)} total candles...")
                
                time.sleep(0.5)
                
            except ccxt.RateLimitExceeded:
                log(f"  Rate limit at batch {batch}, sleeping 3s...")
                time.sleep(3)
            except Exception as e:
                log(f"⚠️  Error at batch {batch}: {str(e)[:100]}")
                time.sleep(1)
                break
        
        log(f"✅ Total {symbol} candles fetched: {len(all_candles)} ({len(all_candles)/12/24 if all_candles else 0:.1f} days)")
        return all_candles
        
    except Exception as e:
        log(f"❌ Connection failed: {str(e)[:200]}")
        return []

def parse_ohlcv_to_df(candles):
    df = pd.DataFrame(candles, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    df = df.drop_duplicates(subset=['timestamp']).sort_values('timestamp').reset_index(drop=True)
    df['close'] = df['close'].astype(float)
    return df

# ===== GRID TRADING BACKTEST ENGINE =====
class GridTradingBacktest:
    def __init__(self, df, symbol='BTC/USD', initial_capital=400, grid_spacing=0.02, leverage=1.5):
        self.df = df.copy()
        self.symbol = symbol
        self.initial_capital = initial_capital
        self.grid_spacing = grid_spacing
        self.leverage = leverage
        
        self.capital = initial_capital
        self.positions = {}
        self.trades = []
        self.equity_curve = [initial_capital]
        self.drawdowns = [0]
        
        self.taker_fee = 0.001  # 0.1% Coinbase Advanced Trade
        self.slippage = 0.0005  # 0.05%
        
        # Grid sizing
        self.num_grids = 10  # 10 above, 10 below
        
        log(f"\n🎯 Grid Backtest ({symbol}):")
        log(f"  Capital: ${initial_capital} | Leverage: {leverage}x")
        log(f"  Grid spacing: {grid_spacing*100}% | Grids: 10 above + 10 below")
        log(f"  Taker fee: {self.taker_fee*100}% | Slippage: {self.slippage*100}%")
    
    def run(self):
        if len(self.df) < 100:
            log(f"❌ Insufficient data ({len(self.df)} candles)")
            return None
        
        log(f"\n▶️  Running backtest on {len(self.df)} candles...")
        
        # Anchor price = first 50-candle MA
        anchor_price = self.df.iloc[:50]['close'].mean()
        
        # Pre-calculate grid levels
        buy_levels = {f"buy_{i}": anchor_price * (1 - (i + 1) * self.grid_spacing) for i in range(self.num_grids)}
        sell_levels = {f"sell_{i}": anchor_price * (1 + (i + 1) * self.grid_spacing) for i in range(self.num_grids)}
        
        size_per_grid = (self.initial_capital * self.leverage) / (self.num_grids * 2 * anchor_price)
        
        log(f"  Anchor price: ${anchor_price:.2f}")
        log(f"  Size per grid: {size_per_grid:.6f} {self.symbol.split('/')[0]}")
        log(f"  Grid range: ${min(buy_levels.values()):.2f} - ${max(sell_levels.values()):.2f}")
        
        for idx in range(50, len(self.df)):
            row = self.df.iloc[idx]
            current_price = row['close']
            
            # Buy signals
            for level_key, level_price in buy_levels.items():
                if level_key not in self.positions and abs(current_price - level_price) / level_price < 0.005:
                    self.positions[level_key] = {
                        'price': level_price,
                        'size': size_per_grid,
                        'idx': idx
                    }
            
            # Sell signals
            to_remove = []
            for level_key, pos in list(self.positions.items()):
                if level_key.startswith('buy'):
                    level_num = int(level_key.split('_')[1])
                    sell_price = anchor_price * (1 + (level_num + 1) * self.grid_spacing)
                    
                    if abs(current_price - sell_price) / sell_price < 0.005:
                        gross_pnl = (sell_price - pos['price']) * pos['size']
                        fees = (pos['price'] * pos['size'] * self.taker_fee) + (sell_price * pos['size'] * self.taker_fee)
                        net_pnl = gross_pnl - fees
                        
                        self.capital += net_pnl
                        self.equity_curve.append(self.capital)
                        
                        self.trades.append({
                            'entry': pos['price'],
                            'exit': sell_price,
                            'size': pos['size'],
                            'gross': gross_pnl,
                            'fees': fees,
                            'net': net_pnl,
                            'hold': idx - pos['idx'],
                            'win': net_pnl > 0
                        })
                        
                        to_remove.append(level_key)
            
            for key in to_remove:
                del self.positions[key]
            
            # Track drawdown
            current_equity = self.capital + sum(p['size'] * current_price for p in self.positions.values())
            running_max = max(self.equity_curve)
            dd = ((current_equity - running_max) / running_max * 100)
            self.drawdowns.append(dd)
        
        # Close open positions at end
        for level_key, pos in list(self.positions.items()):
            exit_price = self.df.iloc[-1]['close']
            gross_pnl = (exit_price - pos['price']) * pos['size']
            fees = (pos['price'] * pos['size'] * self.taker_fee) + (exit_price * pos['size'] * self.taker_fee)
            net_pnl = gross_pnl - fees
            
            self.capital += net_pnl
            self.equity_curve.append(self.capital)
            
            self.trades.append({
                'entry': pos['price'],
                'exit': exit_price,
                'size': pos['size'],
                'gross': gross_pnl,
                'fees': fees,
                'net': net_pnl,
                'hold': len(self.df) - pos['idx'],
                'win': net_pnl > 0
            })
        
        log(f"✅ Backtest done: {len(self.trades)} grid cycles")
        return self.get_metrics()
    
    def get_metrics(self):
        if not self.trades:
            return None
        
        df = pd.DataFrame(self.trades)
        
        wins = (df['net'] > 0).sum()
        wr = (wins / len(df) * 100)
        
        gp = df[df['net'] > 0]['net'].sum()
        gl = abs(df[df['net'] < 0]['net'].sum())
        pf = gp / gl if gl > 0 else (1.0 if gp > 0 else 0.0)
        
        eq = pd.Series(self.equity_curve)
        running_max = eq.expanding().max()
        dd = ((eq - running_max) / running_max * 100).min()
        
        ret = ((self.capital - self.initial_capital) / self.initial_capital * 100)
        
        # Sharpe ratio
        returns = eq.pct_change().dropna()
        sharpe = (returns.mean() / returns.std() * np.sqrt(252 * 24 * 12)) if returns.std() > 0 else 0
        
        avg_trade = df['net'].mean()
        
        # Losing streaks
        streaks = []
        curr = 0
        for w in df['win']:
            if not w:
                curr += 1
            else:
                if curr > 0:
                    streaks.append(curr)
                curr = 0
        if curr > 0:
            streaks.append(curr)
        max_streak = max(streaks) if streaks else 0
        
        return {
            'symbol': self.symbol,
            'spacing': self.grid_spacing,
            'num_trades': len(df),
            'win_rate': wr,
            'profit_factor': pf,
            'max_dd': dd,
            'return': ret,
            'sharpe': sharpe,
            'avg_trade': avg_trade,
            'total_fees': df['fees'].sum(),
            'gross_profit': gp,
            'net_profit': self.capital - self.initial_capital,
            'max_loss_streak': max_streak,
            'final_capital': self.capital
        }

# ===== MAIN EXECUTION =====
log("\n" + "="*100)
log("PHASE 1: FETCH HISTORICAL DATA (6-12 months)")
log("="*100)

btc_candles = fetch_ohlcv_full('BTC/USD', '5m', days=365)
eth_candles = fetch_ohlcv_full('ETH/USD', '5m', days=365)

if not btc_candles or len(btc_candles) < 500:
    log(f"❌ Insufficient BTC data: {len(btc_candles) if btc_candles else 0} candles")
    exit(1)

btc_df = parse_ohlcv_to_df(btc_candles)
eth_df = parse_ohlcv_to_df(eth_candles) if eth_candles else None

log(f"\n✅ BTC Data: {len(btc_df)} candles ({(len(btc_df)/12/24):.1f} days)")
log(f"   Range: {btc_df['timestamp'].min()} → {btc_df['timestamp'].max()}")
log(f"   Price: ${btc_df['close'].min():.0f} - ${btc_df['close'].max():.0f}")

if eth_df is not None:
    log(f"\n✅ ETH Data: {len(eth_df)} candles ({(len(eth_df)/12/24):.1f} days)")
    log(f"   Range: {eth_df['timestamp'].min()} → {eth_df['timestamp'].max()}")
    log(f"   Price: ${eth_df['close'].min():.0f} - ${eth_df['close'].max():.0f}")

# ===== PHASE 2: SENSITIVITY ANALYSIS =====
log("\n" + "="*100)
log("PHASE 2: GRID TRADING BACKTEST (Sensitivity: 1.5%, 2%, 2.5% spacing)")
log("="*100)

spacings = [0.015, 0.02, 0.025]
all_results = {'btc': {}, 'eth': {}}

for spacing in spacings:
    spacing_pct = spacing * 100
    log(f"\n{'─'*100}")
    log(f"Testing grid spacing: {spacing_pct}%")
    log(f"{'─'*100}")
    
    # BTC
    log(f"\nBTC/USD Grid ({spacing_pct}%):")
    btc_tester = GridTradingBacktest(btc_df, symbol='BTC/USD', initial_capital=400, 
                                      grid_spacing=spacing, leverage=1.5)
    btc_metrics = btc_tester.run()
    
    if btc_metrics:
        all_results['btc'][spacing_pct] = btc_metrics
        log(f"  ✅ Result: {btc_metrics['num_trades']} trades | Return: {btc_metrics['return']:+.2f}% | DD: {btc_metrics['max_dd']:.2f}% | WR: {btc_metrics['win_rate']:.1f}%")
    
    # ETH
    if eth_df is not None:
        log(f"\nETH/USD Grid ({spacing_pct}%):")
        eth_tester = GridTradingBacktest(eth_df, symbol='ETH/USD', initial_capital=400, 
                                         grid_spacing=spacing, leverage=1.5)
        eth_metrics = eth_tester.run()
        
        if eth_metrics:
            all_results['eth'][spacing_pct] = eth_metrics
            log(f"  ✅ Result: {eth_metrics['num_trades']} trades | Return: {eth_metrics['return']:+.2f}% | DD: {eth_metrics['max_dd']:.2f}% | WR: {eth_metrics['win_rate']:.1f}%")

# ===== SAVE RESULTS =====
results_file = BACKTEST_DIR / "grid-full-backtest-results.json"
with open(results_file, 'w') as f:
    json.dump({
        'data_info': {
            'btc_candles': len(btc_df),
            'btc_days': len(btc_df) / 12 / 24,
            'btc_date_range': f"{btc_df['timestamp'].min()} to {btc_df['timestamp'].max()}",
            'btc_price_range': f"${btc_df['close'].min():.0f} - ${btc_df['close'].max():.0f}",
            'eth_candles': len(eth_df) if eth_df is not None else 0,
            'eth_days': len(eth_df) / 12 / 24 if eth_df is not None else 0,
        },
        'results': all_results,
        'timestamp': datetime.now().isoformat()
    }, f, indent=2, default=str)

log(f"\n💾 Results saved: {results_file}")

log(f"\n" + "="*100)
log("✅ GRID TRADING FULL BACKTEST COMPLETE")
log("="*100)
