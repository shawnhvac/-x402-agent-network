import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import PayoutService from '../services/payout.service';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/provider/:providerId/stats
 * Get provider dashboard statistics
 */
router.get('/:providerId/stats', async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        bookings: {
          where: { paymentStatus: 'completed' },
        },
        ratings: true,
      },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const earnings = await PayoutService.getProviderEarnings(providerId);

    res.json({
      providerId,
      name: provider.name,
      email: provider.email,
      serviceType: provider.serviceType,
      stats: {
        totalBookings: provider.bookings.length,
        totalRevenue: earnings.totalRevenue,
        totalEarnings: earnings.totalEarnings,
        pendingPayouts: earnings.pendingPayouts,
        completedPayouts: earnings.completedPayouts,
        averageRating: provider.averageRating,
        reviewCount: provider.ratings.length,
      },
      profile: {
        address: provider.address,
        city: provider.city,
        phone: provider.phone,
        hoursOpen: provider.hoursOpen,
        hoursClose: provider.hoursClose,
        daysOpen: provider.daysOpen,
        description: provider.description,
      },
      trialStatus: {
        isInTrial: !provider.isPaidMember,
        trialEndDate: provider.trialEndDate,
        isPaidMember: provider.isPaidMember,
        paidStartDate: provider.paidStartDate,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to load statistics' });
  }
});

/**
 * GET /api/v1/provider/:providerId/payouts
 * Get provider payout history
 */
router.get('/:providerId/payouts', async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const { limit = '10', offset = '0' } = req.query;

    const payouts = await prisma.payout.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.payout.count({
      where: { providerId },
    });

    res.json({
      payouts,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Payout history error:', error);
    res.status(500).json({ error: 'Failed to load payout history' });
  }
});

/**
 * GET /api/v1/provider/:providerId/bookings
 * Get recent bookings
 */
router.get('/:providerId/bookings', async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const bookings = await prisma.booking.findMany({
      where: { providerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        service: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.booking.count({
      where: { providerId },
    });

    res.json({
      bookings,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Bookings error:', error);
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

/**
 * PUT /api/v1/provider/:providerId/profile
 * Update provider profile (hours, description, etc.)
 */
router.put('/:providerId/profile', async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const { hoursOpen, hoursClose, daysOpen, description, phone } = req.body;

    const provider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        hoursOpen,
        hoursClose,
        daysOpen,
        description,
        phone,
      },
    });

    res.json({
      message: 'Profile updated',
      provider,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /api/v1/provider/:providerId/schedule-payout
 * Manually trigger payout (admin only)
 */
router.post('/:providerId/schedule-payout', async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    const payout = await PayoutService.scheduleProviderPayout(providerId);

    if (!payout) {
      return res.status(400).json({ error: 'No bookings to payout' });
    }

    res.json({
      message: 'Payout scheduled',
      payout,
    });
  } catch (error) {
    console.error('Schedule payout error:', error);
    res.status(500).json({ error: 'Failed to schedule payout' });
  }
});

export default router;
