#!/usr/bin/env python3
"""
Kalshi Paper Scanner — Crypto + Sports + Election (Paper Mode Only)
- Monitors BTC crypto markets (KXBTC15M, KXBTC5M series)
- Monitors active sports markets
- Monitors election/presidential/senate markets
- Detects sum-to-one, correlated, and liquidity edges
- PAPER MODE ONLY: logging and observation, zero capital at risk
"""
import requests
import json
from datetime import datetime
from pathlib import Path
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

LOG_DIR = Path(__file__).parent
LOG_FILE = LOG_DIR / "kalshi-paper-scanner.log"
STATE_FILE = LOG_DIR / "kalshi-paper-state.json"

def log(msg):
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")
    print(line)

def load_state():
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {
        'session_start': datetime.now().isoformat(),
        'scans': 0,
        'crypto_markets': 0,
        'sports_markets': 0,
        'election_markets': 0,
        'edges_detected': 0,
        'mode': 'PAPER ONLY'
    }

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2, default=str)

class KalshiPaperScanner:
    """Scan Kalshi markets for profitable edges"""
    def __init__(self):
        self.base_url = "https://api.kalshi.com/trade-api/v2"
        
        # Create session with exponential backoff
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=2,  # 1s, 2s, 4s
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        self.taker_fee = 0.007  # 0.7% Kalshi fee
        self.last_fetch_time = 0
        self.fetch_cache = {}  # Cache market data for 30 seconds
        
    def fetch_markets(self, market_filter=None):
        """Fetch active markets from Kalshi with caching + backoff"""
        try:
            # Check cache first (30-second TTL)
            cache_key = f"{market_filter or 'all'}"
            if cache_key in self.fetch_cache:
                cached_time, cached_data = self.fetch_cache[cache_key]
                if time.time() - cached_time < 30:
                    return cached_data
            
            # Wait minimum 1 second between API calls
            elapsed = time.time() - self.last_fetch_time
            if elapsed < 1.0:
                time.sleep(1.0 - elapsed)
            
            url = f"{self.base_url}/markets"
            params = {'status': 'open', 'limit': 100}  # Reduced from 200
            
            if market_filter:
                params['series_ticker'] = market_filter
            
            response = self.session.get(url, params=params, timeout=15)
            self.last_fetch_time = time.time()
            
            if response.status_code == 200:
                markets = response.json().get('markets', [])
                # Cache the result
                self.fetch_cache[cache_key] = (time.time(), markets)
                return markets
            else:
                log(f"⚠️  API returned {response.status_code}")
                return []
        
        except Exception as e:
            log(f"⚠️  Market fetch error: {str(e)[:100]}")
            return []
    
    def calculate_sum_to_one_edge(self, yes_price, no_price):
        """Calculate sum-to-one arbitrage edge"""
        sum_price = yes_price + no_price
        
        if sum_price < 1.0:
            gross_edge = 1.0 - sum_price
            fee_adjusted = gross_edge - (yes_price * self.taker_fee) - (no_price * self.taker_fee)
            return {
                'sum': sum_price,
                'gross_edge_pct': (gross_edge * 100),
                'fee_adjusted_pct': (fee_adjusted * 100),
                'profitable': fee_adjusted > 0.008  # >0.8% after fees
            }
        
        return {
            'sum': sum_price,
            'gross_edge_pct': 0.0,
            'fee_adjusted_pct': 0.0,
            'profitable': False
        }
    
    def scan_crypto(self):
        """Scan BTC crypto markets"""
        opportunities = []
        
        # Fetch KXBTC series
        btc_markets = self.fetch_markets('KXBTC15M')
        btc_markets.extend(self.fetch_markets('KXBTC5M'))
        
        for market in btc_markets:
            ticker = market.get('ticker', '')
            yes_price = market.get('yes_ask_dollars', 0.5)
            no_price = market.get('no_ask_dollars', 0.5)
            volume = market.get('volume_fp', 0.0)
            
            edge = self.calculate_sum_to_one_edge(yes_price, no_price)
            
            if edge['profitable'] and volume > 1000:  # Min volume filter
                opportunities.append({
                    'category': 'Crypto',
                    'ticker': ticker,
                    'yes_price': yes_price,
                    'no_price': no_price,
                    'edge_pct': edge['fee_adjusted_pct'],
                    'volume': volume,
                    'type': 'sum-to-one'
                })
        
        return btc_markets, opportunities
    
    def scan_sports(self):
        """Scan active sports markets"""
        opportunities = []
        
        # Fetch all open markets
        all_markets = self.fetch_markets()
        
        sports_markets = [m for m in all_markets if any(
            x in m.get('ticker', '').upper() 
            for x in ['NBA', 'NFL', 'MLB', 'NHL', 'SOCCER', 'MARCH']
        )]
        
        for market in sports_markets:
            ticker = market.get('ticker', '')
            yes_price = market.get('yes_ask_dollars', 0.5)
            no_price = market.get('no_ask_dollars', 0.5)
            volume = market.get('volume_fp', 0.0)
            
            edge = self.calculate_sum_to_one_edge(yes_price, no_price)
            
            if edge['profitable'] and volume > 500:
                opportunities.append({
                    'category': 'Sports',
                    'ticker': ticker,
                    'yes_price': yes_price,
                    'no_price': no_price,
                    'edge_pct': edge['fee_adjusted_pct'],
                    'volume': volume,
                    'type': 'sum-to-one'
                })
        
        return sports_markets, opportunities
    
    def scan_elections(self):
        """Scan election markets"""
        opportunities = []
        
        # Fetch all open markets
        all_markets = self.fetch_markets()
        
        election_markets = [m for m in all_markets if any(
            x in m.get('ticker', '').upper()
            for x in ['PRES', 'SENATE', 'HOUSE', 'ELECTION', '2024', '2026']
        )]
        
        for market in election_markets:
            ticker = market.get('ticker', '')
            yes_price = market.get('yes_ask_dollars', 0.5)
            no_price = market.get('no_ask_dollars', 0.5)
            volume = market.get('volume_fp', 0.0)
            
            edge = self.calculate_sum_to_one_edge(yes_price, no_price)
            
            if edge['profitable'] and volume > 500:
                opportunities.append({
                    'category': 'Election',
                    'ticker': ticker,
                    'yes_price': yes_price,
                    'no_price': no_price,
                    'edge_pct': edge['fee_adjusted_pct'],
                    'volume': volume,
                    'type': 'sum-to-one'
                })
        
        return election_markets, opportunities

def main():
    log("=" * 100)
    log("KALSHI PAPER SCANNER — CRYPTO + SPORTS + ELECTION (PAPER MODE)")
    log(f"Start: {datetime.now().isoformat()}")
    log("Mode: PAPER ONLY — No real trades, $500 Kalshi capital 100% protected")
    log("=" * 100)
    
    scanner = KalshiPaperScanner()
    state = load_state()
    
    log("\n▶️  Starting Kalshi paper scanner (scan every 3s)\n")
    
    try:
        while True:
            state['scans'] += 1
            
            try:
                # Scan all categories
                crypto_mkts, crypto_opps = scanner.scan_crypto()
                sports_mkts, sports_opps = scanner.scan_sports()
                election_mkts, election_opps = scanner.scan_elections()
                
                all_opps = crypto_opps + sports_opps + election_opps
                
                # Log every 100 scans
                if state['scans'] % 100 == 0:
                    log(f"\n📊 Scan #{state['scans']}:")
                    log(f"   === MARKETS SCANNED ===")
                    log(f"   Crypto: {len(crypto_mkts)} markets | Sports: {len(sports_mkts)} markets | Election: {len(election_mkts)} markets")
                    
                    if all_opps:
                        log(f"   === OPPORTUNITIES DETECTED: {len(all_opps)} ===")
                        for opp in all_opps:
                            log(f"   ✓ {opp['category']}: {opp['ticker']}")
                            log(f"      Edge: {opp['edge_pct']:+.2f}% | Volume: ${opp['volume']:.0f}k | Type: {opp['type']}")
                        state['edges_detected'] += len(all_opps)
                    else:
                        log(f"   ✓ No qualified edges detected (threshold: >+0.8% after fees)")
                    
                    state['crypto_markets'] = len(crypto_mkts)
                    state['sports_markets'] = len(sports_mkts)
                    state['election_markets'] = len(election_mkts)
                    
                    save_state(state)
                
                time.sleep(30)  # Reduced from 3s to 30s for paper-mode monitoring
                
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
        log(f"Markets scanned: Crypto {state['crypto_markets']} | Sports {state['sports_markets']} | Election {state['election_markets']}")
        log(f"Edges detected: {state['edges_detected']}")
        log("=" * 100)
        save_state(state)

if __name__ == '__main__':
    main()
