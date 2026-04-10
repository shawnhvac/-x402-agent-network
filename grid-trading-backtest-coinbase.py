#!/usr/bin/env python3
"""
Grid Trading Backtester — Coinbase
- Real historical data via Coinbase Advanced Trade API
- BTC/USD or ETH/USD
- Full 1+ month backtest with realistic fees
- 2% grid spacing, configurable leverage
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
LOG_FILE = BACKTEST_DIR / "grid-backtest.log"

def log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")
    print(line)

log("=" * 80)
log("GRID TRADING BACKTESTER — COINBASE ADVANCED TRADE")
log("Asset: BTC/USD + ETH/USD | Timeframe: 5-min | Period: 30+ days")
log("=" * 80)

# ===== LOAD COINBASE CREDENTIALS =====
def load_coinbase_creds():
    """Load Coinbase API credentials from secure storage"""
    creds_file = Path('.credentials/coinbase-api.json')
    if creds_file.exists():
        with open(creds_file) as f:
            return json.load(f)
    return None

# ===== FETCH HISTORICAL DATA FROM COINBASE =====
def fetch_ohlcv_coinbase(symbol='BTC/USD', timeframe='5m', days=30):
    """Fetch OHLCV data from Coinbase with pagination"""
    log(f"\n📊 Fetching Coinbase {symbol} {timeframe} candles for {days} days...")
    
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
        
        while current_time < end_time:
            batch += 1
            try:
                candles = coinbase.fetch_ohlcv(symbol, timeframe, since=current_time, limit=300)
                
                if not candles:
                    log(f"  No more data at batch {batch}")
                    break
                
                all_candles.extend(candles)
                current_time = candles[-1][0] + 300000  # 5 min = 300000 ms
                
                if batch % 10 == 0:
                    log(f"  Batch {batch}: {len(all_candles)} total candles...")
                
                time.sleep(0.5)
                
            except ccxt.RateLimitExceeded:
                log(f"  Rate limit at batch {batch}, sleeping...")
                time.sleep(2)
            except Exception as e:
                log(f"⚠️  Error at batch {batch}: {str(e)[:100]}")
                break
        
        log(f"✅ Total {symbol} candles: {len(all_candles)}")
        return all_candles
        
    except Exception as e:
        log(f"❌ Coinbase connection failed: {str(e)[:200]}")
        return []

def parse_ohlcv_to_df(candles):
    """Convert CCXT OHLCV to DataFrame"""
    df = pd.DataFrame(candles, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    df['close'] = df['close'].astype(float)
    df['open'] = df['open'].astype(float)
    df['high'] = df['high'].astype(float)
    df['low'] = df['low'].astype(float)
    df['volume'] = df['volume'].astype(float)
    
    df = df.drop_duplicates(subset=['timestamp']).sort_values('timestamp').reset_index(drop=True)
    return df

# ===== GRID TRADING BACKTEST =====
class GridTradingBacktest:
    def __init__(self, df, symbol='BTC/USD', initial_capital=500, grid_spacing=0.02, 
                 num_grids=10, leverage=1.5):
        self.df = df.copy()
        self.symbol = symbol
        self.initial_capital = initial_capital
        self.grid_spacing = grid_spacing
        self.num_grids = num_grids
        self.leverage = leverage
        
        self.capital = initial_capital
        self.positions = {}  # {price_level: {'size': X, 'entry_idx': Y}}
        self.trades = []
        self.equity_curve = [initial_capital]
        
        self.taker_fee = 0.005  # Coinbase Advanced Trade taker fee
        self.slippage = 0.0003  # Conservative 0.03% slippage
        
        log(f"\n📊 Grid Backtest initialized ({symbol}):")
        log(f"  Capital: ${initial_capital} | Leverage: {leverage}x")
        log(f"  Grid spacing: {grid_spacing*100}% | Num grids: {num_grids} each side")
        log(f"  Taker fee: {self.taker_fee*100}% | Slippage: {self.slippage*100}%")
    
    def run(self):
        log(f"\n▶️  Running grid backtest on {len(self.df)} candles ({self.symbol})...")
        
        # Set grid around 20-candle moving average as anchor
        if len(self.df) < 20:
            log(f"❌ Insufficient data ({len(self.df)} candles)")
            return None
        
        anchor_price = self.df.iloc[20:40]['close'].mean()  # Use 20-40 candle MA as anchor
        
        # Pre-calculate grid levels
        buy_levels = [anchor_price * (1 - (i + 1) * self.grid_spacing) for i in range(self.num_grids)]
        sell_levels = [anchor_price * (1 + (i + 1) * self.grid_spacing) for i in range(self.num_grids)]
        
        size_per_level = (self.initial_capital * self.leverage) / (self.num_grids * 2 * anchor_price)
        
        log(f"  Anchor price: ${anchor_price:.2f}")
        log(f"  Size per grid level: {size_per_level:.6f} {self.symbol.split('/')[0]}")
        log(f"  Grid range: ${buy_levels[-1]:.2f} - ${sell_levels[-1]:.2f}")
        
        for idx in range(40, len(self.df)):
            row = self.df.iloc[idx]
            current_price = row['close']
            
            # Check buy signals (price approaching buy levels)
            for i, level in enumerate(buy_levels):
                level_key = f"buy_{i}"
                price_diff_pct = abs(current_price - level) / level
                
                # Trigger buy when within 0.3% of grid level
                if price_diff_pct < 0.003 and level_key not in self.positions:
                    self.positions[level_key] = {
                        'size': size_per_level,
                        'entry_price': level,
                        'entry_idx': idx,
                        'side': 'buy',
                        'grid_level': level
                    }
            
            # Check sell signals (price approaching sell levels from above)
            for i, level in enumerate(sell_levels):
                level_key = f"sell_{i}"
                price_diff_pct = abs(current_price - level) / level
                
                # Trigger sell when within 0.3% of grid level
                if price_diff_pct < 0.003:
                    # Find matching buy position
                    buy_key = f"buy_{i}"
                    if buy_key in self.positions:
                        buy_pos = self.positions[buy_key]
                        
                        # Calculate PnL
                        gross_pnl = (level - buy_pos['entry_price']) * buy_pos['size']
                        fees = (buy_pos['entry_price'] * buy_pos['size'] * self.taker_fee) + \
                               (level * buy_pos['size'] * self.taker_fee)
                        net_pnl = gross_pnl - fees
                        
                        self.capital += net_pnl
                        self.equity_curve.append(self.capital)
                        
                        self.trades.append({
                            'grid_level': i,
                            'entry_price': buy_pos['entry_price'],
                            'exit_price': level,
                            'size': buy_pos['size'],
                            'gross_pnl': gross_pnl,
                            'fees': fees,
                            'net_pnl': net_pnl,
                            'hold_candles': idx - buy_pos['entry_idx'],
                            'win': net_pnl > 0
                        })
                        
                        del self.positions[buy_key]
        
        # Close any open positions at end
        for key, pos in list(self.positions.items()):
            exit_price = self.df.iloc[-1]['close']
            gross_pnl = (exit_price - pos['entry_price']) * pos['size']
            fees = (pos['entry_price'] * pos['size'] * self.taker_fee) + \
                   (exit_price * pos['size'] * self.taker_fee)
            net_pnl = gross_pnl - fees
            
            self.capital += net_pnl
            self.equity_curve.append(self.capital)
            
            self.trades.append({
                'grid_level': 'open',
                'entry_price': pos['entry_price'],
                'exit_price': exit_price,
                'size': pos['size'],
                'gross_pnl': gross_pnl,
                'fees': fees,
                'net_pnl': net_pnl,
                'hold_candles': len(self.df) - pos['entry_idx'],
                'win': net_pnl > 0,
                'reason': 'eob'
            })
        
        log(f"✅ Backtest done: {len(self.trades)} grid cycles")
        return self.get_metrics()
    
    def get_metrics(self):
        if not self.trades:
            return {
                'symbol': self.symbol,
                'num_trades': 0,
                'win_rate': 0,
                'profit_factor': 0,
                'max_dd': 0,
                'return': 0,
                'final_capital': self.capital
            }
        
        df = pd.DataFrame(self.trades)
        wins = (df['net_pnl'] > 0).sum()
        wr = (wins / len(df) * 100)
        
        gp = df[df['net_pnl'] > 0]['net_pnl'].sum()
        gl = abs(df[df['net_pnl'] < 0]['net_pnl'].sum())
        pf = gp / gl if gl > 0 else 0
        
        eq = pd.Series(self.equity_curve)
        running_max = eq.expanding().max()
        dd = ((eq - running_max) / running_max * 100).min()
        
        ret = ((self.capital - self.initial_capital) / self.initial_capital * 100)
        
        avg_trade = df['net_pnl'].mean()
        avg_win = df[df['net_pnl'] > 0]['net_pnl'].mean() if wins > 0 else 0
        avg_loss = df[df['net_pnl'] < 0]['net_pnl'].mean() if len(df) - wins > 0 else 0
        
        return {
            'symbol': self.symbol,
            'num_trades': len(df),
            'win_rate': wr,
            'profit_factor': pf,
            'max_dd': dd,
            'return': ret,
            'final_capital': self.capital,
            'avg_trade': avg_trade,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'total_trades_df': df
        }

# ===== MAIN =====
log("\n🔌 Loading Coinbase credentials...")

creds = load_coinbase_creds()
if not creds:
    log("❌ Coinbase credentials not found")
    exit(1)

log("✅ Credentials loaded")

# ===== TEST BTC =====
log("\n" + "=" * 80)
log("BACKTEST 1: BTC/USD Grid Trading")
log("=" * 80)

btc_candles = fetch_ohlcv_coinbase('BTC/USD', '5m', days=30)

if btc_candles and len(btc_candles) >= 120:
    btc_df = parse_ohlcv_to_df(btc_candles)
    
    log(f"\n✅ BTC Data ready: {len(btc_df)} candles from {btc_df['timestamp'].min()} to {btc_df['timestamp'].max()}")
    log(f"   Price range: ${btc_df['close'].min():.2f} - ${btc_df['close'].max():.2f}")
    
    btc_grid = GridTradingBacktest(btc_df, symbol='BTC/USD', initial_capital=500, 
                                    grid_spacing=0.02, num_grids=10, leverage=1.5)
    btc_metrics = btc_grid.run()
    
    if btc_metrics:
        log(f"\n📊 BTC/USD RESULTS:")
        log(f"  Trades: {btc_metrics['num_trades']}")
        log(f"  Win rate: {btc_metrics['win_rate']:.1f}%")
        log(f"  Profit factor: {btc_metrics['profit_factor']:.2f}")
        log(f"  Max DD: {btc_metrics['max_dd']:.2f}%")
        log(f"  Return: {btc_metrics['return']:+.2f}%")
        log(f"  Final capital: ${btc_metrics['final_capital']:.2f}")
        log(f"  Avg trade: ${btc_metrics['avg_trade']:.2f}")
        log(f"  Avg win: ${btc_metrics['avg_win']:.2f} | Avg loss: ${btc_metrics['avg_loss']:.2f}")
else:
    log(f"⚠️  Insufficient BTC data: {len(btc_candles) if btc_candles else 0} candles")
    btc_metrics = None

# ===== TEST ETH =====
log("\n" + "=" * 80)
log("BACKTEST 2: ETH/USD Grid Trading")
log("=" * 80)

eth_candles = fetch_ohlcv_coinbase('ETH/USD', '5m', days=30)

if eth_candles and len(eth_candles) >= 120:
    eth_df = parse_ohlcv_to_df(eth_candles)
    
    log(f"\n✅ ETH Data ready: {len(eth_df)} candles from {eth_df['timestamp'].min()} to {eth_df['timestamp'].max()}")
    log(f"   Price range: ${eth_df['close'].min():.2f} - ${eth_df['close'].max():.2f}")
    
    eth_grid = GridTradingBacktest(eth_df, symbol='ETH/USD', initial_capital=500, 
                                    grid_spacing=0.03, num_grids=10, leverage=1.5)
    eth_metrics = eth_grid.run()
    
    if eth_metrics:
        log(f"\n📊 ETH/USD RESULTS:")
        log(f"  Trades: {eth_metrics['num_trades']}")
        log(f"  Win rate: {eth_metrics['win_rate']:.1f}%")
        log(f"  Profit factor: {eth_metrics['profit_factor']:.2f}")
        log(f"  Max DD: {eth_metrics['max_dd']:.2f}%")
        log(f"  Return: {eth_metrics['return']:+.2f}%")
        log(f"  Final capital: ${eth_metrics['final_capital']:.2f}")
        log(f"  Avg trade: ${eth_metrics['avg_trade']:.2f}")
        log(f"  Avg win: ${eth_metrics['avg_win']:.2f} | Avg loss: ${eth_metrics['avg_loss']:.2f}")
else:
    log(f"⚠️  Insufficient ETH data: {len(eth_candles) if eth_candles else 0} candles")
    eth_metrics = None

# ===== SAVE RESULTS =====
results = {
    'btc': btc_metrics if btc_metrics else {},
    'eth': eth_metrics if eth_metrics else {},
    'timestamp': datetime.now().isoformat()
}

results_file = BACKTEST_DIR / "grid-backtest-coinbase-results.json"
with open(results_file, 'w') as f:
    json.dump(results, f, indent=2, default=str)

log(f"\n💾 Results saved: {results_file}")

log(f"\n{'='*80}")
log("✅ GRID TRADING BACKTEST COMPLETE")
log(f"{'='*80}")
