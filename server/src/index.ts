import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import roomRoutes from './routes/room.routes.js';
import bookingRoutes, { autoReleaseOverdueBookings } from './routes/booking.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`🚀 Meeting Room Server running at http://localhost:${PORT}`);

  // Background job: Auto-release overdue un-checked-in bookings every 30 seconds
  setInterval(async () => {
    const count = await autoReleaseOverdueBookings();
    if (count > 0) {
      console.log(`[Auto-Release] Released ${count} overdue booking(s) due to no-show.`);
    }
  }, 30 * 1000);
});
