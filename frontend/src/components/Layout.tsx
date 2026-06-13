import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, FileText, MessageSquare, User, LogOut, ShieldAlert, GitCompare, Globe } from 'lucide-react';
import { useLanguage, type Language } from '../i18n/LanguageContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage, direction } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', key: 'nav.dashboard', path: '/', icon: Activity },
    { name: 'Upload Report', key: 'nav.uploadReport', path: '/upload', icon: FileText },
    { name: 'Compare Reports', key: 'nav.compareReports', path: '/compare', icon: GitCompare },
    { name: 'AI Chat', key: 'nav.aiChat', path: '/chat', icon: MessageSquare },
    { name: 'Profile', key: 'nav.profile', path: '/profile', icon: User },
  ];

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  return (
    <div className="flex h-screen bg-brand-dark text-slate-100 font-sans overflow-hidden relative">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-indigo/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Glassmorphic Sidebar */}
      <aside className="w-64 glass-panel flex flex-col z-10 shadow-2xl">
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
          <div className="bg-gradient-to-tr from-brand-indigo to-brand-cyan p-2.5 rounded-xl shadow-lg shadow-brand-indigo/20">
            <Activity className="h-5 w-5 text-brand-dark" />
          </div>
          <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-brand-cyan tracking-tight text-glow-cyan">
            MedAI
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${isActive
                    ? 'bg-gradient-to-r from-brand-indigo/15 to-brand-cyan/5 text-brand-cyan border border-brand-cyan/20 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-brand-cyan' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span className="font-medium text-sm">{t(item.key)}</span>
                {isActive && (
                  <span className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse shadow-[0_0_8px_#06b6d4]`}></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language Switcher */}
        <div className="p-4 border-t border-slate-800/40">
          <div className="relative flex items-center bg-slate-900/40 border border-slate-800/80 rounded-xl px-3.5 py-2.5 hover:bg-slate-900/60 transition-colors">
            <Globe className="h-4 w-4 text-slate-500 me-2.5 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-transparent border-none text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer appearance-none pr-6"
              style={{ direction: 'ltr' }}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-brand-dark text-slate-300">
                  {lang.flag} &nbsp; {lang.name}
                </option>
              ))}
            </select>
            <div className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${direction === 'rtl' ? 'left-3.5' : 'right-3.5'} text-slate-500 text-[10px]`}>
              ▼
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-brand-rose hover:bg-brand-rose/10 border border-transparent hover:border-brand-rose/20 rounded-xl w-full transition-all duration-300 group"
          >
            <LogOut className={`h-5 w-5 transition-transform ${direction === 'rtl' ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
            <span className="font-medium text-sm">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-auto p-8 relative z-10">
        <div className="animate-fade-in h-full">
          <Outlet />
        </div>

      </main>
    </div>
  );
}

