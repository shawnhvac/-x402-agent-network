# Stripe Integration Setup
**April 14, 2026**

---

## What We Need from Stripe

### 1. API Keys (CRITICAL)
You need to provide:
```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for development)
STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_... for development)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Where to find:**
1. Go to https://dashboard.stripe.com/apikeys
2. Copy the "Secret key" (starts with `sk_live_` or `sk_test_`)
3. Copy the "Publishable key" (starts with `pk_live_` or `pk_test_`)
4. For webhooks: https://dashboard.stripe.com/webhooks
   - Create endpoint for `http://localhost:3001/webhooks/stripe`
   - Listen for: `charge.succeeded`, `charge.failed`, `charge.refunded`
   - Copy the "Signing secret"

### 2. Connected Account Setup (For Provider Payouts)
Optional but recommended:
- Enable "Connect" in Stripe dashboard
- This lets providers connect their own Stripe accounts
- Payouts go directly to their bank

---

## Integration Plan

### Phase 1: Basic Payments (Days 3-4)
1. Accept credit card charges
2. Create transaction record
3. Update booking status
4. Handle errors

### Phase 2: Webhooks (Day 5)
1. Listen for payment success
2. Listen for payment failures
3. Auto-retry logic
4. Notification emails

### Phase 3: Payouts (Day 6)
1. Calculate 2-3% AgentPay fee
2. Schedule provider payout
3. Stripe Connect (if enabled)
4. Manual payout fallback

---

## Code Structure (Ready to Build)

```
agentpay-backend/
├── src/
│   ├── services/
│   │   ├── stripe.service.ts (payment processing)
│   │   ├── payment.service.ts (general payment logic)
│   │   └── payout.service.ts (provider settlements)
│   │
│   ├── routes/
│   │   ├── payments.ts (POST /api/v1/payments)
│   │   └── webhooks.ts (POST /webhooks/stripe)
│   │
│   └── types/
│       └── stripe.types.ts (TypeScript types)
```

---

## What I'll Build (Once You Provide Keys)

### 1. Stripe Service (`stripe.service.ts`)
```typescript
class StripeService {
  // Charge a customer
  async chargeCustomer(amount, currency, description) {}
  
  // Refund a charge
  async refundCharge(chargeId, amount) {}
  
  // Create customer (for recurring)
  async createCustomer(email, name) {}
  
  // Get charge status
  async getCharge(chargeId) {}
}
```

### 2. Payment Route (`/api/v1/payments`)
```typescript
POST /api/v1/payments
{
  "bookingId": "booking_123",
  "amount": 25.00,
  "currency": "usd",
  "cardToken": "tok_visa", // from Stripe.js
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "chargeId": "ch_1ABC123",
  "amount": 25.00,
  "bookingId": "booking_123"
}
```

### 3. Webhook Handler (`/webhooks/stripe`)
```typescript
POST /webhooks/stripe
Headers: stripe-signature: ...

Listen for:
- charge.succeeded → Mark booking as paid
- charge.failed → Mark booking as failed, notify user
- charge.refunded → Process refund
```

### 4. Payout Service (`payout.service.ts`)
```typescript
// Calculate fee (tiered)
function calculateFee(amount) {
  if (amount < 10) return 0.03; // 3%
  if (amount < 50) return 0.025; // 2.5%
  if (amount < 200) return 0.02; // 2%
  if (amount < 1000) return 0.015; // 1.5%
  return 0.01; // 1%
}

// Schedule payout
async function schedulePayout(providerId, amount) {}

// Process payout
async function processPayout(payoutId) {}
```

---

## Setup Checklist

- [ ] Get `STRIPE_SECRET_KEY` from you
- [ ] Get `STRIPE_PUBLISHABLE_KEY` from you
- [ ] Get `STRIPE_WEBHOOK_SECRET` from you
- [ ] Add to `.env`
- [ ] Test with `sk_test_...` keys first
- [ ] Build Stripe service
- [ ] Build payment endpoint
- [ ] Build webhook handler
- [ ] Test with test credit card
- [ ] Switch to live keys (when ready)

---

## Test Credit Cards (For Development)

Once we have test keys, use these to test:
```
Successful payment:
Card: 4242 4242 4242 4242
Exp: 12/25
CVC: 123

Failed payment:
Card: 4000 0000 0000 0002
Exp: 12/25
CVC: 123

Insufficient funds:
Card: 4000 0000 0000 9995
Exp: 12/25
CVC: 123
```

---

## Webhook Testing (Local Development)

Use Stripe CLI to test webhooks locally:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Listen for webhook events
stripe listen --forward-to localhost:3001/webhooks/stripe

# Get webhook signing secret from CLI output
# Add to .env as STRIPE_WEBHOOK_SECRET

# Trigger test event in another terminal
stripe trigger charge.succeeded
```

---

## Cost Analysis

Stripe charges:
- Transaction fee: 2.9% + $0.30 (standard pricing)
- You take 2-3% from provider
- Margin: Depends on your fee

Example:
```
$25 haircut
├─ Your 2.5% fee: $0.63
├─ Stripe fee: $1.03 (2.9% + $0.30)
├─ Provider receives: $23.34
└─ AgentPay loss: -$0.40 (on first transactions)

But: As volume grows, Stripe fees decrease
     Once you hit $1M/month: Can negotiate better rates
```

---

## Security Notes

- Store STRIPE_SECRET_KEY in environment only (never in code)
- Never store credit card numbers (Stripe handles it)
- Use HTTPS in production
- Verify webhook signature (I'll implement)
- Enable 3D Secure for fraud prevention

---

## Timeline

**When you provide keys:**
- Day 3 (4 hours): Build Stripe service + payment endpoint
- Day 4 (3 hours): Build webhook handler + testing
- Day 5 (3 hours): Build payout scheduler + provider notifications

Total: 10 hours

---

## I'm Ready For

1. **STRIPE_SECRET_KEY** (starts with `sk_`)
2. **STRIPE_PUBLISHABLE_KEY** (starts with `pk_`)
3. **STRIPE_WEBHOOK_SECRET** (from webhook endpoint setup)

Once you send these, I can:
1. Update `.env`
2. Build Stripe service (90 lines)
3. Build payment endpoint (50 lines)
4. Build webhook handler (70 lines)
5. Test everything with test cards

---

## Send Me

Just paste your three Stripe keys in the next message:

```
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

I'll add them to the `.env` and build the integration immediately.

---

**Status:** Waiting for your Stripe keys 🚀
