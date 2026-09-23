import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, Check, ShieldCheck, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Language, translations } from '../translations';

export type CapacityCategory = 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE';

interface RoomFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  capacityFilter: CapacityCategory;
  onCapacityChange: (val: CapacityCategory) => void;
  selectedAmenities: string[];
  onToggleAmenity: (amenity: string) => void;
  availableAmenities: string[];
  availableOnly: boolean;
  onToggleAvailableOnly: () => void;
  totalRooms: number;
  matchedRooms: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  lang: Language;
}

export const RoomFilterBar: React.FC<RoomFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  capacityFilter,
  onCapacityChange,
  selectedAmenities,
  onToggleAmenity,
  availableAmenities,
  availableOnly,
  onToggleAvailableOnly,
  totalRooms,
  matchedRooms,
  hasActiveFilters,
  onClearFilters,
  lang,
}) => {
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);

  // Count active filter conditions (excluding text search)
  const activeCount =
    (capacityFilter !== 'ALL' ? 1 : 0) +
    (availableOnly ? 1 : 0) +
    selectedAmenities.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200">
      {/* Sleek Single Header Row: Search + Filter Toggle Button + Stats */}
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchRoomPlaceholder}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side controls: Filter Toggle Button + Results Counter */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {/* Main "Filter" Button with badge */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition cursor-pointer border ${
              isOpen || activeCount > 0
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isOpen ? t.hideFiltersBtn : t.filtersBtn}</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
            {isOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            )}
          </button>

          {/* Clear Filters (if active) */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              title={t.clearFilters}
              className="px-2.5 py-2 rounded-xl text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center space-x-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">{t.clearFilters}</span>
            </button>
          )}

          {/* Results Badge */}
          <div className="text-[11px] text-slate-500 font-medium bg-slate-50 px-2.5 py-2 rounded-xl border border-slate-200/60 shrink-0">
            <span className="font-bold text-slate-900">{matchedRooms}</span> / {totalRooms} {t.roomsFound}
          </div>
        </div>
      </div>

      {/* Expandable Filter Panel (reveals only when button is clicked) */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category 1: Capacity */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.filterCapacity}</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { key: 'ALL', label: t.allCapacities },
                    { key: 'SMALL', label: t.smallRoom },
                    { key: 'MEDIUM', label: t.mediumRoom },
                    { key: 'LARGE', label: t.largeRoom },
                  ] as const
                ).map((item) => {
                  const isActive = capacityFilter === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => onCapacityChange(item.key)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-left flex items-center justify-between border ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {isActive && <Check className="w-3 h-3 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category 2: Amenities */}
            {availableAmenities.length > 0 && (
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t.filterAmenities}</span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {availableAmenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        onClick={() => onToggleAmenity(amenity)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/70'
                        }`}
                      >
                        {amenity}
                        {isSelected && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category 3: Availability & Controls */}
            <div className="space-y-2 flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.statusFilter}</span>
                </label>
                <button
                  onClick={onToggleAvailableOnly}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer border ${
                    availableOnly
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className={`w-4 h-4 ${availableOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{t.availableOnly}</span>
                  </div>
                  {availableOnly ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </button>
              </div>

              {/* Bottom Quick Action: Close */}
              <div className="pt-2 flex items-center justify-end gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={onClearFilters}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 transition cursor-pointer"
                  >
                    {t.clearFilters}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {lang === 'th' ? 'เสร็จสิ้น' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
