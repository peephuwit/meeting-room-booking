import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Booking } from '../types';
import { api } from '../api';
import { Language, translations, formatDateDMY } from '../translations';

interface MyBookingsModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onBookingCancelled: () => void;
  onToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  lang,
  onClose,
  onBookingCancelled,
  onToast,
}) => {
  const t = translations[lang];
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || (lang === 'th' ? 'โหลดรายการจองไม่สำเร็จ' : 'Failed to load bookings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancel = async (id: string) => {
    if (!window.confirm(t.cancelBookingConfirm)) return;
    try {
      await api.cancelBooking(id);
      onToast?.('success', t.toastCancelSuccess);
      fetchBookings();
      onBookingCancelled();
    } catch (err: any) {
      const errMsg = err.message || 'Could not cancel booking';
      onToast?.('error', errMsg);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await api.checkInBooking(id);
      onToast?.('success', t.checkInSuccess);
      fetchBookings();
      onBookingCancelled();
    } catch (err: any) {
      const errMsg = err.message || 'Could not check in';
      onToast?.('error', errMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 relative flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900">{t.myBookingsTitle}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.myBookingsDesc}</p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">
              {lang === 'th' ? 'กำลังโหลดรายการจอง...' : 'Loading your reservations...'}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              {t.noBookings}
            </div>
          ) : (
            bookings.map((b) => {
              const startDate = new Date(b.startTime);
              const endDate = new Date(b.endTime);
              const now = new Date();
              const isCancelled = b.status === 'CANCELLED';
              const isAutoReleased = isCancelled && b.cancelReason === 'AUTO_RELEASED_NO_SHOW';
              const isCheckedIn = Boolean(b.isCheckedIn);
              const earlyWindowMs = 15 * 60 * 1000;
              const canCheckIn =
                !isCancelled &&
                !isCheckedIn &&
                now.getTime() >= startDate.getTime() - earlyWindowMs &&
                now.getTime() <= endDate.getTime();
              const isPending =
                !isCancelled &&
                !isCheckedIn &&
                now.getTime() < startDate.getTime() - earlyWindowMs;

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCancelled
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : isCheckedIn
                      ? 'bg-emerald-50/20 border-emerald-200 shadow-xs'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900 leading-snug">
                      {b.title}
                    </div>

                    {/* Status Badges on dedicated line below title */}
                    <div className="flex items-center">
                      {isCancelled ? (
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                            isAutoReleased
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isAutoReleased ? t.autoReleasedBadge : lang === 'th' ? 'ยกเลิกแล้ว' : 'CANCELLED'}
                        </span>
                      ) : isCheckedIn ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1 whitespace-nowrap">
                          <span>✓ {t.checkedInBadge}</span>
                        </span>
                      ) : isPending ? (
                        <span
                          className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap"
                          title={t.checkInWindowNotice}
                        >
                          {t.pendingCheckInBadge}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <div className="flex items-center font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                        <span className="truncate">{b.room?.name}</span>
                      </div>
                      <div className="hidden sm:inline">•</div>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                        <span>{formatDateDMY(startDate, lang, 'full')}</span>
                      </div>
                      <div className="hidden sm:inline">•</div>
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                        <span>
                          {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Check-in & Cancel) */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {canCheckIn && (
                      <button
                        onClick={() => handleCheckIn(b.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-600/30 transition flex items-center space-x-1 cursor-pointer animate-pulse"
                      >
                        <span>✓</span>
                        <span>{t.checkInBtn}</span>
                      </button>
                    )}

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        title={lang === 'th' ? 'ยกเลิกการจอง' : 'Cancel Booking'}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
