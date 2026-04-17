# AgentPay + x402 Bazaar Integration Plan
**April 17, 2026**

---

## STRATEGIC OVERVIEW

**The Problem:** Agents can't discover services autonomously
**x402 Bazaar:** Discovery layer for x402-compatible APIs
**AgentPay:** Booking + payment infrastructure
**The Solution:** AgentPay registers service endpoints on Bazaar → Agents discover → AgentPay handles payments

---

## HOW IT WORKS

### Current Flow (Without Bazaar)
```
Agent: "Book me a service"
       ↓
Agent: "I don't know where to look" ❌
```

### New Flow (With Bazaar Integration)
```
Agent: "Book me a service"
       ↓
Agent queries Bazaar: GET /discovery/resources?type=service
       ↓
Bazaar returns: [
  {
    resource: "https://agentpay.com/api/v1/search",
    accepts: [{scheme: "exact", price: "$0.001"}],
    metadata: {description: "Search for services"}
  },
  {
    resource: "https://agentpay.com/api/v1/book",
    accepts: [{scheme: "exact", price: "$0.002"}],
    metadata: {description: "Book a service"}
  }
]
       ↓
Agent makes x402 payment request to discovered endpoint
       ↓
AgentPay processes payment via SmartEscrow
       ↓
Service booked ✅
```

---

## IMPLEMENTATION STEPS

### Phase 1: Convert AgentPay API to x402-Compatible (2-3 weeks)

#### Step 1: Register x402 Scheme (Express Middleware)

**File:** `x402-agent-network/src/middleware/x402-payment.ts`

```typescript
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import {
  bazaarResourceServerExtension,
  declareDiscoveryExtension,
} from "@x402/extensions/bazaar";

// Create facilitator client (CDP for production)
const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://api.cdp.coinbase.com/platform/v2/x402/facilitator",
});

// Create x402 resource server
const x402Server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(x402Server);
x402Server.registerExtension(bazaarResourceServerExtension);

export const setupX402Payment = (app: any) => {
  app.use(
    paymentMiddleware(
      {
        // Search endpoint - agents discover services
        "POST /api/v1/search": {
          accepts: {
            scheme: "exact",
            price: "$0.001",
            network: "eip155:1", // Ethereum mainnet
            payTo: process.env.AGENTPAY_WALLET,
          },
          extensions: {
            ...declareDiscoveryExtension({
              input: {
                schema: {
                  properties: {
                    category: { type: "string" },
                    location: { type: "string" },
                    date: { type: "string" },
                  },
                  required: ["category", "location"],
                },
              },
              output: {
                example: {
                  services: [
                    {
                      id: "salon-123",
                      name: "Local Salon",
                      price: 50,
                      availability: ["2026-04-18 2pm", "2026-04-19 10am"],
                    },
                  ],
                },
                schema: {
                  properties: {
                    services: {
                      type: "array",
                      items: {
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          price: { type: "number" },
                          availability: { type: "array" },
                        },
                      },
                    },
                  },
                },
              },
            }),
          },
        },

        // Book endpoint - agents reserve services
        "POST /api/v1/book": {
          accepts: {
            scheme: "exact",
            price: "$0.002",
            network: "eip155:1",
            payTo: process.env.AGENTPAY_WALLET,
          },
          extensions: {
            ...declareDiscoveryExtension({
              input: {
                schema: {
                  properties: {
                    service_id: { type: "string" },
                    booking_time: { type: "string" },
                    customer_wallet: { type: "string" },
                  },
                  required: ["service_id", "booking_time"],
                },
              },
              output: {
                example: {
                  booking_id: "booking-456",
                  status: "confirmed",
                  service_date: "2026-04-18 2pm",
                },
                schema: {
                  properties: {
                    booking_id: { type: "string" },
                    status: { type: "string" },
                    service_date: { type: "string" },
                  },
                },
              },
            }),
          },
        },

        // Payment endpoint - agents pay for services
        "POST /api/v1/pay": {
          accepts: {
            scheme: "exact",
            price: "$0.001", // Meta fee only
            network: "eip155:1",
            payTo: process.env.AGENTPAY_WALLET,
          },
          extensions: {
            ...declareDiscoveryExtension({
              input: {
                schema: {
                  properties: {
                    booking_id: { type: "string" },
                    amount: { type: "number" },
                    customer_wallet: { type: "string" },
                  },
                  required: ["booking_id", "amount"],
                },
              },
              output: {
                example: {
                  transaction_hash: "0x...",
                  status: "settled",
                  escrow_address: "0x...",
                },
                schema: {
                  properties: {
                    transaction_hash: { type: "string" },
                    status: { type: "string" },
                    escrow_address: { type: "string" },
                  },
                },
              },
            }),
          },
        },
      },
      x402Server,
    ),
  );
};
```

#### Step 2: Install x402 Dependencies

```bash
npm install @x402/express @x402/core @x402/evm @x402/extensions
```

#### Step 3: Update Express App

**File:** `x402-agent-network/src/app.ts`

```typescript
import { setupX402Payment } from "./middleware/x402-payment";

// ... existing imports ...

const app = express();

// ... existing middleware ...

// Register x402 payment middleware
setupX402Payment(app);

// ... existing routes ...

// These routes now accept x402 payments
app.post("/api/v1/search", (req, res) => {
  // Bazaar has already verified payment
  // req.x402.verified = true
  // req.x402.payer = "0x..."
  
  const { category, location, date } = req.body;
  const services = searchServices(category, location, date);
  res.json({ services });
});

app.post("/api/v1/book", (req, res) => {
  const { service_id, booking_time, customer_wallet } = req.body;
  const booking = createBooking(service_id, booking_time, customer_wallet);
  res.json(booking);
});

app.post("/api/v1/pay", (req, res) => {
  const { booking_id, amount, customer_wallet } = req.body;
  
  // Lock funds in SmartEscrow
  const escrow = createEscrow({
    booking_id,
    amount,
    customer: customer_wallet,
    provider: getProviderForBooking(booking_id),
  });
  
  res.json({
    transaction_hash: escrow.txHash,
    status: "settled",
    escrow_address: escrow.address,
  });
});
```

---

### Phase 2: Register with Bazaar (1-2 weeks)

#### Step 1: Deploy x402-Compatible Endpoints

Make sure all three endpoints are live and responding to x402 payment requests:
- `POST https://agentpay.com/api/v1/search`
- `POST https://agentpay.com/api/v1/book`
- `POST https://agentpay.com/api/v1/pay`

#### Step 2: Make First Payment Through CDP Facilitator

The Bazaar auto-registers endpoints after the **first successful payment**:

```bash
# Step 1: Query Bazaar (no results yet)
curl https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?type=service

# Step 2: Make x402 payment to AgentPay
# This triggers facilitator to catalog AgentPay's endpoints
# (Implementation via x402 client library)

# Step 3: Query Bazaar again (AgentPay now appears!)
curl https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?type=service
# Returns:
# {
#   items: [
#     {
#       resource: "https://agentpay.com/api/v1/search",
#       accepts: [{scheme: "exact", price: "$0.001"}],
#       metadata: {description: "Search for services"}
#     },
#     ...
#   ]
# }
```

#### Step 3: Verify Registration

Once registered, AgentPay endpoints will appear in Bazaar search:

```bash
curl "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?type=service&limit=20"
```

---

### Phase 3: Integrate with Agent SDKs (2-3 weeks)

#### Step 1: OpenAI ChatGPT Plugin

**File:** `.well-known/openai-gpt-plugin.json`

```json
{
  "schema_version": "v1",
  "name_for_model": "AgentPay",
  "name_for_human": "AgentPay Service Booking",
  "description_for_model": "Search and book services via AgentPay x402 marketplace",
  "description_for_human": "Book services with autonomous payment",
  "auth": {
    "type": "none"
  },
  "api": {
    "type": "openapi",
    "url": "https://agentpay.com/openapi.json",
    "is_user_action_confirmed": false
  },
  "logo_url": "https://agentpay.com/logo.png",
  "contact_email": "x402agentpay@gmail.com",
  "legal_info_url": "https://agentpay.com/legal"
}
```

#### Step 2: MCP Server for Claude/Cursor

**File:** `src/mcp-server.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "agentpay-mcp",
  version: "1.0.0",
});

// Tool: Search for services
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "search_services") {
    const { category, location, date } = request.params.arguments;
    
    // Make x402 payment request
    const response = await fetch("https://agentpay.com/api/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-402-Payment": generateX402Header(),
      },
      body: JSON.stringify({ category, location, date }),
    });
    
    return { content: [{ type: "text", text: JSON.stringify(await response.json()) }] };
  }
});

// Tool: Book a service
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "book_service") {
    const { service_id, booking_time } = request.params.arguments;
    
    const response = await fetch("https://agentpay.com/api/v1/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-402-Payment": generateX402Header(),
      },
      body: JSON.stringify({ service_id, booking_time }),
    });
    
    return { content: [{ type: "text", text: JSON.stringify(await response.json()) }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## CUSTOMER JOURNEY (WITH BAZAAR)

### Before (Without Bazaar)
```
User: "Book me a salon appointment"
Agent: "I need to know the salon name"
User: "Any salon near me"
Agent: "I don't have a directory of salons"
User: ❌ Can't complete
```

### After (With Bazaar)
```
User: "Book me a salon appointment"
Agent: 1. Queries Bazaar: GET /discovery/resources?type=salon
       2. Gets list: [Salon A, Salon B, Salon C]
       3. Queries availability via x402 payment
       4. Shows options: "Salon A @ 2pm, $50" or "Salon B @ 3pm, $45"
User: "Book Salon A at 2pm"
Agent: 1. Makes x402 payment for booking
       2. Creates escrow for $50
       3. Confirms: "Booked! See you Saturday at 2pm"
User: ✅ Complete
```

---

## REVENUE MODEL: BAZAAR INTEGRATION

### Discovery Cost
- Bazaar listing: **FREE** (auto-registered after first payment)
- Discovery queries: **$0.001 per search** (agent pays)
- AgentPay cut: **50% of discovery fee** ($0.0005)

### Booking Cost
- Service booking: **$0.002 flat** (agent pays)
- AgentPay cut: **100%** ($0.002)

### Service Cost
- Provider sets price: **$X per service**
- AgentPay fee: **2-3% of service price**
- Escrow settlement: **Automatic on completion**

### Revenue per Booking
```
Example: $50 salon appointment

Discovery: Agent pays $0.001 → AgentPay gets $0.0005
Booking: Agent pays $0.002 → AgentPay gets $0.002
Service: $50 → AgentPay gets $1.00-$1.50

Total per booking: $1.00+ in x402 fees + 2-3% service
```

### Projected Volume
```
Month 1: 100 bookings = $100-200
Month 3: 10K bookings = $10K-20K
Month 6: 100K bookings = $100K-200K
Year 1: 1M bookings = $1M+
```

---

## COMPETITIVE ADVANTAGES

| Aspect | Traditional | AgentPay + Bazaar |
|--------|------------|-------------------|
| Discovery | Manual (ChatGPT doesn't know) | Automatic (Bazaar queries) |
| Payment | Credit card (human approval) | x402 (instant, autonomous) |
| Integration | Hard-coded ChatGPT plugins | Open discovery API |
| Trust | Brand-based | Blockchain escrow |
| Scale | Slow (per-integration) | Fast (all x402-compatible) |

---

## PATENT IMPACT

### New Claims to Add (17-20)

**Claim 17:** Integration with x402 Bazaar discovery layer
- Method for registering service endpoints on Bazaar
- Auto-discovery after first x402 payment
- Automatic cataloging of discovery metadata

**Claim 18:** Autonomous agent service discovery
- Agent queries Bazaar for available services
- Agent evaluates pricing/availability
- Agent initiates x402 payment autonomously

**Claim 19:** Combined discovery + payment + escrow
- Unified workflow for autonomous commerce
- No human intervention required
- Complete agent autonomy from search to completion

---

## TIMELINE

### Week 1-2: x402 Integration
- [ ] Install x402 dependencies
- [ ] Convert /search, /book, /pay to x402-compatible
- [ ] Test payment flows
- [ ] Deploy to staging

### Week 3: Bazaar Registration
- [ ] Make first payment through CDP facilitator
- [ ] Verify auto-registration
- [ ] Test discovery queries
- [ ] Deploy to production

### Week 4: Agent Integration
- [ ] Create OpenAI ChatGPT plugin
- [ ] Create MCP server for Claude/Cursor
- [ ] Test end-to-end agent workflows
- [ ] Publish to plugin stores

### Week 5-6: Scale & Optimize
- [ ] Monitor Bazaar discoverability
- [ ] Optimize pricing/fees
- [ ] Add more service categories
- [ ] Onboard first providers

---

## NEXT STEPS

1. **Start Phase 1 immediately** (x402 middleware)
   - Install @x402/express packages
   - Convert 3 main endpoints to x402-compatible
   - Deploy to staging for testing

2. **Validate with test payment** (Phase 2)
   - Make small test payment through CDP facilitator
   - Verify endpoints appear in Bazaar
   - Test discovery queries

3. **Deploy agent integrations** (Phase 3)
   - ChatGPT plugin submission
   - MCP server for Claude/Cursor
   - Test end-to-end workflows

4. **Update patent documentation**
   - Add 4-5 new claims (17-21)
   - Document Bazaar integration advantage
   - Strengthen competitive moat

---

**Status:** Ready to implement Phase 1 immediately

**Key File to Start:** `x402-agent-network/src/middleware/x402-payment.ts`

**Success Metric:** AgentPay endpoints discoverable in Bazaar within 2 weeks
