import React from 'react';
import { Calendar } from 'lucide-react';
import { Language } from '../translations';

interface SplashScreenProps {
  isFading: boolean;
  lang: Language;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isFading, lang }) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white transition-all duration-1000 ease-out ${
        isFading ? 'opacity-0 pointer-events-none scale-105 blur-xs' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="animate-splash-aura absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse-glow [animation-delay:2s] translate-x-24 -translate-y-12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-2xl animate-pulse-glow [animation-delay:1s] -translate-x-24 translate-y-12" />
      </div>

      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Center Branding */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Step 1 & 2: Icon Container with Aura */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Step 2 (0.4s): Aura rings around the icon */}
          <div className="animate-splash-aura absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Outer dashed spinning orbit ring */}
            <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-blue-500/30 border-dashed animate-spin-slow" />

            {/* Secondary counter-rotating dotted ring */}
            <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-indigo-400/20 border-dotted animate-spin [animation-duration:8s] [animation-direction:reverse]" />

            {/* Glowing pulse ring */}
            <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-500/25 animate-ping opacity-50 [animation-duration:2.5s]" />
          </div>

          {/* Step 1 (0.1s): Icon slides up */}
          <div className="animate-splash-icon relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-blue-500/50 ring-4 ring-blue-400/20 animate-float">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
            </div>
          </div>
        </div>

        {/* Step 3 (0.7s): Brand Name & Subtitle */}
        <div className="animate-splash-name flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            RoomReserve
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xs font-normal leading-relaxed">
            {lang === 'th' ? 'ระบบจองห้องประชุมออนไลน์สำหรับองค์กร' : 'Modern Workspace & Room Reservation'}
          </p>
        </div>

        {/* Step 4 (1.0s): Progress Bar & Status */}
        <div className="animate-splash-bar flex flex-col items-center">
          {/* Loading Progress Bar */}
          <div className="w-52 h-1.5 bg-slate-800/80 rounded-full overflow-hidden mt-7 relative shadow-inner ring-1 ring-white/5">
            <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 rounded-full animate-progress shadow-lg shadow-blue-500/50" />
          </div>

          {/* Status text with bouncing dots */}
          <div className="flex items-center space-x-2 mt-4 text-slate-400">
            <span className="text-xs font-medium tracking-wide">
              {lang === 'th' ? 'กำลังเตรียมพร้อมระบบ...' : 'Preparing workspace...'}
            </span>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
