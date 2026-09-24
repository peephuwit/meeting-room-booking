import React from 'react';
import { Users, MapPin, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { Room } from '../types';
import { Language, translations } from '../translations';

interface RoomCardProps {
  room: Room;
  lang: Language;
  onBook: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, lang, onBook }) => {
  const t = translations[lang];
  const amenitiesList = room.amenities
    ? room.amenities.split(',').map((a) => a.trim()).filter(Boolean)
    : [];

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden ${
      room.isMaintenance ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{room.name}</h3>
              {room.isMaintenance && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                  <Wrench className="w-3 h-3 mr-1" />
                  {t.maintenanceBadge}
                </span>
              )}
            </div>
            <div className="flex items-center text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              <span className="truncate">{room.location}</span>
            </div>
          </div>
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap shrink-0">
            <Users className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span>{room.capacity} {t.seats}</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {amenitiesList.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100"
            >
              <CheckCircle2 className="w-3 h-3 mr-1 text-blue-500" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Footer / Action */}
      <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500 flex items-center truncate min-w-0">
          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
          <span className="truncate">{t.instantConfirmation}</span>
        </span>
        {room.isMaintenance ? (
          <button
            disabled
            className="px-3.5 sm:px-4 py-2 bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg cursor-not-allowed border border-amber-300 whitespace-nowrap shrink-0"
          >
            {t.maintenanceBadge}
          </button>
        ) : (
          <button
            onClick={() => onBook(room)}
            className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-600/20 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            {t.bookRoom}
          </button>
        )}
      </div>
    </div>
  );
};
