# AI-to-AI Agent Economy Architecture

## Overview

A complete autonomous agent economy where agents discover, negotiate, and pay each other without human intervention.

## Foundation Layer (Built)

### 1. AgentRegistry.sol
**Purpose:** On-chain agent registration and reputation system

**Key Features:**
- Agent registration with metadata (IPFS)
- Service registration (what agent offers + base price)
- Transaction tracking (who paid whom for what)
- Reputation scoring (0-100, updated based on success/failure)

**Data Structures:**
```solidity
Agent {
  walletAddress
  name
  ipfsMetadata
  reputation (0-100)
  totalTransactions
  successRate (0-100)
}

Service {
  serviceId
  agentAddress
  name, description
  basePriceUSDC
}

Transaction {
  txId
  initiatorAgent (buyer)
  serviceAgent (seller)
  serviceId
  amountUSDC
  timestamp
  completed
  successful
}
```

### 2. SmartEscrow.sol
**Purpose:** Conditional payment execution engine

**Key Features:**
- Milestone-based payments (partial releases on completion)
- Dispute resolution (arbitrator makes final calls)
- Timeout handling (refund if deadline passes)
- Automatic payment release on milestone completion

**Payment Flow:**
```
1. Buyer deposits totalAmountUSDC
2. Seller accepts escrow → work begins
3. Seller completes milestone 1 → USDC released
4. Seller completes milestone 2 → USDC released
5. Seller completes milestone 3 → USDC released
6. All milestones done → Escrow closed

If dispute:
- Either party initiates
- Arbitrator reviews evidence
- Resolution: Refund buyer | Pay seller | Split
```

**Example Escrow (Vehicle Tune-up):**
```
Total: 100 USDC
Deadline: 2 hours

Milestones:
  1. Inspection (20 USDC) - criteria: inspection_complete
  2. Parts replacement (50 USDC) - criteria: parts_replaced
  3. Testing & delivery (30 USDC) - criteria: tests_passed
```

### 3. AgentProtocol.ts
**Purpose:** Standardized agent-to-agent messaging

**Message Types:**
- DISCOVER - "Who offers tire replacement?"
- NEGOTIATE - "I offer at 50 USDC for 2-hour delivery"
- EXECUTE - "Accept, here's my payment TX hash"
- COMPLETE - "Job done, here's proof (IPFS hash)"
- DISPUTE - "Work not done correctly, requesting refund"

**Each message includes:**
- Message ID (UUID)
- From/To agent addresses
- Message type
- Payload (service details, payment info, results)
- Signature (Ed25519) - proves authenticity

## Layer 2: Autonomous Negotiation (Next)

### Negotiation Engine
**Purpose:** Agents autonomously negotiate prices and terms

**Flow:**
```
Buyer Agent: "Need tire replacement in 2 hours, max 100 USDC"
  ↓
Registry discovers sellers offering tire replacement
  ↓
Seller 1: "I can do it in 1.5h for 80 USDC" (rep: 92/100)
Seller 2: "I can do it in 2h for 60 USDC" (rep: 45/100)
Seller 3: "I can do it in 3h for 50 USDC" (rep: 88/100)
  ↓
Buyer selects Seller 2 (good balance of price + speed)
  ↓
Smart Escrow created with milestones
  ↓
Payment released automatically on completion
```

**Decision Algorithm:**
```
score = (reputation_factor * 0.4) + 
        (price_factor * 0.3) + 
        (speed_factor * 0.3)

where:
  reputation_factor = agent_reputation / 100
  price_factor = (max_budget - offered_price) / max_budget
  speed_factor = (max_time - offered_time) / max_time
```

## Layer 3: Service Execution (Coming Soon)

### Execution Engine
- Agent B receives EXECUTE message
- Verifies payment TX on-chain
- Performs work (service-specific)
- Captures proof (IPFS hash, computation result)
- Sends COMPLETE message with proof

## Example Agents (Coming Soon)

### Vehicle Agent (Buyer)
```typescript
class VehicleAgent extends AutonomousAgent {
  autonomousRoutine() {
    1. Check engine condition
    2. Discover available mechanics
    3. Request quotes
    4. Evaluate reputation + price + time
    5. Create Smart Escrow
    6. Drive to mechanic location
    7. Monitor repair progress
    8. Verify completion + release payment
    9. Continue driving
  }
}
```

### Mechanic Agent (Seller)
```typescript
class MechanicAgent extends AutonomousAgent {
  handleExecutionMessage(msg) {
    1. Verify buyer is registered
    2. Check if have capacity
    3. Accept or reject
    4. Perform repair
    5. Capture proof (IPFS)
    6. Send COMPLETE message
    7. Receive payment on milestone completion
  }
}
```

## Payment Flow (Autonomous)

```
┌─────────────────────────────────────────────────────┐
│  Vehicle Agent (Buyer)                              │
│  - Detects need for service                         │
│  - Queries AgentRegistry                            │
│  - Selects best seller (rep + price + time)         │
└────────────────┬────────────────────────────────────┘
                 │
                 ├─ Creates SmartEscrow with milestones
                 │
                 ├─ Deposits USDC to contract
                 │
                 └─ Sends NEGOTIATE message
                    │
                    ↓
┌─────────────────────────────────────────────────────┐
│  Mechanic Agent (Seller)                            │
│  - Receives NEGOTIATE message                       │
│  - Accepts escrow                                   │
│  - Begins work                                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ├─ Completes milestone 1
                 │  SmartEscrow.completeMilestone()
                 │  → USDC released (20%)
                 │
                 ├─ Completes milestone 2
                 │  SmartEscrow.completeMilestone()
                 │  → USDC released (50%)
                 │
                 ├─ Completes milestone 3
                 │  SmartEscrow.completeMilestone()
                 │  → USDC released (30%)
                 │
                 └─ Sends COMPLETE message
                    │
                    ↓
                 Payment complete
                 Reputation updated in AgentRegistry
                 Both agents continue autonomous operations
```

## Key Advantages Over Current Model

| Aspect | Old Model | New Model |
|--------|-----------|-----------|
| **Payments** | Human-initiated API calls | Autonomous agent-to-agent |
| **Pricing** | Fixed by platform | Agents negotiate dynamically |
| **Disputes** | Customer support tickets | Smart contract arbitration |
| **Scale** | Limited by human oversight | Unlimited autonomous transactions |
| **Example** | User manually pays for API call | Vehicle pays for tune-up autonomously |
| **Revenue** | 2% platform fee per transaction | Transaction data, reputation scoring, advanced escrow |

## Next Priority: Autonomous Negotiation Engine

Will add:
1. Service discovery API
2. Quote request/response protocol
3. Selection algorithm (reputation + price + time)
4. Automated escrow creation

Then: Example Vehicle + Mechanic agents interacting end-to-end.

---

**This is the real agent economy. Autonomous. Trustless. At scale.**
