# AgentPay API Testing Guide

## Test Scenarios

### Scenario 1: Complete Booking with Stripe
```bash
# 1. Create booking
curl -X POST http://localhost:3001/api/v1/book \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "providerId": "provider_456",
    "serviceId": "service_789",
    "scheduledTime": "2026-04-16T14:30:00Z",
    "paymentMethod": "stripe"
  }'

# Response: { "bookingId": "booking_abc...", "status": "pending_payment" }

# 2. Process payment
curl -X POST http://localhost:3001/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking_abc...",
    "amount": 25.00,
    "stripeToken": "tok_visa",
    "userEmail": "user@example.com"
  }'

# Response: { "success": true, "chargeId": "ch_...", "fee": 0.63 }

# 3. Check status
curl http://localhost:3001/api/v1/status/booking_abc...

# Response: { "status": "confirmed", "paymentStatus": "completed" }
```

### Scenario 2: Provider Dashboard
```bash
# Get provider stats
curl http://localhost:3001/api/v1/provider/provider_456/stats

# Response includes:
# - totalBookings: 42
# - totalRevenue: 1050.00
# - totalEarnings: 1000.00 (after fees)
# - averageRating: 4.8

# Get payout history
curl http://localhost:3001/api/v1/provider/provider_456/payouts

# Get recent bookings
curl http://localhost:3001/api/v1/provider/provider_456/bookings
```

### Scenario 3: Search and Rating
```bash
# Search for providers
curl -X POST http://localhost:3001/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "service": "salon",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "budget": 50
  }'

# Leave rating
curl -X POST http://localhost:3001/api/v1/rate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "providerId": "provider_456",
    "score": 5,
    "comment": "Great service!"
  }'
```

## Performance Testing

### Response Times
- Search: <100ms
- Book: <150ms
- Payment: <500ms (Stripe API)
- Dashboard stats: <100ms
- Payout processing: <1s per batch

### Load Testing
```bash
# Test 100 concurrent requests
ab -n 100 -c 10 http://localhost:3001/health

# Expected: <50ms average response time
```

## Webhook Testing

### Stripe Webhook
```bash
# Using Stripe CLI
stripe listen --forward-to localhost:3001/webhooks/stripe

# In another terminal, trigger test event
stripe trigger charge.succeeded

# Check logs for: "✅ Charge succeeded"
```

## Test Checklist

- [ ] Health check (GET /health)
- [ ] Search providers
- [ ] Create booking
- [ ] Process Stripe payment
- [ ] Process OpenAPI payment
- [ ] Verify booking confirmed
- [ ] Check payout scheduled
- [ ] Rate provider
- [ ] View provider stats
- [ ] View payout history
- [ ] Update provider profile
- [ ] Test refund
- [ ] Verify email notifications
- [ ] Check webhook processing

## Expected Results

✅ All endpoints responding
✅ <100ms average latency
✅ Payments processing successfully
✅ Payouts scheduling automatically
✅ Emails sending
✅ Database consistency maintained
