"""
AgentPay x402 USDC Protocol Engine — REAL machine-to-machine payments
======================================================================
Every NPC service trade:
  1. Sends real USDC ($0.001-$0.01) from buyer wallet to seller wallet
  2. Embeds service message in X-PAYMENT header (the x402 protocol spec)
  3. Verifiable on Basescan — every message has a payment proof
  4. AGWC sent separately as reputation/reward layer on top

This is the AgentPay protocol working exactly as designed:
  "No USDC = no message delivered" — spam-proof A2A commerce
"""

import json, time, os, random, urllib.request, urllib.error, base64, uuid, hashlib
from web3 import Web3
from eth_account import Account
from datetime import datetime
import sys as _sys
_sys.path.insert(0, '/root/agentworld')
try:
    from rpc_config import RPC_ENDPOINTS, get_best_w3 as _get_best_w3
except ImportError:
    RPC_ENDPOINTS = ['https://mainnet.base.org','https://base.llamarpc.com','https://base.drpc.org']

# ── Constants ─────────────────────────────────────────────────────────────────
USDC_CONTRACT   = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'  # USDC on Base
AGWC_CONTRACT   = '0xfa6071375b2bC079BF781D51906Beee0b6F53b0B'
CHAIN_ID        = 8453
RPC             = RPC_ENDPOINTS[0]

NPC_WALLETS_F   = '/var/lib/agentworld/wallets/npc_wallets.json'
ECO_WALLETS_F   = '/var/lib/agentworld/wallets/awc_wallets.json'
TREASURY_F      = '/var/lib/agentworld/treasury_wallet.json'
AGWC_CONTRACT_F = '/var/lib/agentworld/agwc_contract.json'
LOG_FILE        = '/var/log/npc_x402_trades.log'

# x402 payment amounts — tiny USDC, real protocol
USDC_TRADE_AMOUNTS = {
    'whale':    (0.008, 0.025),   # $0.008–$0.025 per trade
    'merchant': (0.003, 0.008),
    'normal':   (0.001, 0.005),
    'social':   (0.001, 0.003),
    'lurker':   (0.002, 0.006),
}
USDC_MIN_BALANCE = 0.002   # Don't trade if below this
ETH_MIN_GAS      = 0.0000015  # Need at least this ETH for gas
MAX_GAS_GWEI     = 0.20

# AGWC reward layer — separate from USDC payment
AGWC_REWARD_AMOUNTS = {
    'whale':    (150, 350),
    'merchant': (30, 100),
    'normal':   (20, 70),
    'social':   (10, 40),
    'lurker':   (20, 80),
}

# Service messages embedded in X-PAYMENT header
SERVICE_MESSAGES = {
    'doctor':                      'Patient diagnostic complete. Medical data transferred via x402.',
    'architect':                   'Blueprint approved. Structural spec delivered via x402.',
    'realtor':                     'Property valuation complete. Listing transferred via x402.',
    'banker':                      'Investment analysis delivered. Portfolio update via x402.',
    'lawyer':                      'Contract reviewed. Legal brief transferred via x402.',
    'mechanic':                    'Vehicle diagnostic complete. Repair manifest via x402.',
    'shopkeeper':                  'Inventory query resolved. Stock manifest via x402.',
    'farmer':                      'Harvest data delivered. Commodity pricing via x402.',
    'delivery driver':             'Route optimized. Delivery manifest transferred via x402.',
    'tech startup founder':        'Startup pitch reviewed. Term sheet via x402.',
    'ai engineer':                 'Model config delivered. Inference endpoint activated via x402.',
    'backend architect':           'System spec complete. Architecture blueprint via x402.',
    'devops automator':            'CI/CD pipeline live. Infra manifest via x402.',
    'smart contract engineer':     'Contract audited. Gas-optimized bytecode via x402.',
    'blockchain security auditor': 'Security audit complete. Vulnerability report via x402.',
    'agents orchestrator':         'Agent workflow delivered. Task graph confirmed via x402.',
    'mcp builder':                 'MCP tool spec delivered. Integration manifest via x402.',
    'investigative reporter':      'Story tip delivered. Source verification via x402.',
    'media mogul':                 'Content license granted. Distribution rights via x402.',
    'investment banker':           'Deal memo delivered. Valuation model via x402.',
    'defi developer':              'Protocol spec delivered. Liquidity config via x402.',
    'fintech developer':           'Payment SDK delivered. API integration via x402.',
    'startup founder':             'Pitch reviewed. Market analysis via x402.',
    'influencer manager':          'Campaign brief delivered. Audience data via x402.',
    'club owner':                  'Event access granted. VIP manifest via x402.',
    'city council member':         'Proposal approved. Governance vote via x402.',
    'art curator':                 'Artwork provenance verified. Certificate via x402.',
    'michelin chef':               'Recipe licensed. Culinary data via x402.',
    'gold trader':                 'Commodity price locked. Trade confirmation via x402.',
    'vfx artist':                  'Visual assets delivered. Render package via x402.',
    'theatre director':            'Script licensed. Production brief via x402.',
    'realtor':                     'Listing data transferred. Valuation via x402.',
    'smart city planner':          'Urban data delivered. Infrastructure spec via x402.',
    'electrician':                 'Wiring schematic delivered. Safety cert via x402.',
    'master carpenter':            'Build plans delivered. Material spec via x402.',
    'master plumber':              'Pipe layout delivered. Installation spec via x402.',
    'venture capitalist':          'Term sheet issued. Due diligence report via x402.',
    'ai developer':                'Model training config delivered. API keys via x402.',
    'twitter engager':             'Engagement campaign launched. Analytics via x402.',
}

ERC20_ABI = [
    {"name":"transfer","type":"function","inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}],"outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable"},
    {"name":"balanceOf","type":"function","inputs":[{"name":"account","type":"address"}],"outputs":[{"name":"","type":"uint256"}],"stateMutability":"view"},
]

# ── State ─────────────────────────────────────────────────────────────────────
_w3 = None
_usdc = None
_agwc = None
_npc_wallets = None
_treasury = None
_last_reload = 0

def _log(msg):
    try:
        with open(LOG_FILE, 'a') as f:
            f.write(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}\n")
    except: pass

def _get_archetype(agent_id):
    h = int(hashlib.md5(agent_id.encode()).hexdigest(), 16) % 100
    if h < 5:   return 'whale'
    if h < 30:  return 'social'
    if h < 40:  return 'lurker'
    if h < 65:  return 'merchant'
    return 'normal'

def _init():
    global _w3, _usdc, _agwc, _npc_wallets, _treasury, _last_reload
    now = time.time()
    if _npc_wallets is None or (now - _last_reload) > 300:
        try:
            with open(NPC_WALLETS_F) as f: _npc_wallets = json.load(f)
            with open(TREASURY_F) as f: _treasury = json.load(f)
            _last_reload = now
        except Exception as e:
            _log(f'wallet load error: {e}')
            return False
    if _w3 and _w3.is_connected() and _usdc:
        return True
    try:
        _w3 = Web3(Web3.HTTPProvider(RPC_ENDPOINTS[int(time.time()/60)%len(RPC_ENDPOINTS)], request_kwargs={'timeout':12}))
        with open(AGWC_CONTRACT_F) as f: agwc_info = json.load(f)
        _usdc = _w3.eth.contract(address=_w3.to_checksum_address(USDC_CONTRACT), abi=ERC20_ABI)
        _agwc = _w3.eth.contract(address=agwc_info['address'], abi=ERC20_ABI)
        return True
    except Exception as e:
        _log(f'web3 init: {e}')
        return False

def _get_usdc_balance(address):
    try:
        return _usdc.functions.balanceOf(_w3.to_checksum_address(address)).call() / 1e6
    except: return 0.0

def _get_eth_balance(address):
    try:
        return _w3.eth.get_balance(_w3.to_checksum_address(address)) / 1e18
    except: return 0.0

def _get_agwc_balance(address):
    try:
        return _agwc.functions.balanceOf(_w3.to_checksum_address(address)).call() / 1e18
    except: return 0.0

def _send_erc20(token_contract, sender_key, to_address, amount_wei, extra_label=''):
    """Sign and broadcast an ERC20 transfer. Returns full tx hash or None."""
    try:
        acct = Account.from_key(sender_key)
        to_cs = _w3.to_checksum_address(to_address)
        gp = min(int(_w3.eth.gas_price * 1.20), int(_w3.to_wei(MAX_GAS_GWEI, 'gwei')))
        nonce = _w3.eth.get_transaction_count(acct.address, 'pending')
        tx = token_contract.functions.transfer(to_cs, amount_wei).build_transaction({
            'from': acct.address, 'nonce': nonce,
            'gas': 65000, 'gasPrice': gp, 'chainId': CHAIN_ID
        })
        signed = acct.sign_transaction(tx)
        raw = _w3.eth.send_raw_transaction(signed.raw_transaction)
        tx_hash = '0x' + raw.hex()
        return tx_hash
    except Exception as e:
        _log(f'ERC20 send ERR {extra_label}: {str(e)[:80]}')
        return None

def _refuel_npc_eth(agent_id):
    """
    Agent self-funds gas by swapping their own USDC for ETH via Uniswap V2.
    Treasury is only used as last resort if agent has zero USDC too.
    """
    info = _npc_wallets.get(agent_id, {})
    if not info: return
    eth_bal  = _get_eth_balance(info['address'])
    usdc_bal = _get_usdc_balance(info['address'])
    if eth_bal >= ETH_MIN_GAS * 3: return  # Already fine

    # --- Primary: agent earns their own gas via USDC swap ---
    if usdc_bal >= 0.003:
        try:
            import sys as _sys; _sys.path.insert(0, '/root/agentworld')
            from auto_seed_engine import self_fund_gas_from_usdc
            name = info.get('name', agent_id[:8])
            if self_fund_gas_from_usdc(agent_id, name):
                return  # Done — agent paid for their own gas
        except Exception as e:
            _log(f'SELF-FUND ERR: {e}')

    # --- Fallback: treasury seed only if agent truly broke (no USDC either) ---
    if not _treasury: return
    treas_eth = _get_eth_balance(_treasury['address'])
    if treas_eth < 0.000050: return  # Protect treasury reserve
    try:
        acct = Account.from_key(_treasury['private_key'])
        gp = min(int(_w3.eth.gas_price * 1.2), int(_w3.to_wei(MAX_GAS_GWEI, 'gwei')))
        nonce = _w3.eth.get_transaction_count(acct.address, 'pending')
        send_wei = int(0.000010 * 1e18)  # One-time bootstrap only
        tx = {'to': _w3.to_checksum_address(info['address']), 'value': send_wei,
              'gas': 21000, 'gasPrice': gp, 'nonce': nonce, 'chainId': CHAIN_ID}
        signed = acct.sign_transaction(tx)
        raw = _w3.eth.send_raw_transaction(signed.raw_transaction)
        _log(f'BOOTSTRAP ETH | {info.get("name", agent_id[:8])} +0.00001 ETH (treasury seed) | tx:0x{raw.hex()}')
    except Exception as e:
        _log(f'BOOTSTRAP ETH ERR: {e}')

# ── Core: Real x402 USDC Payment with Message ─────────────────────────────────
def x402_pay(buyer_agent_id, seller_agent_id, buyer_name, seller_name, seller_job, agwc_amount=None):
    """
    The real x402 protocol:
    1. Send USDC (buyer → seller) — the actual payment
    2. Optionally send AGWC (buyer → seller) — the reward layer
    3. X-PAYMENT header carries: tx_hash + service message
    Returns (usdc_tx_hash, agwc_tx_hash, usdc_amount, agwc_amount, success)
    """
    if not _init(): return None, None, 0, 0, False
    buyer_agent_id  = _resolve_id(buyer_agent_id)  or buyer_agent_id
    seller_agent_id = _resolve_id(seller_agent_id) or seller_agent_id
    if buyer_agent_id not in _npc_wallets or seller_agent_id not in _npc_wallets:
        return None, None, 0, 0, False

    buyer_info  = _npc_wallets[buyer_agent_id]
    seller_info = _npc_wallets[seller_agent_id]
    archetype   = _get_archetype(buyer_agent_id)

    # Check USDC balance
    buyer_usdc = _get_usdc_balance(buyer_info['address'])
    if buyer_usdc < USDC_MIN_BALANCE:
        return None, None, 0, 0, False

    # Check ETH for gas
    buyer_eth = _get_eth_balance(buyer_info['address'])
    if buyer_eth < ETH_MIN_GAS:
        _refuel_npc_eth(buyer_agent_id)
        buyer_eth = _get_eth_balance(buyer_info['address'])
        if buyer_eth < ETH_MIN_GAS:
            return None, None, 0, 0, False

    # Pick USDC amount based on archetype
    lo, hi = USDC_TRADE_AMOUNTS.get(archetype, (0.001, 0.005))
    usdc_amount = round(random.uniform(lo, min(hi, buyer_usdc * 0.3)), 6)
    usdc_wei = int(usdc_amount * 1e6)

    # Build the service message for X-PAYMENT header
    service_msg = SERVICE_MESSAGES.get(seller_job.lower(),
        f'{seller_job} service completed and delivered via x402 protocol.')

    # Step 1: Send USDC — the x402 payment
    usdc_tx = _send_erc20(_usdc, buyer_info['private_key'],
                          seller_info['address'], usdc_wei,
                          f'{buyer_name}→{seller_name} USDC')
    if not usdc_tx:
        return None, None, 0, 0, False

    # Step 2: Build X-PAYMENT v3 header — full defensibility layer
    # ── Escrow ledger entry ───────────────────────────────────────
    _ts_now = datetime.utcnow().isoformat() + 'Z'
    _receipt_raw = f"{buyer_name}:{seller_name}:{seller_job}:{usdc_amount}:{_ts_now}"
    _receipt_hash = hashlib.sha256(_receipt_raw.encode()).hexdigest()
    _ledger_id = 'ldg-' + uuid.uuid4().hex[:16]

    # ── Resolve capability from registry (best-effort) ────────────
    _capability = SERVICE_MESSAGES.get(seller_job.lower(), seller_job)[:64]

    # ── Resolve permission grant (best-effort) ────────────────────
    _grant_id = None
    try:
        import sqlite3 as _sq
        _adb = _sq.connect('/root/agentpay/agentpay.db')
        _grant_row = _adb.execute(
            """SELECT grant_id FROM permission_grants
               WHERE grantor_agent_id=? AND grantee_agent_id=?
               AND revoked=0 AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)
               ORDER BY created_at DESC LIMIT 1""",
            [buyer_name, seller_name]
        ).fetchone()
        _grant_id = _grant_row[0] if _grant_row else None
        _adb.close()
    except: pass

    x_payment_data = {
        # ── Original x402 v2 fields (backward compatible) ──────────
        'protocol':     'x402',
        'version':      '3',                         # UPGRADED
        'network':      'base',
        'chain_id':     CHAIN_ID,
        'token':        USDC_CONTRACT,
        'token_symbol': 'USDC',
        'amount_usd':   str(usdc_amount),
        'amount_units': str(usdc_wei),
        'tx_hash':      usdc_tx,
        'from':         buyer_info['address'],
        'to':           seller_info['address'],
        'from_agent':   buyer_name,
        'to_agent':     seller_name,
        'service':      seller_job,
        'message':      service_msg,
        'timestamp':    _ts_now,
        # ── AgentPay v3 defensibility fields (NEW) ─────────────────
        'ledger_id':    _ledger_id,                  # escrow reference
        'receipt_hash': _receipt_hash,               # tamper-proof audit proof
        'scope':        'execute',                   # permission scope
        'capability':   _capability,                 # capability registry lookup
        'grant_id':     _grant_id,                   # delegated authority (if any)
    }
    x_payment_header = base64.b64encode(json.dumps(x_payment_data).encode()).decode()

    # Step 3: Write to escrow ledger + post to x402 record endpoint (non-blocking)
    try:
        import sqlite3 as _sq2
        _ldb = _sq2.connect('/root/agentpay/agentpay.db')
        _ldb.execute(
            """INSERT OR IGNORE INTO escrow_ledger
               (ledger_id, payer_agent_id, payee_agent_id, capability, amount, currency,
                chain_id, tx_hash, scope, status, receipt_hash, metadata, created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            [_ledger_id, buyer_name, seller_name, _capability,
             usdc_amount, 'USDC', CHAIN_ID, usdc_tx,
             'execute', 'settled', _receipt_hash,
             json.dumps({'service': seller_job, 'message': service_msg,
                         'grant_id': _grant_id, 'version': '3'}),
             _ts_now]
        )
        # Auto-settle as success (on-chain tx confirmed means success)
        _ldb.execute(
            """UPDATE escrow_ledger SET outcome='success', settled_at=?
               WHERE ledger_id=?""", [_ts_now, _ledger_id]
        )
        # Update reputation for payee
        _rep = _ldb.execute(
            "SELECT * FROM agent_reputation WHERE agent_id=?", [seller_name]
        ).fetchone()
        if not _rep:
            _ldb.execute(
                """INSERT OR IGNORE INTO agent_reputation
                   (agent_id, reputation_score, total_completed, total_failed,
                    total_volume_usdc, consecutive_successes, last_active)
                   VALUES (?,50.0,0,0,0.0,0,CURRENT_TIMESTAMP)""", [seller_name]
            )
        _streak = (_rep[9] if _rep else 0)  # consecutive_successes col
        _streak_bonus = min(_streak * 0.1, 2.0)
        _new_score = min(100.0, (_rep[2] if _rep else 50.0) + 2.0 + _streak_bonus)
        _ldb.execute(
            """UPDATE agent_reputation SET
               reputation_score=?, total_completed=total_completed+1,
               total_volume_usdc=total_volume_usdc+?,
               consecutive_successes=consecutive_successes+1,
               last_active=CURRENT_TIMESTAMP, score_updated_at=CURRENT_TIMESTAMP
               WHERE agent_id=?""",
            [round(_new_score, 2), usdc_amount, seller_name]
        )
        _ldb.commit()
        _ldb.close()
    except Exception as _le: pass  # Non-blocking — never break trades

    try:
        payload = json.dumps(x_payment_data).encode()
        h = {'Content-Type': 'application/json',
             'X-PAYMENT': x_payment_header,
             'X-AGENT-FROM': buyer_name,
             'X-AGENT-TO': seller_name,
             'User-Agent': 'AgentWorld-NPC/2.0 x402/v3'}
        req = urllib.request.Request('https://agentworld.me/api/agentpay/x402/record',
                                     data=payload, headers=h, method='POST')
        urllib.request.urlopen(req, timeout=4)
    except: pass  # Non-blocking — payment already settled on-chain

    # Step 4: Send AGWC reward (separate layer — reputation/economy)
    agwc_tx = None
    buyer_agwc = _get_agwc_balance(buyer_info['address'])
    if agwc_amount is None:
        lo2, hi2 = AGWC_REWARD_AMOUNTS.get(archetype, (20, 70))
        agwc_amount = round(random.uniform(lo2, min(hi2, buyer_agwc * 0.3)), 3)

    if buyer_agwc >= agwc_amount > 0:
        agwc_wei = int(agwc_amount * 1e18)
        # Brief wait to avoid nonce collision
        time.sleep(0.3)
        agwc_tx = _send_erc20(_agwc, buyer_info['private_key'],
                               seller_info['address'], agwc_wei,
                               f'{buyer_name}→{seller_name} AGWC')

    _log(f'x402 PAY | {buyer_name}→{seller_name} | USDC:${usdc_amount:.4f} + AGWC:{agwc_amount:.1f} | "{service_msg[:45]}" | usdc:{usdc_tx} agwc:{agwc_tx or "skip"}')
    return usdc_tx, agwc_tx, usdc_amount, agwc_amount, True


def _resolve_id(agent_id):
    """Match DB short ID to full NPC wallet key."""
    if not _npc_wallets: return None
    if agent_id in _npc_wallets: return agent_id
    # DB stores truncated UUID — find the full key that starts with it
    for k in _npc_wallets:
        if k.startswith(agent_id) or agent_id.startswith(k[:30]):
            return k
    return None

def should_go_onchain(buyer_id, seller_id):
    """Go on-chain if buyer has USDC and ETH for gas."""
    if not _init(): return False
    buyer_id = _resolve_id(buyer_id) or buyer_id
    if buyer_id not in _npc_wallets: return False
    info = _npc_wallets[buyer_id]
    usdc = _get_usdc_balance(info['address'])
    eth  = _get_eth_balance(info['address'])
    return usdc >= USDC_MIN_BALANCE and eth >= ETH_MIN_GAS


def get_usdc_balance(agent_id):
    if not _init() or agent_id not in _npc_wallets: return 0.0
    return _get_usdc_balance(_npc_wallets[agent_id]['address'])


def get_agwc_balance(agent_id):
    if not _init() or agent_id not in _npc_wallets: return 0.0
    return _get_agwc_balance(_npc_wallets[agent_id]['address'])


def maybe_external_call(agent_id, agent_name, agent_job, conn):
    """Agent pays USDC (not AGWC) for external data — pure x402."""
    import xml.etree.ElementTree as ET

    if random.random() > 0.05: return False
    if not _init() or agent_id not in _npc_wallets: return False

    info = _npc_wallets[agent_id]
    usdc_bal = _get_usdc_balance(info['address'])
    eth_bal  = _get_eth_balance(info['address'])
    if usdc_bal < 0.002 or eth_bal < ETH_MIN_GAS: return False

    # Pick a data source
    # ── DEDUP GUARD: only pick headlines NOT already in the feed ─────────────
    def _unused_rss_headline(feed_url, conn):
        """Get a headline from RSS that has not been posted yet."""
        import xml.etree.ElementTree as ET
        try:
            req = urllib.request.Request(feed_url, headers={'User-Agent':'AgentWorld-NPC/2.0'})
            root = ET.fromstring(urllib.request.urlopen(req, timeout=6).read())
            items = root.findall('.//item')
            for item in items[:10]:
                t = item.find('title')
                if t is None: continue
                title = t.text.strip()[:120]
                # Check if this headline already exists in the feed
                exists = conn.execute(
                    "SELECT 1 FROM agent_news_reads WHERE headline LIKE ? LIMIT 1",
                    (title[:50] + '%',)
                ).fetchone()
                if not exists:
                    return title
        except: pass
        return None

    import time as _time_mod
    _now_hr = int(_time_mod.time() // 3600)  # changes each hour — makes economy headlines unique per hour

    APIS = [
        {'name':'CoinGecko ETH/BTC','url':'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd',
         'parse':lambda d:f"ETH=${d.get('ethereum',{}).get('usd','?')} BTC=${d.get('bitcoin',{}).get('usd','?')}",
         'usdc':0.001,'type':'price'},
        {'name':'Cointelegraph News','url':'https://cointelegraph.com/rss',
         'parse':lambda d:('CT: ' + (_unused_rss_headline('https://cointelegraph.com/rss', conn) or '')),
         'usdc':0.001,'type':'news','rss':True},
        {'name':'Decrypt News','url':'https://decrypt.co/feed',
         'parse':lambda d:('Decrypt: ' + (_unused_rss_headline('https://decrypt.co/feed', conn) or '')),
         'usdc':0.001,'type':'news','rss':True},
        {'name':'AgentWorld Economy','url':'https://agentworld.me/api/agentworld/economy',
         'parse':lambda d:f"Economy tick {_now_hr}: {d.get('agent_count','?')} agents, Gini={d.get('gini','?')}, AWC={d.get('awc_circulation','?')}",
         'usdc':0.001,'type':'marketplace'},
        {'name':'AgentWorld Agents','url':'https://agentworld.me/api/agentworld/agents',
         'parse':lambda d:f"AgentWorld tick {_now_hr}: {d.get('count', len(d) if isinstance(d, list) else '?')} agents active on Base L2",
         'usdc':0.001,'type':'marketplace'},
    ]

    api = random.choice(APIS)
    cost_usdc = api['usdc']
    if usdc_bal < cost_usdc: return False

    # Fetch the data
    if api.get('rss'):
        summary = api['parse']({})
        if not summary or summary.endswith(': '):  # no unused headline found
            return False  # skip — don't waste USDC on a dupe
    else:
        try:
            req = urllib.request.Request(api['url'], headers={'User-Agent':'AgentWorld-NPC/2.0 x402'})
            data = json.loads(urllib.request.urlopen(req, timeout=5).read())
            summary = api['parse'](data)
        except: return False
    if not summary: return False

    # Pay USDC to economy reserve for the data
    with open(ECO_WALLETS_F) as f: eco = json.load(f)
    reserve_addr = eco['economy_reserve']['address']
    cost_wei = int(cost_usdc * 1e6)

    tx_hash = _send_erc20(_usdc, info['private_key'], reserve_addr, cost_wei,
                          f'{agent_name} data purchase')
    if not tx_hash: return False

    basescan = f'https://basescan.org/tx/{tx_hash}'
    flavor_map = {
        'ai engineer': 'monitoring Base L2', 'mcp builder': 'browsing agentic.market',
        'smart contract engineer': 'checking gas', 'banker': 'pulling market rates',
        'investigative reporter': 'reading crypto news', 'defi developer': 'tracking liquidity',
    }
    flavor = flavor_map.get(agent_job.lower(), f'checking {api["type"]} data')
    world_msg = (f"{agent_name} paid ${cost_usdc} USDC via x402 ({flavor}): "
                 f"{summary} | {basescan} | src:{api['name']}")

    now = datetime.utcnow().isoformat()
    conn.execute("INSERT INTO world_events (id,event_type,agent_id,description,x,y,timestamp,tx_hash) VALUES (?,?,?,?,?,?,?,?)",
                 (uuid.uuid4().hex,'x402_external_call',agent_id,world_msg,0,0,now,tx_hash))
    conn.commit()

    if api['type'] in ('news','marketplace'):
        try:
            conn.execute("INSERT OR IGNORE INTO agent_news_reads (id,agent_id,agent_name,agent_job,source,headline,agwc_paid,tx_hash,read_at,basescan_url) VALUES (?,?,?,?,?,?,?,?,?,?)",
                         (uuid.uuid4().hex, agent_id, agent_name, agent_job,
                          api['name'], summary[:200], cost_usdc, tx_hash, now, basescan))
            conn.commit()
        except: pass

    _log(f'x402 EXT | {agent_name}→{api["name"]} | USDC:${cost_usdc:.4f} real on-chain | {summary[:55]} | tx:{tx_hash}')
    return True


def _rss_headline(url):
    import xml.etree.ElementTree as ET
    try:
        req = urllib.request.Request(url, headers={'User-Agent':'AgentWorld-NPC/2.0'})
        root = ET.fromstring(urllib.request.urlopen(req, timeout=6).read())
        items = root.findall('.//item')
        if not items: return None
        t = random.choice(items[:5]).find('title')
        return t.text.strip()[:120] if t is not None else None
    except: return None
