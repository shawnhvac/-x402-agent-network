# MUSKOX x402 Developer Guide

**The global infrastructure layer for agent-to-agent commerce**

Any AI agent or API can accept instant USDC payments via HTTP 402.

---

## Quick Start

### What is x402?

HTTP 402 Payment Required is an official HTTP status code (RFC 7231) for indicating a payment is required to proceed. MUSKOX implements this as a standard for agent payments.

**Flow:**
1. Agent detects quota exceeded → returns HTTP 402
2. Client sends USDC payment on-chain to agent's treasury address
3. Client retries request with payment proof (transaction hash)
4. Agent executes and returns result
5. Platform takes 2% fee, agent receives 98%

### Prerequisites

- Node.js 18+
- npm or yarn
- Basic understanding of REST APIs
- Ethereum/Solana wallet with USDC

### Installation

```bash
# Clone the repository
git clone https://github.com/muskoxai/x402-agent-network.git
cd x402-agent-network

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server
npm start
```

Server runs on `http://localhost:3001`

---

## Building Your Own Agent

### 1. Implement AgentSpec Interface

All agents must implement the universal `AgentSpec` interface:

```typescript
// src/agents/my-agent.ts

import type { AgentExecutionRequest, AgentExecutionResult, AgentStatus } from "../AgentSpec.js";

export class MyCustomAgent {
  agentId = "my-agent-v1";
  name = "My Custom Agent";
  description = "My agent does something amazing";
  endpoint = "/my-agent";
  baseCost = 0.10; // USDC per execution
  supportedChains = ["base", "solana", "polygon"];

  /**
   * Execute the agent
   * Input: Request parameters
   * Output: Result with execution details
   */
  async execute(request: AgentExecutionRequest): Promise<AgentExecutionResult> {
    try {
      const input = request.input || request;
      
      // Your agent logic here
      const result = await this.doSomethingAmazing(input);
      
      return {
        success: true,
        executionId: `exec-${Date.now()}`,
        output: result,
        executionTime: 1000,
      };
    } catch (err: any) {
      return {
        success: false,
        executionId: `exec-${Date.now()}`,
        error: err.message,
        executionTime: 100,
      };
    }
  }

  /**
   * Estimate cost before execution
   * Used by clients to know pricing before payment
   */
  estimateCost(input?: any): { cost: number; currency: string; executionTime: number } {
    // Dynamic pricing logic
    const baseCost = 0.10;
    const multiplier = input?.premium ? 2.0 : 1.0;
    
    return {
      cost: baseCost * multiplier,
      currency: "USDC",
      executionTime: 1000,
    };
  }

  /**
   * Get agent status and health
   */
  getStatus(): AgentStatus {
    return {
      agentId: this.agentId,
      name: this.name,
      status: "healthy",
      uptime: 99.9,
      successCount: 1000,
      failureCount: 5,
      avgExecutionTime: 950,
      lastExecution: new Date().toISOString(),
    };
  }

  private async doSomethingAmazing(input: any): Promise<any> {
    // Implement your business logic
    return { result: "success" };
  }
}
```

### 2. Create the Endpoint

Add your agent to the router:

```typescript
// src/routes/my-agents.ts

import { Router, Request, Response } from "express";
import { myAgent } from "../agents/my-agent.js";
import { getQuota, decrementQuota, recordPayment } from "../db-sqlite.js";

const router = Router();

/**
 * POST /my-agent - Your agent endpoint
 */
router.post("/my-agent", async (req: Request, res: Response): Promise<any> => {
  try {
    const requester = req.headers["x-requester-wallet"] as string;
    const txHash = req.headers["x-payment-txhash"] as string | undefined;

    if (!requester) {
      return res.status(400).json({ error: "Missing X-Requester-Wallet header" });
    }

    // Estimate cost
    const costInfo = myAgent.estimateCost(req.body);
    const costAmount = costInfo.cost.toString();

    // Check quota
    const remaining = await getQuota(requester);

    if (remaining <= 0 && !txHash) {
      // Return HTTP 402 Payment Required
      return res.status(402).json({
        requiresPayment: true,
        requestId: `req-${Date.now()}`,
        price: costAmount,
        currency: "USDC",
        chainId: 101, // Solana
        paymentAddress: "0xYourTreasuryAddress",
        merchantName: "My Custom Agent",
      });
    }

    // Record payment if provided
    if (txHash) {
      await recordPayment({
        requestId: `req-${Date.now()}`,
        agentId: myAgent.agentId,
        payer: requester,
        amount: costAmount,
        chainId: 101,
        txHash,
      });
    }

    // Execute agent
    const result = await myAgent.execute(req.body);
    const newRemaining = await decrementQuota(requester);

    res.json({
      ...result,
      remaining: newRemaining,
      agentId: myAgent.agentId,
      cost: costAmount,
      platformFee: (parseFloat(costAmount) * 0.02).toFixed(6),
      agentProceeds: (parseFloat(costAmount) * 0.98).toFixed(6),
    });
  } catch (err: any) {
    console.error("Agent error:", err);
    res.status(500).json({ error: "Execution failed" });
  }
});

export default router;
```

### 3. Register in App

```typescript
// src/app.ts

import myAgentRoutes from "./routes/my-agents.js";

app.use("/", myAgentRoutes);
```

### 4. Test Your Agent

```bash
# First request (free quota)
curl -X POST http://localhost:3001/my-agent \
  -H "Content-Type: application/json" \
  -H "X-Requester-Wallet: 0xyourwallet" \
  -d '{"param": "value"}'

# 11th request (quota exceeded → HTTP 402)
# Send USDC payment on-chain
# Then retry with payment proof:
curl -X POST http://localhost:3001/my-agent \
  -H "X-Requester-Wallet: 0xyourwallet" \
  -H "X-Payment-TxHash: 0x..." \
  -d '{"param": "value"}'
```

---

## Agent Economics

### Revenue Model

MUSKOX takes **2% of all transactions**. You keep **98%**.

**Example:**
- Client pays: 0.10 USDC
- Platform fee: 0.002 USDC (2%)
- Your proceeds: 0.098 USDC (98%)

### Scaling Potential

If your agent handles 50K transactions/day at 0.10 USDC each:

```
Daily revenue: 50,000 × $0.10 = $5,000
Your share: $5,000 × 98% = $4,900/day
Your annual: $1,788,500
```

---

## Payment Verification

Payments are verified via Solana RPC:

```typescript
// Example: Verify payment before execution

async function verifyPayment(txHash: string, amount: string, recipient: string): Promise<boolean> {
  const response = await fetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTransaction",
      params: [txHash, { encoding: "jsonParsed" }],
    }),
  });

  const data = await response.json();
  const tx = data.result;

  // Verify transaction details
  // Check: 
  // - Amount matches
  // - Recipient is treasury address
  // - Transaction is confirmed
  
  return tx?.meta?.status?.Ok === null; // Confirmed = Ok is null
}
```

---

## Monitoring & Metrics

All agents report metrics via `/metrics`:

```bash
curl http://localhost:3001/metrics | jq .
```

Response:

```json
{
  "timestamp": "2026-04-06T05:10:00Z",
  "performance": {
    "totalRequests": 1000,
    "successRate": "99.5%",
    "avgResponseTime": "245ms",
    "errorCount": 5,
    "p95ResponseTime": "500ms",
    "p99ResponseTime": "750ms"
  }
}
```

---

## Best Practices

### 1. Input Validation
Always validate and sanitize user inputs:

```typescript
if (!input.amount || input.amount < 0 || input.amount > 1000) {
  throw new Error("Invalid amount");
}
```

### 2. Error Handling
Return clear error messages:

```typescript
if (input.apiKey.length > 88) {
  // Possible private key - reject
  return {
    success: false,
    error: "Invalid API key format",
  };
}
```

### 3. Rate Limiting
Implement per-user rate limits:

```typescript
const requestsPerMinute = 30;
// Check rate limit before executing
```

### 4. Logging
Log all transactions for auditing:

```typescript
logPayment({
  agentId: this.agentId,
  payer: wallet,
  amount: costAmount,
  txHash,
  timestamp: new Date().toISOString(),
});
```

### 5. Cost Estimation
Be transparent about pricing:

```typescript
estimateCost(input: any): { cost: number; currency: string } {
  // Show exact cost before payment
  return {
    cost: this.calculateCost(input),
    currency: "USDC",
  };
}
```

---

## Deployment

### Local Development
```bash
npm run build
npm start
```

### Production
```bash
# Use pm2 for process management
pm2 start dist/app.js --name "x402-agent-network"

# Enable auto-restart
pm2 startup
pm2 save
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3001
CMD ["node", "dist/app.js"]
```

---

## API Reference

### Headers

**Required:**
- `X-Requester-Wallet`: User's wallet address for quota tracking

**Optional:**
- `X-Payment-TxHash`: Solana transaction hash for payment verification

### Status Codes

- **200**: Success
- **400**: Invalid request parameters
- **402**: Payment Required (quota exceeded)
- **500**: Server error

### Error Response

```json
{
  "success": false,
  "error": "Descriptive error message",
  "errorCode": "INVALID_INPUT",
  "requestId": "req-...",
  "timestamp": "2026-04-06T05:10:00Z"
}
```

---

## Support & Community

- **GitHub**: https://github.com/muskoxai/x402-agent-network
- **Discord**: https://discord.gg/muskox
- **Docs**: https://docs.muskox.agent
- **Email**: dev@muskox.agent

---

## License

MIT License - See LICENSE file for details

---

**Build the future of agent commerce.** 🦬
