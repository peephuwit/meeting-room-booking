import React from 'react';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { Room, Booking } from '../types';
import { Language, translations } from '../translations';
import { CalendarDatePicker } from './CalendarDatePicker';

interface ScheduleViewProps {
  rooms: Room[];
  bookings: Booking[];
  selectedDate: string;
  lang: Language;
  onSelectDate: (date: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  rooms,
  bookings,
  selectedDate,
  lang,
  onSelectDate,
}) => {
  const t = translations[lang];

  // Filter bookings for selected date (YYYY-MM-DD)
  const dayBookings = bookings.filter((b) => {
    if (b.status === 'CANCELLED') return false;
    const bookingDateStr = format(new Date(b.startTime), 'yyyy-MM-dd');
    return bookingDateStr === selectedDate;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t.scheduleTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.scheduleDesc}</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">{t.dateLabel}</span>
          <CalendarDatePicker
            value={selectedDate}
            onChange={onSelectDate}
            lang={lang}
          />
        </div>
      </div>

      {/* Timeline Rows for each room */}
      <div className="mt-6 space-y-4">
        {rooms.map((room) => {
          const roomBookings = dayBookings.filter((b) => b.roomId === room.id);

          return (
            <div
              key={room.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Room info */}
              <div className="min-w-[200px]">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900">{room.name}</span>
                  {room.isMaintenance && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      {t.maintenanceBadge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {room.location} • <span className="whitespace-nowrap">{room.capacity} {t.seats}</span>
                </div>
              </div>

              {/* Booked slots chips */}
              <div className="flex-1 flex flex-wrap items-center gap-2">
                {room.isMaintenance ? (
                  <span className="text-xs text-amber-700 font-medium px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                    {t.errRoomMaintenance}
                  </span>
                ) : roomBookings.length === 0 ? (
                  <span className="text-xs text-emerald-600 font-medium px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    {t.availableAllDay}
                  </span>
                ) : (
                  roomBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`px-2.5 py-1 rounded-md border text-xs flex items-center space-x-1.5 shadow-2xs ${
                        b.isCheckedIn
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : 'bg-blue-100/70 border-blue-200 text-blue-900'
                      }`}
                    >
                      <Clock className={`w-3 h-3 ${b.isCheckedIn ? 'text-emerald-600' : 'text-blue-600'}`} />
                      <span className="font-semibold">
                        {format(new Date(b.startTime), 'HH:mm')} - {format(new Date(b.endTime), 'HH:mm')}
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="font-medium truncate max-w-[120px]">{b.title}</span>
                      {b.isCheckedIn && (
                        <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full whitespace-nowrap">
                          ✓ {t.checkedInBadge}
                        </span>
                      )}
                      {b.user && (
                        <span className="text-[10px] text-slate-500 flex items-center ml-1">
                          <User className="w-2.5 h-2.5 mr-0.5" /> {b.user.name}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
