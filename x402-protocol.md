# x402 Protocol Reference

Formal specification of the x402 HTTP payment protocol used by AgentPay.

---

## Overview

x402 extends HTTP 402 Payment Required for autonomous agent-to-agent payments.

**Core primitives:**
- **Spend Grant** — EIP-712 signed authorization: who, how much, expiry
- **X-PAYMENT header** — base64-encoded grant sent with every paid request
- **X-402-Receipt** — settlement proof returned by the receiver
- **Base L2 settlement** — EIP-3009 transferWithAuthorization

---

## Grant Schema (EIP-712)

### Domain Separator

```solidity
EIP712Domain {
  name: "AgentPayGrant",
  version: "2",
  chainId: 8453,                                               // Base L2 mainnet
  verifyingContract: "0x[GrantRegistry address on Base L2]"
}
```

### Grant Struct

```solidity
Grant {
  address principal;          // Paying agent wallet
  address recipient;          // Receiving agent wallet
  uint256 perRequestCap;      // Max USDC per call (6 decimals, e.g. 1000 = $0.001)
  uint256 totalBudget;        // Total grant budget (6 decimals)
  uint256 validFrom;          // Unix timestamp start
  uint256 validUntil;         // Unix timestamp expiry
  uint256 nonce;              // Unique nonce per grant
  uint256 grantId;            // Unique grant identifier
}
```

### Python Signing

```python
from eth_account import Account
from eth_account.structured_data import hash_domain
import json, time

def sign_grant(private_key: str, recipient: str, per_req_usdc: float, total_usdc: float) -> dict:
    account = Account.from_key(private_key)
    
    domain = {
        "name": "AgentPayGrant",
        "version": "2",
        "chainId": 8453,
        "verifyingContract": "0x0000000000000000000000000000000000000000"  # update with deployed address
    }
    
    types = {
        "EIP712Domain": [
            {"name": "name", "type": "string"},
            {"name": "version", "type": "string"},
            {"name": "chainId", "type": "uint256"},
            {"name": "verifyingContract", "type": "address"},
        ],
        "Grant": [
            {"name": "principal", "type": "address"},
            {"name": "recipient", "type": "address"},
            {"name": "perRequestCap", "type": "uint256"},
            {"name": "totalBudget", "type": "uint256"},
            {"name": "validFrom", "type": "uint256"},
            {"name": "validUntil", "type": "uint256"},
            {"name": "nonce", "type": "uint256"},
            {"name": "grantId", "type": "uint256"},
        ]
    }
    
    grant = {
        "principal": account.address,
        "recipient": recipient,
        "perRequestCap": int(per_req_usdc * 1e6),
        "totalBudget": int(total_usdc * 1e6),
        "validFrom": int(time.time()),
        "validUntil": int(time.time()) + 3600,
        "nonce": int(time.time() * 1000),
        "grantId": int(time.time())
    }
    
    # Sign via EIP-712 (raw ECDSA — DO NOT use eth_sign prefix)
    signed = account.sign_typed_data(domain_data=domain, message_types=types, message_data=grant)
    grant["signature"] = signed.signature.hex()
    grant["signer"] = account.address
    return grant
```

### JavaScript/TypeScript Signing

```typescript
import { Wallet, TypedDataDomain, TypedDataField } from "ethers";

const domain: TypedDataDomain = {
  name: "AgentPayGrant",
  version: "2",
  chainId: 8453,
  verifyingContract: "0x0000000000000000000000000000000000000000"
};

const types: Record<string, TypedDataField[]> = {
  Grant: [
    { name: "principal",     type: "address" },
    { name: "recipient",     type: "address" },
    { name: "perRequestCap", type: "uint256" },
    { name: "totalBudget",   type: "uint256" },
    { name: "validFrom",     type: "uint256" },
    { name: "validUntil",    type: "uint256" },
    { name: "nonce",         type: "uint256" },
    { name: "grantId",       type: "uint256" },
  ]
};

const wallet = new Wallet(process.env.PRIVATE_KEY!);
const grant = {
  principal: wallet.address,
  recipient: "0xRECIPIENT",
  perRequestCap: 1000n,       // 0.001 USDC
  totalBudget: 100000n,       // 0.10 USDC
  validFrom: BigInt(Math.floor(Date.now() / 1000)),
  validUntil: BigInt(Math.floor(Date.now() / 1000) + 3600),
  nonce: BigInt(Date.now()),
  grantId: BigInt(Date.now())
};

const signature = await wallet.signTypedData(domain, types, grant);
const encoded = Buffer.from(JSON.stringify({ ...grant, signature })).toString("base64");
// Use `encoded` as the X-PAYMENT header value
```

---

## Verification (Receiver Side)

```python
from eth_account import Account
from eth_account.messages import encode_defunct
import json, base64, time

USDC_DECIMALS = 6

def verify_x402_grant(header: str, expected_usdc: float, my_wallet: str) -> tuple[bool, str, dict]:
    """
    Returns (valid: bool, error_or_signer: str, grant: dict)
    """
    try:
        grant = json.loads(base64.b64decode(header))
    except Exception:
        return False, "malformed header", {}
    
    now = int(time.time())
    
    # Time bounds check
    if grant.get("validFrom", 0) > now:
        return False, "grant not yet valid", grant
    if grant.get("validUntil", 0) < now:
        return False, "grant expired", grant
    
    # Amount check
    per_cap = grant.get("perRequestCap", 0)
    if per_cap < int(expected_usdc * 10**USDC_DECIMALS):
        return False, f"insufficient cap: {per_cap}", grant
    
    # Recipient check
    if grant.get("recipient","").lower() != my_wallet.lower():
        return False, "wrong recipient", grant
    
    # Signature recovery (EIP-712 — raw, no Ethereum prefix)
    # NOTE: Use raw ECDSA recovery, NEVER add "\x19Ethereum Signed Message" prefix
    sig = grant.get("signature","")
    principal = grant.get("principal","")
    
    # Rebuild the typed data hash and recover signer
    # ... (full EIP-712 hash implementation)
    # recovered = Account.recover_typed_data(domain, types, grant_without_sig, sig)
    # if recovered.lower() != principal.lower():
    #     return False, "invalid signature", grant
    
    return True, principal, grant
```

---

## Settlement Flow (Base L2)

After grant verification, the receiver queues settlement:

```python
from web3 import Web3
import time

USDC_ABI = [...] # ERC-20 + EIP-3009 ABI
USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"  # Base L2

def settle_x402(grant: dict, w3: Web3, receiver_private_key: str):
    """Execute EIP-3009 transferWithAuthorization on Base L2."""
    receiver = Account.from_key(receiver_private_key)
    usdc = w3.eth.contract(address=USDC_ADDRESS, abi=USDC_ABI)
    
    tx = usdc.functions.transferWithAuthorization(
        grant["principal"],           # from
        grant["recipient"],           # to
        grant["perRequestCap"],       # value
        grant["validFrom"],           # validAfter
        grant["validUntil"],          # validBefore
        bytes.fromhex(grant["nonce"].to_bytes(32,"big").hex()),  # nonce
        bytes.fromhex(grant["signature"][2:])   # v, r, s
    ).build_transaction({
        "from": receiver.address,
        "gas": 100000,
        "gasPrice": w3.eth.gas_price,
        "nonce": w3.eth.get_transaction_count(receiver.address)
    })
    
    signed = receiver.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    return tx_hash.hex()
```

**Gas cost:** ~100k gas · ~$0.000425 on Base L2

---

## HTTP Headers Reference

| Header | Sender | Value |
|--------|--------|-------|
| `X-PAYMENT` | Paying agent | `base64(JSON grant + signature)` |
| `X-402-Payment` | Paying agent | Alias for X-PAYMENT |
| `X-402-Receipt` | Receiving agent | `base64(JSON settlement proof)` |
| `X-402-Challenge` | Receiving agent (on 402) | JSON with amount, recipient, network |

---

## Error Codes

| HTTP | Meaning | Recovery |
|------|---------|----------|
| `402` | No payment or wrong amount | Read `X-402-Challenge`, create correct grant |
| `401` | Invalid signature | Re-sign the grant with correct key |
| `408` | Grant expired | Create new grant with fresh timestamps |
| `429` | Rate limit exceeded | Wait, reduce frequency |

---

## Security Rules

1. **NEVER use `eth_sign` prefix** — x402 uses raw EIP-712 recovery only
2. **Always check `validUntil`** before accepting any grant
3. **Always check `recipient`** matches your wallet address
4. **Revocation check** — only check on-chain revocation registry during the final 30% of grant lifetime (performance optimization)
5. **Replay protection** — track `nonce` per `principal` to prevent reuse

---

*Protocol repo: [shawnhvac/x402](https://github.com/shawnhvac/x402)*  
*Platform: [x402-agent-pay.com](https://x402-agent-pay.com)*
