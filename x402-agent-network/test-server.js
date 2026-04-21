#!/usr/bin/env node
/**
 * test-server.js - Minimal test server for x402 payment flow
 * Bypasses SQLite to test Bazaar registration
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'ready',
    timestamp: new Date().toISOString(),
    mode: 'test-server'
  });
});

// x402 payment endpoint - /api/v1/search
app.post('/api/v1/search', (req, res) => {
  console.log('🔍 /api/v1/search called');
  console.log('Headers:', {
    'X-402-Price': req.headers['x-402-price'],
    'X-402-Network': req.headers['x-402-network'],
    'X-402-Payer': req.headers['x-402-payer']
  });
  console.log('Body:', req.body);

  // Simulate payment processing
  res.status(200).json({
    status: 'success',
    payment: 'accepted',
    message: 'Payment received for search endpoint',
    payment_info: {
      price: '0.001',
      currency: 'ETH',
      network: 'eip155:1',
      timestamp: new Date().toISOString(),
      payer: req.headers['x-402-payer']
    },
    bazaar_registration: {
      status: 'triggered',
      message: 'CDP facilitator will catalog this endpoint',
      estimated_time: '5-10 minutes'
    }
  });
});

// x402 payment endpoint - /api/v1/book
app.post('/api/v1/book', (req, res) => {
  console.log('📅 /api/v1/book called');
  res.status(200).json({
    status: 'success',
    payment: 'accepted',
    message: 'Payment received for booking endpoint',
    payment_info: {
      price: '0.002',
      currency: 'ETH',
      network: 'eip155:1'
    }
  });
});

// x402 payment endpoint - /api/v1/pay
app.post('/api/v1/pay', (req, res) => {
  console.log('💳 /api/v1/pay called');
  res.status(200).json({
    status: 'success',
    payment: 'accepted',
    message: 'Payment received for service payment',
    payment_info: {
      price: '0.001',
      currency: 'ETH',
      network: 'eip155:1'
    }
  });
});

// Discovery endpoint for Bazaar
app.get('/discovery/resources', (req, res) => {
  console.log('🔎 /discovery/resources called');
  res.json({
    resources: [
      {
        resource: 'https://agentpay.com/api/v1/search',
        accepts: [{ scheme: 'exact', price: '$0.001' }],
        description: 'Search for available services by category and location',
        metadata: {
          input: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              location: { type: 'string' }
            }
          },
          output: {
            type: 'array',
            items: { type: 'object' }
          }
        }
      },
      {
        resource: 'https://agentpay.com/api/v1/book',
        accepts: [{ scheme: 'exact', price: '$0.002' }],
        description: 'Book a service appointment',
        metadata: {
          input: {
            type: 'object',
            properties: {
              service_id: { type: 'string' },
              date: { type: 'string' },
              time: { type: 'string' }
            }
          },
          output: {
            type: 'object',
            properties: {
              booking_id: { type: 'string' },
              status: { type: 'string' }
            }
          }
        }
      },
      {
        resource: 'https://agentpay.com/api/v1/pay',
        accepts: [{ scheme: 'exact', price: '$0.001' }],
        description: 'Complete payment for booked service',
        metadata: {
          input: {
            type: 'object',
            properties: {
              booking_id: { type: 'string' },
              amount: { type: 'number' }
            }
          },
          output: {
            type: 'object',
            properties: {
              transaction_id: { type: 'string' },
              status: { type: 'string' }
            }
          }
        }
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║         AgentPay Test Server (x402 Enabled)         ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║ Server running on http://localhost:${PORT}${' '.repeat(23 - PORT.toString().length)}║`);
  console.log('║ Mode: TEST (minimal, no database)                    ║');
  console.log('║                                                      ║');
  console.log('║ Endpoints:                                           ║');
  console.log('║   POST /api/v1/search  - Search services ($0.001)   ║');
  console.log('║   POST /api/v1/book    - Book service ($0.002)      ║');
  console.log('║   POST /api/v1/pay     - Pay for service ($0.001)   ║');
  console.log('║   GET  /health         - Health check               ║');
  console.log('║   GET  /discovery/resources - Bazaar discovery      ║');
  console.log('║                                                      ║');
  console.log('║ Ready for x402 payment testing!                     ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  process.exit(0);
});
