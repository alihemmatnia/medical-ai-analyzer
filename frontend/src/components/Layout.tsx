import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, FileText, MessageSquare, User, LogOut, ShieldAlert, GitCompare } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Upload Report', path: '/upload', icon: FileText },
    { name: 'Compare Reports', path: '/compare', icon: GitCompare },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-brand-dark text-slate-100 font-sans overflow-hidden">
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
                key={item.name}
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-indigo/15 to-brand-cyan/5 text-brand-cyan border border-brand-cyan/20 shadow-glow-cyan' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-brand-cyan' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/60">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-brand-rose hover:bg-brand-rose/10 border border-transparent hover:border-brand-rose/20 rounded-xl w-full transition-all duration-300 group"
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-0.5" /> 
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-auto p-8 relative z-10">
        <div className="animate-fade-in h-full">
          <Outlet />
        </div>
        
        {/* Subtle Floating Disclaimer */}
        <div className="fixed bottom-4 right-8 text-[11px] text-slate-500 bg-brand-dark/95 border border-slate-800/80 px-4 py-2 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 max-w-sm">
          <ShieldAlert size={12} className="text-brand-amber shrink-0 animate-pulse" />
          <span>Informational only. Not a substitute for professional advice.</span>
        </div>
      </main>
    </div>
  );
}

