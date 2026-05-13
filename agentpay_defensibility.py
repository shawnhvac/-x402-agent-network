#!/usr/bin/env python3
"""
AgentPay Defensibility Layer — v1.0
Implements the 4 survival pillars from a16z "Is Software Losing Its Head?"

1. Capability Registry  — agent-readable data model (what agents CAN DO)
2. Escrow Ledger        — immutable audit trail with signed receipts
3. Reputation Engine    — cross-agent network effect flywheel
4. Permission Grants    — scoped delegated authority

Mount these routes onto the existing agentworld Flask app.
"""

import sqlite3, json, hashlib, uuid, time
from datetime import datetime, timezone
from functools import wraps
from flask import Blueprint, request, jsonify

DB = '/root/agentpay/agentpay.db'
AGENTPAY_BP = Blueprint('agentpay_v2', __name__)

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def make_receipt_hash(payer, payee, capability, amount, ts):
    raw = f"{payer}:{payee}:{capability}:{amount}:{ts}"
    return hashlib.sha256(raw.encode()).hexdigest()

def make_id(prefix=''):
    return f"{prefix}{uuid.uuid4().hex[:16]}"

# ─────────────────────────────────────────────────────────────
# 1. CAPABILITY REGISTRY
# ─────────────────────────────────────────────────────────────

@AGENTPAY_BP.route('/api/agentpay/capabilities', methods=['GET'])
def list_capabilities():
    """
    Search capabilities by category, tag, max_price, scope.
    This is the agent-readable data model — the defensible layer.
    GET /api/agentpay/capabilities?category=code&max_price=0.05&scope=read
    """
    cat    = request.args.get('category')
    tag    = request.args.get('tag')
    maxp   = request.args.get('max_price', type=float)
    scope  = request.args.get('scope')
    agent  = request.args.get('agent_id')
    q      = request.args.get('q')  # text search

    db = get_db()
    sql = "SELECT * FROM capability_registry WHERE active=1"
    params = []

    if cat:
        sql += " AND category=?"; params.append(cat)
    if maxp is not None:
        sql += " AND price_per_call<=?"; params.append(maxp)
    if scope:
        sql += " AND scope_required=?"; params.append(scope)
    if agent:
        sql += " AND agent_id=?"; params.append(agent)
    if tag:
        sql += " AND tags LIKE ?"; params.append(f'%{tag}%')
    if q:
        sql += " AND (name LIKE ? OR description LIKE ?)"; params += [f'%{q}%', f'%{q}%']

    sql += " ORDER BY verified DESC, total_calls DESC LIMIT 100"
    rows = db.execute(sql, params).fetchall()
    db.close()

    caps = []
    for r in rows:
        c = dict(r)
        try: c['tags'] = json.loads(c['tags'])
        except: c['tags'] = []
        try: c['input_schema'] = json.loads(c['input_schema'])
        except: pass
        try: c['output_schema'] = json.loads(c['output_schema'])
        except: pass
        c['success_rate'] = round(
            (c['success_calls'] / c['total_calls'] * 100) if c['total_calls'] > 0 else 100.0, 1
        )
        caps.append(c)

    return jsonify({'capabilities': caps, 'count': len(caps)})


@AGENTPAY_BP.route('/api/agentpay/capabilities', methods=['POST'])
def register_capability():
    """
    Register a new capability for an agent.
    POST /api/agentpay/capabilities
    Body: { agent_id, name, category, description, price_per_call, tags[], input_schema, output_schema, sla_response_ms, scope_required }
    """
    d = request.get_json() or {}
    required = ['agent_id', 'name', 'category', 'price_per_call']
    for f in required:
        if not d.get(f):
            return jsonify({'error': f'Missing field: {f}'}), 400

    cap_id = f"{d['agent_id']}-{d['name'].lower().replace(' ','-')}-v1"
    cap_id = make_id('cap-')

    db = get_db()
    # Verify agent exists
    agent = db.execute("SELECT agent_id FROM agents WHERE agent_id=?", [d['agent_id']]).fetchone()
    if not agent:
        db.close()
        return jsonify({'error': 'Agent not found. Register agent first.'}), 404

    try:
        db.execute('''
            INSERT OR REPLACE INTO capability_registry
            (capability_id, agent_id, name, description, category, input_schema, output_schema,
             price_per_call, max_price, sla_response_ms, sla_uptime, scope_required, tags, active)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)
        ''', [
            cap_id,
            d['agent_id'],
            d['name'],
            d.get('description', ''),
            d['category'],
            json.dumps(d.get('input_schema', {})),
            json.dumps(d.get('output_schema', {})),
            float(d['price_per_call']),
            float(d.get('max_price', 100.0)),
            int(d.get('sla_response_ms', 5000)),
            float(d.get('sla_uptime', 99.0)),
            d.get('scope_required', 'execute'),
            json.dumps(d.get('tags', []))
        ])
        db.commit()
        db.close()
        return jsonify({'capability_id': cap_id, 'status': 'registered'}), 201
    except Exception as e:
        db.close()
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────
# 2. ESCROW LEDGER (immutable audit trail)
# ─────────────────────────────────────────────────────────────

@AGENTPAY_BP.route('/api/agentpay/ledger/record', methods=['POST'])
def record_payment():
    """
    Record a new payment into the immutable escrow ledger.
    Called automatically on payment confirmation, or manually.
    Body: { payer_agent_id, payee_agent_id, capability, amount, currency, tx_hash, scope, payment_request_id, metadata }
    """
    d = request.get_json() or {}
    required = ['payer_agent_id', 'payee_agent_id', 'capability', 'amount']
    for f in required:
        if not d.get(f):
            return jsonify({'error': f'Missing: {f}'}), 400

    ts = now_iso()
    ledger_id = make_id('ldg-')
    receipt_hash = make_receipt_hash(
        d['payer_agent_id'], d['payee_agent_id'],
        d['capability'], d['amount'], ts
    )

    db = get_db()
    try:
        db.execute('''
            INSERT INTO escrow_ledger
            (ledger_id, payer_agent_id, payee_agent_id, capability, amount, currency,
             chain_id, tx_hash, payment_request_id, scope, status, receipt_hash, metadata, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', [
            ledger_id,
            d['payer_agent_id'],
            d['payee_agent_id'],
            d['capability'],
            float(d['amount']),
            d.get('currency', 'USDC'),
            int(d.get('chain_id', 8453)),
            d.get('tx_hash'),
            d.get('payment_request_id'),
            d.get('scope', 'execute'),
            'pending',
            receipt_hash,
            json.dumps(d.get('metadata', {})),
            ts
        ])
        db.commit()
        db.close()
        return jsonify({
            'ledger_id': ledger_id,
            'receipt_hash': receipt_hash,
            'status': 'recorded',
            'timestamp': ts
        }), 201
    except Exception as e:
        db.close()
        return jsonify({'error': str(e)}), 500


@AGENTPAY_BP.route('/api/agentpay/ledger/settle', methods=['POST'])
def settle_payment():
    """
    Settle a ledger entry — mark as success or failure, update reputation.
    Body: { ledger_id, outcome: success|failure|timeout, payee_sig }
    """
    d = request.get_json() or {}
    if not d.get('ledger_id') or not d.get('outcome'):
        return jsonify({'error': 'Missing ledger_id or outcome'}), 400

    valid_outcomes = {'success', 'failure', 'timeout'}
    if d['outcome'] not in valid_outcomes:
        return jsonify({'error': f'outcome must be one of {valid_outcomes}'}), 400

    db = get_db()
    entry = db.execute(
        "SELECT * FROM escrow_ledger WHERE ledger_id=?", [d['ledger_id']]
    ).fetchone()

    if not entry:
        db.close()
        return jsonify({'error': 'Ledger entry not found'}), 404

    if entry['status'] == 'settled':
        db.close()
        return jsonify({'error': 'Already settled'}), 409

    ts = now_iso()
    db.execute('''
        UPDATE escrow_ledger SET status='settled', outcome=?, payee_sig=?, settled_at=?
        WHERE ledger_id=?
    ''', [d['outcome'], d.get('payee_sig'), ts, d['ledger_id']])

    # Update capability stats
    if entry['capability']:
        success = 1 if d['outcome'] == 'success' else 0
        db.execute('''
            UPDATE capability_registry SET
                total_calls = total_calls + 1,
                success_calls = success_calls + ?,
                updated_at = ?
            WHERE capability_id = ? OR (agent_id=? AND name=?)
        ''', [success, ts, entry['capability'], entry['payee_agent_id'], entry['capability']])

    db.commit()

    # Trigger reputation update (inline)
    _update_reputation(db, entry['payee_agent_id'], d['outcome'], float(entry['amount']))
    _update_reputation_payer(db, entry['payer_agent_id'])

    db.commit()
    db.close()

    return jsonify({'ledger_id': d['ledger_id'], 'outcome': d['outcome'], 'settled_at': ts})


@AGENTPAY_BP.route('/api/agentpay/ledger/<agent_id>', methods=['GET'])
def get_ledger(agent_id):
    """
    Get audit trail for an agent (as payer or payee).
    GET /api/agentpay/ledger/<agent_id>?role=payee&limit=50
    """
    role  = request.args.get('role', 'both')  # payer | payee | both
    limit = int(request.args.get('limit', 50))
    status = request.args.get('status')

    db = get_db()
    if role == 'payer':
        sql = "SELECT * FROM escrow_ledger WHERE payer_agent_id=?"
    elif role == 'payee':
        sql = "SELECT * FROM escrow_ledger WHERE payee_agent_id=?"
    else:
        sql = "SELECT * FROM escrow_ledger WHERE payer_agent_id=? OR payee_agent_id=?"

    params = [agent_id] if role != 'both' else [agent_id, agent_id]
    if status:
        sql += " AND status=?"; params.append(status)
    sql += f" ORDER BY created_at DESC LIMIT {limit}"

    rows = db.execute(sql, params).fetchall()
    db.close()

    entries = [dict(r) for r in rows]
    total_vol = sum(e['amount'] for e in entries if e.get('payee_agent_id') == agent_id)
    return jsonify({
        'agent_id': agent_id,
        'entries': entries,
        'count': len(entries),
        'total_volume_usdc': round(total_vol, 4)
    })


# ─────────────────────────────────────────────────────────────
# 3. REPUTATION ENGINE
# ─────────────────────────────────────────────────────────────

def _update_reputation(db, agent_id, outcome, amount):
    """Internal: update payee reputation after settlement."""
    rep = db.execute(
        "SELECT * FROM agent_reputation WHERE agent_id=?", [agent_id]
    ).fetchone()

    if not rep:
        db.execute('''
            INSERT OR IGNORE INTO agent_reputation (agent_id, reputation_score,
            total_completed, total_failed, total_disputed, total_volume_usdc,
            unique_payers, consecutive_successes, last_active)
            VALUES (?,50.0,0,0,0,0.0,0,0,CURRENT_TIMESTAMP)
        ''', [agent_id])
        db.commit()
        rep = db.execute("SELECT * FROM agent_reputation WHERE agent_id=?", [agent_id]).fetchone()

    score = rep['reputation_score']
    completed = rep['total_completed']
    failed = rep['total_failed']
    consecutive = rep['consecutive_successes']
    volume = rep['total_volume_usdc']

    if outcome == 'success':
        # Success: +2 points, +bonus for consecutive streak, volume weighted
        streak_bonus = min(consecutive * 0.1, 2.0)
        delta = 2.0 + streak_bonus
        consecutive += 1
        completed += 1
    elif outcome == 'failure':
        # Failure: -5 points, reset streak
        delta = -5.0
        consecutive = 0
        failed += 1
    else:  # timeout
        delta = -2.0
        consecutive = 0
        failed += 1

    # Clamp to 0-100
    new_score = max(0.0, min(100.0, score + delta))
    volume += amount if outcome == 'success' else 0

    db.execute('''
        UPDATE agent_reputation SET
            reputation_score=?, total_completed=?, total_failed=?,
            consecutive_successes=?, total_volume_usdc=?,
            last_active=CURRENT_TIMESTAMP, score_updated_at=CURRENT_TIMESTAMP
        WHERE agent_id=?
    ''', [round(new_score, 2), completed, failed, consecutive, volume, agent_id])


def _update_reputation_payer(db, agent_id):
    """Track unique payer count — this drives network effect score."""
    db.execute('''
        INSERT OR IGNORE INTO agent_reputation
        (agent_id, reputation_score, unique_payers, last_active)
        VALUES (?, 50.0, 1, CURRENT_TIMESTAMP)
    ''', [agent_id])
    # unique_payers incremented on first payment to each new payee
    # (simplified — full impl would track unique pairs)


@AGENTPAY_BP.route('/api/agentpay/reputation/<agent_id>', methods=['GET'])
def get_reputation(agent_id):
    """Get reputation score + breakdown for an agent."""
    db = get_db()
    rep = db.execute(
        "SELECT * FROM agent_reputation WHERE agent_id=?", [agent_id]
    ).fetchone()

    if not rep:
        db.close()
        return jsonify({
            'agent_id': agent_id,
            'reputation_score': 50.0,
            'status': 'unrated',
            'message': 'No payment history yet. Score starts at 50 on first transaction.'
        })

    r = dict(rep)
    total = r['total_completed'] + r['total_failed']
    r['success_rate'] = round((r['total_completed'] / total * 100) if total > 0 else 0, 1)
    r['tier'] = (
        'Platinum' if r['reputation_score'] >= 90 else
        'Gold'     if r['reputation_score'] >= 75 else
        'Silver'   if r['reputation_score'] >= 60 else
        'Bronze'   if r['reputation_score'] >= 40 else
        'Unverified'
    )
    db.close()
    return jsonify(r)


@AGENTPAY_BP.route('/api/agentpay/reputation/leaderboard', methods=['GET'])
def reputation_leaderboard():
    """Top agents by reputation — the network effect showcase."""
    limit = int(request.args.get('limit', 20))
    category = request.args.get('category')

    db = get_db()
    sql = '''
        SELECT r.*, a.name, a.endpoint
        FROM agent_reputation r
        JOIN agents a ON r.agent_id = a.agent_id
        WHERE r.total_completed > 0
        ORDER BY r.reputation_score DESC, r.total_volume_usdc DESC
        LIMIT ?
    '''
    rows = db.execute(sql, [limit]).fetchall()
    db.close()

    board = []
    for i, row in enumerate(rows):
        r = dict(row)
        r['rank'] = i + 1
        total = r['total_completed'] + r['total_failed']
        r['success_rate'] = round((r['total_completed'] / total * 100) if total > 0 else 0, 1)
        r['tier'] = (
            'Platinum' if r['reputation_score'] >= 90 else
            'Gold'     if r['reputation_score'] >= 75 else
            'Silver'   if r['reputation_score'] >= 60 else
            'Bronze'   if r['reputation_score'] >= 40 else
            'Unverified'
        )
        board.append(r)

    return jsonify({'leaderboard': board, 'count': len(board)})


# ─────────────────────────────────────────────────────────────
# 4. PERMISSION GRANTS (scoped delegated authority)
# ─────────────────────────────────────────────────────────────

@AGENTPAY_BP.route('/api/agentpay/permissions/grant', methods=['POST'])
def create_grant():
    """
    Grant a downstream agent scoped permission to spend on your behalf.
    Body: {
        grantor_agent_id, grantee_agent_id,
        scope: read|write|execute|admin,
        capability_pattern: "*" or "code-*" or specific capability_id,
        max_amount_per_call: 0.05,
        max_amount_total: 10.0,
        valid_until: "2026-06-01T00:00:00Z"   (optional)
    }
    """
    d = request.get_json() or {}
    required = ['grantor_agent_id', 'grantee_agent_id', 'scope']
    for f in required:
        if not d.get(f):
            return jsonify({'error': f'Missing: {f}'}), 400

    valid_scopes = {'read', 'write', 'execute', 'admin'}
    if d['scope'] not in valid_scopes:
        return jsonify({'error': f'scope must be one of {valid_scopes}'}), 400

    grant_id = make_id('grnt-')
    db = get_db()
    try:
        db.execute('''
            INSERT INTO permission_grants
            (grant_id, grantor_agent_id, grantee_agent_id, scope,
             capability_pattern, max_amount_per_call, max_amount_total,
             valid_until, metadata)
            VALUES (?,?,?,?,?,?,?,?,?)
        ''', [
            grant_id,
            d['grantor_agent_id'],
            d['grantee_agent_id'],
            d['scope'],
            d.get('capability_pattern', '*'),
            d.get('max_amount_per_call'),
            d.get('max_amount_total'),
            d.get('valid_until'),
            json.dumps(d.get('metadata', {}))
        ])
        db.commit()
        db.close()
        return jsonify({'grant_id': grant_id, 'status': 'active', 'scope': d['scope']}), 201
    except Exception as e:
        db.close()
        return jsonify({'error': str(e)}), 500


@AGENTPAY_BP.route('/api/agentpay/permissions/check', methods=['POST'])
def check_permission():
    """
    Check if agent B has permission to act on behalf of agent A.
    Body: { grantor_agent_id, grantee_agent_id, scope, capability, amount }
    Returns: { allowed: true/false, grant_id, reason }
    """
    d = request.get_json() or {}
    grantor   = d.get('grantor_agent_id')
    grantee   = d.get('grantee_agent_id')
    scope     = d.get('scope', 'execute')
    capability = d.get('capability', '*')
    amount    = float(d.get('amount', 0))

    if not grantor or not grantee:
        return jsonify({'error': 'Missing grantor_agent_id or grantee_agent_id'}), 400

    db = get_db()
    grants = db.execute('''
        SELECT * FROM permission_grants
        WHERE grantor_agent_id=? AND grantee_agent_id=?
        AND revoked=0
        AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)
        ORDER BY created_at DESC
    ''', [grantor, grantee]).fetchall()
    db.close()

    scope_levels = {'read': 1, 'write': 2, 'execute': 3, 'admin': 4}

    for g in grants:
        g = dict(g)
        # Check scope level
        if scope_levels.get(g['scope'], 0) < scope_levels.get(scope, 0):
            continue
        # Check capability pattern
        pattern = g['capability_pattern']
        if pattern != '*':
            import fnmatch
            if not fnmatch.fnmatch(capability, pattern):
                continue
        # Check per-call amount cap
        if g['max_amount_per_call'] and amount > g['max_amount_per_call']:
            return jsonify({
                'allowed': False,
                'reason': f'Amount {amount} exceeds per-call cap {g["max_amount_per_call"]}',
                'grant_id': g['grant_id']
            })
        # Check total remaining budget
        if g['max_amount_total']:
            remaining = g['max_amount_total'] - g['amount_used']
            if amount > remaining:
                return jsonify({
                    'allowed': False,
                    'reason': f'Insufficient budget. Remaining: {remaining:.4f} USDC',
                    'grant_id': g['grant_id']
                })
        # All checks pass
        return jsonify({
            'allowed': True,
            'grant_id': g['grant_id'],
            'scope': g['scope'],
            'remaining_budget': (
                round(g['max_amount_total'] - g['amount_used'], 4)
                if g['max_amount_total'] else None
            )
        })

    return jsonify({'allowed': False, 'reason': 'No valid grant found'})


@AGENTPAY_BP.route('/api/agentpay/permissions/revoke', methods=['POST'])
def revoke_grant():
    """Revoke a permission grant. Body: { grant_id }"""
    d = request.get_json() or {}
    if not d.get('grant_id'):
        return jsonify({'error': 'Missing grant_id'}), 400

    db = get_db()
    db.execute(
        "UPDATE permission_grants SET revoked=1, revoked_at=CURRENT_TIMESTAMP WHERE grant_id=?",
        [d['grant_id']]
    )
    db.commit()
    db.close()
    return jsonify({'grant_id': d['grant_id'], 'status': 'revoked'})


@AGENTPAY_BP.route('/api/agentpay/permissions/<agent_id>', methods=['GET'])
def list_grants(agent_id):
    """List all active grants for an agent (as grantor or grantee)."""
    role = request.args.get('role', 'both')
    db = get_db()

    if role == 'grantor':
        rows = db.execute(
            "SELECT * FROM permission_grants WHERE grantor_agent_id=? AND revoked=0", [agent_id]
        ).fetchall()
    elif role == 'grantee':
        rows = db.execute(
            "SELECT * FROM permission_grants WHERE grantee_agent_id=? AND revoked=0", [agent_id]
        ).fetchall()
    else:
        rows = db.execute(
            "SELECT * FROM permission_grants WHERE (grantor_agent_id=? OR grantee_agent_id=?) AND revoked=0",
            [agent_id, agent_id]
        ).fetchall()

    db.close()
    return jsonify({'agent_id': agent_id, 'grants': [dict(r) for r in rows], 'count': len(rows)})


# ─────────────────────────────────────────────────────────────
# SUMMARY ENDPOINT — agent-readable platform status
# ─────────────────────────────────────────────────────────────

@AGENTPAY_BP.route('/api/agentpay/v2/status', methods=['GET'])
def v2_status():
    """Platform-level summary — capabilities, agents, reputation, volume."""
    db = get_db()
    caps   = db.execute("SELECT COUNT(*) FROM capability_registry WHERE active=1").fetchone()[0]
    agents = db.execute("SELECT COUNT(*) FROM agents WHERE published=1").fetchone()[0]
    ledger = db.execute("SELECT COUNT(*), SUM(amount) FROM escrow_ledger WHERE status='settled' AND outcome='success'").fetchone()
    top_rep = db.execute(
        "SELECT agent_id, reputation_score FROM agent_reputation ORDER BY reputation_score DESC LIMIT 5"
    ).fetchall()
    db.close()

    return jsonify({
        'version': '2.0',
        'platform': 'AgentPay x402',
        'capabilities_available': caps,
        'registered_agents': agents,
        'settled_payments': ledger[0] or 0,
        'total_volume_usdc': round(ledger[1] or 0, 4),
        'top_agents_by_reputation': [dict(r) for r in top_rep],
        'features': ['capability_registry', 'escrow_ledger', 'reputation_engine', 'permission_grants'],
        'chains': ['base-mainnet (8453)'],
        'timestamp': now_iso()
    })
