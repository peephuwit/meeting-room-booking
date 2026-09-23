import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';
import { Language, translations } from '../translations';

interface AuthModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, lang, onClose, onSuccess }) => {
  const t = translations[lang];
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const data = await api.register(name, email, password);
        localStorage.setItem('token', data.token);
        onSuccess(data.user);
      } else {
        const data = await api.login(email, password);
        localStorage.setItem('token', data.token);
        onSuccess(data.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(demoEmail, demoPass);
      localStorage.setItem('token', data.token);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900">
          {isRegister ? t.registerTitle : t.signInTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isRegister ? t.registerDesc : t.signInDesc}
        </p>

        {/* 1-Click Demo Section */}
        <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
          <div className="flex items-center text-xs font-bold text-blue-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
            {t.demoTitle}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('john@company.com', 'user123')}
              className="px-2.5 py-1.5 bg-white hover:bg-blue-100/50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 transition flex flex-col items-center cursor-pointer"
            >
              <span>{t.demoUser}</span>
              <span className="text-[10px] text-slate-400 font-normal">john@company.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@company.com', 'admin123')}
              className="px-2.5 py-1.5 bg-white hover:bg-purple-100/50 border border-purple-200 rounded-lg text-xs font-semibold text-purple-700 transition flex flex-col items-center cursor-pointer"
            >
              <span>{t.demoAdmin}</span>
              <span className="text-[10px] text-slate-400 font-normal">admin@company.com</span>
            </button>
          </div>
        </div>

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="px-2 text-[11px] text-slate-400 font-medium uppercase">
            {t.orContinueWith}
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.fullNameLabel}</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full text-sm rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.emailLabel}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full text-sm rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.passwordLabel}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition disabled:opacity-50 cursor-pointer"
          >
            {loading
              ? lang === 'th' ? 'กำลังประมวลผล...' : 'Please wait...'
              : isRegister
              ? t.registerTitle
              : t.signInTitle}
          </button>
        </form>

        {/* Social OAuth Logins (Below Submit Button - Instant Demo) */}
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="px-2 text-[11px] text-slate-400 font-medium uppercase">
            {lang === 'th' ? 'หรือเข้าสู่ระบบด้วย' : 'Or continue with'}
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => window.location.href = '/api/auth/demo-oauth?provider=google'}
            className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition shadow-2xs cursor-pointer"
            title={lang === 'th' ? 'เข้าสู่ระบบด้วย Google (Demo)' : 'Sign in with Google (Demo)'}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => window.location.href = '/api/auth/demo-oauth?provider=github'}
            className="w-full py-2 px-3 bg-[#24292F] hover:bg-[#1b1f23] text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition shadow-2xs cursor-pointer"
            title={lang === 'th' ? 'เข้าสู่ระบบด้วย GitHub (Demo)' : 'Sign in with GitHub (Demo)'}
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            {isRegister ? t.alreadyHaveAccount : t.noAccount}
          </button>
        </div>
      </div>
    </div>
  );
};
