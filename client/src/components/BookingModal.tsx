import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Calendar, Clock, CheckCircle, MapPin } from 'lucide-react';
import { Room } from '../types';
import { api } from '../api';
import { Language, translations } from '../translations';
import { DateSelector } from './DateSelector';
const TIME_OPTIONS = [
  { value: '08:00', labelEn: '08:00 (8:00 AM)', labelTh: '08:00 น. (เช้า)' },
  { value: '08:30', labelEn: '08:30 (8:30 AM)', labelTh: '08:30 น.' },
  { value: '09:00', labelEn: '09:00 (9:00 AM)', labelTh: '09:00 น.' },
  { value: '09:30', labelEn: '09:30 (9:30 AM)', labelTh: '09:30 น.' },
  { value: '10:00', labelEn: '10:00 (10:00 AM)', labelTh: '10:00 น.' },
  { value: '10:30', labelEn: '10:30 (10:30 AM)', labelTh: '10:30 น.' },
  { value: '11:00', labelEn: '11:00 (11:00 AM)', labelTh: '11:00 น.' },
  { value: '11:30', labelEn: '11:30 (11:30 AM)', labelTh: '11:30 น.' },
  { value: '12:00', labelEn: '12:00 (Noon)', labelTh: '12:00 น. (เที่ยง)' },
  { value: '12:30', labelEn: '12:30 (12:30 PM)', labelTh: '12:30 น.' },
  { value: '13:00', labelEn: '13:00 (1:00 PM)', labelTh: '13:00 น. (บ่ายโมง)' },
  { value: '13:30', labelEn: '13:30 (1:30 PM)', labelTh: '13:30 น.' },
  { value: '14:00', labelEn: '14:00 (2:00 PM)', labelTh: '14:00 น. (บ่ายสอง)' },
  { value: '14:30', labelEn: '14:30 (2:30 PM)', labelTh: '14:30 น.' },
  { value: '15:00', labelEn: '15:00 (3:00 PM)', labelTh: '15:00 น. (บ่ายสาม)' },
  { value: '15:30', labelEn: '15:30 (3:30 PM)', labelTh: '15:30 น.' },
  { value: '16:00', labelEn: '16:00 (4:00 PM)', labelTh: '16:00 น. (สี่โมงเย็น)' },
  { value: '16:30', labelEn: '16:30 (4:30 PM)', labelTh: '16:30 น.' },
  { value: '17:00', labelEn: '17:00 (5:00 PM)', labelTh: '17:00 น. (ห้าโมงเย็น)' },
  { value: '17:30', labelEn: '17:30 (5:30 PM)', labelTh: '17:30 น.' },
  { value: '18:00', labelEn: '18:00 (6:00 PM)', labelTh: '18:00 น. (หกโมงเย็น)' },
  { value: '18:30', labelEn: '18:30 (6:30 PM)', labelTh: '18:30 น.' },
  { value: '19:00', labelEn: '19:00 (7:00 PM)', labelTh: '19:00 น. (หนึ่งทุ่ม)' },
  { value: '19:30', labelEn: '19:30 (7:30 PM)', labelTh: '19:30 น.' },
  { value: '20:00', labelEn: '20:00 (8:00 PM)', labelTh: '20:00 น. (สองทุ่ม)' },
  { value: '21:00', labelEn: '21:00 (9:00 PM)', labelTh: '21:00 น. (สามทุ่ม)' },
  { value: '22:00', labelEn: '22:00 (10:00 PM)', labelTh: '22:00 น. (สี่ทุ่ม)' },
];

interface BookingModalProps {
  rooms: Room[];
  selectedRoom: Room | null;
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onSuccess: () => void;
  onToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  rooms,
  selectedRoom,
  isOpen,
  lang,
  onClose,
  onSuccess,
  onToast,
}) => {
  const t = translations[lang];
  const [roomId, setRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRoom) {
      setRoomId(selectedRoom.id);
    } else if (rooms.length > 0 && !roomId) {
      setRoomId(rooms[0].id);
    }
  }, [selectedRoom, rooms]);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
    setTitle(lang === 'th' ? 'ประชุมทีม' : 'Team Sync');
    setError(null);
    setSuccessMsg(null);
  }, [isOpen, lang]);

  if (!isOpen) return null;

  const currentRoom = rooms.find((r) => r.id === roomId);

  // Time & Date validations
  const todayYMD = new Date().toISOString().slice(0, 10);
  const isToday = date === todayYMD;
  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const availableStartOptions = TIME_OPTIONS.filter((slot) => {
    if (!isToday) return true;
    return slot.value > currentHHMM;
  });

  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  const durationMinutes = (eH * 60 + eM) - (sH * 60 + sM);
  const durationHours = (durationMinutes / 60).toFixed(1).replace('.0', '');
  const isDurationOverLimit = durationMinutes > 240;

  const maxAdvance = new Date();
  maxAdvance.setDate(maxAdvance.getDate() + 30);
  maxAdvance.setHours(23, 59, 59, 999);
  const isAdvanceExceeded = new Date(date) > maxAdvance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!roomId) {
      const errText = lang === 'th' ? 'กรุณาเลือกห้องประชุม' : 'Please select a room';
      setError(errText);
      onToast?.('error', errText);
      return;
    }
    if (currentRoom?.isMaintenance) {
      setError(t.errRoomMaintenance);
      onToast?.('error', t.errRoomMaintenance);
      return;
    }
    if (title.trim().length < 2) {
      const errText = lang === 'th' ? 'กรุณากรอกหัวข้อการประชุมอย่างน้อย 2 ตัวอักษร (เช่น คุยงาน, วางแผน)' : 'Meeting title must have at least 2 characters';
      setError(errText);
      onToast?.('error', errText);
      return;
    }
    if (isToday && startTime <= currentHHMM) {
      setError(t.errPastTime);
      onToast?.('error', t.errPastTime);
      return;
    }
    if (durationMinutes <= 0) {
      const errText = lang === 'th' ? 'เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น' : 'End time must be strictly after start time';
      setError(errText);
      onToast?.('error', errText);
      return;
    }
    if (isDurationOverLimit) {
      setError(t.errMaxDuration);
      onToast?.('error', t.errMaxDuration);
      return;
    }
    if (isAdvanceExceeded) {
      setError(t.errMaxAdvance);
      onToast?.('error', t.errMaxAdvance);
      return;
    }

    try {
      setLoading(true);

      const startISO = new Date(`${date}T${startTime}:00`).toISOString();
      const endISO = new Date(`${date}T${endTime}:00`).toISOString();

      const res = await api.createBooking({
        roomId,
        title,
        startTime: startISO,
        endTime: endISO,
      });

      const succText = res.message || (lang === 'th' ? 'จองห้องประชุมสำเร็จ!' : 'Booking confirmed!');
      setSuccessMsg(succText);
      onToast?.('success', succText);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      let msg = err.message || 'Booking failed';
      if (msg.includes('at least 2 characters')) {
        msg = lang === 'th' ? 'กรุณากรอกหัวข้อการประชุมอย่างน้อย 2 ตัวอักษร' : msg;
      } else if (msg.includes('strictly after start time')) {
        msg = lang === 'th' ? 'เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น' : msg;
      } else if (msg.includes('Conflict detected!')) {
        msg = lang === 'th' ? msg.replace('Conflict detected! This room is already booked by', 'เวลาชนกัน! ห้องนี้ถูกจองไว้แล้วโดย') : msg;
      } else if (msg.includes('Cannot book a start time in the past')) {
        msg = t.errPastTime;
      } else if (msg.includes('exceed 4 hours')) {
        msg = t.errMaxDuration;
      } else if (msg.includes('30 days')) {
        msg = t.errMaxAdvance;
      } else if (msg.includes('maintenance')) {
        msg = t.errRoomMaintenance;
      }
      setError(msg);
      onToast?.('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-blue-600 mb-1">
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">{t.modalSubtitle}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t.modalTitle}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.modalDesc}</p>

        {error && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="font-semibold">{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Room Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.selectRoomLabel}</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.capacity} {t.seats} - {r.location})
                </option>
              ))}
            </select>
            {currentRoom && (
              <div className="mt-1 flex items-center text-[11px] text-slate-500">
                <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                {currentRoom.location} • {currentRoom.amenities}
              </div>
            )}
            {currentRoom?.isMaintenance && (
              <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t.errRoomMaintenance}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.meetingTitleLabel}</label>
            <input
              type="text"
              placeholder={t.meetingTitlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>{t.dateLabelModal} ({lang === 'th' ? 'วัน / เดือน / ปี' : 'Day / Month / Year'})</span>
            </label>
            <DateSelector
              value={date}
              onChange={setDate}
              lang={lang}
              showPreview={true}
            />
            {isAdvanceExceeded && (
              <div className="mt-1 text-xs text-rose-600 font-semibold">{t.errMaxAdvance}</div>
            )}
          </div>

          {/* Time Slot (Start & End) */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-400" /> {t.startTimeLabel}
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_OPTIONS.map((slot) => {
                    const isPast = isToday && slot.value <= currentHHMM;
                    return (
                      <option key={slot.value} value={slot.value} disabled={isPast}>
                        {lang === 'th' ? slot.labelTh : slot.labelEn} {isPast ? (lang === 'th' ? '(เลยเวลาแล้ว)' : '(Past)') : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-400" /> {t.endTimeLabel}
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_OPTIONS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {lang === 'th' ? slot.labelTh : slot.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration Indicator and Max 4-hr Notice */}
            <div className="flex items-center justify-between text-[11px] pt-1 px-0.5">
              <span className="text-slate-500 flex items-center">
                <span>{t.durationNotice}:</span>
                <span className={`ml-1 font-bold ${isDurationOverLimit ? 'text-rose-600' : 'text-blue-600'}`}>
                  {durationMinutes > 0 ? `${durationHours} ${lang === 'th' ? 'ชม.' : 'hrs'}` : '-'}
                </span>
                <span className="text-slate-400 ml-1">{t.maxDurationNotice}</span>
              </span>
              {isDurationOverLimit && (
                <span className="text-rose-600 font-semibold">{t.errMaxDuration}</span>
              )}
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              {t.cancelButton}
            </button>
            <button
              type="submit"
              disabled={loading || isDurationOverLimit || isAdvanceExceeded || currentRoom?.isMaintenance}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? t.checkingCollision : t.confirmButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
