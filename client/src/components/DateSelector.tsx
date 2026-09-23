import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Language, THAI_MONTHS_FULL, EN_MONTHS_FULL, formatDateDMY } from '../translations';

interface DateSelectorProps {
  value: string; // format: 'yyyy-MM-dd'
  onChange: (val: string) => void;
  lang: Language;
  className?: string;
  showPreview?: boolean;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  value,
  onChange,
  lang,
  className = '',
  showPreview = false,
}) => {
  const now = new Date();
  const parts = (value || '').split('-').map(Number);
  const year = parts[0] || now.getFullYear();
  const month = parts[1] || now.getMonth() + 1;
  const day = parts[2] || now.getDate();

  // Calculate days in the selected month & year
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const months = lang === 'th' ? THAI_MONTHS_FULL : EN_MONTHS_FULL;

  // Years: current year - 1 to current year + 2
  const currentYear = now.getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const updateDate = (newY: number, newM: number, newD: number) => {
    const maxDays = new Date(newY, newM, 0).getDate();
    const safeDay = Math.min(newD, maxDays);
    const yyyy = String(newY);
    const mm = String(newM).padStart(2, '0');
    const dd = String(safeDay).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        {/* 1. วัน (Day) */}
        <div className="relative">
          <select
            value={day}
            onChange={(e) => updateDate(year, month, Number(e.target.value))}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
            title={lang === 'th' ? 'เลือกวัน' : 'Select Day'}
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {lang === 'th' ? `วันที่ ${d}` : `${d}`}
              </option>
            ))}
          </select>
        </div>

        {/* 2. เดือน (Month) */}
        <div className="relative">
          <select
            value={month}
            onChange={(e) => updateDate(year, Number(e.target.value), day)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs min-w-[100px]"
            title={lang === 'th' ? 'เลือกเดือน' : 'Select Month'}
          >
            {months.map((mName, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {mName}
              </option>
            ))}
          </select>
        </div>

        {/* 3. ปี (Year) */}
        <div className="relative">
          <select
            value={year}
            onChange={(e) => updateDate(Number(e.target.value), month, day)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
            title={lang === 'th' ? 'เลือกปี' : 'Select Year'}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {lang === 'th' ? `พ.ศ. ${y + 543}` : `${y}`}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Native Calendar Picker Shortcut */}
        <div className="relative flex items-center" title={lang === 'th' ? 'เปิดปฏิทิน' : 'Open Calendar'}>
          <input
            type="date"
            value={value}
            onChange={(e) => {
              if (e.target.value) onChange(e.target.value);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <button
            type="button"
            className="p-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="text-[11px] font-medium text-blue-600 flex items-center space-x-1">
          <span>📅</span>
          <span>{formatDateDMY(value, lang, 'full')}</span>
        </div>
      )}
    </div>
  );
};
