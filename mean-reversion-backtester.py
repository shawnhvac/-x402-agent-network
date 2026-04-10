#!/usr/bin/env python3
"""
Mean-Reversion Backtester
12-month historical backtest with realistic fees, slippage, and leverage
Uses Kraken API for free historical data access
"""
import json
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import time

# ===== CONFIG =====
BACKTEST_DIR = Path(__file__).parent / "backtest-results"
BACKTEST_DIR.mkdir(exist_ok=True)
LOG_FILE = BACKTEST_DIR / "backtest.log"

def log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")
    print(line)

log("=" * 80)
log("MEAN-REVERSION BACKTESTER — PHASE 1")
log("Asset: BTC/USDT | Period: Last 12 months | Leverage: Up to 2x")
log("=" * 80)

# ===== FETCH HISTORICAL DATA FROM KRAKEN =====
def fetch_kraken_ohlc(pair="XXBTZUSD", interval=1, days=365):
    """Fetch OHLC data from Kraken (free public API)"""
    log(f"\n📊 Fetching Kraken {pair} 1m candles for last {days} days...")
    
    url = "https://api.kraken.com/0/public/OHLC"
    all_candles = []
    
    # Kraken returns last 720 candles per request for 1m interval
    end_time = int(datetime.now().timestamp())
    start_time = int((datetime.now() - timedelta(days=days)).timestamp())
    
    current_time = start_time
    batch = 0
    
    while current_time < end_time:
        batch += 1
        try:
            resp = requests.get(url, params={
                "pair": pair,
                "interval": interval,
                "since": current_time
            }, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            
            if data['result'][pair]:
                candles = data['result'][pair]
                all_candles.extend(candles)
                current_time = candles[-1][0] + 60  # Last candle time + 60 seconds
                
                if batch % 20 == 0:
                    log(f"  Fetched {len(all_candles)} candles...")
                
                time.sleep(0.5)  # Rate limit
            else:
                break
        except Exception as e:
            log(f"⚠️  Error fetching batch {batch}: {e}")
            break
    
    log(f"✅ Total {pair} candles fetched: {len(all_candles)}")
    return all_candles

def parse_ohlc_to_df(candles):
    """Convert Kraken OHLC to DataFrame"""
    # Kraken format: [time, open, high, low, close, vwap, volume, count]
    df = pd.DataFrame(candles, columns=['timestamp', 'open', 'high', 'low', 'close', 'vwap', 'volume', 'count'])
    
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
    df['close'] = df['close'].astype(float)
    df['open'] = df['open'].astype(float)
    df['high'] = df['high'].astype(float)
    df['low'] = df['low'].astype(float)
    df['volume'] = df['volume'].astype(float)
    
    return df.sort_values('timestamp').reset_index(drop=True)

# ===== INDICATORS =====
def calculate_ema(series, period):
    """Calculate Exponential Moving Average"""
    return series.ewm(span=period, adjust=False).mean()

def add_indicators(df):
    """Add 20-min EMA and 60-min EMA to DataFrame"""
    df['ema_20'] = calculate_ema(df['close'], 20)
    df['ema_60'] = calculate_ema(df['close'], 60)
    
    # Calculate deviations
    df['deviation_from_ema20'] = ((df['close'] - df['ema_20']) / df['ema_20'] * 100)
    df['ema_spread'] = abs((df['ema_20'] - df['ema_60']) / df['ema_20'] * 100)
    
    return df

# ===== STRATEGY =====
class MeanReversionBacktester:
    def __init__(self, df, initial_capital=1300, leverage=2.0, 
                 dev_threshold=2.0, ema_spread_threshold=1.0):
        self.df = df.copy()
        self.initial_capital = initial_capital
        self.leverage = leverage
        self.dev_threshold = dev_threshold
        self.ema_spread_threshold = ema_spread_threshold
        
        self.capital = initial_capital
        self.position = None
        self.trades = []
        self.equity_curve = [initial_capital]
        
        # Fees and slippage
        self.taker_fee = 0.001  # 0.1% Kraken/Binance taker
        self.slippage = 0.0008  # 0.08% assumed slippage
        
        self.max_hold_minutes = 4 * 60
        
        log(f"\n🎯 Backtester initialized:")
        log(f"  Initial capital: ${initial_capital}")
        log(f"  Leverage: {leverage}x")
        log(f"  Deviation threshold: {dev_threshold}%")
        log(f"  EMA spread threshold: {ema_spread_threshold}%")
        log(f"  Taker fee: {self.taker_fee*100}%")
        log(f"  Slippage: {self.slippage*100}%")
    
    def run(self):
        """Run backtest"""
        log(f"\n▶️  Running backtest on {len(self.df)} candles...")
        
        for idx in range(60, len(self.df)):
            row = self.df.iloc[idx]
            
            # Close position if max hold exceeded
            if self.position:
                hold_time = idx - self.position['entry_idx']
                if hold_time >= self.max_hold_minutes:
                    self.close_position(idx, row, reason="max_hold")
                    continue
            
            # Check exit conditions
            if self.position:
                exit_price = row['close']
                deviation = ((exit_price - row['ema_20']) / row['ema_20'] * 100)
                
                if abs(deviation) < 0.5:
                    self.close_position(idx, row, reason="reversion")
                    continue
                
                if self.position['side'] == 'long':
                    loss_pct = ((exit_price - self.position['entry_price']) / self.position['entry_price'] * 100)
                    if loss_pct <= -1.8:
                        self.close_position(idx, row, reason="stop_loss")
                        continue
                else:
                    loss_pct = ((self.position['entry_price'] - exit_price) / self.position['entry_price'] * 100)
                    if loss_pct <= -1.8:
                        self.close_position(idx, row, reason="stop_loss")
                        continue
            
            # Entry signals
            if not self.position:
                deviation = row['deviation_from_ema20']
                ema_spread = row['ema_spread']
                
                if ema_spread < self.ema_spread_threshold:
                    if deviation < -self.dev_threshold:
                        self.open_position(idx, row, 'long')
                    elif deviation > self.dev_threshold:
                        self.open_position(idx, row, 'short')
        
        if self.position:
            self.close_position(len(self.df) - 1, self.df.iloc[-1], reason="end_of_backtest")
        
        log(f"\n✅ Backtest complete. {len(self.trades)} trades executed.")
        return self.calculate_metrics()
    
    def open_position(self, idx, row, side):
        entry_price = row['close'] * (1 + self.slippage if side == 'long' else -self.slippage)
        size = (self.capital * self.leverage) / entry_price
        
        self.position = {
            'side': side,
            'entry_price': entry_price,
            'entry_idx': idx,
            'entry_time': row['timestamp'],
            'size': size
        }
    
    def close_position(self, idx, row, reason):
        if not self.position:
            return
        
        exit_price = row['close'] * (1 - self.slippage if self.position['side'] == 'long' else 1 + self.slippage)
        exit_time = row['timestamp']
        
        if self.position['side'] == 'long':
            pnl = (exit_price - self.position['entry_price']) * self.position['size']
        else:
            pnl = (self.position['entry_price'] - exit_price) * self.position['size']
        
        fees = (self.position['entry_price'] * self.position['size'] * self.taker_fee * 2)
        net_pnl = pnl - fees
        
        self.capital += net_pnl
        self.equity_curve.append(self.capital)
        
        hold_time = idx - self.position['entry_idx']
        
        trade = {
            'entry_time': str(self.position['entry_time']),
            'exit_time': str(exit_time),
            'side': self.position['side'],
            'entry_price': self.position['entry_price'],
            'exit_price': exit_price,
            'size': self.position['size'],
            'pnl': pnl,
            'fees': fees,
            'net_pnl': net_pnl,
            'hold_minutes': hold_time,
            'win': net_pnl > 0,
            'reason': reason
        }
        
        self.trades.append(trade)
        self.position = None
    
    def calculate_metrics(self):
        if not self.trades:
            return {
                'num_trades': 0,
                'win_rate': 0,
                'profit_factor': 0,
                'max_drawdown': 0,
                'total_return': 0,
                'sharpe_ratio': 0,
                'avg_hold_minutes': 0,
                'losing_streaks': []
            }
        
        trades_df = pd.DataFrame(self.trades)
        
        wins = trades_df['win'].sum()
        win_rate = (wins / len(trades_df) * 100) if len(trades_df) > 0 else 0
        
        gross_profit = trades_df[trades_df['net_pnl'] > 0]['net_pnl'].sum()
        gross_loss = abs(trades_df[trades_df['net_pnl'] < 0]['net_pnl'].sum())
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else 0
        
        equity_series = pd.Series(self.equity_curve)
        running_max = equity_series.expanding().max()
        drawdown = (equity_series - running_max) / running_max
        max_drawdown = drawdown.min() * 100
        
        total_return = ((self.capital - self.initial_capital) / self.initial_capital * 100)
        
        returns = pd.Series(self.equity_curve).pct_change().dropna()
        sharpe = (returns.mean() / returns.std() * np.sqrt(252 * 24 * 60)) if returns.std() > 0 else 0
        
        avg_hold = trades_df['hold_minutes'].mean()
        
        losing_streaks = []
        current_streak = 0
        for win in trades_df['win']:
            if not win:
                current_streak += 1
            else:
                if current_streak > 0:
                    losing_streaks.append(current_streak)
                current_streak = 0
        if current_streak > 0:
            losing_streaks.append(current_streak)
        
        losing_streaks = sorted(losing_streaks, reverse=True)[:5]
        
        return {
            'num_trades': len(trades_df),
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'max_drawdown': max_drawdown,
            'total_return': total_return,
            'sharpe_ratio': sharpe,
            'avg_hold_minutes': avg_hold,
            'losing_streaks': losing_streaks,
            'gross_profit': gross_profit,
            'gross_loss': gross_loss
        }

# ===== RUN BACKTEST =====
log("\n📥 Fetching BTC/USD historical data from Kraken...")
candles = fetch_kraken_ohlc("XXBTZUSD", interval=1, days=365)

if candles:
    df = parse_ohlc_to_df(candles)
    df = add_indicators(df)
    
    log(f"\n✅ Data ready: {len(df)} candles from {df['timestamp'].min()} to {df['timestamp'].max()}")
    
    scenarios = [
        {'dev': 1.5, 'ema_spread': 0.5, 'name': 'Aggressive (1.5% dev, 0.5% EMA)'},
        {'dev': 2.0, 'ema_spread': 1.0, 'name': 'Default (2.0% dev, 1.0% EMA)'},
        {'dev': 2.5, 'ema_spread': 1.5, 'name': 'Conservative (2.5% dev, 1.5% EMA)'},
    ]
    
    results = {}
    
    for scenario in scenarios:
        log(f"\n{'='*80}")
        log(f"🧪 Testing: {scenario['name']}")
        log(f"{'='*80}")
        
        tester = MeanReversionBacktester(
            df,
            initial_capital=1300,
            leverage=2.0,
            dev_threshold=scenario['dev'],
            ema_spread_threshold=scenario['ema_spread']
        )
        
        metrics = tester.run()
        results[scenario['name']] = {
            'scenario': scenario,
            'metrics': metrics,
            'final_capital': tester.capital
        }
        
        log(f"\n📊 RESULTS FOR: {scenario['name']}")
        log(f"  Number of trades: {metrics['num_trades']}")
        log(f"  Win rate: {metrics['win_rate']:.1f}%")
        log(f"  Profit factor: {metrics['profit_factor']:.2f}")
        log(f"  Max drawdown: {metrics['max_drawdown']:.2f}%")
        log(f"  Total return: {metrics['total_return']:+.2f}%")
        log(f"  Sharpe ratio: {metrics['sharpe_ratio']:.2f}")
        log(f"  Avg hold time: {metrics['avg_hold_minutes']:.0f} minutes")
        log(f"  Losing streaks (top 5): {metrics['losing_streaks']}")
        log(f"  Final capital: ${tester.capital:.2f}")
    
    results_file = BACKTEST_DIR / "backtest-results.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    log(f"\n💾 Results saved to {results_file}")
    log(f"\n{'='*80}")
    log("✅ BACKTEST COMPLETE")
    log(f"{'='*80}")
else:
    log("❌ Failed to fetch data")
