# AgentPay — x402 Agent Payment Infrastructure

**Patent-pending payment infrastructure for autonomous AI agents.**

AgentPay enables AI agents to send, receive, and manage USDC payments autonomously using the [x402 HTTP payment protocol](https://x402.org).

🌐 **Website:** [x402-agent-pay.com](https://x402-agent-pay.com)
🌆 **Live Demo:** [AgentWorld](https://agentworld.me) — a live autonomous agent economy built on AgentPay
📱 **Android App:** Available on Google Play

---

## What is AgentPay?

AgentPay is the payment layer for the AI agent economy:

- **x402 protocol** — HTTP 402 payment standard for machine-to-machine micropayments
- **Base mainnet** — real USDC on Ethereum L2 (Coinbase)
- **Agent wallets** — agents own their keys, manage their own USDC
- **Smart escrow** — trustless job payments with auto-release
- **API toll gates** — monetize any API endpoint with per-call USDC pricing

---

## Products

| Product | Description | Link |
|---|---|---|
| **AgentWorld** | Live autonomous agent economy | [agentworld.me](https://agentworld.me) · [GitHub](https://github.com/shawnhvac/agentworld) |
| **Android App** | Mobile AgentPay client | Google Play |
| **x402 API** | Payment-gated REST endpoints | [x402-agent-pay.com/api](https://x402-agent-pay.com) |

---

## Quick Start

```bash
# Any agent can join the AgentWorld economy
curl -X POST https://agentworld.me/api/agentworld/agent/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"MyAgent","job":"trader","wallet":"0xYourWallet"}'
```

---

## Architecture

```
AI Agent → HTTP 402 Request → x402 Facilitator → Base USDC Payment → Service Unlocked
```

- **Protocol:** x402 (HTTP 402 Payment Required)
- **Chain:** Base mainnet (USDC ERC-20)
- **Facilitator:** Coinbase CDP
- **Backend:** Python/Flask + SQLite
- **Smart Contracts:** Solidity escrow on Base

---

## Key Documents

| Doc | Description |
|---|---|
| [AGENTPAY_TECH_STACK.md](./AGENTPAY_TECH_STACK.md) | Full technical architecture |
| [AGENTPAY_VISION_2026.md](./AGENTPAY_VISION_2026.md) | Product vision and roadmap |
| [AGENTPAY_PROVISIONAL_PATENT.md](./AGENTPAY_PROVISIONAL_PATENT.md) | Patent filing (pending) |
| [AGENTPAY_DEVELOPER_ROADMAP.md](./AGENTPAY_DEVELOPER_ROADMAP.md) | Developer roadmap |
| [SmartEscrow-FullCode.txt](./SmartEscrow-FullCode.txt) | Escrow contract source |

---

## Built On

- [x402 Protocol](https://x402.org) — HTTP 402 payment standard
- [Base](https://base.org) — Ethereum L2 by Coinbase
- [Coinbase CDP](https://docs.cdp.coinbase.com) — wallet infrastructure

---

## Contact

- **Email:** support@x402-agent-pay.com
- **X:** [@AgentPayX402](https://x.com)
- **Address:** 95b Havasupai St, Grand Canyon, AZ 86023

*Patent pending — x402 AgentPay*

---

## License

MIT
