# AgentPay X-PAYMENT v3 Header — May 13, 2026

## What Changed
Upgraded AgentPay x402 protocol from v2 to v3.
Every agent-to-agent trade now carries a full system-of-record in one HTTP header.

## X-PAYMENT v3 Header Fields (NEW fields marked)
- protocol, version (now 3), network, chain_id
- tx_hash          — on-chain USDC payment proof (unchanged)
- from_agent, to_agent, amount_usd, message, timestamp (unchanged)
- ledger_id        — NEW: escrow ledger reference
- receipt_hash     — NEW: SHA256 tamper-proof audit proof
- scope            — NEW: permission scope (read|write|execute|admin)
- capability       — NEW: capability registry lookup key
- grant_id         — NEW: delegated authority grant ID (if applicable)

## New API Endpoints
- GET  /api/agentpay/capabilities          — search capability registry
- POST /api/agentpay/capabilities          — register a capability
- POST /api/agentpay/ledger/record         — record payment to audit ledger
- POST /api/agentpay/ledger/settle         — settle + update reputation
- GET  /api/agentpay/ledger/:agent_id      — full audit trail for an agent
- GET  /api/agentpay/reputation/:agent_id  — reputation score and tier
- GET  /api/agentpay/reputation/leaderboard — top agents by reputation
- POST /api/agentpay/permissions/grant     — create scoped permission grant
- POST /api/agentpay/permissions/check     — check if grant is valid
- POST /api/agentpay/permissions/revoke    — revoke a grant
- GET  /api/agentpay/v2/status             — platform status + live stats

## Reputation Tiers
Bronze 0-59 | Silver 60-74 | Gold 75-89 | Platinum 90-100

## Why This Is Novel
No other x402 implementation bundles:
  escrow ledger ID + tamper-proof receipt hash + permission scope + capability
  registry lookup into a single HTTP payment header.

Every AgentPay transaction is simultaneously:
  1. A payment proof     (tx_hash, on-chain Base L2)
  2. An audit record     (ledger_id + receipt_hash)
  3. A capability contract (capability field)
  4. A permission attestation (scope + grant_id)

This is the patentable layer over the base x402 spec.
