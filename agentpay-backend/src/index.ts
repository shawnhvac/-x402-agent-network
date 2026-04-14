import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Express
const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: prisma ? 'connected' : 'disconnected'
  });
});

// API v1 endpoints

// SEARCH endpoint - find providers
app.post('/api/v1/search', async (req: Request, res: Response) => {
  try {
    const { service, latitude, longitude, budget, maxDistance = 5 } = req.body;

    // Calculate distance and find providers
    const providers = await prisma.provider.findMany({
      where: {
        isActive: true,
        serviceType: service || undefined,
      },
      include: {
        services: true,
        ratings: true,
      },
      take: 20,
    });

    // Filter by location distance (simple implementation)
    const nearbyProviders = providers.filter(p => {
      const dx = p.latitude - latitude;
      const dy = p.longitude - longitude;
      const distance = Math.sqrt(dx * dx + dy * dy) * 69; // rough miles conversion
      return distance <= maxDistance;
    });

    // Filter by budget and calculate average rating
    const results = nearbyProviders.map(p => ({
      id: p.id,
      name: p.name,
      serviceType: p.serviceType,
      address: p.address,
      city: p.city,
      distance: Math.sqrt(
        Math.pow(p.latitude - latitude, 2) + 
        Math.pow(p.longitude - longitude, 2)
      ) * 69,
      rating: p.ratings.length > 0 
        ? p.ratings.reduce((sum, r) => sum + r.score, 0) / p.ratings.length 
        : 0,
      reviewCount: p.ratings.length,
      priceRange: `$${p.services[0]?.basePrice || 'N/A'}-${p.services[p.services.length - 1]?.basePrice || 'N/A'}`,
      services: p.services.map(s => ({
        id: s.id,
        name: s.name,
        price: s.basePrice,
        duration: s.duration,
      })),
    })).filter(p => !budget || p.priceRange);

    res.json({
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// BOOK endpoint - create booking
app.post('/api/v1/book', async (req: Request, res: Response) => {
  try {
    const { userId, providerId, serviceId, scheduledTime, paymentMethod } = req.body;

    // Get service details for pricing
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        providerId,
        serviceId,
        scheduledTime: new Date(scheduledTime),
        duration: service.duration,
        amount: service.basePrice,
        paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
      },
      include: {
        service: true,
        provider: true,
        user: true,
      },
    });

    // TODO: Process payment based on paymentMethod
    // - "stripe": Call Stripe API
    // - "phantom"/"solflare": Create Solana transfer transaction
    // - "jupiter": Create swap + transfer

    res.json({
      bookingId: booking.id,
      status: 'pending_payment',
      amount: booking.amount,
      booking,
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// STATUS endpoint - track booking
app.get('/api/v1/status/:bookingId', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: true,
        service: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      bookingId: booking.id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      scheduledTime: booking.scheduledTime,
      provider: {
        name: booking.provider.name,
        address: booking.provider.address,
        phone: booking.provider.phone,
      },
      service: {
        name: booking.service.name,
        price: booking.service.basePrice,
      },
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Status check failed' });
  }
});

// RATE endpoint - leave feedback
app.post('/api/v1/rate', async (req: Request, res: Response) => {
  try {
    const { userId, providerId, score, comment } = req.body;

    const rating = await prisma.rating.upsert({
      where: {
        userId_providerId: {
          userId,
          providerId,
        },
      },
      update: {
        score,
        comment,
      },
      create: {
        userId,
        providerId,
        score,
        comment,
      },
    });

    // Update provider's average rating
    const allRatings = await prisma.rating.findMany({
      where: { providerId },
    });

    const avgRating = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;

    await prisma.provider.update({
      where: { id: providerId },
      data: { averageRating: avgRating },
    });

    res.json({ rating, averageRating: avgRating });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: 'Rating failed' });
  }
});

// PROVIDER endpoint - get provider details
app.get('/api/v1/providers/:providerId', async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        services: true,
        ratings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({
      provider,
      ratingCount: provider.ratings.length,
      averageRating: provider.averageRating,
    });
  } catch (error) {
    console.error('Provider error:', error);
    res.status(500).json({ error: 'Failed to get provider' });
  }
});

// UPDATE PROVIDER endpoint - modify hours, pricing, etc.
app.put('/api/v1/provider/:providerId', async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const { hoursOpen, hoursClose, daysOpen, description } = req.body;

    const provider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        hoursOpen,
        hoursClose,
        daysOpen,
        description,
      },
    });

    res.json({ provider, message: 'Provider updated successfully' });
  } catch (error) {
    console.error('Provider update error:', error);
    res.status(500).json({ error: 'Failed to update provider' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AgentPay server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API docs: http://localhost:${PORT}/api/v1/docs`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
