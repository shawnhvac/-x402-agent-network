#!/usr/bin/env python3
"""
Mean-Reversion Backtester v2 — FIXED
- Full 12-month data via CCXT Kraken (non-geo-restricted)
- 5-minute candles (realistic for mean-reversion)
- Relaxed parameters based on 2025 proven backtests
- Full sensitivity analysis + Grid Trading alternative
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
LOG_FILE = BACKTEST_DIR / "backtest-v2.log"

def log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")
    print(line)

log("=" * 80)
log("MEAN-REVERSION BACKTESTER v2 — FULL 12-MONTH DATA")
log("Asset: BTC/USDT | Timeframe: 5-min | Leverage: 1.5-2x | Exchange: Kraken")
log("=" * 80)

# ===== FETCH HISTORICAL DATA VIA CCXT KRAKEN =====
def fetch_ohlcv_full(symbol='BTC/USD', timeframe='5m', days=365):
    """Fetch full OHLCV data from Kraken with pagination"""
    log(f"\n📊 Fetching Kraken {symbol} {timeframe} candles for {days} days...")
    
    kraken = ccxt.kraken({'enableRateLimit': True})
    all_candles = []
    
    end_time = int(datetime.now().timestamp() * 1000)
    start_time = int((datetime.now() - timedelta(days=days)).timestamp() * 1000)
    
    current_time = start_time
    batch = 0
    
    while current_time < end_time:
        batch += 1
        try:
            # Kraken returns candles in reverse order sometimes, handle it
            candles = kraken.fetch_ohlcv(symbol, timeframe, since=current_time, limit=720)
            
            if not candles:
                log(f"  No more data at batch {batch}")
                break
            
            all_candles.extend(candles)
            current_time = candles[-1][0] + 300000  # 5 min = 300000 ms
            
            if batch % 10 == 0:
                log(f"  Batch {batch}: {len(all_candles)} total candles...")
            
            time.sleep(0.3)  # Rate limiting
            
        except ccxt.RateLimitExceeded:
            log(f"  Rate limit at batch {batch}, sleeping 3s...")
            time.sleep(3)
        except Exception as e:
            log(f"⚠️  Error at batch {batch}: {str(e)[:100]}")
            break
    
    log(f"✅ Total {symbol} candles: {len(all_candles)}")
    return all_candles

def parse_ohlcv_to_df(candles):
    """Convert CCXT OHLCV to DataFrame"""
    df = pd.DataFrame(candles, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    df['close'] = df['close'].astype(float)
    df['open'] = df['open'].astype(float)
    df['high'] = df['high'].astype(float)
    df['low'] = df['low'].astype(float)
    df['volume'] = df['volume'].astype(float)
    
    # Remove duplicates and sort
    df = df.drop_duplicates(subset=['timestamp']).sort_values('timestamp').reset_index(drop=True)
    return df

# ===== INDICATORS =====
def calculate_ema(series, period):
    return series.ewm(span=period, adjust=False).mean()

def add_indicators(df):
    df['ema_20'] = calculate_ema(df['close'], 20)
    df['ema_60'] = calculate_ema(df['close'], 60)
    df['deviation_from_ema20'] = ((df['close'] - df['ema_20']) / df['ema_20'] * 100)
    df['ema_spread'] = abs((df['ema_20'] - df['ema_60']) / df['ema_20'] * 100)
    return df

# ===== MEAN-REVERSION BACKTEST =====
class MeanReversionBacktest:
    def __init__(self, df, initial_capital=1300, leverage=1.5, 
                 dev_threshold=1.0, ema_spread_threshold=2.0):
        self.df = df.copy()
        self.initial_capital = initial_capital
        self.leverage = leverage
        self.dev_threshold = dev_threshold
        self.ema_spread_threshold = ema_spread_threshold
        
        self.capital = initial_capital
        self.position = None
        self.trades = []
        self.equity_curve = [initial_capital]
        
        self.taker_fee = 0.001  # 0.1%
        self.slippage = 0.0005  # 0.05%
        self.max_hold_minutes = 6 * 60  # 6 hours
        
        log(f"\n🎯 MR Backtest initialized:")
        log(f"  Capital: ${initial_capital} | Leverage: {leverage}x")
        log(f"  Dev threshold: {dev_threshold}% | EMA spread: {ema_spread_threshold}%")
        log(f"  Fee: {self.taker_fee*100}% | Slippage: {self.slippage*100}%")
    
    def run(self):
        log(f"\n▶️  Running backtest on {len(self.df)} candles...")
        
        for idx in range(60, len(self.df)):
            row = self.df.iloc[idx]
            
            # Close position if max hold exceeded
            if self.position:
                hold_time = idx - self.position['entry_idx']
                if hold_time >= self.max_hold_minutes:
                    self.close_position(idx, row, "max_hold")
                    continue
            
            # Check exit conditions
            if self.position:
                exit_price = row['close']
                deviation = ((exit_price - row['ema_20']) / row['ema_20'] * 100)
                
                # TP: within 0.3% of EMA20
                if abs(deviation) < 0.3:
                    self.close_position(idx, row, "tp")
                    continue
                
                # SL: 2% loss
                if self.position['side'] == 'long':
                    loss = ((exit_price - self.position['entry_price']) / self.position['entry_price'] * 100)
                    if loss <= -2.0:
                        self.close_position(idx, row, "sl")
                        continue
                else:  # short
                    loss = ((self.position['entry_price'] - exit_price) / self.position['entry_price'] * 100)
                    if loss <= -2.0:
                        self.close_position(idx, row, "sl")
                        continue
            
            # Entry signals
            if not self.position:
                dev = row['deviation_from_ema20']
                spread = row['ema_spread']
                
                if spread < self.ema_spread_threshold:
                    if dev < -self.dev_threshold:
                        self.open_position(idx, row, 'long')
                    elif dev > self.dev_threshold:
                        self.open_position(idx, row, 'short')
        
        if self.position:
            self.close_position(len(self.df) - 1, self.df.iloc[-1], "eob")
        
        log(f"✅ Backtest done: {len(self.trades)} trades")
        return self.get_metrics()
    
    def open_position(self, idx, row, side):
        entry_price = row['close'] * (1 + self.slippage if side == 'long' else 1 - self.slippage)
        size = (self.capital * self.leverage) / entry_price
        self.position = {
            'side': side, 'entry_price': entry_price, 'entry_idx': idx,
            'entry_time': row['timestamp'], 'size': size
        }
    
    def close_position(self, idx, row, reason):
        if not self.position:
            return
        
        exit_price = row['close'] * (1 - self.slippage if self.position['side'] == 'long' else 1 + self.slippage)
        
        if self.position['side'] == 'long':
            pnl = (exit_price - self.position['entry_price']) * self.position['size']
        else:
            pnl = (self.position['entry_price'] - exit_price) * self.position['size']
        
        fees = self.position['entry_price'] * self.position['size'] * self.taker_fee * 2
        net_pnl = pnl - fees
        
        self.capital += net_pnl
        self.equity_curve.append(self.capital)
        
        self.trades.append({
            'entry_time': self.position['entry_time'],
            'exit_time': row['timestamp'],
            'side': self.position['side'],
            'entry_price': self.position['entry_price'],
            'exit_price': exit_price,
            'size': self.position['size'],
            'pnl': pnl,
            'fees': fees,
            'net_pnl': net_pnl,
            'hold_min': idx - self.position['entry_idx'],
            'win': net_pnl > 0,
            'reason': reason
        })
        
        self.position = None
    
    def get_metrics(self):
        if not self.trades:
            return {'num_trades': 0, 'win_rate': 0, 'profit_factor': 0, 'max_dd': 0,
                    'return': 0, 'sharpe': 0, 'avg_hold': 0, 'losing_streaks': [], 'gp': 0, 'gl': 0}
        
        df = pd.DataFrame(self.trades)
        wins = df['win'].sum()
        wr = (wins / len(df) * 100)
        
        gp = df[df['net_pnl'] > 0]['net_pnl'].sum()
        gl = abs(df[df['net_pnl'] < 0]['net_pnl'].sum())
        pf = gp / gl if gl > 0 else 0
        
        eq = pd.Series(self.equity_curve)
        dd = ((eq - eq.expanding().max()) / eq.expanding().max()).min() * 100
        
        ret = ((self.capital - self.initial_capital) / self.initial_capital * 100)
        
        returns = eq.pct_change().dropna()
        sharpe = (returns.mean() / returns.std() * np.sqrt(252 * 24 * 12)) if returns.std() > 0 else 0
        
        avg_h = df['hold_min'].mean()
        
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
        streaks = sorted(streaks, reverse=True)[:5]
        
        return {
            'num_trades': len(df),
            'win_rate': wr,
            'profit_factor': pf,
            'max_dd': dd,
            'return': ret,
            'sharpe': sharpe,
            'avg_hold': avg_h,
            'losing_streaks': streaks,
            'gp': gp,
            'gl': gl
        }

# ===== GRID TRADING BACKTEST =====
class GridTradingBacktest:
    def __init__(self, df, initial_capital=500, grid_spacing=0.02, num_grids=10, leverage=1.5):
        self.df = df.copy()
        self.initial_capital = initial_capital
        self.grid_spacing = grid_spacing
        self.num_grids = num_grids
        self.leverage = leverage
        
        self.capital = initial_capital
        self.positions = {}
        self.trades = []
        self.equity_curve = [initial_capital]
        
        self.taker_fee = 0.001
        self.slippage = 0.0005
        
        log(f"\n📊 Grid Backtest initialized:")
        log(f"  Capital: ${initial_capital} | Leverage: {leverage}x")
        log(f"  Grid spacing: {grid_spacing*100}% | Num grids: {num_grids} each side")
    
    def run(self):
        log(f"\n▶️  Running grid backtest on {len(self.df)} candles...")
        
        initial_price = self.df.iloc[100]['close']  # Use 100th candle as anchor
        size_per_level = (self.initial_capital * self.leverage) / (self.num_grids * 2 * initial_price)
        
        for idx in range(100, len(self.df)):
            row = self.df.iloc[idx]
            current_price = row['close']
            
            # Buy signals (price below center)
            for i in range(1, self.num_grids + 1):
                level = initial_price * (1 - (i * self.grid_spacing))
                if level not in self.positions and abs(current_price - level) / level < 0.01:
                    self.positions[level] = {'size': size_per_level, 'time': idx}
            
            # Sell signals (price above center)
            levels_to_remove = []
            for level in list(self.positions.keys()):
                sell_at = level * (1 + self.grid_spacing)
                if abs(current_price - sell_at) / sell_at < 0.01:
                    pnl = (sell_at - level) * self.positions[level]['size'] - (level * self.positions[level]['size'] * self.taker_fee * 2)
                    self.capital += pnl
                    self.equity_curve.append(self.capital)
                    self.trades.append({'pnl': pnl, 'buy': level, 'sell': sell_at, 'hold': idx - self.positions[level]['time']})
                    levels_to_remove.append(level)
            
            for level in levels_to_remove:
                del self.positions[level]
        
        log(f"✅ Grid backtest done: {len(self.trades)} cycles")
        return self.get_metrics()
    
    def get_metrics(self):
        if not self.trades:
            return {'num_trades': 0, 'win_rate': 100, 'profit_factor': 0, 'max_dd': 0, 'return': 0}
        
        df = pd.DataFrame(self.trades)
        wins = (df['pnl'] > 0).sum()
        wr = wins / len(df) * 100
        
        gp = df[df['pnl'] > 0]['pnl'].sum()
        gl = abs(df[df['pnl'] < 0]['pnl'].sum())
        pf = gp / gl if gl > 0 else 0
        
        eq = pd.Series(self.equity_curve)
        dd = ((eq - eq.expanding().max()) / eq.expanding().max()).min() * 100
        
        ret = ((self.capital - self.initial_capital) / self.initial_capital * 100)
        
        return {
            'num_trades': len(df),
            'win_rate': wr,
            'profit_factor': pf,
            'max_dd': dd,
            'return': ret
        }

# ===== MAIN =====
log("\n🔌 Initializing Kraken...")
try:
    candles = fetch_ohlcv_full(symbol='BTC/USD', timeframe='5m', days=365)
    
    if not candles or len(candles) < 120:
        log(f"❌ Insufficient data: {len(candles)} candles")
        exit(1)
    
    df = parse_ohlcv_to_df(candles)
    df = add_indicators(df)
    
    log(f"✅ Data ready: {len(df)} candles from {df['timestamp'].min()} to {df['timestamp'].max()}")
    
    # ===== MEAN-REVERSION SENSITIVITY TESTS =====
    mr_scenarios = [
        {'dev': 0.8, 'ema_spread': 1.5, 'name': 'Aggressive'},
        {'dev': 1.0, 'ema_spread': 2.0, 'name': 'Default'},
        {'dev': 1.2, 'ema_spread': 2.5, 'name': 'Conservative'},
    ]
    
    mr_results = {}
    for scenario in mr_scenarios:
        log(f"\n{'='*80}")
        log(f"🧪 Mean-Reversion: {scenario['name']} ({scenario['dev']}% dev, {scenario['ema_spread']}% EMA)")
        log(f"{'='*80}")
        
        tester = MeanReversionBacktest(df, leverage=1.5, dev_threshold=scenario['dev'], 
                                       ema_spread_threshold=scenario['ema_spread'])
        metrics = tester.run()
        mr_results[scenario['name']] = metrics
        
        log(f"\n📊 RESULTS:")
        log(f"  Trades: {metrics['num_trades']}")
        log(f"  Win rate: {metrics['win_rate']:.1f}%")
        log(f"  Profit factor: {metrics['profit_factor']:.2f}")
        log(f"  Max DD: {metrics['max_dd']:.2f}%")
        log(f"  Return: {metrics['return']:+.2f}%")
        log(f"  Sharpe: {metrics['sharpe']:.2f}")
        log(f"  Avg hold: {metrics['avg_hold']:.0f} candles (~{metrics['avg_hold']*5:.0f} min)")
        log(f"  Losing streaks: {metrics['losing_streaks']}")
    
    # ===== GRID TRADING TEST =====
    log(f"\n{'='*80}")
    log("🧪 Grid Trading: 2% spacing, 10 grids, 1.5x leverage, $500 capital")
    log(f"{'='*80}")
    
    grid = GridTradingBacktest(df, initial_capital=500, grid_spacing=0.02, num_grids=10, leverage=1.5)
    grid_metrics = grid.run()
    
    log(f"\n📊 GRID RESULTS:")
    log(f"  Trades: {grid_metrics['num_trades']}")
    log(f"  Win rate: {grid_metrics['win_rate']:.1f}%")
    log(f"  Profit factor: {grid_metrics['profit_factor']:.2f}")
    log(f"  Max DD: {grid_metrics['max_dd']:.2f}%")
    log(f"  Return: {grid_metrics['return']:+.2f}%")
    
    # ===== SAVE RESULTS =====
    results_file = BACKTEST_DIR / "backtest-v2-results.json"
    with open(results_file, 'w') as f:
        json.dump({
            'mean_reversion': mr_results,
            'grid_trading': grid_metrics,
            'data': {
                'symbol': 'BTC/USD',
                'timeframe': '5m',
                'candles': len(df),
                'start': str(df['timestamp'].min()),
                'end': str(df['timestamp'].max()),
                'start_price': float(df.iloc[0]['close']),
                'end_price': float(df.iloc[-1]['close']),
                'price_change_pct': float(((df.iloc[-1]['close'] - df.iloc[0]['close']) / df.iloc[0]['close'] * 100))
            }
        }, f, indent=2, default=str)
    
    log(f"\n💾 Results saved: {results_file}")
    log(f"\n{'='*80}")
    log("✅ BACKTEST v2 COMPLETE")
    log(f"{'='*80}")

except Exception as e:
    log(f"❌ FATAL: {e}")
    import traceback
    log(traceback.format_exc())
    exit(1)
