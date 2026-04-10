#!/usr/bin/env python3
"""
Aggressive Polymarket Scanner - finds ALL crypto markets
"""
import subprocess
import json
import re
from datetime import datetime

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout

def scan_all_crypto_markets():
    """Scan for all BTC/ETH markets across multiple search terms"""
    search_terms = [
        "Bitcoin", "BTC", "bitcoin", "btc",
        "Ethereum", "ETH", "ethereum", "eth",
        "crypto", "Crypto"
    ]
    
    all_markets = []
    seen_ids = set()
    
    for term in search_terms:
        output = run_cmd(f'cd ~/.openclaw/skills/polyclaw && uv run python scripts/polyclaw.py markets search "{term}" 2>/dev/null')
        
        for line in output.split('\n'):
            if not line.strip() or 'Question' in line or '---' in line:
                continue
            
            parts = line.split()
            if len(parts) < 5:
                continue
            
            try:
                market_id = parts[0]
                if market_id in seen_ids:
                    continue
                seen_ids.add(market_id)
                
                yes_price = float(parts[1].replace('$', ''))
                no_price = float(parts[2].replace('$', ''))
                volume = parts[3]
                question = ' '.join(parts[4:])
                
                # Skip obvious no-edges
                if (yes_price == 0.0 and no_price == 1.0) or (yes_price == 1.0 and no_price == 0.0):
                    continue
                
                sum_price = yes_price + no_price
                edge = 1.0 - sum_price - 0.02  # 2% fee
                
                all_markets.append({
                    'id': market_id,
                    'yes': yes_price,
                    'no': no_price,
                    'sum': sum_price,
                    'edge': edge,
                    'volume': volume,
                    'question': question
                })
            except (ValueError, IndexError):
                continue
    
    return all_markets

def find_opportunities(markets, min_edge=0.005):
    """Find markets with profitable edges"""
    opportunities = []
    for m in markets:
        if m['edge'] > min_edge:
            opportunities.append(m)
    
    # Sort by edge (best first)
    opportunities.sort(key=lambda x: x['edge'], reverse=True)
    return opportunities

if __name__ == '__main__':
    print(f"[{datetime.now().isoformat()}] Scanning ALL crypto markets...")
    markets = scan_all_crypto_markets()
    print(f"Found {len(markets)} total crypto markets")
    
    opps = find_opportunities(markets, min_edge=0.005)
    print(f"Found {len(opps)} opportunities with edge > 0.5%")
    
    if opps:
        print("\nTop opportunities:")
        for i, opp in enumerate(opps[:5], 1):
            print(f"{i}. ID={opp['id']} | Edge={opp['edge']:.3f} | Sum={opp['sum']:.4f}")
            print(f"   YES={opp['yes']:.4f} NO={opp['no']:.4f} | {opp['question'][:60]}")
    
    # Save to file for trader
    with open('/root/.openclaw/workspace/opportunities.json', 'w') as f:
        json.dump(opps, f, indent=2)
    
    print(f"\nSaved to opportunities.json")
