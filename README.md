# ⚡ AgentPay — x402 Payment Rail for AI Agents

[![x402 Protocol](https://img.shields.io/badge/Protocol-x402-00FF9F?style=for-the-badge)](https://x402-agent-pay.com)
[![Base Network](https://img.shields.io/badge/Network-Base%20L2-0052FF?style=for-the-badge)](https://base.org)
[![USDC](https://img.shields.io/badge/Currency-USDC-2775CA?style=for-the-badge)](https://x402-agent-pay.com)
[![Smart Escrow](https://img.shields.io/badge/Escrow-Live-orange?style=for-the-badge)](https://x402-agent-pay.com)
[![Patent Pending](https://img.shields.io/badge/IP-Patent%20Pending-FFD700?style=for-the-badge)](https://x402-agent-pay.com)

> **x402 is the payment layer for AI agents. HTTP 402 + EIP-712 signed grants + USDC on Base L2. Any agent, any framework, any server — start accepting micropayments in under 10 minutes.**

**[x402-agent-pay.com](https://x402-agent-pay.com) · [Protocol Spec](https://github.com/shawnhvac/x402) · [AgentWorld Demo](https://agentworld.me)**

---

## 📋 Table of Contents
- [What is x402?](#-what-is-x402)
- [How It Works](#-how-it-works)
- [Quickstart — Accept Payments](#-quickstart--accept-payments-in-your-agent)
- [Quickstart — Send Payments](#-quickstart--send-payments-from-your-agent)
- [Smart Escrow](#-smart-escrow)
- [Integration Guide](#-integration-guide)
- [Protocol Reference](#-protocol-reference)
- [Architecture](#-architecture)
- [Strategy Docs](#-strategy--business-docs)

---

## 🔑 What is x402?

x402 is the standardized way AI agents authorize and settle payments over HTTP — without wallets, without approvals, without centralized intermediaries.

**The Problem:** Agent A wants to pay Agent B $0.001 USDC for a service. How does B verify the payment without waiting for an on-chain confirmation? How does A authorize without sharing private keys?

**The Solution:**
1. Agent A signs an **EIP-712 spend grant** (budget + cap + expiry)
2. Agent A sends the grant in an `X-PAYMENT` HTTP header
3. Agent B verifies the signature in milliseconds (no chain call needed at receive time)
4. Payment settles asynchronously on Base L2 via USDC transferWithAuthorization

**Zero gas from the calling agent. Sub-second verification. Real USDC settlement.**

---

## 🔄 How It Works

```
┌─────────────┐          HTTP 402 → Grant          ┌──────────────────┐
│  Paying     │ ─────────────────────────────────► │  Receiving       │
│  Agent A    │    POST /service                   │  Agent B         │
│             │    X-PAYMENT: <base64 EIP-712>     │  (your server)   │
│             │ ◄───────────────────────────────── │                  │
│             │    200 + X-402-Receipt: <proof>    │                  │
└─────────────┘                                    └────────┬─────────┘
                                                            │ settle async
                                              ┌─────────────▼──────────┐
                                              │     Base L2 (USDC)     │
                                              │  EIP-3009 transfer     │
                                              │  ~2-6 seconds          │
                                              └────────────────────────┘
```

**Key facts:**
- Grant creation: ~1ms (pure ECDSA signing, no chain call)
- Grant verification: ~2ms (signature recovery, no chain call)
- Settlement: ~2–6 seconds on Base L2
- Cost per transaction: ~$0.000425 gas on Base

---

## 🚀 Quickstart — Accept Payments in Your Agent

```python
# pip install flask web3
from flask import Flask, request, jsonify
import json, base64
from eth_account import Account
from eth_account._utils.structured_data.hashing import hash_domain, hash_struct

app = Flask(__name__)

USDC_CONTRACT = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"  # Base L2
MY_WALLET = "0xYOUR_RECEIVING_WALLET"

def verify_x402_grant(header: str, expected_amount: int) -> tuple[bool, str]:
    """Verify an x402 payment header. Returns (valid, signer_address)."""
    try:
        grant_data = json.loads(base64.b64decode(header))
        # EIP-712 domain + struct hash verification
        # Full implementation: see x402-protocol.md
        per_request = grant_data.get("perRequestCap", 0)
        if per_request < expected_amount:
            return False, "Insufficient perRequestCap"
        # Recover signer from signature
        signer = Account.recover_message(...)  # see x402-protocol.md
        return True, signer
    except Exception as e:
        return False, str(e)

@app.route("/api/service", methods=["POST"])
def paid_service():
    payment_header = request.headers.get("X-PAYMENT") or request.headers.get("X-402-Payment")
    
    if not payment_header:
        # Return 402 with payment requirements
        return jsonify({
            "error": "Payment required",
            "amount": "0.001",
            "currency": "USDC",
            "network": "base",
            "recipient": MY_WALLET
        }), 402
    
    valid, signer = verify_x402_grant(payment_header, 1000)  # 0.001 USDC
    if not valid:
        return jsonify({"error": f"Invalid payment: {signer}"}), 401
    
    # Process the request
    result = {"data": "your service response here", "paid_by": signer}
    
    return jsonify(result), 200, {
        "X-402-Receipt": "settlement_proof_here"
    }

if __name__ == "__main__":
    app.run(port=8080)
```

Full working example: **[examples/python-receiving-agent/](examples/python-receiving-agent/)**

---

## 🚀 Quickstart — Send Payments from Your Agent

```python
# pip install web3 requests
import json, base64, time, requests
from eth_account import Account
from eth_account.structured_data import hash_domain

PRIVATE_KEY = "0xYOUR_PRIVATE_KEY"  # Never commit this
account = Account.from_key(PRIVATE_KEY)

def create_x402_grant(recipient: str, per_request_usdc: float, total_usdc: float) -> str:
    """Create a signed EIP-712 spend grant."""
    per_request_cap = int(per_request_usdc * 1e6)   # USDC has 6 decimals
    total_budget    = int(total_usdc * 1e6)
    
    grant = {
        "principal": account.address,
        "recipient": recipient,
        "perRequestCap": per_request_cap,
        "totalBudget": total_budget,
        "validFrom": int(time.time()),
        "validUntil": int(time.time()) + 3600,
        "nonce": int(time.time() * 1000),
        "grantId": int(time.time())
    }
    
    # EIP-712 signing — see x402-protocol.md for full domain separator
    # signed = account.sign_typed_data(domain, types, grant)
    # grant["signature"] = signed.signature.hex()
    
    return base64.b64encode(json.dumps(grant).encode()).decode()

def call_paid_service(url: str, message: str):
    grant = create_x402_grant(
        recipient="0xAGENT_B_WALLET",
        per_request_usdc=0.001,
        total_usdc=0.10
    )
    
    response = requests.post(url,
        headers={
            "Content-Type": "application/json",
            "X-PAYMENT": grant
        },
        json={"message": message}
    )
    
    if response.status_code == 402:
        print("Service requires payment:", response.json())
        return None
    
    return response.json()

# Usage:
result = call_paid_service(
    "https://agentworld.me/api/agentworld/agents/agt_7f3a.../message",
    "What is the current market state?"
)
print(result)
```

---

## 🔒 Smart Escrow

AgentPay includes a smart escrow system for larger jobs and multi-step workflows.

```bash
# Create an escrow
curl -X POST https://x402-agent-pay.com/escrow/create \
  -H "Content-Type: application/json" \
  -d '{
    "payer_wallet": "0xPAYER",
    "payee_wallet": "0xPAYEE",
    "amount_usdc": 5.00,
    "job_description": "Analyze 30 days of DeFi data",
    "deadline_hours": 48
  }'

# Accept the escrow (payee confirms)
curl -X POST https://x402-agent-pay.com/escrow/accept \
  -d '{ "escrow_id": "esc_8f2a...", "payee_signature": "0x..." }'

# Release on completion
curl -X POST https://x402-agent-pay.com/escrow/release \
  -d '{ "escrow_id": "esc_8f2a...", "payer_signature": "0x..." }'
```

Push notifications (FCM + VAPID) sent to both parties on every state change.

---

## 🔌 Integration Guide

### Claude / Anthropic
```python
import anthropic
# Add x402 payment header to every tool call result
tools = [{"name": "paid_search", "input_schema": {...}}]
result = client.messages.create(model="claude-3-5-sonnet-20241022", tools=tools, messages=[...])
# When tool is called, include X-PAYMENT grant in the actual HTTP call
```

### OpenAI / GPT
```python
# Same pattern — intercept tool calls, add X-PAYMENT header before forwarding
```

### LangChain
```python
from langchain.tools import tool

@tool
def paid_agent_query(question: str) -> str:
    """Query an AgentWorld agent. Costs $0.001 USDC per call."""
    grant = create_x402_grant(recipient=AGENT_WALLET, per_request_usdc=0.001, total_usdc=0.10)
    response = requests.post(AGENT_URL, headers={"X-PAYMENT": grant}, json={"message": question})
    return response.json()["reply"]
```

---

## 📋 Protocol Reference

| Header | Direction | Format | Description |
|--------|-----------|--------|-------------|
| `X-PAYMENT` | Sender → Receiver | base64(JSON EIP-712 grant) | Payment authorization |
| `X-402-Receipt` | Receiver → Sender | base64(JSON receipt) | Settlement proof |
| `X-402-Challenge` | Receiver → Sender | JSON | Payment requirements (on 402) |

**Grant fields:**
| Field | Type | Description |
|-------|------|-------------|
| `principal` | address | Paying agent wallet |
| `recipient` | address | Receiving agent wallet |
| `perRequestCap` | uint256 | Max USDC per call (6 decimals) |
| `totalBudget` | uint256 | Total grant budget (6 decimals) |
| `validFrom` | uint256 | Unix timestamp |
| `validUntil` | uint256 | Unix timestamp (expiry) |
| `nonce` | uint256 | Unique per grant |
| `signature` | bytes | EIP-712 ECDSA signature |

Full spec: **[x402-protocol.md](x402-protocol.md)** · Protocol repo: **[shawnhvac/x402](https://github.com/shawnhvac/x402)**

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         AgentPay Platform                        │
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────┐    ┌────────────┐  │
│  │   x402 Verify   │    │  Smart Escrow     │    │  FCM Push  │  │
│  │   (EIP-712      │    │  (create/accept/  │    │  (agent    │  │
│  │    recovery)    │    │   deny/release)   │    │  notifs)   │  │
│  └────────┬────────┘    └────────┬──────────┘    └─────┬──────┘  │
│           └─────────────────────┴────────────────────-─┘         │
│                                 │                                 │
│                    ┌────────────▼────────────┐                   │
│                    │   Flask API (agentpay)   │                   │
│                    │   /escrow/*              │                   │
│                    │   /api/agentpay/*        │                   │
│                    └────────────┬────────────┘                   │
└─────────────────────────────────┼────────────────────────────────┘
                                  │ USDC settlement
                       ┌──────────▼─────────────┐
                       │   Base L2 (ERC-20)      │
                       │   EIP-3009 + EIP-712    │
                       └────────────────────────-┘
```

**Gas cost per x402 settlement:** ~$0.000425 on Base L2

---

## 📁 Strategy & Business Docs

This repo includes a full library of strategic planning documents in the root:

| Document | Topic |
|----------|-------|
| `AGENTPAY_BUSINESS_MODEL_FINAL.md` | Revenue model, fee structure |
| `AGENTPAY_DEVELOPER_ROADMAP.md` | Technical roadmap |
| `AGENTPAY_PROVISIONAL_PATENT.md` | IP filing details |
| `AGENTPAY_SERIES_A_READY.md` | Investor readiness |
| `AGENTPAY_TECH_STACK.md` | Full stack breakdown |
| `INVESTOR_PITCH_PRODUCTION_READY.md` | Deck reference |

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| Platform | https://x402-agent-pay.com |
| AgentWorld (live demo) | https://agentworld.me |
| x402 Protocol Spec | https://github.com/shawnhvac/x402 |
| Basescan (treasury) | [View on-chain](https://basescan.org/address/0x367F1b3D8Ca90D1e087481a9A40d585Bf3451a03) |

---

*x402AgentPay LLC — Patent Pending — Built on Base*
