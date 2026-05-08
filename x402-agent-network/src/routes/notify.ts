import express, { Router, Request, Response } from 'express';
import { createBooking, getBooking, updateBookingStatus, getStats } from '../services/booking-db.js';

const router = Router();

// ── registerBooking: persists to SQLite ───────────────────────────
export function registerBooking(booking: {
  id: string;
  phone?: string;
  email?: string;
  businessName: string;
  serviceType: string;
  customerName?: string;
  customerEmail?: string;
  date: string;
  time: string;
  price: number;
  fee?: number;
  net?: number;
}) {
  createBooking({
    id: booking.id,
    status: 'pending',
    business_name: booking.businessName,
    phone: booking.phone,
    email: booking.email,
    service_type: booking.serviceType,
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    date: booking.date,
    time: booking.time,
    price: booking.price,
    fee: booking.fee,
    net: booking.net,
  });
}

// ── Booking status check ─────────────────────────────────────────
router.get('/status/:bookingId', (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const booking = getBooking(bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  return res.json({ bookingId, ...booking });
});

// ── Booking status update (from email monitor or external) ────────
router.post('/booking-status', express.json(), (req: Request, res: Response) => {
  const { bookingId, status, source } = req.body;
  if (!bookingId || !status) return res.status(400).json({ error: 'bookingId and status required' });
  const ok = updateBookingStatus(bookingId, status, {}, source ?? 'api');
  return res.json({ ok, bookingId, status });
});

// ── Stats endpoint ────────────────────────────────────────────────
router.get('/stats', (_req: Request, res: Response) => {
  return res.json(getStats());
});

export default router;
