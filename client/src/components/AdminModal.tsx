import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  CalendarCheck,
  Plus,
  Edit2,
  Trash2,
  Wrench,
  CheckCircle,
  Clock,
  User,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { Room, Booking } from '../types';
import { api } from '../api';
import { Language, translations, formatDateDMY } from '../translations';
import { format } from 'date-fns';

interface AdminModalProps {
  isOpen: boolean;
  lang: Language;
  rooms: Room[];
  onClose: () => void;
  onRefreshData: () => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  lang,
  rooms,
  onClose,
  onRefreshData,
  onToast,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms');

  // Room Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formName, setFormName] = useState('');
  const [formCapacity, setFormCapacity] = useState(10);
  const [formLocation, setFormLocation] = useState('');
  const [formAmenities, setFormAmenities] = useState('');
  const [formMaintenance, setFormMaintenance] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // All Bookings State
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllBookings = async () => {
    try {
      setBookingsLoading(true);
      const data = await api.getAllBookingsAdmin();
      setAllBookings(data);
    } catch (err: any) {
      onToast('error', err.message || 'Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'bookings') {
      fetchAllBookings();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setFormName('');
    setFormCapacity(8);
    setFormLocation('');
    setFormAmenities('TV, Whiteboard, Video Conference');
    setFormMaintenance(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setFormName(room.name);
    setFormCapacity(room.capacity);
    setFormLocation(room.location);
    setFormAmenities(room.amenities || '');
    setFormMaintenance(room.isMaintenance || false);
    setIsFormOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formName.trim().length < 2) {
      onToast('error', lang === 'th' ? 'กรุณากรอกชื่อห้องอย่างน้อย 2 ตัวอักษร' : 'Room name must have at least 2 characters');
      return;
    }

    try {
      setFormLoading(true);
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, {
          name: formName,
          capacity: Number(formCapacity),
          location: formLocation,
          amenities: formAmenities,
          isMaintenance: formMaintenance,
        });
        onToast('success', t.toastRoomUpdated);
      } else {
        await api.createRoom({
          name: formName,
          capacity: Number(formCapacity),
          location: formLocation,
          amenities: formAmenities,
          isMaintenance: formMaintenance,
        });
        onToast('success', t.toastRoomCreated);
      }
      setIsFormOpen(false);
      onRefreshData();
    } catch (err: any) {
      onToast('error', err.message || 'Failed to save room');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleMaintenance = async (room: Room) => {
    try {
      const nextState = !room.isMaintenance;
      await api.updateRoom(room.id, { isMaintenance: nextState });
      onToast(
        'info',
        lang === 'th'
          ? `ห้อง ${room.name} ${nextState ? 'เข้าสู่โหมดปิดปรับปรุง' : 'เปิดให้บริการตามปกติ'}`
          : `${room.name} is now ${nextState ? 'under maintenance' : 'available'}`
      );
      onRefreshData();
    } catch (err: any) {
      onToast('error', err.message || 'Failed to update maintenance state');
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!window.confirm(t.confirmDeleteRoom)) return;
    try {
      await api.deleteRoom(room.id);
      onToast('success', t.toastRoomDeleted);
      onRefreshData();
    } catch (err: any) {
      onToast('error', err.message || 'Failed to delete room');
    }
  };

  const handleAdminCancelBooking = async (id: string) => {
    if (!window.confirm(t.adminCancelBookingConfirm)) return;
    try {
      await api.cancelBooking(id);
      onToast('success', t.toastCancelSuccess);
      fetchAllBookings();
      onRefreshData();
    } catch (err: any) {
      onToast('error', err.message || 'Failed to cancel booking');
    }
  };

  const filteredBookings = allBookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = b.title.toLowerCase().includes(q);
    const roomMatch = b.room?.name.toLowerCase().includes(q) || false;
    const userMatch =
      b.user?.name.toLowerCase().includes(q) || b.user?.email.toLowerCase().includes(q) || false;
    return titleMatch || roomMatch || userMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                ADMIN PANEL
              </span>
              <h2 className="text-lg font-bold text-slate-900">{t.adminModalTitle}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t.adminModalDesc}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center space-x-4 bg-white">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'rooms'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t.tabRooms}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              {rooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{t.tabBookings}</span>
          </button>
        </div>

        {/* Tab 1: Rooms Management */}
        {activeTab === 'rooms' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {lang === 'th' ? `ห้องประชุมทั้งหมด (${rooms.length})` : `All Conference Rooms (${rooms.length})`}
              </span>
              <button
                onClick={handleOpenCreate}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addRoomBtn}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`rounded-2xl p-4.5 border transition flex flex-col justify-between ${
                    room.isMaintenance
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-base flex items-center space-x-2">
                          <span>{room.name}</span>
                          {room.isMaintenance ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              {t.maintenanceBadge}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {t.activeBadge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {room.location} • {room.capacity} {t.seats}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100 truncate">
                      {room.amenities || '-'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleMaintenance(room)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition flex items-center space-x-1 cursor-pointer ${
                        room.isMaintenance
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                      title={t.toggleMaintenance}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{room.isMaintenance ? (lang === 'th' ? 'เปิดใช้งาน' : 'Reactivate') : t.maintenanceLabel}</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(room)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title={t.editRoomTitle}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: All Bookings Overview */}
        {activeTab === 'bookings' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t.searchBookingsPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <span className="text-xs text-slate-500 font-medium">
                {t.allBookingsCount}: <strong className="text-slate-800">{filteredBookings.length}</strong>
              </span>
            </div>

            {bookingsLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading bookings...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {lang === 'th' ? 'ไม่พบรายการจองตามคำค้นหา' : 'No reservations found.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {filteredBookings.map((b) => {
                  const startDate = new Date(b.startTime);
                  const endDate = new Date(b.endTime);
                  const isCancelled = b.status === 'CANCELLED';

                  return (
                    <div
                      key={b.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCancelled ? 'bg-slate-50/70 opacity-60' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">{b.title}</span>
                          {isCancelled ? (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                b.cancelReason === 'AUTO_RELEASED_NO_SHOW'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {b.cancelReason === 'AUTO_RELEASED_NO_SHOW'
                                ? t.autoReleasedBadge
                                : lang === 'th'
                                ? 'ยกเลิกแล้ว'
                                : 'CANCELLED'}
                            </span>
                          ) : b.isCheckedIn ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ {t.checkedInBadge}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              {t.pendingCheckInBadge}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <div className="font-semibold text-slate-700">{b.room?.name}</div>
                          <span>•</span>
                          <div>{formatDateDMY(startDate, lang, 'full')}</div>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                            </span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center text-slate-600 font-medium">
                            <User className="w-3 h-3 mr-1 text-slate-400" />
                            <span>{b.user?.name || b.user?.email}</span>
                          </div>
                        </div>
                      </div>

                      {!isCancelled && (
                        <button
                          onClick={() => handleAdminCancelBooking(b.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition shrink-0 cursor-pointer self-start sm:self-auto"
                        >
                          {lang === 'th' ? 'ยกเลิกคิวนี้' : 'Cancel Slot'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Room Create / Edit Modal Popup */}
        {isFormOpen && (
          <div className="absolute inset-0 z-20 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-slate-900 mb-4">
                {editingRoom ? t.editRoomTitle : t.createRoomTitle}
              </h3>

              <form onSubmit={handleSaveRoom} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.roomNameLabel}
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="e.g. Conference Room Beta"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.roomCapacityLabel}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(Number(e.target.value))}
                      required
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.roomLocationLabel}
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      required
                      placeholder="e.g. 3rd Floor"
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.roomAmenitiesLabel}
                  </label>
                  <input
                    type="text"
                    value={formAmenities}
                    onChange={(e) => setFormAmenities(e.target.value)}
                    placeholder="e.g. 4K TV, Whiteboard, Video Conference"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formMaintenance}
                      onChange={(e) => setFormMaintenance(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <span>{t.maintenanceLabel}</span>
                  </label>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    {t.cancelButton}
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {formLoading ? 'Saving...' : t.saveRoomBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
