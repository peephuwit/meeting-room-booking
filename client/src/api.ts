import { User, Room, Booking } from './types';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
    return data;
  },

  // Rooms
  async getRooms(): Promise<Room[]> {
    const res = await fetch(`${API_BASE}/rooms`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch rooms');
    return data.rooms;
  },

  async createRoom(payload: {
    name: string;
    capacity: number;
    location: string;
    amenities: string;
    isMaintenance?: boolean;
  }): Promise<Room> {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create room');
    return data.room;
  },

  async updateRoom(
    id: string,
    payload: Partial<{
      name: string;
      capacity: number;
      location: string;
      amenities: string;
      isMaintenance: boolean;
    }>
  ): Promise<Room> {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update room');
    return data.room;
  },

  async deleteRoom(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete room');
  },

  // Bookings
  async getBookings(roomId?: string): Promise<Booking[]> {
    const url = roomId ? `${API_BASE}/bookings?roomId=${roomId}` : `${API_BASE}/bookings`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch bookings');
    return data.bookings;
  },

  async getMyBookings(): Promise<Booking[]> {
    const res = await fetch(`${API_BASE}/bookings/my`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch my bookings');
    return data.bookings;
  },

  async getAllBookingsAdmin(): Promise<Booking[]> {
    const res = await fetch(`${API_BASE}/bookings/admin/all`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch all bookings');
    return data.bookings;
  },

  async createBooking(payload: {
    roomId: string;
    title: string;
    startTime: string;
    endTime: string;
  }): Promise<{ booking: Booking; message: string }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Booking failed');
    }
    return data;
  },

  async cancelBooking(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to cancel booking');
  },

  async checkInBooking(id: string): Promise<{ booking: Booking; message: string }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/checkin`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Check-in failed');
    return data;
  },
};
