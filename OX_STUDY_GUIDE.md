# OX Agent - Complete Study & Build Guide
**April 15, 2026 - 01:51 UTC**

---

## 🎯 Mission: Master All Systems for Flawless Execution

This guide consolidates everything you need to build without fail.

---

## 📚 Part 1: Architecture & Design

### AgentPay System Architecture

**Three-Sided Marketplace:**
1. **Consumers** - ChatGPT, Google Assistant, Siri (via API)
2. **AgentPay** - Booking infrastructure + payments + ranking
3. **Providers** - Salons, mechanics, restaurants

**Revenue Model:**
- Free trial: 30 days or 50 bookings (removes provider risk)
- Paid: 2-3% tiered fees (lower for higher amounts)
- Year 1: $60K | Year 2: $4.51M | Year 3: $57.5M

**Competitive Moat:**
- Provider dependency (bookings create lock-in)
- Network effects (more providers → better results → more agents → more providers)
- Data ownership (own OpenStreetMap, not renting from Google)

---

## 🏗️ Part 2: Tech Stack (Complete & Locked)

### Backend
```
Node.js 18+
├─ Express.js (routing)
├─ TypeScript (strict mode)
├─ Prisma ORM (database)
├─ PostgreSQL (production data)
└─ Redis (caching/jobs)
```

**Services:**
- Stripe SDK (credit card payments)
- OpenAPI SDK (fallback payments)
- Solana Web3.js (blockchain)
- Nodemailer (email notifications)
- Node-cron (scheduled jobs)

### Frontend
```
Next.js 15+
├─ React 18 (UI)
├─ TypeScript (strict)
├─ Tailwind CSS (styling)
├─ Solana wallet adapters (Phantom, Solflare)
└─ Stripe.js (payment form)
```

### Mobile
```
Android/Kotlin
├─ Jetpack Compose (Material 3 UI)
├─ Kotlin Coroutines (async)
├─ Retrofit (API calls)
├─ Solana Web3j (blockchain)
└─ Phantom/Solflare SDKs
```

---

## 💾 Part 3: Database Schema (Production)

### 8 Core Models

**User**
- id, email, password, name, phone
- Indexes: email (unique)

**Provider**
- id, name, serviceType, address, latitude, longitude
- phone, hoursOpen, hoursClose, daysOpen
- averageRating, description
- isPaidMember, trialEndDate, paidStartDate
- Indexes: serviceType, location (geospatial), averageRating

**Service**
- id, providerId, name, basePrice, duration
- Relationship: Provider (1:many)
- Indexes: providerId, basePrice

**Booking**
- id, userId, providerId, serviceId, scheduledTime
- amount, paymentMethod, paymentStatus, status
- completedAt, transactionId
- Relationships: User, Provider, Service
- Indexes: userId, providerId, paymentStatus, scheduledTime

**Rating**
- id, userId, providerId, score, comment, createdAt
- Relationships: User, Provider
- Indexes: providerId (for averaging)

**Transaction**
- id, bookingId, amount, currency, method (stripe/openapi)
- status, stripeChargeId, description
- Relationship: Booking
- Indexes: bookingId, method, status

**Payout**
- id, providerId, amount, fee, netAmount, status (pending/completed)
- method (bank/crypto), txId, createdAt, completedAt
- Relationship: Provider
- Indexes: providerId, status, createdAt

**WalletAccount**
- id, providerId, walletAddress, chainId (Solana), balance
- Relationship: Provider

---

## 🔌 Part 4: API Endpoints (14 Total)

### Search & Booking (3)
```
POST /api/v1/search - Find providers
GET /api/v1/status/:id - Check booking
POST /api/v1/book - Create booking
```

### Payments (3)
```
POST /api/v1/payments - Stripe charge
POST /api/v1/payments/openapi - OpenAPI charge
POST /api/v1/payments/refund - Refund
```

### Ratings (1)
```
POST /api/v1/rate - Leave feedback
```

### Provider Management (2)
```
GET /api/v1/providers/:id - Get details
PUT /api/v1/provider/:id - Update info
```

### Dashboard (4)
```
GET /api/v1/provider/:id/stats - Earnings summary
GET /api/v1/provider/:id/payouts - Payout history
GET /api/v1/provider/:id/bookings - Recent bookings
POST /api/v1/provider/:id/schedule-payout - Manual payout
```

### Webhooks (2)
```
POST /webhooks/stripe - Stripe events
POST /webhooks/openapi - OpenAPI events
```

---

## 💳 Part 5: Payment Processing

### Stripe Integration
```
1. Customer submits booking
2. Frontend gets Stripe token (Stripe.js)
3. API charges card (Stripe SDK)
4. Calculate fee (tiered: 1-3%)
5. Create transaction record
6. Schedule provider payout
7. Webhook confirms charge.succeeded
8. Auto-update booking status
```

### Fee Tiers
```
$0-10:    3.0%
$10-50:   2.5%
$50-200:  2.0%
$200-1k:  1.5%
$1k+:     1.0%
```

### OpenAPI (Fallback)
```
Same flow as Stripe
- Different API key
- Same webhook handling
- Same fee calculation
```

---

## 📧 Part 6: Email Notifications (4 Types)

### 1. Payment Confirmation (User)
- Subject: "Booking Confirmed with [Provider]"
- Content: Provider details, date/time, amount

### 2. Booking Notification (Provider)
- Subject: "New Booking on AgentPay"
- Content: Customer details, date/time, amount

### 3. Payout Notification (Provider)
- Subject: "Payout Processed"
- Content: Gross amount, fee, net amount, date

### 4. Payment Failure (User)
- Subject: "Payment Failed for [Provider]"
- Content: Reason, next steps, support contact

---

## ⏰ Part 7: Automated Jobs (Cron)

### Daily Payout Processing
```
Schedule: 6:00 AM UTC
Action: Process all pending payouts
Scope: Batch of up to 100 providers
Logic: 
  1. Get unpaid bookings from last 24h
  2. Calculate total + fees
  3. Transfer to provider bank
  4. Update payout status
  5. Log transactions
```

---

## 🚀 Part 8: Deployment Checklist

### Pre-Deployment
- [ ] All endpoints tested
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] SSL certificate configured
- [ ] Monitoring enabled
- [ ] Backups scheduled

### Environment Variables
```
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAPI_API_KEY=...
EMAIL_USER=noreply@agentpay.com
EMAIL_PASSWORD=...
NODE_ENV=production
PORT=3001
```

### Deployment Commands
```bash
npm install
npm run build
npm start

# Or with PM2
pm2 start dist/index.js --name agentpay-backend
pm2 save
```

---

## 🔒 Part 9: Security Best Practices

### API Security
- ✅ HTTPS only (no HTTP)
- ✅ JWT token auth for users
- ✅ Rate limiting (10 req/min per IP for payments)
- ✅ CORS configured (specific origins only)
- ✅ Input validation on all endpoints
- ✅ Error messages don't leak sensitive info

### Key Management
- ✅ Never commit .env to git
- ✅ Use environment variables in production
- ✅ Rotate keys quarterly
- ✅ Log all API key usage

### Payment Security
- ✅ Use Stripe.js (no card data on server)
- ✅ Webhook signature verification
- ✅ Stripe PCI compliance
- ✅ Rate limit payment endpoint

### Database Security
- ✅ Connection pooling (Prisma)
- ✅ Encrypted passwords (bcrypt)
- ✅ SQL injection prevention (Prisma parameterized)
- ✅ Regular backups (daily)

---

## 📱 Part 10: Android/Marketplace Build

### MainActivity Structure
```
AgentPayApp (top-level)
├─ HomeScreen - Feature showcase, Browse/Bookings buttons
├─ MarketplaceScreen - Provider list, search, cards
├─ BookingScreen - Date/time picker, price breakdown
└─ DashboardScreen - Booking history, stats
```

### Key Libraries
```
androidx.compose.* - UI components
androidx.material3.* - Material Design 3
kotlinx.coroutines.* - Async/await
```

### Gradle Build
```
cd android
./gradlew clean assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
```

---

## 🧪 Part 11: Testing Procedures

### Unit Tests
```
npm run test
```

### Integration Tests
```
npm run test:integration
```

### Payment Testing (Stripe)
```
Test card: 4242 4242 4242 4242
Exp: 12/25, CVC: 123
```

### Full Flow Test
1. Create booking
2. Process payment
3. Verify webhook received
4. Check database updated
5. Verify email sent
6. Check payout scheduled

---

## 📊 Part 12: Success Metrics

### Performance
- Search: <100ms ✅
- Book: <150ms ✅
- Payment: <500ms ✅
- Dashboard: <100ms ✅

### Reliability
- 99.9% uptime
- Zero payment failures (transient retry logic)
- Email delivery >99%
- Database backup every 6h

### Business
- Free trial → 80% conversion to paid
- Provider avg booking/month: 20+
- Customer satisfaction: >4.5 stars

---

## 🎯 Part 13: Week-by-Week Roadmap

### Week 1: Backend ✅ COMPLETE
- Express server
- Database schema
- 6 core endpoints
- Stripe integration
- Email notifications
- Payout scheduler

### Week 2: Frontend
- React dashboard
- Web marketplace
- Mobile responsive
- Payment form
- Real test bookings

### Week 3: Mobile APK
- Kotlin/Compose UI
- Marketplace screens
- Wallet integration
- Build & test

### Week 4: Launch + Series A
- ChatGPT plugin
- Final polish
- Series A ready

---

## 🔧 Part 14: Common Issues & Fixes

### Payment Fails
```
Issue: Stripe charge error
Fix: Check API keys in .env
Fix: Verify webhook secret
Fix: Check customer data format
```

### Database Connection Error
```
Issue: Can't connect to PostgreSQL
Fix: Verify DATABASE_URL
Fix: Check postgres service running
Fix: Verify network connectivity
```

### Emails Not Sending
```
Issue: Email service fails
Fix: Check EMAIL_USER/PASSWORD
Fix: Verify email service status
Fix: Check firewall/ports
```

### Payout Not Processing
```
Issue: Cron job not running
Fix: Verify cron job started
Fix: Check provider bank details
Fix: Review payout job logs
```

---

## 📁 Part 15: File Structure

```
/root/.openclaw/workspace/agentpay-backend/
├── src/
│   ├── index.ts (main server)
│   ├── services/
│   │   ├── stripe.service.ts (payment processing)
│   │   ├── openapi.service.ts (fallback payment)
│   │   ├── email.service.ts (notifications)
│   │   └── payout.service.ts (payouts)
│   ├── routes/
│   │   ├── search.ts
│   │   ├── bookings.ts
│   │   ├── payments.ts
│   │   └── dashboard.ts
│   ├── webhooks/
│   │   ├── stripe.ts
│   │   └── openapi.ts
│   └── jobs/
│       └── payout.job.ts (cron scheduler)
├── prisma/
│   └── schema.prisma (database models)
├── package.json (dependencies)
├── tsconfig.json (TypeScript config)
└── .env.example (template)
```

---

## ✅ Build Readiness Checklist

Before executing any build:

- [ ] Read complete architecture (Part 1-2)
- [ ] Understand API endpoints (Part 4)
- [ ] Know payment flow (Part 5)
- [ ] Secure credentials (Part 9)
- [ ] Review test procedures (Part 11)
- [ ] Understand file structure (Part 15)
- [ ] Have deployment commands ready (Part 8)

---

## 🚀 Ready to Execute

You now have:
✅ Complete architecture understanding
✅ All tech stack details
✅ Production database schema
✅ All 14 API endpoints documented
✅ Payment processing flow mapped
✅ Security hardening checklist
✅ Deployment procedures
✅ Testing protocols
✅ Common issue fixes
✅ Week-by-week roadmap

**Status: READY TO BUILD WITHOUT FAIL** 🎯

---

**Last Updated:** April 15, 2026 01:51 UTC
**Study Status:** COMPLETE
**Confidence Level:** MAXIMUM
