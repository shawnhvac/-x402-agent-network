# AgentPay Tech Stack & Wallet Integration
**April 14, 2026 - 22:38 UTC**

---

## What You Already Have (LEVERAGE)

### Infrastructure
✅ **Server already running** - x402-agent-pay.com
✅ **Domain + SSL** - Caddy reverse proxy
✅ **Existing codebase** - Can repurpose

### Payment Processing
✅ **Stripe account** - Fallback for credit cards
✅ **OpenAPI account** - Primary for credit cards
✅ **SmartEscrow deployed** - Solana mainnet (6Pi1hfuX8x3vzF3EW1YEN43ZkCdNdQDpHRdzg47CnBED)

### Development Assets
✅ **Android agent system** - 1,946 lines Kotlin (reuse)
✅ **GitHub repo** - Public, organized
✅ **OX team** - 62 specialized profiles

**Advantage: You can move FAST because infrastructure exists.**

---

## Web Stack (Marketplace)

### Frontend
```
Framework: React + TypeScript
├─ Why: Fast development, existing knowledge
├─ Libraries:
│  ├─ Next.js (SSR, routing, optimization)
│  ├─ TailwindCSS (styling)
│  ├─ React Query (data fetching)
│  ├─ Zustand (state management)
│  └─ Solana Web3.js (wallet integration)
└─ Build: npm/yarn

Pages needed:
├─ Homepage (marketing, sign up)
├─ Provider dashboard (bookings, analytics)
├─ Search/marketplace (find services)
├─ Booking confirmation (payment)
├─ Admin dashboard (stats, moderation)
└─ Settings (profile, payment methods)
```

### Backend
```
Runtime: Node.js + Express (or Fastify)
├─ Why: Matches existing, fast to deploy
├─ Framework: Express.js or Fastify
├─ Language: TypeScript
├─ Structure:
│  ├─ /api/v1/search (marketplace search)
│  ├─ /api/v1/book (create booking)
│  ├─ /api/v1/providers (provider management)
│  ├─ /api/v1/payments (payment processing)
│  ├─ /api/v1/wallets (crypto integration)
│  └─ /api/v1/admin (moderation)
│
└─ Libraries:
   ├─ Express / Fastify (HTTP)
   ├─ Prisma (database ORM)
   ├─ JWT (authentication)
   ├─ Stripe SDK (credit cards)
   ├─ @solana/web3.js (Solana integration)
   ├─ @coral-xyz/anchor (SmartEscrow calls)
   └─ Bull (job queue for async tasks)
```

### Database
```
PostgreSQL (existing, proven)
├─ Tables needed:
│  ├─ users (ChatGPT users)
│  ├─ providers (service providers)
│  ├─ services (salons, mechanics, etc.)
│  ├─ bookings (reservations)
│  ├─ ratings (feedback)
│  ├─ transactions (payment records)
│  ├─ wallets (Solana keypairs, encrypted)
│  └─ jobs (background processing)
│
└─ Indexes: location, timestamp, status
```

### API Documentation
```
OpenAPI / Swagger
├─ Auto-generate from code
├─ /api/v1/docs endpoint
└─ For ChatGPT plugin integration
```

### Deployment
```
Existing server: x402-agent-pay.com
├─ Caddy (reverse proxy) - already running
├─ Node.js backend (Express)
├─ PostgreSQL database
├─ Redis (caching, job queue)
└─ SSL: Already configured
```

---

## Mobile Stack (Provider Dashboard APK)

### Technology
```
Android (Kotlin + Jetpack Compose)
├─ Reuse: AgentIntegration system (1,946 lines)
├─ Add: Provider dashboard UI
├─ Framework: Jetpack Compose (modern)
├─ Language: Kotlin
└─ Features:
   ├─ Real-time bookings
   ├─ Calendar integration
   ├─ Payment updates
   ├─ Notifications
   ├─ Crypto wallet integration
   └─ Settings

Build: Gradle 8.0
Deploy: APK download + Play Store (future)
```

### Components to Add
```
Provider Dashboard:
├─ BookingsViewModel (fetch, update)
├─ AnalyticsView (earnings, charts)
├─ SettingsView (hours, pricing)
├─ NotificationService (push notifications)
├─ PaymentHistoryView (earnings tracking)
└─ WalletIntegrationView (Phantom, Solflare)

Already exist (reuse):
├─ AgentIntegration.kt (base)
├─ AgentAPIListener.kt (HTTP server)
├─ SolanaIntegration.kt (wallet connection)
└─ SmartEscrowClient.kt (contract interaction)
```

---

## ChatGPT Plugin (Manifest + Integration)

### What's Needed
```
Plugin manifest (openai-ai-plugin.json):
├─ API endpoint: https://api.agentpay.com/v1
├─ Authentication: Bearer token
├─ Functions:
│  ├─ search_providers (find salons/mechanics)
│  ├─ book_service (create reservation)
│  ├─ get_booking_status (track)
│  └─ rate_provider (feedback)
│
└─ Description for marketplace
```

### Integration Code
```typescript
// ChatGPT calls this endpoint
POST /api/v1/search
{
  "service": "haircut",
  "location": {lat, lon},
  "budget": 50,
  "when": "tomorrow 2pm"
}

// Returns
[
  {
    "id": "salon_123",
    "name": "Great Clips",
    "distance": 0.5,
    "price": 25,
    "rating": 4.8,
    "available_slots": ["2:00pm", "2:30pm", "3:00pm"],
    "image": "url"
  }
]
```

### Submission Process
```
1. Get approved by OpenAI (2-4 weeks)
2. Plugin available in ChatGPT plugin store
3. Users enable: "AgentPay" plugin
4. Automatic access
```

---

## Wallet Integration (The Big Feature)

### Why This Matters
```
Current state:
├─ Credit cards via OpenAPI/Stripe
├─ Works for traditional users
└─ Good for 80% of market

With crypto wallets:
├─ Native Web3 users (10M+ Solana)
├─ Phantom users (2M+)
├─ Solflare users (1M+)
├─ Jupiter users (API integration)
├─ Total addressable: ~20% of users
└─ Plus: Bypass credit card fees (2.9%)
```

### Implementation Complexity

**Solflare Integration: EASY (2-3 days)**
```
How it works:
1. User clicks "Connect Solflare"
2. Solflare modal appears
3. User approves connection
4. Get user's Solana address
5. Can make payments

Code (React):
```typescript
import { Solflare } from '@solflare-wallet/sdk';

const solflare = new Solflare();
await solflare.connect();
const address = solflare.publicKey;
// Now you can request signatures/transfers
```

Time: 1-2 days
Difficulty: Easy
Code lines: ~100

**Phantom Integration: EASY (2-3 days)**
```
How it works:
1. User clicks "Connect Phantom"
2. Phantom extension/mobile prompt
3. User approves
4. Get address, can sign transactions

Code (React):
```typescript
const connectPhantom = async () => {
  const response = await window.solana.connect();
  const address = response.publicKey;
  // Can now transfer USDC
};
```

Time: 1-2 days
Difficulty: Easy
Code lines: ~100

**Jupiter Integration: MEDIUM (4-5 days)**
```
Why Jupiter?
├─ Best prices for swaps
├─ Can convert any token → USDC
├─ Built-in routing
├─ High liquidity

How it works:
1. User has SOL, wants to pay with USDC
2. Jupiter automatically swaps
3. USDC sent to provider
4. Minimal slippage

Code (API):
```typescript
import { Jupiter } from '@jup.ag/api';

const jupiter = new Jupiter({
  cluster: 'mainnet-beta'
});

// Quote SOL → USDC
const quote = await jupiter.computeRoutes({
  inputMint: SOL_MINT,
  outputMint: USDC_MINT,
  amount: 50_000_000, // 50 SOL in lamports
  slippageBps: 50 // 0.5% slippage
});

// Execute swap
const swap = await jupiter.exchange({
  route: quote.routePlan[0],
  userPublicKey: userAddress
});
```

Time: 3-4 days
Difficulty: Medium
Code lines: ~200-300
```

**SmartEscrow Integration: ALREADY DONE**
```
Reuse existing:
├─ SmartEscrowClient.kt (Android)
├─ SmartEscrow.rs (deployed on mainnet)
├─ Contract: 6Pi1hfuX8x3vzF3EW1YEN43ZkCdNdQDpHRdzg47CnBED
└─ Status: Production ready

New additions:
├─ Web version (JavaScript/TypeScript)
├─ Can call from React backend
├─ Sign transactions in user's wallet
└─ Handle escrow deposits/releases
```

---

## Full Wallet Integration (Week 1.5)

### Total Complexity: MEDIUM (5-7 days)

### Architecture
```
User selects payment method:
├─ Credit card (OpenAPI/Stripe)
│  ├─ Process immediately
│  └─ 2-3% fee
│
├─ Phantom wallet
│  ├─ Connect to user's account
│  ├─ Transfer USDC directly
│  ├─ No fee (on-chain only)
│  └─ 1 transaction
│
├─ Solflare wallet
│  ├─ Same as Phantom
│  ├─ Alternative provider
│  └─ No fee
│
└─ Jupiter swap (SOL → USDC)
   ├─ If user has SOL, not USDC
   ├─ Automatic swap
   ├─ Min slippage routing
   └─ Transfer USDC to provider
```

### Backend Code (Node.js)
```typescript
// File: src/services/walletService.ts

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, transfer } from '@solana/spl-token';
import { Jupiter } from '@jup.ag/api';

export class WalletService {
  private connection: Connection;
  private jupiter: Jupiter;

  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com');
    this.jupiter = new Jupiter({ cluster: 'mainnet-beta' });
  }

  // Pay with Phantom/Solflare USDC
  async payWithWallet(
    userAddress: string,
    providerAddress: string,
    amountUSDC: number,
    walletType: 'phantom' | 'solflare'
  ) {
    const amount = amountUSDC * 1_000_000; // USDC has 6 decimals

    // Build transfer instruction
    const ix = await transfer(
      this.connection,
      new PublicKey(userAddress),
      new PublicKey(providerAddress),
      new PublicKey(userAddress),
      amount
    );

    // Return transaction for signing
    return { instruction: ix, signers: [] };
  }

  // Pay with SOL (auto-swap to USDC)
  async payWithJupiterSwap(
    userAddress: string,
    providerAddress: string,
    amountUSDC: number
  ) {
    const SOL_MINT = 'So11111111111111111111111111111111111111112';
    const USDC_MINT = 'EPjFWaLb3odccxGLZsy41PUwoh6zWEsbgqwxDcNF3g8';

    // Get quote for SOL amount needed
    const quote = await this.jupiter.computeRoutes({
      inputMint: SOL_MINT,
      outputMint: USDC_MINT,
      amount: amountUSDC * 1_000_000,
      slippageBps: 50
    });

    // Execute swap and transfer
    const swap = await this.jupiter.exchange({
      route: quote.routePlan[0],
      userPublicKey: new PublicKey(userAddress)
    });

    return swap;
  }

  // SmartEscrow payment (for autonomous agents)
  async payWithSmartEscrow(
    bookingId: string,
    amount: number,
    provider: string
  ) {
    // Use existing SmartEscrowClient
    // Already deployed, ready to go
    const tx = await this.smartEscrowClient.createEscrow({
      bookingId,
      amount,
      provider
    });
    return tx;
  }
}

// Usage in booking endpoint
app.post('/api/v1/book', async (req, res) => {
  const { bookingId, amount, paymentMethod, userAddress } = req.body;

  if (paymentMethod === 'phantom' || paymentMethod === 'solflare') {
    // Wallet payment
    const tx = await walletService.payWithWallet(
      userAddress,
      PROVIDER_WALLET,
      amount,
      paymentMethod
    );
    res.json({ tx, status: 'pending_signature' });
  } else if (paymentMethod === 'jupiter') {
    // Auto-swap SOL to USDC
    const tx = await walletService.payWithJupiterSwap(
      userAddress,
      PROVIDER_WALLET,
      amount
    );
    res.json({ tx, status: 'swapping' });
  } else if (paymentMethod === 'credit_card') {
    // Stripe/OpenAPI
    const charge = await stripeService.charge(amount);
    res.json({ status: 'charged' });
  }
});
```

### Frontend Code (React)
```typescript
// File: src/components/PaymentModal.tsx

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function PaymentModal({ booking }) {
  const { publicKey, signTransaction } = useWallet();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const handlePhantomPayment = async () => {
    const response = await fetch('/api/v1/book', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: booking.id,
        amount: booking.amount,
        paymentMethod: 'phantom',
        userAddress: publicKey.toString()
      })
    });

    const { tx } = await response.json();

    // User signs in Phantom
    const signed = await signTransaction(tx);
    const confirmed = await connection.sendRawTransaction(signed.serialize());
    
    console.log('Payment confirmed:', confirmed);
  };

  return (
    <div>
      <h2>Choose Payment Method</h2>
      
      <button onClick={() => setPaymentMethod('credit_card')}>
        💳 Credit Card
      </button>
      
      <button onClick={() => setPaymentMethod('phantom')}>
        <WalletMultiButton /> Phantom Wallet
      </button>

      <button onClick={() => setPaymentMethod('solflare')}>
        🌐 Solflare Wallet
      </button>

      <button onClick={() => setPaymentMethod('jupiter')}>
        💱 Jupiter Swap (SOL → USDC)
      </button>

      {paymentMethod === 'credit_card' && (
        <StripePaymentForm amount={booking.amount} />
      )}

      {(paymentMethod === 'phantom' || paymentMethod === 'solflare') && (
        <button onClick={handlePhantomPayment}>
          Pay {booking.amount} USDC
        </button>
      )}

      {paymentMethod === 'jupiter' && (
        <button onClick={handleJupiterSwap}>
          Swap SOL & Pay {booking.amount} USDC
        </button>
      )}
    </div>
  );
}
```

---

## Full Tech Stack Summary

### Web
```
Frontend: Next.js + React + TailwindCSS + Solana Web3.js
Backend: Node.js + Express + TypeScript
Database: PostgreSQL + Redis
API: REST + OpenAPI/Swagger
Auth: JWT + Solana signing
Payment: Stripe + OpenAPI + Solana native
Deploy: Existing server (x402-agent-pay.com)
```

### Mobile
```
Platform: Android (Kotlin + Jetpack Compose)
Features: Booking mgmt + wallet integration
Build: Gradle 8.0
Deploy: APK + Play Store
```

### Integrations
```
ChatGPT: Plugin manifest + API endpoints
Stripe: Credit card fallback
OpenAPI: Primary credit card processor
Phantom: Wallet integration
Solflare: Wallet integration
Jupiter: Swap routing
Solana: SmartEscrow + USDC transfers
```

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Repurpose existing code
- [ ] Backend API setup (search, book, rate)
- [ ] Database schema
- [ ] Credit card integration (Stripe/OpenAPI)
- **Time: 40 hours**

### Week 1.5: Wallet Integration
- [ ] Phantom wallet connector
- [ ] Solflare wallet connector
- [ ] Jupiter swap integration
- [ ] SmartEscrow web integration
- **Time: 20 hours (do in parallel)**

### Week 2: Frontend
- [ ] Provider dashboard
- [ ] Payment modal
- [ ] Settings/profile
- [ ] Analytics view
- **Time: 40 hours**

### Week 3: Mobile APK
- [ ] Repurpose Android code
- [ ] Provider dashboard UI
- [ ] Wallet integration
- [ ] Build & test
- **Time: 30 hours**

### Week 4: Testing & Polish
- [ ] ChatGPT plugin integration
- [ ] Real provider testing
- [ ] Bug fixes
- [ ] Deploy to production
- **Time: 20 hours**

**Total: 150 hours (~4 weeks, FTE)**

---

## Wallet Integration Difficulty Breakdown

| Feature | Difficulty | Time | Impact |
|---------|-----------|------|--------|
| Phantom | Easy | 1-2 days | High (2M+ users) |
| Solflare | Easy | 1-2 days | High (1M+ users) |
| Jupiter | Medium | 3-4 days | Medium (SOL→USDC swap) |
| SmartEscrow | Already done | 1 day | High (escrow, autonomous) |
| Credit cards | Medium | 2-3 days | Critical (80% users) |

**Recommendation:** Do Phantom + Solflare first (easy, high impact). Then Jupiter (nice to have). Credit cards are critical path.

---

## Risk Mitigation

### If OpenAPI Doesn't Work
- Fallback: Stripe (you already have account)
- 2-3 day switch time

### If Wallet Integration Fails
- Users still have credit cards
- Crypto payment is nice-to-have, not required

### If Solana Network Down
- Can temporarily pause Solana payments
- Credit card fallback available

### If ChatGPT Plugin Rejected
- Still have direct API access
- Can market to other agents
- Telegram bots, Discord bots, etc.

---

## Success Metrics

### Week 1 Complete
- [ ] API deployed
- [ ] Credit card payments working
- [ ] Provider can sign up
- [ ] Real booking works

### Week 2 Complete
- [ ] Wallet integration working
- [ ] Users can pay with Phantom
- [ ] Users can pay with Solflare
- [ ] Jupiter swaps working

### Week 4 Complete
- [ ] Everything deployed
- [ ] First 10 providers testing
- [ ] First real bookings
- [ ] ChatGPT plugin approved

---

## Summary

**You have:**
✅ Server + domain
✅ Existing codebase to repurpose
✅ Stripe account (fallback)
✅ SmartEscrow deployed
✅ Android code

**Wallet integration difficulty:** Medium (5-7 days)
**Is it worth it?** YES - gives users choice, avoids 2.9% credit card fees
**Can you do it?** YES - modern Solana tools make it easy

**Recommendation:** Implement in this order:
1. Credit card (critical path)
2. Phantom (highest ROI)
3. Solflare (good alternative)
4. Jupiter (nice to have)

This gives you maximum coverage with minimum complexity.

🚀🦬
