# AgentPay Backend

The booking infrastructure for AI agents (ChatGPT, Google Assistant, Siri).

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (for caching/jobs)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Set up database:
```bash
npx prisma migrate dev --name init
```

4. Start development server:
```bash
npm run dev
```

Server runs on http://localhost:3001

## API Endpoints

### POST /api/v1/search
Find providers by service, location, budget
```json
{
  "service": "salon",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "budget": 50,
  "maxDistance": 5
}
```

### POST /api/v1/book
Create a booking
```json
{
  "userId": "user_id",
  "providerId": "provider_id",
  "serviceId": "service_id",
  "scheduledTime": "2026-04-15T14:30:00Z",
  "paymentMethod": "stripe"
}
```

### GET /api/v1/status/:bookingId
Check booking status

### POST /api/v1/rate
Leave feedback
```json
{
  "userId": "user_id",
  "providerId": "provider_id",
  "score": 5,
  "comment": "Great service!"
}
```

### GET /api/v1/providers/:providerId
Get provider details

### PUT /api/v1/provider/:providerId
Update provider info
```json
{
  "hoursOpen": "09:00",
  "hoursClose": "17:00",
  "daysOpen": "Mon,Tue,Wed,Thu,Fri,Sat",
  "description": "Professional salon..."
}
```

## Database Schema

See `prisma/schema.prisma` for complete schema.

Key models:
- User (ChatGPT/Siri/Google users)
- Provider (Salons, mechanics, restaurants)
- Service (Services offered)
- Booking (Reservations)
- Rating (Reviews)
- Transaction (Payments)
- WalletAccount (Crypto wallets)

## Payment Methods

- Stripe (credit cards)
- Phantom (Solana)
- Solflare (Solana)
- Jupiter (SOL → USDC swap)

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build TypeScript
npm run migrate  # Run migrations
npm run generate # Generate Prisma client
```

## Deployment

```bash
npm run build
npm start
```

Environment variables in production:
- DATABASE_URL
- JWT_SECRET
- STRIPE_SECRET_KEY
- SOLANA_RPC_URL
- PORT

## Status

🚀 Week 1 Foundation - In Progress

- [x] Project setup
- [x] Database schema
- [x] Express server
- [x] Core API endpoints
- [ ] Payment integration (Stripe/OpenAPI)
- [ ] Wallet integration (Phantom/Solflare)
- [ ] Deployment
