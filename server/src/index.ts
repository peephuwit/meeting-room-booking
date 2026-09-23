import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma.js';
import authRoutes from './routes/auth.routes.js';
import roomRoutes from './routes/room.routes.js';
import bookingRoutes, { autoReleaseOverdueBookings } from './routes/booking.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Auto-seed initial demo data if database is empty
async function ensureSeedData() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('🌱 No users found in database. Auto-seeding initial data...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      const userPassword = await bcrypt.hash('user123', 10);

      const admin = await prisma.user.create({
        data: {
          name: 'Admin Boss',
          email: 'admin@company.com',
          password: adminPassword,
          role: 'ADMIN',
        },
      });

      const john = await prisma.user.create({
        data: {
          name: 'John Developer',
          email: 'john@company.com',
          password: userPassword,
          role: 'USER',
        },
      });

      const roomAlpha = await prisma.room.create({
        data: {
          name: 'Room Alpha (Main)',
          capacity: 10,
          location: '2nd Floor, West Wing',
          amenities: '4K TV, Whiteboard, Video Conference',
        },
      });

      await prisma.room.create({
        data: {
          name: 'Room Beta (Creative)',
          capacity: 6,
          location: '2nd Floor, East Wing',
          amenities: 'Whiteboard, Standing Desks, Monitor',
        },
      });

      await prisma.room.create({
        data: {
          name: 'Executive Boardroom',
          capacity: 20,
          location: '5th Floor, Penthouse',
          amenities: 'Projector, Surround Audio, Catering Station',
        },
      });

      await prisma.room.create({
        data: {
          name: 'Focus Pod A',
          capacity: 2,
          location: '3rd Floor, Quiet Zone',
          amenities: 'Soundproof Booth, External Monitor',
        },
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(11, 30, 0, 0);

      await prisma.booking.create({
        data: {
          title: 'Weekly Engineering Sync',
          startTime: tomorrow,
          endTime: tomorrowEnd,
          status: 'CONFIRMED',
          userId: john.id,
          roomId: roomAlpha.id,
        },
      });

      console.log('✅ Initial demo data seeded successfully!');
    }
  } catch (err) {
    console.error('Error during auto-seeding:', err);
  }
}

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'An unexpected error occurred on the server' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Meeting Room Server running at http://localhost:${PORT}`);
  await ensureSeedData();

  // Background job: Auto-release overdue un-checked-in bookings every 30 seconds
  setInterval(async () => {
    const count = await autoReleaseOverdueBookings();
    if (count > 0) {
      console.log(`[Auto-Release] Released ${count} overdue booking(s) due to no-show.`);
    }
  }, 30 * 1000);
});
