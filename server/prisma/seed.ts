import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Clear existing data
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // 3. Create Users
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

  // 4. Create Rooms
  const roomAlpha = await prisma.room.create({
    data: {
      name: 'Room Alpha (Main)',
      capacity: 10,
      location: '2nd Floor, West Wing',
      amenities: '4K TV, Whiteboard, Video Conference',
    },
  });

  const roomBeta = await prisma.room.create({
    data: {
      name: 'Room Beta (Creative)',
      capacity: 6,
      location: '2nd Floor, East Wing',
      amenities: 'Whiteboard, Standing Desks, Monitor',
    },
  });

  const boardroom = await prisma.room.create({
    data: {
      name: 'Executive Boardroom',
      capacity: 20,
      location: '5th Floor, Penthouse',
      amenities: 'Projector, Surround Audio, Catering Station',
    },
  });

  const focusPod = await prisma.room.create({
    data: {
      name: 'Focus Pod A',
      capacity: 2,
      location: '3rd Floor, Quiet Zone',
      amenities: 'Soundproof Booth, External Monitor',
    },
  });

  // 5. Create a sample booking for tomorrow
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

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
