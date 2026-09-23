import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

const createBookingSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  title: z.string().min(2, 'Meeting title must have at least 2 characters'),
  startTime: z.string().datetime('Invalid start time format (ISO-8601 required)'),
  endTime: z.string().datetime('Invalid end time format (ISO-8601 required)'),
});

// Auto-release bookings that are past 15 minutes from startTime and not checked in
export async function autoReleaseOverdueBookings(): Promise<number> {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const result = await prisma.booking.updateMany({
      where: {
        status: 'CONFIRMED',
        isCheckedIn: false,
        startTime: {
          lte: fifteenMinutesAgo,
        },
      },
      data: {
        status: 'CANCELLED',
        cancelReason: 'AUTO_RELEASED_NO_SHOW',
      },
    });
    return result.count;
  } catch (e) {
    console.error('Error during autoReleaseOverdueBookings:', e);
    return 0;
  }
}

// GET /api/bookings/admin/all - Get all bookings across the company (Admin only)
router.get('/admin/all', authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    await autoReleaseOverdueBookings();
    const bookings = await prisma.booking.findMany({
      include: {
        room: { select: { id: true, name: true, location: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: 'desc' },
    });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/bookings - List all bookings (can filter by roomId and date)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    await autoReleaseOverdueBookings();
    const { roomId, date } = req.query;

    const where: any = {
      status: 'CONFIRMED',
    };

    if (roomId && typeof roomId === 'string') {
      where.roomId = roomId;
    }

    if (date && typeof date === 'string') {
      // Filter for specific day (e.g. 2026-09-19)
      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const dayEnd = new Date(`${date}T23:59:59.999Z`);
      where.startTime = { gte: dayStart };
      where.endTime = { lte: dayEnd };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: { select: { id: true, name: true, location: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/bookings/my - Get current user's bookings
router.get('/my', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    await autoReleaseOverdueBookings();
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        room: { select: { id: true, name: true, location: true } },
      },
      orderBy: { startTime: 'desc' },
    });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/bookings - Create new booking with Conflict Prevention
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    await autoReleaseOverdueBookings();
    const validated = createBookingSchema.parse(req.body);
    const start = new Date(validated.startTime);
    const end = new Date(validated.endTime);

    // 1. Sanity check: Start must be before End
    if (start >= end) {
      res.status(400).json({ message: 'End time must be strictly after start time.' });
      return;
    }

    // 2. Cannot book in the past (start time cannot be before current time)
    if (start < new Date()) {
      res.status(400).json({ message: 'Cannot book a start time in the past.' });
      return;
    }

    // 3. Minimum 15 minutes, Maximum 4 hours (Enterprise limit)
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    if (durationMinutes < 15) {
      res.status(400).json({ message: 'Booking must be at least 15 minutes long.' });
      return;
    }
    if (durationMinutes > 240) {
      res.status(400).json({ message: 'Booking duration cannot exceed 4 hours per reservation.' });
      return;
    }

    // 4. Maximum 30 days in advance
    const maxAdvance = new Date();
    maxAdvance.setDate(maxAdvance.getDate() + 30);
    maxAdvance.setHours(23, 59, 59, 999);
    if (start > maxAdvance) {
      res.status(400).json({ message: 'Cannot book more than 30 days in advance.' });
      return;
    }

    // 5. Verify room exists and is not under maintenance
    const room = await prisma.room.findUnique({
      where: { id: validated.roomId },
    });
    if (!room) {
      res.status(404).json({ message: 'Selected room does not exist.' });
      return;
    }
    if (room.isMaintenance) {
      res.status(400).json({ message: 'This room is currently under maintenance and cannot be booked.' });
      return;
    }

    // 5. 🔥 THE CORE LOGIC: Time-overlap conflict detection
    // Conflict condition: (newStart < existingEnd) AND (newEnd > existingStart)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId: validated.roomId,
        status: 'CONFIRMED',
        startTime: { lt: end },
        endTime: { gt: start },
      },
      include: {
        user: { select: { name: true } },
      },
    });

    if (conflictingBooking) {
      res.status(409).json({
        message: `Conflict detected! This room is already booked by ${conflictingBooking.user.name} (${conflictingBooking.title}).`,
        conflictingBooking: {
          id: conflictingBooking.id,
          title: conflictingBooking.title,
          startTime: conflictingBooking.startTime,
          endTime: conflictingBooking.endTime,
        },
      });
      return;
    }

    // 6. Save confirmed booking
    const booking = await prisma.booking.create({
      data: {
        roomId: validated.roomId,
        userId: req.user!.id,
        title: validated.title,
        startTime: start,
        endTime: end,
        status: 'CONFIRMED',
      },
      include: {
        room: { select: { id: true, name: true, location: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ booking, message: 'Room booked successfully!' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0].message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking not found.' });
      return;
    }

    // Only owner or admin can cancel
    if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Forbidden. You can only cancel your own bookings.' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelReason: req.user!.role === 'ADMIN' && booking.userId !== req.user!.id ? 'ADMIN_CANCELLED' : 'USER_CANCELLED'
      },
    });

    res.json({ message: 'Booking cancelled successfully.', booking: updated });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/bookings/:id/checkin - Check in to a booking
router.post('/:id/checkin', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    await autoReleaseOverdueBookings();
    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: { select: { id: true, name: true, location: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking not found.' });
      return;
    }

    // Only owner or admin can check in
    if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Forbidden. You can only check in to your own bookings.' });
      return;
    }

    if (booking.status === 'CANCELLED') {
      if (booking.cancelReason === 'AUTO_RELEASED_NO_SHOW') {
        res.status(400).json({ message: 'This booking was auto-released because check-in was not completed within 15 minutes of start time.' });
        return;
      }
      res.status(400).json({ message: 'Cannot check in to a cancelled booking.' });
      return;
    }

    if (booking.isCheckedIn) {
      res.status(400).json({ message: 'This booking has already been checked in.' });
      return;
    }

    const now = new Date();
    const earlyWindowMs = 15 * 60 * 1000; // 15 minutes prior
    const earliestCheckIn = new Date(booking.startTime.getTime() - earlyWindowMs);

    if (now < earliestCheckIn) {
      res.status(400).json({ message: 'Check-in opens 15 minutes prior to the meeting start time.' });
      return;
    }

    if (now > booking.endTime) {
      res.status(400).json({ message: 'This meeting has already ended.' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        isCheckedIn: true,
        checkedInAt: now,
      },
      include: {
        room: { select: { id: true, name: true, location: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ message: 'Check-in successful! Welcome to the meeting.', booking: updated });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
