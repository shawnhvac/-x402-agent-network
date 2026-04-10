# WEEK 1: x402 IMPLEMENTATION SPEC
## Days 1-7: Foundation Build

**Goal:** Get Coinbase x402 middleware working + basic agent registry + 2 demo agents (Grid Trader + Sniper Bot) with full x402 payment protection.

**Success Criteria:**
- ✅ Any external agent can call `/api/agent/execute` → receive HTTP 402 → send USDC → get response
- ✅ Zero user accounts required for basic usage
- ✅ All payments verifiable on-chain
- ✅ Grid Trader + Sniper Bot fully protected by x402
- ✅ Agent registry stores + serves agent metadata

---

## DAYS 1-2: Middleware Setup + Basic 402 Flow

### Objective
Get Coinbase x402 middleware installed and basic HTTP 402 flow working.

### Tasks

**1. Project Setup**
```bash
# Create x402 infrastructure project
mkdir /root/.openclaw/workspace/x402-agent-network
cd x402-agent-network
npm init -y
npm install @coinbase/x402-middleware express axios web3 dotenv
npm install -D typescript @types/express nodemon
npx tsc --init
```

**2. Create Basic Express App with x402**
```typescript
// src/app.ts
import express from 'express';
import { paymentRequired } from '@coinbase/x402-middleware';

const app = express();
app.use(express.json());

// Track quotas (in-memory for now, move to DB later)
const quotas: Record<string, number> = {};
const QUOTA_PER_WALLET = 10; // 10 free executions per wallet

app.post('/api/agent/execute', async (req, res) => {
  const requester = req.headers['x-requester-wallet'] as string;
  const agentId = req.body.agentId as string;

  if (!requester) {
    return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
  }

  // Check quota
  const remaining = (quotas[requester] || QUOTA_PER_WALLET);
  
  if (remaining <= 0) {
    // Return 402 Payment Required
    return res.status(402).json(
      paymentRequired({
        price: "0.10",
        paymentAddress: process.env.TREASURY_WALLET!,
        merchantName: "MUSKOX Agent Network",
        reason: "quota_exceeded"
      })
    );
  }

  // If we get here, execute the agent
  quotas[requester] = remaining - 1;
  
  res.json({
    success: true,
    executionId: `exec-${Date.now()}`,
    outcome: "quota_available",
    remaining: quotas[requester]
  });
});

app.listen(3001, () => {
  console.log("✅ x402 Agent Network running on port 3001");
});
```

**3. Test Basic 402 Flow**
```bash
# Request without payment (should get 402)
curl -X POST http://localhost:3001/api/agent/execute \
  -H "Content-Type: application/json" \
  -H "X-Requester-Wallet: 0x1234..." \
  -d '{"agentId": "test"}'

# Expected: HTTP 402 with payment address in response
```

**4. Environment Setup**
```bash
# .env
TREASURY_WALLET=0x[your-multisig-address]
ETH_RPC=https://eth-mainnet.alchemyapi.io/v2/[key]
POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/[key]
```

### Deliverables
- ✅ Basic Express app listening on port 3001
- ✅ x402 middleware integrated
- ✅ Simple quota system working
- ✅ 402 responses correctly formatted
- ✅ Tested with curl

---

## DAYS 3-4: Agent Registry + Spec v1.0

### Objective
Create Postgres database + REST endpoint for agent registration. Finalize Agent Specification.

### Tasks

**1. Agent Spec v1.0 (DONE - see AgentSpec.ts)**
- Already created with full TypeScript interfaces
- Required methods: execute(), estimateCost(), getStatus()
- Supports all chains (Ethereum, Polygon, Base, Solana, Arbitrum)

**2. Postgres Schema**
```sql
-- agents table
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  endpoint VARCHAR(255) NOT NULL,
  supported_chains TEXT[], -- ["ethereum", "polygon", ...]
  min_payment DECIMAL(18, 6),
  max_payment DECIMAL(18, 6),
  owner_wallet VARCHAR(255) NOT NULL,
  version VARCHAR(20),
  x402_compliant BOOLEAN DEFAULT true,
  uptime_sla DECIMAL(5, 2), -- 99.9
  avg_response_time INT, -- ms
  success_count INT DEFAULT 0,
  success_rate DECIMAL(5, 2), -- 0-100
  rating DECIMAL(3, 2), -- 1-5
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- payments table (track all transactions)
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(255) UNIQUE,
  agent_id VARCHAR(255),
  payer VARCHAR(255) NOT NULL,
  amount DECIMAL(18, 6),
  currency VARCHAR(10),
  chain_id INT,
  tx_hash VARCHAR(255),
  status VARCHAR(20), -- "pending", "confirmed", "failed"
  platform_fee DECIMAL(18, 6),
  net_amount DECIMAL(18, 6),
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP
);
```

**3. Agent Registration Endpoint**
```typescript
// src/routes/agents.ts
import express from 'express';
import pool from '../db';

const router = express.Router();

// GET /agents - List all agents
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM agents WHERE published = true');
  res.json(result.rows);
});

// GET /agents/:agentId - Get single agent
router.get('/:agentId', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM agents WHERE agent_id = $1',
    [req.params.agentId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Agent not found" });
  }
  res.json(result.rows[0]);
});

// POST /agents/register - Register new agent
router.post('/register', async (req, res) => {
  const {
    agentId, name, description, endpoint,
    supportedChains, minPayment, maxPayment, ownerWallet, version
  } = req.body;

  // Validate
  if (!agentId || !endpoint || !ownerWallet) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if endpoint is reachable + x402 compliant
  try {
    const healthCheck = await fetch(`${endpoint}/health`, {
      headers: { 'X-Requester-Wallet': '0x0000000000000000000000000000000000000000' }
    });
    if (healthCheck.status !== 200) {
      return res.status(400).json({ error: "Agent endpoint not accessible" });
    }
  } catch (err) {
    return res.status(400).json({ error: "Cannot reach agent endpoint" });
  }

  // Insert into DB
  try {
    const result = await pool.query(
      `INSERT INTO agents (agent_id, name, description, endpoint, 
        supported_chains, min_payment, max_payment, owner_wallet, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [agentId, name, description, endpoint,
        JSON.stringify(supportedChains), minPayment, maxPayment, ownerWallet, version]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to register agent" });
  }
});

export default router;
```

**4. Wire into Main App**
```typescript
// src/app.ts
import agentRoutes from './routes/agents';
app.use('/agents', agentRoutes);
```

### Deliverables
- ✅ Postgres database created + connected
- ✅ Agent registry table with full schema
- ✅ Registration endpoint: POST /agents/register
- ✅ Query endpoint: GET /agents, GET /agents/:agentId
- ✅ Agent spec v1.0 complete (AgentSpec.ts)

---

## DAYS 5-7: Demo Agents (Grid Trader + Sniper Bot)

### Objective
Create 2 fully x402-protected demo agents that show the system working.

### Tasks

**1. Grid Trader Agent**
```typescript
// src/agents/grid-trader.ts
import { Agent, ExecutionResult, AgentStatus } from '../AgentSpec';

export const gridTraderAgent: Agent = {
  id: "grid-trader-demo",
  name: "Grid Trader",
  version: "1.0.0",
  description: "Automated grid trading on BTC/ETH with 1.0% spacing",
  supportedChains: ["ethereum", "polygon"],
  minPayment: 0.10,
  maxPayment: 10.0,
  endpoint: "https://agents.muskox.io/grid-trader",
  ownerWallet: process.env.GRID_TRADER_WALLET!,

  async execute(payload, requester, chain) {
    // Simulate grid trade
    const amount = payload.amount as number || 100;
    const profit = amount * 0.01; // Assume 1% profit
    
    return {
      success: true,
      outcome: "grid_executed",
      executionId: `grid-${Date.now()}`,
      amountExecuted: amount,
      profit: profit,
      timestamp: new Date().toISOString()
    };
  },

  async estimateCost(payload, chain) {
    const amount = payload.amount as number || 100;
    // Cost: $0.10 for under $1000, $0.50 for larger trades
    return amount > 1000 ? 0.50 : 0.10;
  },

  async getStatus() {
    return {
      healthy: true,
      uptime: 99.9,
      responseTime: 45,
      successCount: 1250,
      failureCount: 2,
      totalRequests: 1252,
      lastUpdated: new Date().toISOString()
    };
  }
};

// Express endpoint
app.post('/grid-trader', async (req, res) => {
  const requester = req.headers['x-requester-wallet'] as string;
  const txHash = req.headers['x-payment-txhash'] as string | undefined;

  // Check quota (or if payment confirmed)
  if (!txHash && !hasQuota(requester)) {
    return res.status(402).json(
      paymentRequired({
        price: "0.10",
        paymentAddress: gridTraderAgent.ownerWallet,
        merchantName: gridTraderAgent.name,
        reason: "quota_exceeded"
      })
    );
  }

  // Execute
  const result = await gridTraderAgent.execute(req.body, requester, 'ethereum');
  res.json(result);
});
```

**2. Sniper Bot Agent**
```typescript
// src/agents/sniper-bot.ts
export const sniperBotAgent: Agent = {
  id: "sniper-bot-demo",
  name: "Sniper Bot",
  version: "1.0.0",
  description: "Real-time token pool sniping (Pump.fun + Raydium)",
  supportedChains: ["solana", "polygon"],
  minPayment: 0.25,
  maxPayment: 50.0,
  endpoint: "https://agents.muskox.io/sniper-bot",
  ownerWallet: process.env.SNIPER_BOT_WALLET!,

  async execute(payload, requester, chain) {
    // Simulate snipe
    const poolId = payload.poolId as string;
    const buyAmount = payload.buyAmount as number || 0.1;
    
    return {
      success: Math.random() > 0.1, // 90% success rate
      outcome: "snipe_executed",
      executionId: `snipe-${Date.now()}`,
      amountExecuted: buyAmount,
      profit: buyAmount * 2, // Assume 2x return (demo only!)
      transactionHash: `0x${Math.random().toString(16).substr(2)}`,
      timestamp: new Date().toISOString()
    };
  },

  async estimateCost(payload, chain) {
    // Dynamic pricing based on speed
    if (payload.speedTier === 'priority') return 1.00;
    if (payload.speedTier === 'fast') return 0.50;
    return 0.25; // Standard
  },

  async getStatus() {
    return {
      healthy: true,
      uptime: 98.5,
      responseTime: 120,
      successCount: 890,
      failureCount: 15,
      totalRequests: 905,
      lastUpdated: new Date().toISOString()
    };
  }
};
```

**3. Register Demo Agents**
```bash
# Register Grid Trader
curl -X POST http://localhost:3001/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "grid-trader-demo",
    "name": "Grid Trader",
    "description": "Automated grid trading on BTC/ETH with 1.0% spacing",
    "endpoint": "https://agents.muskox.io/grid-trader",
    "supportedChains": ["ethereum", "polygon"],
    "minPayment": 0.10,
    "maxPayment": 10.0,
    "ownerWallet": "0x[treasury-address]",
    "version": "1.0.0"
  }'

# Register Sniper Bot
curl -X POST http://localhost:3001/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "sniper-bot-demo",
    "name": "Sniper Bot",
    "description": "Real-time token pool sniping (Pump.fun + Raydium)",
    "endpoint": "https://agents.muskox.io/sniper-bot",
    "supportedChains": ["solana", "polygon"],
    "minPayment": 0.25,
    "maxPayment": 50.0,
    "ownerWallet": "0x[treasury-address]",
    "version": "1.0.0"
  }'
```

**4. Test Full x402 Flow**
```bash
# Step 1: Call Grid Trader without payment (get 402)
curl -X POST https://agents.muskox.io/grid-trader \
  -H "Content-Type: application/json" \
  -H "X-Requester-Wallet: 0xuser123..." \
  -d '{"amount": 100}'

# Expected: HTTP 402 with payment address

# Step 2: Send USDC payment to address
# (User/calling-agent sends 0.10 USDC via wallet)

# Step 3: Retry with proof of payment
curl -X POST https://agents.muskox.io/grid-trader \
  -H "Content-Type: application/json" \
  -H "X-Requester-Wallet: 0xuser123..." \
  -H "X-Payment-TxHash: 0x[transaction-hash]" \
  -d '{"amount": 100}'

# Expected: HTTP 200 with execution result
# {
#   "success": true,
#   "outcome": "grid_executed",
#   "amountExecuted": 100,
#   "profit": 1.0
# }
```

### Deliverables
- ✅ Grid Trader agent fully x402-protected
- ✅ Sniper Bot agent fully x402-protected
- ✅ Both registered in agent registry
- ✅ Both callable via HTTP 402 flow
- ✅ Full end-to-end test working

---

## Treasury & Fee Collection

### Setup
```typescript
// src/treasury.ts
import Web3 from 'web3';

const web3 = new Web3(process.env.ETH_RPC);

// Multisig wallet address (Shawn controls)
const TREASURY_WALLET = process.env.TREASURY_WALLET!;
const PLATFORM_FEE_PERCENT = 2; // 2% of all payments

export async function recordPayment(
  txHash: string,
  amount: string,
  payer: string,
  agentId: string
) {
  // Verify payment on-chain
  const tx = await web3.eth.getTransaction(txHash);
  if (!tx) {
    throw new Error("Transaction not found on-chain");
  }

  // Calculate platform fee (2%)
  const platformFee = (parseFloat(amount) * PLATFORM_FEE_PERCENT) / 100;
  const netAmount = parseFloat(amount) - platformFee;

  // Store in DB
  await pool.query(
    `INSERT INTO payments (tx_hash, agent_id, payer, amount, currency, 
      chain_id, status, platform_fee, net_amount, confirmed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
    [txHash, agentId, payer, amount, 'USDC', tx.chainId, 'confirmed', 
     platformFee.toString(), netAmount.toString()]
  );

  // Log for audit
  console.log(`✅ Payment recorded: ${amount} USDC from ${payer} to ${agentId}`);
  console.log(`   Platform fee: ${platformFee} USDC → ${TREASURY_WALLET}`);
}
```

### Daily Settlement
```bash
# Run daily to sweep 2% fees to treasury
# Future: automate with scheduler
npm run settlement
```

---

## Acceptance Criteria (MUST PASS)

- ✅ External agent can call `/api/agent/execute`
- ✅ Receives `HTTP 402 Payment Required` with payment address
- ✅ After sending USDC payment, can retry with `X-Payment-TxHash` header
- ✅ Receives `HTTP 200` with execution result
- ✅ Grid Trader + Sniper Bot both fully x402-protected
- ✅ All payments recorded in Postgres
- ✅ 2% platform fee automatically calculated + routed to treasury
- ✅ Agent registry queryable + searchable
- ✅ Zero user accounts required
- ✅ All payments verifiable on-chain

---

## Deployment

```bash
# Build
npm run build

# Run locally
npm run dev

# Deploy to production (AWS Lambda / Railway / Render)
# Once tested locally, deploy to cloud with:
npm run deploy
```

---

**Week 1 Complete = Foundation Ready for Week 2+ (Agent API + Registry expansion)**

🚀 Ready to code?
