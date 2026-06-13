import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, Mail, Lock } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, direction } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.access_token);
      navigate('/');
    } catch (err) {
      setError(t('auth.errorInvalid', { defaultValue: 'Invalid email or password' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-brand-dark px-4 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-indigo/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-brand-cyan/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card p-8 rounded-2xl shadow-2xl z-10 border border-slate-800/80 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-brand-indigo to-brand-cyan p-3 rounded-2xl shadow-lg shadow-brand-indigo/35 mb-4">
            <Activity className="h-8 w-8 text-brand-dark" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-brand-cyan tracking-tight">
            {t('auth.signInTitle')}
          </h1>
          <p className="text-slate-400 mt-1.5 text-xs text-center">
            {t('auth.signInSub')}
          </p>
        </div>
        
        {error && (
          <div className="bg-brand-rose/10 border border-brand-rose/25 text-brand-rose px-4 py-3 rounded-xl text-xs mb-6 animate-pulse">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">{t('auth.email')}</label>
            <div className="relative">
              <Mail className={`absolute ${direction === 'rtl' ? 'right-3.5' : 'left-3.5'} top-3.5 h-5 w-5 text-slate-500`} />
              <input 
                type="email" 
                className="w-full ps-11 pe-4 py-3 bg-brand-navy/60 border border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-transparent text-slate-100 placeholder-slate-500 transition-all text-sm"
                placeholder="name@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">{t('auth.password')}</label>
            <div className="relative">
              <Lock className={`absolute ${direction === 'rtl' ? 'right-3.5' : 'left-3.5'} top-3.5 h-5 w-5 text-slate-500`} />
              <input 
                type="password" 
                className="w-full ps-11 pe-4 py-3 bg-brand-navy/60 border border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-transparent text-slate-100 placeholder-slate-500 transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-indigo to-brand-cyan hover:from-brand-indigo/90 hover:to-brand-cyan/90 text-brand-dark font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-brand-cyan/15 hover:shadow-brand-cyan/25 flex items-center justify-center gap-2 text-sm mt-6"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></span>
            ) : (
              t('auth.signInBtn')
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-slate-400">
          {t('auth.noAccount')} <Link to="/register" className="text-brand-cyan hover:underline font-semibold">{t('auth.createAccount')}</Link>
        </div>
      </div>
    </div>
  );
}

