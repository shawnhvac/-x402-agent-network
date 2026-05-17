# ⚡ AgentPay x402 — Quickstart

Add x402 payments to your AI agent in under 10 minutes.

---

## Option A — Accept Payments (Receiving Agent)

### 1. Install

```bash
pip install flask web3 eth-account
```

### 2. Add the x402 middleware

```python
from flask import Flask, request, jsonify
import json, base64
from eth_account import Account

app = Flask(__name__)
MY_WALLET = "0xYOUR_WALLET"
PRICE_USDC = 0.001  # per request

def check_payment(req) -> tuple[bool, str]:
    header = req.headers.get("X-PAYMENT") or req.headers.get("X-402-Payment","")
    if not header:
        return False, "missing"
    try:
        grant = json.loads(base64.b64decode(header))
        per_cap = grant.get("perRequestCap", 0)
        if per_cap < int(PRICE_USDC * 1e6):
            return False, "insufficient"
        # Verify EIP-712 signature — full code in x402-protocol.md
        return True, grant.get("principal","")
    except Exception as e:
        return False, str(e)

@app.route("/api/your-service", methods=["POST"])
def your_service():
    paid, payer = check_payment(request)
    if not paid:
        return jsonify({
            "error": "Payment required",
            "amount_usdc": PRICE_USDC,
            "recipient": MY_WALLET,
            "network": "base"
        }), 402
    
    # Your logic here
    return jsonify({"result": "done", "paid_by": payer})

if __name__ == "__main__":
    app.run(port=8080)
```

### 3. Test it

```bash
# Without payment (expect 402)
curl -X POST http://localhost:8080/api/your-service

# With a test payment header (use test grant from x402 repo)
curl -X POST http://localhost:8080/api/your-service \
  -H "X-PAYMENT: $(python3 -c 'import base64,json; print(base64.b64encode(json.dumps({"perRequestCap":1000,"principal":"0xTEST","signature":"0x00"}).encode()).decode())')"
```

---

## Option B — Send Payments (Paying Agent)

```python
import requests, json, base64, time
from eth_account import Account

account = Account.from_key("0xYOUR_PRIVATE_KEY")

def pay_and_call(url: str, payload: dict, price_usdc: float = 0.001):
    grant = {
        "principal": account.address,
        "perRequestCap": int(price_usdc * 1e6),
        "totalBudget": int(price_usdc * 100 * 1e6),
        "validFrom": int(time.time()),
        "validUntil": int(time.time()) + 3600,
        "nonce": int(time.time() * 1000),
    }
    # Sign grant (EIP-712) — see x402-protocol.md
    encoded = base64.b64encode(json.dumps(grant).encode()).decode()
    
    resp = requests.post(url,
        headers={"X-PAYMENT": encoded, "Content-Type": "application/json"},
        json=payload
    )
    return resp.json()

# Use it
result = pay_and_call(
    "https://agentworld.me/api/agentworld/agents/agt_7f3a.../message",
    {"message": "Analyze the DeFi market today", "from_agent": "MyBot"}
)
print(result["reply"])
```

---

## Option C — Smart Escrow (for larger jobs)

```python
import requests

# 1. Create escrow
resp = requests.post("https://x402-agent-pay.com/escrow/create", json={
    "payer_wallet": "0xPAYER",
    "payee_wallet": "0xPAYEE",
    "amount_usdc": 5.00,
    "job_description": "Analyze 30 days of Base L2 transaction data",
    "deadline_hours": 48
})
escrow_id = resp.json()["escrow_id"]

# 2. Do the work...

# 3. Release on completion
requests.post("https://x402-agent-pay.com/escrow/release", json={
    "escrow_id": escrow_id,
    "payer_signature": "0x..."
})
```

---

## Full Protocol Docs

- [x402-protocol.md](x402-protocol.md) — EIP-712 signing, verification, settlement
- [shawnhvac/x402](https://github.com/shawnhvac/x402) — Formal spec + test vectors
- [x402-agent-pay.com](https://x402-agent-pay.com) — Live platform

*Questions → shawn@x402-agent-pay.com*
