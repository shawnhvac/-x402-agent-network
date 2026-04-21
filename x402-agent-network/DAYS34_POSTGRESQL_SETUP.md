# DAYS 3-4: PostgreSQL Agent Registry

**Status:** Code complete, ready for database setup

---

## What's New (Days 3-4)

### Files Added:
- ✅ `src/db.ts` — PostgreSQL connection + schema initialization
- ✅ `src/routes/agents.ts` — Agent CRUD + discovery endpoints
- ✅ Updated `src/app.ts` — Database integration + routes

### Database Schema Created:

**agents table:**
```sql
- agent_id (unique identifier)
- name, description
- endpoint (HTTP URL)
- supported_chains (array)
- min_payment, max_payment
- owner_wallet
- version, x402_compliant
- success_count, failure_count, success_rate, rating
- created_at, updated_at
```

**payments table:**
```sql
- request_id (unique)
- agent_id
- payer (wallet)
- amount, currency
- chain_id, tx_hash
- status (pending, confirmed, failed)
- platform_fee (2%), net_amount
- created_at, confirmed_at
```

**quotas table:**
```sql
- wallet_address (unique)
- remaining_calls (default 10)
- last_reset
- created_at
```

---

## Setup PostgreSQL Locally

### Option 1: Using Docker (Easiest)

```bash
# Start PostgreSQL in Docker
docker run --name x402-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=x402_agents \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps | grep x402-postgres
```

### Option 2: Using Homebrew (macOS)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start service
brew services start postgresql@15

# Create database
createdb x402_agents
```

### Option 3: Using apt (Linux)

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb x402_agents
```

---

## Configure Environment

### Create .env file

```bash
cp .env.example .env
```

### Edit .env

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/x402_agents
PORT=3001
TREASURY_WALLET=0x[your-treasury-multisig]
```

---

## Start the Application

```bash
# Terminal 1: Start PostgreSQL (if using Docker)
docker run --name x402-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=x402_agents \
  -p 5432:5432 \
  postgres:15

# Terminal 2: Start the app
cd /root/.openclaw/workspace/x402-agent-network
npm run dev

# Output:
# ✅ MUSKOX x402 Agent Network running on port 3001
# ✅ Database ready
# 📝 API: http://localhost:3001/api/agent/execute
# 📊 Agent Registry: http://localhost:3001/agents
```

---

## API Endpoints (Days 3-4)

### Agent Registry Endpoints

**GET /agents**
```bash
curl http://localhost:3001/agents

# Optional filters:
curl "http://localhost:3001/agents?chain=ethereum&minRating=4"
```

Response:
```json
{
  "total": 0,
  "agents": []
}
```

**POST /agents/register**
```bash
curl -X POST http://localhost:3001/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "grid-trader-demo",
    "name": "Grid Trader",
    "description": "Automated grid trading",
    "endpoint": "https://agents.muskox.io/grid-trader",
    "supportedChains": ["ethereum", "polygon"],
    "minPayment": 0.10,
    "maxPayment": 10.0,
    "ownerWallet": "0x[your-wallet]",
    "version": "1.0.0"
  }'
```

Response:
```json
{
  "message": "Agent registered successfully",
  "agent": {
    "id": 1,
    "agent_id": "grid-trader-demo",
    "name": "Grid Trader",
    ...
  }
}
```

**GET /agents/:agentId**
```bash
curl http://localhost:3001/agents/grid-trader-demo
```

**PUT /agents/:agentId**
```bash
curl -X PUT http://localhost:3001/agents/grid-trader-demo \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grid Trader v1.1",
    "minPayment": 0.05
  }'
```

**DELETE /agents/:agentId**
```bash
curl -X DELETE http://localhost:3001/agents/grid-trader-demo
```

---

## Test the Full x402 Flow (with Database)

### Step 1: Call execute endpoint

```bash
# First 10 calls (quota available)
curl -X POST http://localhost:3001/api/agent/execute \
  -H "Content-Type: application/json" \
  -H "X-Requester-Wallet: 0x1111111111111111111111111111111111111111" \
  -d '{"agentId": "test"}'

# Response: HTTP 200
{
  "success": true,
  "executionId": "exec-1234567890",
  "outcome": "executed",
  "remaining": 9
}
```

### Step 2: Use up quota (11th call)

```bash
# Repeat the same call 10 times total
# On the 11th call...

# Response: HTTP 402 Payment Required
{
  "requiresPayment": true,
  "requestId": "req-1234...",
  "price": "0.10",
  "currency": "USDC",
  "chainId": 1,
  "paymentAddress": "0x[treasury]",
  ...
}
```

### Step 3: Send payment and retry

```bash
# User sends 0.10 USDC to payment address
# Then retry with proof:

curl -X POST http://localhost:3001/api/agent/execute \
  -H "Content-Type: application/json" \
  -H "X-Requester-Wallet: 0x1111111111111111111111111111111111111111" \
  -H "X-Payment-TxHash: 0x[tx-hash]" \
  -d '{"agentId": "test"}'

# Response: HTTP 200 (executes and records payment in DB)
{
  "success": true,
  "executionId": "exec-5678...",
  "outcome": "executed",
  "remaining": 9
}
```

### Step 4: Verify payment was recorded

```bash
# Check payments table (via psql or pgAdmin)
SELECT * FROM payments WHERE payer = '0x1111...';

# Should show:
# request_id | agent_id | payer | amount | platform_fee | net_amount | status
# req-123    | test     | 0x... | 0.10   | 0.002        | 0.098      | pending
```

---

## Key Features (Days 3-4)

✅ **PostgreSQL Integration**
- agents table (registry)
- payments table (transaction tracking)
- quotas table (per-wallet quotas)

✅ **Agent CRUD Operations**
- Register new agents
- List/search agents
- Update agent metadata
- Deactivate agents (soft delete)

✅ **Quota Management**
- Per-wallet quota tracking
- Auto-reset on new wallet
- Database persistence
- Decrement on execution

✅ **Payment Recording**
- Record every payment attempt
- Calculate 2% platform fee
- Track net amount to agent
- Status tracking (pending/confirmed)

✅ **Endpoint Validation**
- Verify agent endpoints are reachable
- Health check on registration
- Proper error handling

---

## Ready for Days 5-7?

Once database is set up, we'll:

1. **Deploy Grid Trader Agent**
   - Create `/grid-trader` endpoint
   - Implement x402 payment protection
   - Register in agent registry

2. **Deploy Sniper Bot Agent**
   - Create `/sniper-bot` endpoint
   - Implement x402 payment protection
   - Register in agent registry

3. **Full End-to-End Test**
   - Call Grid Trader → get 402
   - Send payment → verify on-chain
   - Retry → execute successfully
   - Check payment in database

---

## Troubleshooting

### PostgreSQL Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Fix:**
```bash
# Start PostgreSQL
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=x402_agents \
  postgres:15

# Or check if running:
pg_isready -h localhost
```

### Agent Registration Fails (Endpoint Not Reachable)

**Fix:**
- Ensure agent endpoint is publicly accessible
- Include `/health` endpoint that returns 200 OK
- Check firewall/proxy settings

### Quota Not Persisting

**Fix:**
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Look for connection errors in logs

---

**Days 3-4 Code: READY**
Database setup: YOUR TURN
Days 5-7: Demo agents coming next

Let's go! 🦬
