export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities: string;
  isMaintenance?: boolean;
  createdAt?: string;
  bookings?: Booking[];
}

export interface Booking {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED';
  isCheckedIn?: boolean;
  checkedInAt?: string;
  cancelReason?: string;
  userId: string;
  roomId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  room?: {
    id: string;
    name: string;
    location: string;
  };
  createdAt?: string;
}
