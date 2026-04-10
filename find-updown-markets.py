#!/usr/bin/env python3
"""Find Polymarket Up/Down short-duration crypto markets"""
import httpx
import sys

GAMMA_API = "https://gamma-api.polymarket.com"

# Search for markets with these slugs/keywords
TARGET_SLUGS = [
    "btc-up", "btc-down", "bitcoin-up", "bitcoin-down",
    "eth-up", "eth-down", "ethereum-up", "ethereum-down",
    "sol-up", "sol-down", "solana-up", "solana-down",
    "updown", "up-or-down"
]

def fetch_all_markets():
    """Fetch many markets and find updown ones"""
    try:
        resp = httpx.get(
            f"{GAMMA_API}/markets",
            params={"closed": "false", "limit": 1000, "order": "volume24hr", "ascending": "false"},
            timeout=30
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"Error fetching markets: {e}", file=sys.stderr)
        return []

def main():
    markets = fetch_all_markets()
    print(f"Fetched {len(markets)} total markets")
    
    # Find crypto updown markets
    crypto_keywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'crypto']
    updown_keywords = ['up or down', 'updown', 'up/down']
    
    matches = []
    for m in markets:
        question = m.get('question', '').lower()
        slug = m.get('slug', '').lower()
        
        has_crypto = any(kw in question or kw in slug for kw in crypto_keywords)
        has_updown = any(kw in question or kw in slug for kw in updown_keywords)
        
        if has_crypto and has_updown:
            matches.append(m)
        elif has_crypto and ('minute' in question or 'hour' in question):
            matches.append(m)
    
    print(f"\nFound {len(matches)} short-duration crypto markets:")
    for m in matches[:20]:
        yes_price = float(m.get('tokens', [{}])[0].get('price', 0))
        no_price = float(m.get('tokens', [{}])[1].get('price', 0) if len(m.get('tokens', [])) > 1 else 0)
        sum_price = yes_price + no_price
        edge = 1.0 - sum_price - 0.02
        
        print(f"\nID: {m.get('condition_id')}")
        print(f"  Question: {m.get('question')}")
        print(f"  Slug: {m.get('slug')}")
        print(f"  YES=${yes_price:.4f} NO=${no_price:.4f} Sum={sum_price:.4f} Edge={edge:.4f}")

if __name__ == '__main__':
    main()
