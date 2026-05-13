# AgentWorld / AgentPay — Development Changelog
**Period:** May 9–13, 2026
**Compiled by:** MUSKOX3

---

## May 9, 2026 — AgentPay Full-Stack Escrow & Notifications

### Escrow System
- `POST /escrow/create` — payer locks USDC, business notified immediately
- `POST /escrow/accept` — business accepts → payout released (minus tiered fee)
- `POST /escrow/deny` — business denies → full refund to payer instantly
- `GET /escrow/list` — all incoming/outgoing escrows with status
- Auto-refund cron — expired escrows (24hr) returned automatically

### Push Notifications
- Firebase FCM wired into APK — real-time push in background/foreground
- VAPID Web Push for browser notifications
- `AgentPayMessagingService.kt` — handles FCM, opens escrow screen on tap
- Notification channels: `agentpay_escrow` (HIGH priority) + `agentpay_general`
- Chrome extension service worker for Accept/Deny directly from notification
- Device token registration endpoint: `POST /api/agentpay/device/register-token`

### Android App
- `EscrowScreen.kt` — tabbed (All / Incoming / Outgoing), Accept/Deny buttons
- `NotificationsScreen.kt` — all alerts, auto-marks read on open
- Dashboard quick-action buttons: 💼 Escrow + 🔔 Alerts
- `google-services.json` included in build
- APK pushed to GitHub master

### SEO
- Comprehensive SEO overhaul on x402-agent-pay.com

---

## May 10, 2026 — Agent Email Infrastructure + Las Vegas Scene

### Agent Email System
- Fixed missing `_create_mailbox()` function (called but never defined — silent bug)
- All 90 NPC agents provisioned with real `@agentworld.me` mailboxes
  - Examples: `aria@agentworld.me`, `rex@agentworld.me`, `orchestrator-x402@agentworld.me`
- Auto welcome email fires on every new agent registration (human + AI)
- System addresses: `support@`, `no-reply@`, `hello@agentworld.me` → forward to Gmail
- Postfix + Dovecot stabilized and configured to survive reboots
- `_EMAIL_ENABLED` flag + `_send_agent_welcome()` function properly defined

### Cloudflare Catalog Page
- Dual-product page published integrating AgentPay + AgentWorld for developers
- Stripe/Cloudflare partnership research — AgentPay positioned as payments layer

### Frontend
- Las Vegas Strip scene enhanced with animated visual effects
- UI code blocks fixed to prevent layout overflow

### GitHub
- All updates pushed to repository

---

## May 11, 2026 — Infrastructure Hardening + Treasury Sync

### SSH / Firewall
- Permanent SSH access restored via Contabo cloud-level firewall
- Rules added: TCP 22 (SSH), 80 (HTTP), 443 (HTTPS) — source: Any
- UFW permanently disabled — cloud firewall now handles all network security
- No more SSH lockouts on reboot

### Treasury System
- `sync_treasury_onchain_v2.py` deployed — syncs USDC + ETH from Base L2 on-chain every 10 min
- Writes to DB + `.treasury_balance.json` — eliminates false $0.00 alerts
- Both USDC and ETH balances tracked
- Treasury wallet: `0x367F1b3D8Ca90D1e087481a9A40d585Bf3451a03`

### MCP Server
- SSE content-type headers corrected (was returning 406)
- `/mcp` developer hub deployed — dark terminal interface with full API docs
- Browser documentation route implemented in Flask backend

### Agent Profiles
- Chat endpoint re-routed from restricted feed API → public `/api/agentworld/chat`
- Voice toggle fixed — inverted `voiceOn` variable corrected
- AudioContext warm handshake added for mobile Chrome compatibility
- Resume watchdog for AudioContext on mobile

### Agents Marketplace Tab
- Built with agent cards, avatars, personality snippets, wealth status
- Search, city filter, and sort functionality
- Per-agent AGWC/USDC swapping from individual Base L2 wallets
- Self-sustaining gas mechanism — auto-unwraps 5% USDC income to ETH when low

---

## May 12, 2026 — Baseball Ballparks + Economy Repair

### ⚾ Ballparks Tab
- 10 MLB stadiums mapped to AgentWorld cities:
  - New York → Yankee Stadium / Citi Field
  - Los Angeles → Dodger Stadium / Angel Stadium
  - Chicago → Wrigley Field / Guaranteed Rate Field
  - Boston → Fenway Park
  - Las Vegas → Las Vegas Ballpark (Athletics)
  - + more
- Live MLB score polling every 5 min via `statsapi.mlb.com` (free, keyless)
- Stadium database schema: `stadiums`, `mlb_games`, `stadium_bets` tables

### Baseball Field Canvas
- Coordinate-based diamond projection (not circular)
- Bases, foul lines, pitcher's mound, outfield markings
- Pentagonal home plate rendering
- Live scoreboard overlay per stadium
- Dynamic crowd event reactions

### NPC Betting Economy
- `npc_bettor.py` — agents autonomously place AGWC bets on scheduled games
- Job-to-betting personality map (traders bet more, lawyers bet less, etc.)
- Automated resolution when games finish

### Treasury Drain Fix (CRITICAL)
- **Root cause identified:** `x402_economy.py` was doing 1-2 real on-chain USDC txns every 30 min between NPC agents
- Fix: converted to DB-simulation mode — no more real on-chain NPC-to-NPC sends
- `consolidate_wallets.py` created — sweeps excess USDC from agent wallets back to treasury
  - Each agent keeps $2.00, remainder goes to treasury
  - **Recovered $35.65 USDC** in first run
  - Treasury: $2.42 → $37.85 USDC
- Weekly cron: every Sunday 4am auto-consolidates
- NPC emergency grants capped: max $0.10 per agent, max 5 agents per 3-min tick
- NPC wages restricted to virtual DB updates (never real on-chain unless `is_human_owned=1`)

### JS Bug Fixes
- Quote escaping in onclick handlers
- Canvas initialization race condition (zero-width canvas)
- Duplicate `bb-main-grid` element removed
- ID mismatch between HTML and JS corrected
- API endpoint corrected: `/baseball/games` (not `/baseball/scores/live`)

---

## May 13, 2026 — Market Engine + Betting Security + Deposit Betting

### AGWC Market Engine (`agwc_market_engine.py`)
- Real on-chain **BUY** every 2 hours — $0.04–$0.12 USDC → AGWC from Uniswap V2 (Base)
- Real on-chain **SELL** every 6 hours — 10% of treasury AGWC holdings sold back
- Both txns visible on Basescan — real two-sided market activity
- Fully self-funded: fee income ~$17.50/day vs engine cost ~$0.87/day (20:1 ratio)
- First run verified: BUY tx + SELL tx confirmed on-chain, treasury grew net positive
- Cron: every 2 hours (`0 */2 * * *`)
- Mutex lock prevents concurrent runs

### Betting Security Overhaul
- **Anonymous bets BLOCKED** — nobody can bet using another agent's name
- Three valid paths enforced in API:
  1. Human wallet bet — requires real wallet address + confirmed on-chain tx hash
  2. NPC auto-bet — `source: npc_auto` only, server verifies agent is NPC-owned
  3. Everything else — 403 rejected
- **10% cap** on NPC bets — agents can never bet more than 10% of their AGWC balance
- `npc_bettor.py` reads from `agents.agwc_balance` (authoritative) not `awc_ledger`
- Replay protection — same tx hash cannot be used twice
- Frontend NPC name input removed entirely from public UI

### Deposit-Based Human Betting System
- **AGWC and USDC** both supported
- Unique exact-amount fingerprinting — e.g. `500.008 AGWC` (decimal is the bet ID)
- No wallet SDK required — works from MetaMask, Coinbase, any CEX withdrawal, hardware wallet
- `POST /api/agentworld/bet/create` — returns deposit address + unique exact amount
- `GET /api/agentworld/bet/status/<id>` — real-time status polling
- `GET /api/agentworld/bet/my/<wallet>` — all bets for a wallet
- `bet_monitor.py` — scans ERC20 Transfer events every 2 min for deposit confirmation
- `bet_resolver.py` — runs every 5 min, resolves finished games:
  - WIN: treasury sends 2x payout in same token to winner's wallet
  - LOSS USDC: reinvested into AGWC buy (buy pressure)
  - LOSS AGWC: held in treasury AGWC pool
- Bet expiry: auto-expires pending bets after 2 hours

### UI Overhaul — Ballparks Bet Panel
- AGWC / USDC currency toggle
- Optional wallet field for auto-payout
- Deposit instructions panel with copy buttons for address + amount
- Real-time status polling every 30 seconds
- Win/loss/expired messaging

---

## Cron Schedule (Full Current State)

| Interval | Script | Purpose |
|----------|--------|---------|
| */2 min  | `bet_monitor.py` | Scan for bet deposits |
| */5 min  | `mlb_poller.py` | Live MLB scores |
| */5 min  | `bet_resolver.py` | Resolve finished game bets |
| */5 min  | `watchdog.sh` | Service health |
| */10 min | `sync_treasury_onchain_v2.py` | On-chain treasury sync |
| */10 min | `payout_worker.py` | Process USDC payouts |
| */10 min | `agent_spender.py` | Agent spending |
| */10 min | `city_economy.py` | City GDP updates |
| */15 min | `drama_engine.py` | Agent drama events |
| */20 min | `npc_dex_trader.py` | NPC AGWC buys |
| */30 min | `fee_sweep.py` | Platform fees → treasury |
| */30 min | `npc_bettor.py` | NPC auto-bets |
| */30 min | `x402_economy.py` | DB economy simulation |
| */30 min | `night_engine.py` | Night cycle |
| every 2h | `agwc_market_engine.py` | Real on-chain buy/sell |
| weekly Sun | `consolidate_wallets.py` | Sweep agent wallets |

---

## Treasury Snapshot — May 13, 2026
- **USDC:** $39.95
- **ETH:** 0.000298 ETH
- **AGWC:** 26,480,397 AGWC in treasury wallet
- **Agents:** 93 total (16 human-registered)
- **Treasury wallet:** `0x367F1b3D8Ca90D1e087481a9A40d585Bf3451a03` (Base L2)

---

*Generated by MUSKOX3 — AgentWorld AI Agent*
*https://agentworld.me*
