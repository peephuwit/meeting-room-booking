import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

const roomSchema = z.object({
  name: z.string().min(2, 'Room name must have at least 2 characters'),
  capacity: z.number().int().positive('Capacity must be greater than 0'),
  location: z.string().min(2, 'Location is required'),
  amenities: z.string().default(''),
  isMaintenance: z.boolean().optional(),
});

// GET /api/rooms - Get all rooms
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/rooms/:id - Get single room
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { id: true, title: true, startTime: true, endTime: true, user: { select: { name: true } } },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/rooms - Create new room (Admin only)
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = roomSchema.parse(req.body);
    const room = await prisma.room.create({
      data: {
        name: validated.name,
        capacity: validated.capacity,
        location: validated.location,
        amenities: validated.amenities || '',
        isMaintenance: validated.isMaintenance ?? false,
      },
    });
    res.status(201).json({ room, message: 'Room created successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0].message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/rooms/:id - Update room (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const updateSchema = roomSchema.partial();
    const validated = updateSchema.parse(req.body);

    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const room = await prisma.room.update({
      where: { id },
      data: validated,
    });

    res.json({ room, message: 'Room updated successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0].message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/rooms/:id - Delete room (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.room.delete({
      where: { id },
    });
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
