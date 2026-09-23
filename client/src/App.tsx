import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar, Building2, Users, CalendarCheck, ShieldCheck, ArrowRight, Info, Search } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { RoomCard } from './components/RoomCard';
import { ScheduleView } from './components/ScheduleView';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { AdminModal } from './components/AdminModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { SplashScreen } from './components/SplashScreen';
import { RoomFilterBar, CapacityCategory } from './components/RoomFilterBar';
import { api } from './api';
import { User, Room, Booking } from './types';
import { Language, translations } from './translations';

export function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('app_lang') as Language) || 'th';
  });

  const handleToggleLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = translations[lang];

  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Computed stats
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayBookingsCount = bookings.filter(
    (b) => b.status === 'CONFIRMED' && format(new Date(b.startTime), 'yyyy-MM-dd') === todayStr
  ).length;

  // Modals
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMyBookingsModalOpen, setIsMyBookingsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Tomorrow as default date
  const tomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return format(tomorrow, 'yyyy-MM-dd');
  };
  const [selectedDate, setSelectedDate] = useState<string>(tomorrowStr());

  // Room Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [capacityFilter, setCapacityFilter] = useState<CapacityCategory>('ALL');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);

  // Available amenities extracted dynamically from rooms
  const availableAmenities = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => {
      if (r.amenities) {
        r.amenities.split(',').forEach((a) => {
          const trimmed = a.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set).sort();
  }, [rooms]);

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCapacityFilter('ALL');
    setSelectedAmenities([]);
    setAvailableOnly(false);
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || capacityFilter !== 'ALL' || selectedAmenities.length > 0 || availableOnly
  );

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = room.name.toLowerCase().includes(q);
        const matchLoc = room.location.toLowerCase().includes(q);
        const matchAmen = room.amenities?.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchAmen) return false;
      }

      // Capacity filter
      if (capacityFilter === 'SMALL' && (room.capacity < 1 || room.capacity > 4)) return false;
      if (capacityFilter === 'MEDIUM' && (room.capacity < 5 || room.capacity > 10)) return false;
      if (capacityFilter === 'LARGE' && room.capacity < 11) return false;

      // Available only
      if (availableOnly && room.isMaintenance) return false;

      // Amenities filter
      if (selectedAmenities.length > 0) {
        const roomAmenitiesList = room.amenities
          ? room.amenities.split(',').map((a) => a.trim().toLowerCase())
          : [];
        const hasAll = selectedAmenities.every((sel) =>
          roomAmenitiesList.includes(sel.toLowerCase())
        );
        if (!hasAll) return false;
      }

      return true;
    });
  }, [rooms, searchQuery, capacityFilter, availableOnly, selectedAmenities]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsData, bookingsData] = await Promise.all([
        api.getRooms(),
        api.getBookings(),
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    const init = async () => {
      // Check URL parameters for OAuth callbacks
      const params = new URLSearchParams(window.location.search);
      const oauthToken = params.get('token');
      const oauthError = params.get('oauth_error');

      if (oauthToken) {
        localStorage.setItem('token', oauthToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch {
          localStorage.removeItem('token');
        }
      } else if (oauthError) {
        setOauthNotice(decodeURIComponent(oauthError));
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const res = await api.getMe();
            setUser(res.user);
          } catch {
            localStorage.removeItem('token');
          }
        }
      }

      await fetchData();

      // Ensure minimum display of 2500ms for a smooth and deliberate presentation
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2500 - elapsed);

      setTimeout(() => {
        setIsSplashFading(true);
        setTimeout(() => {
          setIsSplashActive(false);
        }, 1000);
      }, remaining);
    };

    init();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleOpenBooking = (room?: Room) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedRoom(room || null);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Full-Screen Splash Screen Preloader */}
      {isSplashActive && <SplashScreen isFading={isSplashFading} lang={lang} />}

      <Navbar
        user={user}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenMyBookings={() => setIsMyBookingsModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* OAuth Notification Banner */}
      {oauthNotice && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-4 py-3 text-xs sm:text-sm font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{oauthNotice}</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <a
                href="/api/auth/demo-oauth?provider=google"
                className="underline hover:text-amber-950 font-bold"
              >
                {lang === 'th' ? 'ทดสอบด้วย Demo OAuth' : 'Test with Demo OAuth'}
              </a>
              <button
                onClick={() => setOauthNotice(null)}
                className="text-amber-500 hover:text-amber-800 p-1 rounded-md"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Modern Enterprise Hero & Live Status Section (Stagger 1) */}
        <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 ${
          isSplashFading || !isSplashActive ? 'animate-stagger-1' : 'opacity-0'
        }`}>
          <div className="absolute -right-16 -top-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/2 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top row: badge & live status pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-semibold border border-blue-400/20 backdrop-blur-xs">
                <Building2 className="w-3.5 h-3.5" />
                <span>{t.heroBadge}</span>
              </div>

              <div
                className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-400/20 backdrop-blur-xs"
                title={`${t.statStatus}: ${t.statusActive}`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
              </div>
            </div>

            {/* Headline and description */}
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
                {t.heroTitle}
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.heroDesc}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenBooking()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.bookNowBtn}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => {
                  const scheduleElem = document.getElementById('schedule-section');
                  if (scheduleElem) {
                    const navbarOffset = 80;
                    const elementPosition = scheduleElem.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarOffset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth',
                    });
                  }
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-medium rounded-xl transition cursor-pointer"
              >
                {t.viewScheduleBtn}
              </button>
            </div>

            {/* Live KPI Metric Cards */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">{t.statRooms}</div>
                  <div className="text-lg font-bold text-white tracking-tight">{rooms.length}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-400 font-medium truncate">{t.statCapacity}</div>
                  <div className="text-lg font-bold text-white tracking-tight whitespace-nowrap">
                    {totalCapacity} <span className="text-xs font-normal text-slate-400">{t.seats}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">{t.statToday}</div>
                  <div className="text-lg font-bold text-white tracking-tight">{todayBookingsCount}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">{t.statStatus}</div>
                  <div className="text-sm font-bold text-emerald-400 tracking-tight flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                    {t.statusActive}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Timeline View with anchor id (Stagger 2) */}
        <div id="schedule-section" className={`scroll-mt-20 ${
          isSplashFading || !isSplashActive ? 'animate-stagger-2' : 'opacity-0'
        }`}>
          <ScheduleView
            rooms={rooms}
            bookings={bookings}
            selectedDate={selectedDate}
            lang={lang}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Available Rooms Grid (Stagger 3) */}
        <section className={`space-y-4 ${
          isSplashFading || !isSplashActive ? 'animate-stagger-3' : 'opacity-0'
        }`}>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.roomsTitle}</h2>
            <p className="text-xs text-slate-500">{t.roomsDesc}</p>
          </div>

          {/* Smart Search & Filter Bar */}
          <RoomFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            capacityFilter={capacityFilter}
            onCapacityChange={setCapacityFilter}
            selectedAmenities={selectedAmenities}
            onToggleAmenity={handleToggleAmenity}
            availableAmenities={availableAmenities}
            availableOnly={availableOnly}
            onToggleAvailableOnly={() => setAvailableOnly((prev) => !prev)}
            totalRooms={rooms.length}
            matchedRooms={filteredRooms.length}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            lang={lang}
          />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4 animate-pulse">
                  <div className="h-36 bg-slate-200/80 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200/80 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-200/50 rounded-md w-1/2" />
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <div className="h-3 bg-slate-200/50 rounded-md w-1/3" />
                    <div className="h-8 bg-slate-200/80 rounded-lg w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3 p-6 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">{t.noRoomsMatch}</p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                {t.resetFilterBtn}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} lang={lang} onBook={handleOpenBooking} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer (Stagger 4) */}
      <footer className={`bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 ${
        isSplashFading || !isSplashActive ? 'animate-stagger-4' : 'opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t.footerText}</span>
          <div className="flex items-center space-x-1 text-slate-500">
            <Info className="w-3.5 h-3.5" />
            <span>{t.footerDeploy}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookingModal
        rooms={rooms}
        selectedRoom={selectedRoom}
        isOpen={isBookingModalOpen}
        lang={lang}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={fetchData}
        onToast={showToast}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        lang={lang}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(newUser) => {
          setUser(newUser);
          fetchData();
        }}
      />

      <MyBookingsModal
        isOpen={isMyBookingsModalOpen}
        lang={lang}
        onClose={() => setIsMyBookingsModalOpen(false)}
        onBookingCancelled={fetchData}
        onToast={showToast}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        lang={lang}
        rooms={rooms}
        onClose={() => setIsAdminModalOpen(false)}
        onRefreshData={fetchData}
        onToast={showToast}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
