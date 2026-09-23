import React from 'react';
import { Calendar, CalendarCheck, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { User } from '../types';
import { Language, translations } from '../translations';

interface NavbarProps {
  user: User | null;
  lang: Language;
  onToggleLang: (newLang: Language) => void;
  onOpenAuth: () => void;
  onOpenMyBookings: () => void;
  onOpenAdmin?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  lang,
  onToggleLang,
  onOpenAuth,
  onOpenMyBookings,
  onOpenAdmin,
  onLogout,
}) => {
  const t = translations[lang];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">RoomReserve</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {t.brandSubtitle}
            </span>
          </div>
        </div>

        {/* Right side: Language Switcher & User actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold shrink-0">
            <button
              onClick={() => onToggleLang('th')}
              title="ภาษาไทย"
              className={`px-1.5 sm:px-2 py-1 rounded-md transition flex items-center space-x-1 ${
                lang === 'th'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="text-xs">🇹🇭</span>
              <span className="hidden sm:inline text-xs">TH</span>
            </button>
            <button
              onClick={() => onToggleLang('en')}
              title="English"
              className={`px-1.5 sm:px-2 py-1 rounded-md transition flex items-center space-x-1 ${
                lang === 'en'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="text-xs">🇬🇧</span>
              <span className="hidden sm:inline text-xs">EN</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          {user ? (
            <>
              {user.role === 'ADMIN' && onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  title={t.adminDashboardBtn}
                  className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 sm:px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline">{t.adminDashboardBtn}</span>
                </button>
              )}

              <button
                onClick={onOpenMyBookings}
                title={t.myBookings}
                className="inline-flex items-center space-x-1 text-xs sm:text-sm font-medium text-slate-700 hover:text-blue-600 px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition shrink-0"
              >
                <CalendarCheck className="w-4 h-4 text-blue-600 sm:text-slate-500" />
                <span className="hidden sm:inline">{t.myBookings}</span>
              </button>

              <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

              <div className="flex items-center space-x-2 pl-0.5 sm:pl-1 shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs sm:text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-900 flex items-center">
                    {user.name}
                    {user.role === 'ADMIN' && (
                      <span className="ml-1 text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded-full border border-purple-200 flex items-center">
                        <Shield className="w-2.5 h-2.5 mr-0.5" /> {t.adminBadge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">{user.email}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title={t.signOut}
                className="text-slate-400 hover:text-red-600 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition shrink-0"
            >
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="sm:hidden">{lang === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}</span>
              <span className="hidden sm:inline">{t.signInDemo}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
