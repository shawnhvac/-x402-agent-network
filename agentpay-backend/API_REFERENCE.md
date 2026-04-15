# AgentPay API Reference

**Base URL:** `https://x402-agent-pay.com/api/v1`

---

## Search & Discovery

### POST /search
Search for providers by service, location, and budget.

**Request:**
```json
{
  "service": "salon",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 5,
  "budget": 50,
  "limit": 20
}
```

**Response:**
```json
{
  "providers": [
    {
      "id": "provider_123",
      "name": "Test Salon",
      "address": "123 Main St",
      "rating": 4.8,
      "reviews": 42,
      "distance": 0.3,
      "services": [
        {
          "id": "service_789",
          "name": "Haircut",
          "basePrice": 25.00,
          "duration": 30
        }
      ]
    }
  ],
  "total": 1
}
```

---

## Booking

### POST /book
Create a new booking.

**Request:**
```json
{
  "userId": "user_123",
  "providerId": "provider_456",
  "serviceId": "service_789",
  "scheduledTime": "2026-04-16T14:30:00Z",
  "paymentMethod": "stripe"
}
```

**Response:**
```json
{
  "bookingId": "booking_abc123",
  "status": "pending_payment",
  "amount": 25.00,
  "scheduledTime": "2026-04-16T14:30:00Z"
}
```

### GET /status/:bookingId
Get booking status and details.

**Response:**
```json
{
  "bookingId": "booking_abc123",
  "status": "confirmed",
  "paymentStatus": "completed",
  "amount": 25.00,
  "provider": {
    "name": "Test Salon",
    "phone": "555-0123"
  }
}
```

---

## Payments

### POST /payments
Process payment via Stripe.

**Request:**
```json
{
  "bookingId": "booking_abc123",
  "amount": 25.00,
  "stripeToken": "tok_visa",
  "userEmail": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "bookingId": "booking_abc123",
  "chargeId": "ch_1ABC...",
  "amount": 25.00,
  "fee": 0.63,
  "providerAmount": 24.37
}
```

### POST /payments/openapi
Process payment via OpenAPI (fallback).

**Request:**
```json
{
  "bookingId": "booking_abc123",
  "amount": 25.00,
  "cardToken": "card_visa",
  "userEmail": "user@example.com"
}
```

**Response:** Same as Stripe

### POST /payments/refund
Refund a charge.

**Request:**
```json
{
  "chargeId": "ch_1ABC...",
  "amount": 25.00
}
```

**Response:**
```json
{
  "success": true,
  "refundId": "re_1ABC...",
  "amount": 25.00
}
```

---

## Ratings

### POST /rate
Leave a rating for a provider.

**Request:**
```json
{
  "userId": "user_123",
  "providerId": "provider_456",
  "score": 5,
  "comment": "Great service!"
}
```

**Response:**
```json
{
  "success": true,
  "ratingId": "rating_xyz",
  "averageRating": 4.8
}
```

---

## Provider Management

### GET /providers/:providerId
Get provider details.

**Response:**
```json
{
  "id": "provider_456",
  "name": "Test Salon",
  "email": "salon@test.com",
  "phone": "555-0123",
  "address": "123 Main St",
  "city": "New York",
  "averageRating": 4.8,
  "reviewCount": 42,
  "services": [
    {
      "id": "service_789",
      "name": "Haircut",
      "basePrice": 25.00,
      "duration": 30
    }
  ]
}
```

### PUT /provider/:providerId
Update provider profile.

**Request:**
```json
{
  "hoursOpen": "09:00",
  "hoursClose": "17:00",
  "daysOpen": "Mon,Tue,Wed,Thu,Fri,Sat",
  "description": "Professional salon with 15 years experience",
  "phone": "555-0124"
}
```

**Response:**
```json
{
  "success": true,
  "provider": { ... }
}
```

---

## Provider Dashboard

### GET /provider/:providerId/stats
Get provider statistics and earnings.

**Response:**
```json
{
  "providerId": "provider_456",
  "name": "Test Salon",
  "stats": {
    "totalBookings": 42,
    "totalRevenue": 1050.00,
    "totalEarnings": 1000.00,
    "pendingPayouts": 250.00,
    "completedPayouts": 750.00,
    "averageRating": 4.8,
    "reviewCount": 42
  },
  "profile": {
    "address": "123 Main St",
    "city": "New York",
    "phone": "555-0123",
    "hoursOpen": "09:00",
    "hoursClose": "17:00",
    "description": "..."
  },
  "trialStatus": {
    "isInTrial": false,
    "isPaidMember": true,
    "paidStartDate": "2026-04-01"
  }
}
```

### GET /provider/:providerId/payouts
Get payout history.

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "payouts": [
    {
      "id": "payout_123",
      "amount": 250.00,
      "fee": 5.00,
      "netAmount": 245.00,
      "status": "completed",
      "method": "bank",
      "txId": "TRANSFER_...",
      "createdAt": "2026-04-15T06:00:00Z"
    }
  ],
  "total": 15,
  "limit": 10,
  "offset": 0
}
```

### GET /provider/:providerId/bookings
Get recent bookings.

**Query Parameters:**
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "bookings": [
    {
      "id": "booking_abc123",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "service": {
        "name": "Haircut",
        "basePrice": 25.00
      },
      "scheduledTime": "2026-04-16T14:30:00Z",
      "status": "confirmed",
      "amount": 25.00
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### POST /provider/:providerId/schedule-payout
Manually trigger payout (admin only).

**Response:**
```json
{
  "message": "Payout scheduled",
  "payout": {
    "id": "payout_123",
    "amount": 250.00,
    "netAmount": 245.00,
    "status": "pending"
  }
}
```

---

## Webhooks

### POST /webhooks/stripe
Handle Stripe webhook events.

**Stripe sends:**
```json
{
  "type": "charge.succeeded",
  "data": {
    "id": "ch_1ABC...",
    "amount": 2500,
    "status": "succeeded"
  }
}
```

**Events handled:**
- `charge.succeeded`: Update booking to confirmed
- `charge.failed`: Cancel booking
- `charge.refunded`: Process refund

### POST /webhooks/openapi
Handle OpenAPI webhook events.

**Same event types as Stripe**

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: bookingId, amount, stripeToken"
}
```

### 404 Not Found
```json
{
  "error": "Provider not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Payment processing failed"
}
```

---

## Rate Limiting

- Search: 100 req/min
- Booking: 50 req/min
- Payment: 10 req/min
- Dashboard: 100 req/min
- Webhooks: Unlimited

---

## Authentication

All endpoints support optional API key authentication:

```bash
curl -H "Authorization: Bearer sk_test_..." \
  https://x402-agent-pay.com/api/v1/providers
```

---

## Response Format

All responses are JSON with consistent format:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-04-15T00:30:00Z"
}
```

---

**API Version:** 1.0
**Last Updated:** April 15, 2026
**Status:** Production Ready ✅

