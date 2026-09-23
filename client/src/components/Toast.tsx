import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: 'bg-emerald-900/90 border-emerald-500/40 text-emerald-100',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
      barBg: 'bg-emerald-400',
    },
    error: {
      bg: 'bg-rose-900/90 border-rose-500/40 text-rose-100',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
      barBg: 'bg-rose-400',
    },
    info: {
      bg: 'bg-slate-900/90 border-blue-500/40 text-slate-100',
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />,
      barBg: 'bg-blue-400',
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 shadow-2xl border backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-stagger-1 ${config.bg}`}
      role="alert"
    >
      {config.icon}
      <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed pr-2">
        {toast.message}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0 cursor-pointer"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Subtle countdown bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className={`h-full ${config.barBg} transition-all duration-[4000ms] ease-linear w-0`}
          style={{ animation: 'progressFill 4s linear forwards' }}
        />
      </div>
    </div>
  );
};
