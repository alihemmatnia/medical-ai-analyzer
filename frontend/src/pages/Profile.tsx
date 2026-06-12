import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User, Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-cyan rounded-full animate-spin"></div>
        <div className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">Retrieving Profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 pb-10">
      <div className="glass-card rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-indigo/5 rounded-full blur-3xl"></div>

        {/* Profile Card Header */}
        <div className="p-8 border-b border-slate-800/60 bg-slate-900/40 relative z-10 flex flex-col sm:flex-row items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-cyan p-0.5 shadow-xl shadow-brand-indigo/10 shrink-0">
            <div className="h-full w-full bg-brand-dark rounded-[14px] flex items-center justify-center text-brand-cyan">
              <User className="h-10 w-10" />
            </div>
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight">{user.name}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-brand-cyan" /> Verified Medical Profile
            </div>
          </div>
        </div>
        
        {/* Profile Card Details */}
        <div className="p-8 space-y-6 relative z-10">
          <div className="grid grid-cols-1 gap-4">
            {/* Name */}
            <div className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 hover:border-slate-800 transition-colors">
              <div className="bg-brand-indigo/10 p-3 rounded-xl text-brand-indigo">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Account Holder</div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">{user.name}</div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 hover:border-slate-800 transition-colors">
              <div className="bg-brand-cyan/10 p-3 rounded-xl text-brand-cyan">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Registered Email</div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-1.5">
              <Heart size={14} className="text-brand-rose animate-pulse" />
              <span>Diagnostic System Status: Secure & Active</span>
            </div>
            <div>
              Registered: {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

