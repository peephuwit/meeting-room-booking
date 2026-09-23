import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language, THAI_MONTHS_FULL, EN_MONTHS_FULL, formatDateDMY } from '../translations';

interface CalendarDatePickerProps {
  value: string; // 'yyyy-MM-dd'
  onChange: (dateStr: string) => void;
  lang: Language;
  className?: string;
}

const WEEKDAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const WEEKDAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  value,
  onChange,
  lang,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parseDate = (val: string) => {
    const parts = (val || '').split('-').map(Number);
    const now = new Date();
    return {
      year: parts[0] || now.getFullYear(),
      month: parts[1] ? parts[1] - 1 : now.getMonth(), // 0-indexed
      day: parts[2] || now.getDate(),
    };
  };

  const selected = parseDate(value);

  // View state for browsing calendar (year & month)
  const [viewYear, setViewYear] = useState(selected.year);
  const [viewMonth, setViewMonth] = useState(selected.month);

  // Keep view in sync when value changes externally
  useEffect(() => {
    const s = parseDate(value);
    setViewYear(s.year);
    setViewMonth(s.month);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Navigation
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const yyyy = String(viewYear);
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleToday = () => {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setIsOpen(false);
  };

  // Calendar days computation
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonthDays = Array.from(
    { length: firstDayOfWeek },
    (_, i) => daysInPrevMonth - firstDayOfWeek + i + 1
  );
  const currentMonthDays = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  // Remaining slots to fill grid
  const totalCells = firstDayOfWeek + daysInCurrentMonth;
  const nextMonthDaysCount = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => i + 1);

  const weekdays = lang === 'th' ? WEEKDAYS_TH : WEEKDAYS_EN;
  const monthNames = lang === 'th' ? THAI_MONTHS_FULL : EN_MONTHS_FULL;
  const monthLabel = monthNames[viewMonth];
  const yearLabel = lang === 'th' ? `${viewYear + 543}` : `${viewYear}`;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Main Single Date Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white border border-slate-300 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition cursor-pointer"
      >
        <CalendarIcon className="w-4 h-4 text-blue-600" />
        <span>{formatDateDMY(value, lang, 'full')}</span>
      </button>

      {/* Popover Calendar with Thai/EN Month Support */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4">
          {/* Header: Month & Year with Prev/Next */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-xs font-bold text-slate-800">
              {monthLabel} {yearLabel}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {weekdays.map((wd, i) => (
              <div
                key={wd}
                className={`text-[11px] font-bold py-1 ${
                  i === 0 ? 'text-red-500' : 'text-slate-400'
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Prev month padding */}
            {prevMonthDays.map((d) => (
              <div
                key={`prev-${d}`}
                className="h-8 flex items-center justify-center text-[11px] text-slate-300 select-none"
              >
                {d}
              </div>
            ))}

            {/* Current month days */}
            {currentMonthDays.map((d) => {
              const isSelected =
                selected.year === viewYear &&
                selected.month === viewMonth &&
                selected.day === d;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelectDay(d)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {d}
                </button>
              );
            })}

            {/* Next month padding */}
            {nextMonthDays.map((d) => (
              <div
                key={`next-${d}`}
                className="h-8 flex items-center justify-center text-[11px] text-slate-300 select-none"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Footer: Today quick button */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleToday}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              {lang === 'th' ? 'วันนี้' : 'Today'}
            </button>
            <span className="text-[11px] text-slate-400">
              {formatDateDMY(value, lang, 'short')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
